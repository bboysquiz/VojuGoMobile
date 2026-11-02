/* global __dirname */
const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const ts = require("typescript");

// Загружаем исходные TypeScript-модули без Metro и нативных хранилищ.
const cache = new Map();
const root = path.resolve(__dirname, "..");
function load(file) {
  file = path.resolve(root, file);
  if (!fs.existsSync(file))
    file += fs.existsSync(`${file}.ts`) ? ".ts" : ".tsx";
  if (cache.has(file)) return cache.get(file).exports;
  const module = { exports: {} };
  cache.set(file, module);
  const localRequire = (name) => {
    if (name === "react-native")
      return {
        Platform: { OS: "ios" },
        View: "View",
        Text: "Text",
        TextInput: "TextInput",
        StyleSheet: { create: (styles) => styles },
      };
    if (name === "react")
      return {
        useRef: (current) => ({ current }),
        useState: (value) => [value, () => {}],
      };
    if (name === "expo-secure-store")
      return {
        getItemAsync: async () => null,
        setItemAsync: async () => {},
        deleteItemAsync: async () => {},
      };
    if (name.startsWith("@/"))
      return load(path.join(root, "src", name.slice(2)));
    if (name.startsWith("."))
      return load(path.resolve(path.dirname(file), name));
    return require(name);
  };
  const { outputText } = ts.transpileModule(fs.readFileSync(file, "utf8"), {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2022,
      jsx: ts.JsxEmit.ReactJSX,
    },
  });
  new Function("require", "module", "exports", outputText)(
    localRequire,
    module,
    module.exports,
  );
  return module.exports;
}

const { PasswordRecoveryController } = load(
  "src/features/auth/model/password-recovery-controller",
);
const { RecoveryError } = load("src/features/auth/model/password-recovery");
const { ApiError, apiRequest } = load("src/shared/api/http");
const { createPasswordRecoveryApi } = load(
  "src/features/auth/api/password-recovery.api",
);
const phone = "+79991234567";
const channel = (kind, availableInSeconds = 0) => ({
  kind,
  destination: kind === "email" ? "t***@example.test" : phone,
  fallback: kind === "sms",
  availableInSeconds,
});

function setup(channels = [channel("sms")], overrides = {}) {
  let now = 1_000_000;
  const calls = [];
  const api = {
    start: async (...args) => {
      calls.push(["start", ...args]);
      return { id: phone, channels };
    },
    sendCode: async (...args) => {
      calls.push(["send", ...args]);
      return { id: args[1].kind, channel: args[1], retryAfterSeconds: 10 };
    },
    confirmCode: async (...args) => {
      calls.push(["verify", ...args]);
      return { resetToken: "one-time" };
    },
    resetPassword: async (...args) => {
      calls.push(["reset", ...args]);
    },
    ...overrides,
  };
  const flow = new PasswordRecoveryController(api, phone, () => now);
  return {
    flow,
    calls,
    advance: (seconds) => {
      now += seconds * 1000;
      flow.refreshClock();
    },
  };
}

for (const kind of ["telegram", "email", "sms"]) {
  test(`Единственный способ ${kind} требует явного выбора, включая окончание available_in`, async () => {
    const { flow, calls, advance } = setup([channel(kind, 10)]);
    await flow.submitPhone();
    assert.equal(flow.getSnapshot().step, "channels");
    assert.equal(calls.length, 1);
    await flow.sendCode(flow.getSnapshot().session.channels[0]);
    assert.equal(calls.length, 1);
    advance(10);
    assert.equal(calls.length, 1);
    await flow.sendCode(flow.getSnapshot().session.channels[0]);
    assert.equal(flow.getSnapshot().step, "code");
    assert.equal(flow.getSnapshot().remainingSeconds, 60);
  });
}

test("Полный сценарий проверяет пароль, очищает секреты и не отправляет код автоматически", async () => {
  const { flow, calls } = setup();
  await flow.submitPhone();
  await flow.savePassword();
  assert.deepEqual(
    calls.map((item) => item[0]),
    ["start"],
  );
  await flow.sendCode(flow.getSnapshot().session.channels[0]);
  await flow.confirmCode("1234");
  assert.equal(flow.getSnapshot().step, "password");
  flow.setPassword("short");
  flow.setConfirmation("other");
  await flow.savePassword();
  assert.ok(flow.getSnapshot().passwordError);
  assert.ok(flow.getSnapshot().confirmationError);
  flow.setPassword("НовыйПароль123");
  flow.setConfirmation("НовыйПароль123");
  await flow.savePassword();
  assert.equal(flow.getSnapshot().step, "success");
  assert.equal(flow.getSnapshot().password, "");
  assert.equal(flow.getSnapshot().resetToken, "");
  assert.deepEqual(
    calls.map((item) => item[0]),
    ["start", "send", "verify", "reset"],
  );
});

