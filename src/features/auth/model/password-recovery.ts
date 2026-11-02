export type RecoveryChannelKind = "telegram" | "email" | "sms";

export interface RecoveryChannel {
  kind: RecoveryChannelKind;
  destination: string;
  /** Явно заданная ссылка на бота из API или настроек проекта, а не угаданное имя в Telegram. */
  href?: string;
  /** Серверная пауза перед отправкой из ответа /password-recovery/methods. */
  availableInSeconds?: number;
  fallback?: boolean;
}

export interface RecoverySession {
  id: string;
  channels: RecoveryChannel[];
}

export interface RecoveryChallenge {
  id: string;
  channel: RecoveryChannel;
  retryAfterSeconds?: number;
}

export type RecoveryFailure =
  | "not-found"
  | "connection"
  | "invalid-code"
  | "code-expired"
  | "invalid-password"
  | "expired"
  | "exhausted"
  | "method-exhausted"
  | "rate-limited"
  | "request";

export class RecoveryError extends Error {
  readonly reason: RecoveryFailure;
  readonly retryAfterSeconds?: number;

  constructor(
    reason: RecoveryFailure,
    message = "",
    retryAfterSeconds?: number,
  ) {
    super(message);
    this.reason = reason;
    this.retryAfterSeconds = retryAfterSeconds;
    this.name = "RecoveryError";
  }
}

/** Контракт для интерфейса: преобразование серверных DTO и ошибок выполняется только в адаптере API. */
export interface PasswordRecoveryApi {
  start(phone: string, signal: AbortSignal): Promise<RecoverySession>;
  sendCode(
    sessionId: string,
    channel: RecoveryChannel,
    signal: AbortSignal,
  ): Promise<RecoveryChallenge>;
  confirmCode(
    sessionId: string,
    challengeId: string,
    code: string,
    signal: AbortSignal,
  ): Promise<{ resetToken: string }>;
  resetPassword(
    resetToken: string,
    password: string,
    signal: AbortSignal,
  ): Promise<void>;
}

export type RecoveryStep =
  "phone" | "channels" | "code" | "password" | "success" | "exhausted";
