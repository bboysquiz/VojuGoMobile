import { apiRequest, ApiError, isAbortError } from "@/shared/api/http";
import { Platform } from "react-native";
import { saveAuthTokens } from "@/shared/api/auth-token-storage";
import type { AuthResponse } from "@/shared/api/auth.types";
import {
  RecoveryError,
  type PasswordRecoveryApi,
  type RecoveryChannel,
  type RecoveryChannelKind,
  type RecoveryFailure,
} from "../model/password-recovery";

interface RecoveryMethodDto {
  method: RecoveryChannelKind;
  destination?: string;
  fallback: boolean;
  available_in?: number;
}

interface RecoveryMethodsResponse {
  methods: RecoveryMethodDto[];
}
interface RecoveryCodeSendResponse {
  retry_after: number;
}
interface RecoveryTokenResponse {
  recovery_token: string;
  expires_in: number;
}
type Operation = "methods" | "send" | "verify" | "reset";

// Неизвестные коды показываем как ошибки, не считая их исчерпанием попыток.
const errorReasons: Readonly<Record<string, RecoveryFailure>> = {
  USER_NOT_FOUND: "not-found",
  RECOVERY_CODE_INVALID: "invalid-code",
  RECOVERY_CODE_EXPIRED: "code-expired",
  RECOVERY_RESEND_TOO_EARLY: "rate-limited",
  RECOVERY_METHOD_EXHAUSTED: "method-exhausted",
  RECOVERY_ATTEMPTS_EXHAUSTED: "exhausted",
  RECOVERY_SESSION_EXPIRED: "expired",
  PASSWORD_VALIDATION_FAILED: "invalid-password",
};

const errorMessages: Readonly<Record<RecoveryFailure, string>> = {
  "not-found": "Аккаунт с таким номером не найден",
  connection: "Соединение прервано. Попробуйте снова.",
  "invalid-code": "Неверный код",
  "code-expired": "Срок действия кода истёк. Запросите новый код.",
  "invalid-password":
    "Пароль не соответствует требованиям. Используйте минимум 8 символов, буквы и цифры.",
  expired: "Срок восстановления истёк. Запросите новый код.",
  exhausted: "Лимит попыток восстановления исчерпан. Обратитесь в поддержку.",
  "method-exhausted":
    "Лимит попыток для этого способа исчерпан. Выберите другой способ.",
  "rate-limited": "Слишком много запросов. Попробуйте позже.",
  request: "Не удалось выполнить запрос. Попробуйте снова.",
};

const requestErrorMessages: Readonly<Record<Operation, string>> = {
  methods: "Не удалось получить способы восстановления. Попробуйте снова.",
  send: "Не удалось отправить код. Попробуйте снова.",
  verify: "Не удалось проверить код. Попробуйте снова.",
  reset: "Не удалось изменить пароль. Попробуйте снова.",
};

function recoveryErrorMessage(
  error: ApiError,
  reason: RecoveryFailure,
  operation: Operation,
): string {
  const message = error.message.trim();
  // Переводим известное сообщение, но не определяем по его тексту вид или срок ограничения.
  if (
    operation === "send" &&
    error.status === 429 &&
    /^recovery code send limit reached[.!]?$/i.test(message)
  ) {
    return "Достигнут лимит отправки кодов. Попробуйте позже.";
  }
  if (/[\u0400-\u04ff]/u.test(message)) return message;
  return reason === "request"
    ? requestErrorMessages[operation]
    : errorMessages[reason];
}

function recoveryError(error: unknown, operation: Operation): never {
  if (isAbortError(error) || error instanceof RecoveryError) throw error;
  if (!(error instanceof ApiError)) throw new RecoveryError("connection");
  const declaredReason = Object.hasOwn(errorReasons, error.code)
    ? errorReasons[error.code]
    : undefined;
  const reason =
    declaredReason ??
    (operation === "reset" && error.status === 401
      ? "expired"
      : error.status === 429
        ? "rate-limited"
        : error.status === 0
          ? "connection"
          : "request");
  throw new RecoveryError(
    reason,
    recoveryErrorMessage(error, reason, operation),
    error.retryAfterSeconds,
  );
}

async function request<T>(
  operation: Operation,
  action: () => Promise<T>,
): Promise<T> {
  try {
    return await action();
  } catch (error) {
    return recoveryError(error, operation);
  }
}