test("Повторная отправка ждёт минуту и учитывает время в фоне", async () => {
  const { flow, calls, advance } = setup();
  await flow.submitPhone();
  await flow.sendCode(flow.getSnapshot().session.channels[0]);
  advance(59);
  await flow.resendCode();
  assert.equal(calls.filter((item) => item[0] === "send").length, 1);
  advance(120);
  await flow.resendCode();
  assert.equal(calls.filter((item) => item[0] === "send").length, 2);
});

test("Обычный 429 оставляет выбор способов, соблюдает серверную паузу и не показывает поддержку", async () => {
  const { flow, advance } = setup([channel("sms")], {
    sendCode: async () => {
      throw new RecoveryError("rate-limited", "Подождите", 120);
    },
  });
  await flow.submitPhone();
  await flow.sendCode(flow.getSnapshot().session.channels[0]);
  assert.equal(flow.getSnapshot().step, "channels");
  assert.equal(flow.channelWaitSeconds(channel("sms")), 120);
  advance(61);
  assert.equal(flow.channelWaitSeconds(channel("sms")), 59);
});

test("Лимит одного способа предлагает остальные; лимит последнего открывает поддержку", async () => {
  const { flow } = setup([channel("telegram"), channel("email")], {
    sendCode: async () => {
      throw new RecoveryError("method-exhausted");
    },
  });
  await flow.submitPhone();
  await flow.sendCode(flow.getSnapshot().session.channels[0]);
  assert.equal(flow.getSnapshot().step, "channels");
  assert.deepEqual(
    flow.getSnapshot().session.channels.map((item) => item.kind),
    ["email"],
  );
  await flow.sendCode(flow.getSnapshot().session.channels[0]);
  assert.equal(flow.getSnapshot().step, "exhausted");
});

test("Неверный код остаётся редактируемым, изменение очищает ошибку", async () => {
  const { flow } = setup(undefined, {
    confirmCode: async () => {
      throw new RecoveryError("invalid-code", "Неверный код");
    },
  });
  await flow.submitPhone();
  await flow.sendCode(flow.getSnapshot().session.channels[0]);
  await flow.confirmCode("1234");
  assert.equal(flow.getSnapshot().step, "code");
  assert.equal(flow.getSnapshot().failure, "invalid-code");
  flow.setCode("1235");
  assert.equal(flow.getSnapshot().failure, undefined);
});

test("Истёкшее разрешение возвращает к телефону и очищает оба пароля", async () => {
  const { flow } = setup(undefined, {
    resetPassword: async () => {
      throw new RecoveryError("expired");
    },
  });
  await flow.submitPhone();
  await flow.sendCode(flow.getSnapshot().session.channels[0]);
  await flow.confirmCode("1234");
  flow.setPassword("Password123");
  flow.setConfirmation("Password123");
  await flow.savePassword();
  assert.equal(flow.getSnapshot().step, "phone");
  assert.equal(flow.getSnapshot().failure, "expired");
  assert.equal(flow.getSnapshot().password, "");
  assert.equal(flow.getSnapshot().confirmation, "");
  assert.equal(flow.getSnapshot().resetToken, "");
});

test("Смена способа сохраняет серверную паузу альтернативного канала", async () => {
  const { flow } = setup([channel("telegram"), channel("sms", 120)]);
  await flow.submitPhone();
  await flow.sendCode(flow.getSnapshot().session.channels[0]);
  flow.showOtherChannels();
  assert.deepEqual(
    flow.getSnapshot().session.channels.map((item) => item.kind),
    ["sms"],
  );
  assert.equal(flow.channelWaitSeconds(channel("sms")), 120);
});

test("Уход отменяет запрос и игнорирует поздний ответ; двойное нажатие не дублирует запрос", async () => {
  let finish;
  let signal;
  let count = 0;
  const { flow } = setup(undefined, {
    start: (_, value) => {
      signal = value;
      count++;
      return new Promise((resolve) => {
        finish = resolve;
      });
    },
  });
  const pending = flow.submitPhone();
  await flow.submitPhone();
  assert.equal(count, 1);
  flow.dispose();
  assert.equal(signal.aborted, true);
  finish({ id: phone, channels: [channel("sms")] });
  await pending;
  assert.equal(flow.getSnapshot().step, "phone");
  assert.equal(flow.getSnapshot().session, undefined);
});

