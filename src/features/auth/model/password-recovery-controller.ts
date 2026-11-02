import { isValidPhone, normalizePhoneInput } from "../../../shared/lib/phone";
import {
  RecoveryError,
  type PasswordRecoveryApi,
  type RecoveryChannel,
  type RecoveryChannelKind,
  type RecoveryChallenge,
  type RecoveryFailure,
  type RecoverySession,
  type RecoveryStep,
} from "./password-recovery";

interface RecoveryState {
  step: RecoveryStep;
  phone: string;
  code: string;
  password: string;
  confirmation: string;
  phoneError: string;
  passwordError: string;
  confirmationError: string;
  failure?: RecoveryFailure;
  failureMessage: string;
  busy: boolean;
  session?: RecoverySession;
  challenge?: RecoveryChallenge;
  resetToken: string;
  remainingSeconds: number;
  now: number;
  deadlines: Partial<Record<RecoveryChannelKind, number>>;
}

export function formatRecoveryTimer(seconds: number): string {
  return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`;
}

export class PasswordRecoveryController {
  private state: RecoveryState;
  private listeners = new Set<() => void>();
  private active = true;
  private version = 0;
  private request?: AbortController;
  private interval?: ReturnType<typeof setInterval>;
  private codeDeadline = 0;

  constructor(
    private api: PasswordRecoveryApi,
    initialPhone = "",
    private clock: () => number = Date.now,
  ) {
    this.state = {
      step: "phone",
      phone: initialPhone,
      code: "",
      password: "",
      confirmation: "",
      phoneError: "",
      passwordError: "",
      confirmationError: "",
      failureMessage: "",
      busy: false,
      resetToken: "",
      remainingSeconds: 0,
      now: clock(),
      deadlines: {},
    };
  }

  getSnapshot = () => this.state;
  subscribe = (listener: () => void) => {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  };

  private update(patch: Partial<RecoveryState>) {
    this.state = { ...this.state, ...patch };
    this.listeners.forEach((listener) => listener());
  }

  activate() {
    this.active = true;
    this.refreshClock();
    if (!this.interval)
      this.interval = setInterval(() => this.refreshClock(), 1000);
  }

  dispose() {
    this.active = false;
    ++this.version;
    this.request?.abort();
    clearInterval(this.interval);
    this.interval = undefined;
    this.codeDeadline = 0;
    this.update({
      code: "",
      password: "",
      confirmation: "",
      resetToken: "",
      session: undefined,
      challenge: undefined,
      busy: false,
      deadlines: {},
      remainingSeconds: 0,
    });
  }

  refreshClock() {
    const now = this.clock();
    if (
      this.state.remainingSeconds ||
      Object.values(this.state.deadlines).some(
        (deadline) => deadline > this.state.now,
      )
    ) {
      this.update({
        now,
        remainingSeconds: this.codeDeadline
          ? Math.max(0, Math.ceil((this.codeDeadline - now) / 1000))
          : 0,
      });
    }
  }

  channelWaitSeconds(channel: RecoveryChannel): number {
    return Math.max(
      0,
      Math.ceil(
        ((this.state.deadlines[channel.kind] ?? 0) - this.clock()) / 1000,
      ),
    );
  }

  private setWait(channel: RecoveryChannel, seconds = 60) {
    const delay = Number.isFinite(seconds) ? Math.max(60, seconds) : 60;
    const now = this.clock();
    const deadline = now + delay * 1000;
    const inCode = this.state.step === "code";
    if (inCode) this.codeDeadline = deadline;
    this.update({
      now,
      deadlines: { ...this.state.deadlines, [channel.kind]: deadline },
      ...(inCode ? { remainingSeconds: delay } : {}),
    });
  }

  private async run<T>(
    action: (signal: AbortSignal) => Promise<T>,
    accept: (result: T) => void,
    reject?: (error: RecoveryError) => void,
  ) {
    if (this.state.busy || !this.active) return;
    const version = ++this.version;
    this.request = new AbortController();
    this.update({ busy: true, failure: undefined, failureMessage: "" });
    try {
      const result = await action(this.request.signal);
      if (version === this.version && this.active) accept(result);
    } catch (error) {
      if (
        version !== this.version ||
        !this.active ||
        (error instanceof Error && error.name === "AbortError")
      )
        return;
      const problem =
        error instanceof RecoveryError
          ? error
          : new RecoveryError("connection");
      if (problem.reason === "not-found" || problem.reason === "expired")
        this.changeNumber();
      this.update({
        failure: problem.reason,
        failureMessage:
          problem.reason === "expired"
            ? "Срок восстановления истёк. Запросите новый код."
            : problem.message,
      });
      if (problem.reason === "not-found")
        this.update({ phoneError: "Аккаунт с таким номером не найден" });
      if (problem.reason === "invalid-password") {
        this.update({
          passwordError: problem.message || "Минимум 8 символов, буквы и цифры",
        });
      }
      if (problem.reason === "exhausted") {
        this.codeDeadline = 0;
        this.update({
          step: "exhausted",
          code: "",
          password: "",
          confirmation: "",
          resetToken: "",
          remainingSeconds: 0,
        });
      }
      reject?.(problem);
    } finally {
      if (version === this.version && this.active) this.update({ busy: false });
    }
  }

  setPhone(value: string) {
    this.update({
      phone: normalizePhoneInput(value),
      phoneError: "",
      failure: undefined,
      failureMessage: "",
    });
  }

  setCode(value: string) {
    const clearFailure = ["invalid-code", "code-expired", "request"].includes(
      this.state.failure ?? "",
    );
    this.update({
      code: value,
      ...(clearFailure ? { failure: undefined, failureMessage: "" } : {}),
    });
  }

  setPassword(value: string) {
    this.update({
      password: value,
      passwordError: "",
      failure: undefined,
      failureMessage: "",
    });
  }

  setConfirmation(value: string) {
    this.update({
      confirmation: value,
      confirmationError: "",
      failure: undefined,
      failureMessage: "",
    });
  }

  async submitPhone() {
    if (this.state.busy || this.state.step !== "phone") return;
    this.update({ phoneError: "" });
    if (!isValidPhone(this.state.phone)) {
      this.update({ phoneError: "Введите номер в формате +7 999 123-45-67" });
      return;
    }
    await this.run(
      (signal) => this.api.start(this.state.phone, signal),
      (session) => {
        const now = this.clock();
        this.update({
          session,
          step: "channels",
          now,
          deadlines: Object.fromEntries(
            session.channels.map((channel) => [
              channel.kind,
              now + (channel.availableInSeconds ?? 0) * 1000,
            ]),
          ),
        });
      },
    );
  }

  private methodExhausted(channel: RecoveryChannel) {
    const session = this.state.session;
    if (!session) return;
    const channels = session.channels.filter(
      (item) => item.kind !== channel.kind,
    );
    this.codeDeadline = 0;
    this.update({
      session: { ...session, channels },
      challenge: undefined,
      code: "",
      remainingSeconds: 0,
      step: channels.length ? "channels" : "exhausted",
    });
  }

  async sendCode(channel: RecoveryChannel) {
    const session = this.state.session;
    if (
      !session ||
      !["channels", "code"].includes(this.state.step) ||
      !session.channels.some((item) => item.kind === channel.kind) ||
      this.channelWaitSeconds(channel)
    )
      return;
    await this.run(
      (signal) => this.api.sendCode(session.id, channel, signal),
      (challenge) => {
        this.update({ challenge, code: "", step: "code" });
        this.setWait(channel, challenge.retryAfterSeconds);
      },
      (error) => {
        if (error.reason === "method-exhausted") this.methodExhausted(channel);
        if (error.reason === "rate-limited")
          this.setWait(channel, error.retryAfterSeconds);
      },
    );
  }

  async confirmCode(code = this.state.code) {
    const { session, challenge, step } = this.state;
    if (step !== "code" || !session || !challenge || !/^\d{4}$/.test(code))
      return;
    await this.run(
      (signal) => this.api.confirmCode(session.id, challenge.id, code, signal),
      (result) => {
        this.codeDeadline = 0;
        this.update({
          resetToken: result.resetToken,
          code: "",
          remainingSeconds: 0,
          step: "password",
        });
      },
      (error) => {
        if (error.reason === "method-exhausted")
          this.methodExhausted(challenge.channel);
      },
    );
  }

  async resendCode() {
    this.refreshClock();
    if (
      this.state.step !== "code" ||
      this.state.remainingSeconds ||
      !this.state.challenge
    )
      return;
    await this.sendCode(this.state.challenge.channel);
  }

  showOtherChannels() {
    const { session, challenge, busy, step } = this.state;
    if (busy || step !== "code" || !session || !challenge) return;
    const channels = session.channels.filter(
      (channel) => channel.kind !== challenge.channel.kind,
    );
    if (!channels.length) return;
    this.codeDeadline = 0;
    this.update({
      session: { ...session, channels },
      challenge: undefined,
      code: "",
      step: "channels",
      remainingSeconds: 0,
      failure: undefined,
      failureMessage: "",
    });
  }

  async savePassword() {
    const { step, busy, resetToken, password, confirmation } = this.state;
    if (step !== "password" || busy || !resetToken) return;
    const passwordError =
      password.length < 8 || !/\p{L}/u.test(password) || !/\d/.test(password)
        ? "Минимум 8 символов, буквы и цифры"
        : "";
    const confirmationError =
      confirmation !== password || !confirmation ? "Пароли не совпадают" : "";
    this.update({ passwordError, confirmationError });
    if (passwordError || confirmationError) return;
    await this.run(
      (signal) => this.api.resetPassword(resetToken, password, signal),
      () => {
        this.update({
          password: "",
          confirmation: "",
          resetToken: "",
          session: undefined,
          challenge: undefined,
          step: "success",
        });
      },
    );
  }

  changeNumber() {
    ++this.version;
    this.request?.abort();
    this.codeDeadline = 0;
    this.update({
      step: "phone",
      busy: false,
      session: undefined,
      challenge: undefined,
      resetToken: "",
      code: "",
      password: "",
      confirmation: "",
      phoneError: "",
      passwordError: "",
      confirmationError: "",
      failure: undefined,
      failureMessage: "",
      deadlines: {},
      remainingSeconds: 0,
    });
  }
}