function isMethod(value: unknown): value is RecoveryChannelKind {
  return value === "telegram" || value === "email" || value === "sms";
}

function invalidResponse(): never {
  throw new RecoveryError(
    "request",
    "Не удалось обработать ответ сервера. Попробуйте снова.",
  );
}

function seconds(value: unknown): value is number {
  return typeof value === "number" && Number.isInteger(value) && value >= 0;
}

interface RecoveryTransport {
  isWeb: boolean;
  request: typeof apiRequest;
  saveTokens: typeof saveAuthTokens;
}

export function createPasswordRecoveryApi({
  isWeb,
  request: apiRequest,
  saveTokens,
}: RecoveryTransport): PasswordRecoveryApi {
  const options = {
    auth: false,
    retryOnUnauthorized: false,
    credentials: isWeb ? ("include" as const) : ("omit" as const),
  };
  return {
    async start(phone, signal) {
      const response = await request("methods", () =>
        apiRequest<RecoveryMethodsResponse>("/auth/password-recovery/methods", {
          ...options,
          method: "POST",
          body: { phone },
          signal,
        }),
      );
      if (
        !response ||
        !Array.isArray(response.methods) ||
        !response.methods.length
      )
        invalidResponse();
      const seen = new Set<RecoveryChannelKind>();
      const channels: RecoveryChannel[] = response.methods.map((method) => {
        if (
          !method ||
          !isMethod(method.method) ||
          seen.has(method.method) ||
          typeof method.fallback !== "boolean" ||
          (method.destination !== undefined &&
            typeof method.destination !== "string") ||
          (method.available_in !== undefined && !seconds(method.available_in))
        )
          invalidResponse();
        seen.add(method.method);
        return {
          kind: method.method,
          destination:
            method.destination ?? (method.method === "sms" ? phone : ""),
          fallback: method.fallback,
          availableInSeconds: method.available_in ?? 0,
          // В Swagger нет ссылки на бота: используем публичный адрес из настроек профиля.
          href:
            method.method === "telegram"
              ? "https://t.me/vozugo_bot"
              : undefined,
        };
      });
      return { id: phone, channels };
    },
    async sendCode(phone, channel, signal) {
      const response = await request("send", () =>
        apiRequest<RecoveryCodeSendResponse>(
          "/auth/password-recovery/code/send",
          {
            ...options,
            method: "POST",
            body: { phone, method: channel.kind },
            signal,
          },
        ),
      );
      if (!response || !seconds(response.retry_after)) invalidResponse();
      return {
        id: channel.kind,
        channel,
        retryAfterSeconds: response.retry_after,
      };
    },
    async confirmCode(phone, method, code, signal) {
      if (!isMethod(method)) invalidResponse();
      const response = await request("verify", () =>
        apiRequest<RecoveryTokenResponse>(
          "/auth/password-recovery/code/verify",
          {
            ...options,
            method: "POST",
            body: { phone, method, code },
            signal,
          },
        ),
      );
      if (
        !response ||
        typeof response.recovery_token !== "string" ||
        !response.recovery_token ||
        !/^[A-Za-z0-9._~+/=-]+$/.test(response.recovery_token) ||
        !seconds(response.expires_in) ||
        response.expires_in === 0
      )
        invalidResponse();
      return { resetToken: response.recovery_token };
    },
    async resetPassword(resetToken, password, signal) {
      // На телефоне передаём одноразовое право только в документированной cookie,
      // отдельно от обычного Bearer-токена; в браузере cookies управляет браузер.
      const response = await request("reset", () =>
        apiRequest<AuthResponse>("/auth/password/reset", {
          ...options,
          headers: isWeb
            ? undefined
            : { Cookie: `vojugo_access_token=${resetToken}` },
          method: "POST",
          body: { new_password: password },
          signal,
        }),
      );
      if (
        !response ||
        typeof response.access_token !== "string" ||
        !response.access_token ||
        typeof response.refresh_token !== "string" ||
        !response.refresh_token
      )
        invalidResponse();
      await saveTokens(response.access_token, response.refresh_token);
    },
  };
}

export const passwordRecoveryApi = createPasswordRecoveryApi({
  isWeb: Platform.OS === "web",
  request: apiRequest,
  saveTokens: saveAuthTokens,
});