test("Нормализация телефона и локальная проверка не вызывают сервер", async () => {
  const { flow, calls } = setup();
  flow.setPhone("123");
  await flow.submitPhone();
  assert.ok(flow.getSnapshot().phoneError);
  assert.equal(calls.length, 0);
  flow.setPhone("8 (999) 123-45-67");
  assert.equal(flow.getSnapshot().phone, phone);
  await flow.submitPhone();
  assert.equal(calls.length, 1);
});

test("Нативный транспорт соблюдает Swagger, использует recovery-cookie и сохраняет только обычную сессию", async () => {
  const originalFetch = global.fetch;
  const originalBase = process.env.EXPO_PUBLIC_API_BASE_URL;
  process.env.EXPO_PUBLIC_API_BASE_URL = "https://recovery.example.test/api/v1";
  const requests = [],
    saved = [];
  const responses = [
    { methods: [{ method: "sms", fallback: true }] },
    { retry_after: 90 },
    { recovery_token: "one-time-token", expires_in: 300 },
    { access_token: "access", refresh_token: "refresh" },
  ];
  global.fetch = async (url, options) => {
    requests.push({ url, ...options, body: JSON.parse(options.body) });
    return Response.json(responses.shift());
  };
  try {
    const api = createPasswordRecoveryApi({
      isWeb: false,
      request: apiRequest,
      saveTokens: async (...args) => {
        saved.push(args);
      },
    });
    const signal = new AbortController().signal;
    const session = await api.start(phone, signal);
    const challenge = await api.sendCode(
      session.id,
      session.channels[0],
      signal,
    );
    const verified = await api.confirmCode(
      session.id,
      challenge.id,
      "1234",
      signal,
    );
    assert.equal(saved.length, 0);
    await api.resetPassword(verified.resetToken, "Password123", signal);
    assert.deepEqual(saved, [["access", "refresh"]]);
    assert.deepEqual(
      requests.map((item) => item.body),
      [
        { phone },
        { phone, method: "sms" },
        { phone, method: "sms", code: "1234" },
        { new_password: "Password123" },
      ],
    );
    assert.equal(
      requests[3].headers.get("Cookie"),
      "vojugo_access_token=one-time-token",
    );
    assert.ok(
      requests.every(
        (item) =>
          !item.headers.has("Authorization") && item.credentials === "omit",
      ),
    );
  } finally {
    global.fetch = originalFetch;
    if (originalBase === undefined) delete process.env.EXPO_PUBLIC_API_BASE_URL;
    else process.env.EXPO_PUBLIC_API_BASE_URL = originalBase;
  }
});

test("Браузерный транспорт использует cookies браузера без ручного заголовка Cookie", async () => {
  let sent;
  const api = createPasswordRecoveryApi({
    isWeb: true,
    request: async (_, options) => {
      sent = options;
      return { access_token: "a", refresh_token: "r" };
    },
    saveTokens: async () => {},
  });
  await api.resetPassword(
    "recovery",
    "Password123",
    new AbortController().signal,
  );
  assert.equal(sent.credentials, "include");
  assert.equal(sent.headers, undefined);
  assert.equal(sent.retryOnUnauthorized, false);
});

test("Пустые и некорректные способы не создают вымышленные каналы", async () => {
  for (const response of [
    { methods: [] },
    { methods: [{ method: "push", fallback: false }] },
    {
      methods: [
        { method: "sms", fallback: false },
        { method: "sms", fallback: true },
      ],
    },
  ]) {
    const api = createPasswordRecoveryApi({
      isWeb: false,
      request: async () => response,
      saveTokens: async () => {},
    });
    await assert.rejects(
      api.start(phone, new AbortController().signal),
      (error) => error.reason === "request",
    );
  }
});

test("Ошибки транспорта различают 429, истёкший токен и неизвестные ошибки", async () => {
  for (const [code, status, expected] of [
    ["HTTP_ERROR", 429, "rate-limited"],
    ["RECOVERY_METHOD_EXHAUSTED", 429, "method-exhausted"],
    ["HTTP_ERROR", 401, "expired"],
    ["HTTP_ERROR", 500, "request"],
  ]) {
    const api = createPasswordRecoveryApi({
      isWeb: false,
      request: async () => {
        throw new ApiError(
          "recovery code send limit reached",
          code,
          status,
          90,
        );
      },
      saveTokens: async () => {},
    });
    await assert.rejects(
      api.resetPassword("token", "Password123", new AbortController().signal),
      (error) => error.reason === expected && error.retryAfterSeconds === 90,
    );
  }
});

test("Неполный ответ reset не показывает успех и не сохраняет разрешение как обычный токен", async () => {
  let saved = false;
  const api = createPasswordRecoveryApi({
    isWeb: false,
    request: async () => undefined,
    saveTokens: async () => {
      saved = true;
    },
  });
  await assert.rejects(
    api.resetPassword("token", "Password123", new AbortController().signal),
  );
  assert.equal(saved, false);
});

test("HTTP 429 сохраняет Retry-After, в том числе дату, и русское сообщение", async () => {
  const originalFetch = global.fetch;
  const originalBase = process.env.EXPO_PUBLIC_API_BASE_URL;
  process.env.EXPO_PUBLIC_API_BASE_URL = "https://recovery.example.test/api/v1";
  try {
    for (const retryAfter of [
      "120",
      new Date(Date.now() + 120_000).toUTCString(),
    ]) {
      global.fetch = async () =>
        Response.json(
          { code: "HTTP_ERROR", message: "recovery code send limit reached" },
          { status: 429, headers: { "Retry-After": retryAfter } },
        );
      const api = createPasswordRecoveryApi({
        isWeb: false,
        request: apiRequest,
        saveTokens: async () => {},
      });
      await assert.rejects(
        api.sendCode(phone, channel("sms"), new AbortController().signal),
        (error) =>
          error.reason === "rate-limited" &&
          error.retryAfterSeconds >= 119 &&
          error.message === "Достигнут лимит отправки кодов. Попробуйте позже.",
      );
    }
  } finally {
    global.fetch = originalFetch;
    if (originalBase === undefined) delete process.env.EXPO_PUBLIC_API_BASE_URL;
    else process.env.EXPO_PUBLIC_API_BASE_URL = originalBase;
  }
});

test("401 каждого запроса восстановления не обновляет обычную сессию и не повторяет запрос", async () => {
  const originalFetch = global.fetch;
  const originalBase = process.env.EXPO_PUBLIC_API_BASE_URL;
  process.env.EXPO_PUBLIC_API_BASE_URL = "https://recovery.example.test/api/v1";
  try {
    const api = createPasswordRecoveryApi({
      isWeb: false,
      request: apiRequest,
      saveTokens: async () => {},
    });
    const signal = new AbortController().signal;
    for (const operation of [
      () => api.start(phone, signal),
      () => api.sendCode(phone, channel("sms"), signal),
      () => api.confirmCode(phone, "sms", "1234", signal),
      () => api.resetPassword("token", "Password123", signal),
    ]) {
      const paths = [];
      global.fetch = async (url) => {
        paths.push(url);
        return Response.json(
          { code: "HTTP_ERROR", message: "Unauthorized" },
          { status: 401 },
        );
      };
      await assert.rejects(operation());
      assert.equal(paths.length, 1);
      assert.ok(!paths[0].endsWith("/auth/refresh"));
    }
  } finally {
    global.fetch = originalFetch;
    if (originalBase === undefined) delete process.env.EXPO_PUBLIC_API_BASE_URL;
    else process.env.EXPO_PUBLIC_API_BASE_URL = originalBase;
  }
});

test("Отмена fetch остаётся AbortError и не превращается в ошибку соединения", async () => {
  const originalFetch = global.fetch;
  const originalBase = process.env.EXPO_PUBLIC_API_BASE_URL;
  process.env.EXPO_PUBLIC_API_BASE_URL = "https://recovery.example.test/api/v1";
  global.fetch = async () => {
    throw new DOMException("Отмена", "AbortError");
  };
  try {
    const api = createPasswordRecoveryApi({
      isWeb: false,
      request: apiRequest,
      saveTokens: async () => {},
    });
    await assert.rejects(
      api.start(phone, new AbortController().signal),
      (error) => error.name === "AbortError",
    );
  } finally {
    global.fetch = originalFetch;
    if (originalBase === undefined) delete process.env.EXPO_PUBLIC_API_BASE_URL;
    else process.env.EXPO_PUBLIC_API_BASE_URL = originalBase;
  }
});

test("Поле кода сохраняет пустую позицию при удалении цифры из середины", () => {
  const { AuthCodeInput } = load("src/features/auth/components/AuthCodeInput");
  let value;
  let completed;
  const tree = AuthCodeInput({
    value: "1234",
    onChange: (next) => {
      value = next;
    },
    onComplete: (next) => {
      completed = next;
    },
  });
  const inputs = tree.props.children[0].props.children;
  inputs[1].props.onChangeText("");
  assert.equal(value, "1 34");
  assert.equal(completed, undefined);
  const updated = AuthCodeInput({
    value,
    onChange: (next) => {
      value = next;
    },
    onComplete: (next) => {
      completed = next;
    },
  });
  updated.props.children[0].props.children[1].props.onChangeText("9");
  assert.equal(value, "1934");
  assert.equal(completed, "1934");
});
