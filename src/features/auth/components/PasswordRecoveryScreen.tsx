import * as Linking from "expo-linking";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { getSelf } from "../api/auth.api";
import { formatRecoveryPhone } from "../model/recovery-phone";
import { formatRecoveryTimer } from "../model/password-recovery-controller";
import { usePasswordRecovery } from "../model/use-password-recovery";
import { AuthChannelOption } from "./AuthChannelOption";
import { AuthCodeInput } from "./AuthCodeInput";
import { AuthInput } from "./AuthInput";
import { AuthPageLayout } from "./AuthPageLayout";
import { AuthSubmitButton } from "./AuthSubmitButton";

const channelTitles = {
  telegram: "Бот ВожуГо в Telegram",
  email: "Электронная почта",
  sms: "SMS на номер",
};

function TextButton({
  label,
  onPress,
  disabled = false,
}: {
  label: string;
  onPress: () => void;
  disabled?: boolean;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled}
      accessibilityState={{ disabled }}
      onPress={onPress}
      style={styles.textButton}
    >
      <Text style={styles.link}>{label}</Text>
    </Pressable>
  );
}

export function PasswordRecoveryScreen() {
  const router = useRouter();
  const { state, flow } = usePasswordRecovery();
  const [navigationError, setNavigationError] = useState("");
  const [opening, setOpening] = useState(false);
  const { step, busy, challenge, session } = state;
  const channel = challenge?.channel;
  const title =
    step === "channels"
      ? "Куда отправить код?"
      : step === "password"
        ? "Придумайте новый пароль"
        : step === "success"
          ? "Пароль изменён"
          : step === "exhausted"
            ? "Код не приходит"
            : step === "code"
              ? channel?.kind === "telegram"
                ? "Введите код из Telegram"
                : channel?.kind === "email"
                  ? "Введите код из письма"
                  : "Введите код из SMS"
              : "Восстановление пароля";
  const description =
    step === "phone"
      ? "Отправим код для смены пароля\nна привязанный номер"
      : step === "channels"
        ? `Нашли способы связи для номера\n${formatRecoveryPhone(state.phone)}`
        : step === "success"
          ? "Используйте новый пароль\nпри следующем входе"
          : step === "exhausted"
            ? "Вы использовали все 3 попытки восстановления. Напишите нам, и мы поможем вернуть доступ"
            : step === "code" && channel?.kind === "email"
              ? `${channel.destination ? `Отправили код на ${channel.destination}\n` : ""}Письма нет? Проверьте папку «Спам»`
              : step === "code" && channel?.kind === "sms"
                ? `Отправили код на ${formatRecoveryPhone(channel.destination)}`
                : "";
  const codeError =
    state.failure === "invalid-code"
      ? state.failureMessage || "Неверный код"
      : state.failure === "code-expired"
        ? state.failureMessage ||
          "Срок действия кода истёк. Запросите новый код."
        : "";
  const requestError =
    state.failure === "connection"
      ? "Соединение прервано. Попробуйте снова"
      : ["request", "rate-limited", "expired", "method-exhausted"].includes(
            state.failure ?? "",
          )
        ? state.failureMessage ||
          "Не удалось выполнить запрос. Попробуйте снова."
        : "";
  const otherChannels =
    session?.channels.filter((item) => item.kind !== channel?.kind) ?? [];

  async function openLink(href: string) {
    try {
      await Linking.openURL(href);
      setNavigationError("");
    } catch {
      setNavigationError("Не удалось открыть ссылку. Попробуйте снова.");
    }
  }

  async function openCabinet() {
    if (opening) return;
    setOpening(true);
    setNavigationError("");
    try {
      const user = await getSelf();
      if (user.roles.includes("customer"))
        router.replace("/cabinet/customer/orders");
      else if (user.roles.includes("contractor"))
        router.replace("/cabinet/contractor");
      else
        setNavigationError("Для пользователя не назначена поддерживаемая роль");
    } catch (error) {
      setNavigationError(
        error instanceof Error
          ? error.message
          : "Не удалось открыть кабинет. Попробуйте снова.",
      );
    } finally {
      setOpening(false);
    }
  }

  return (
    <AuthPageLayout
      title={title}
      description={description}
      success={step === "success"}
      onClose={() => router.replace("/")}
      headerExtra={
        step === "channels" ? (
          <TextButton
            label="Изменить номер"
            disabled={busy}
            onPress={() => flow.changeNumber()}
          />
        ) : step === "code" && channel?.kind === "telegram" ? (
          <TextButton
            label="Открыть бота"
            onPress={() => {
              void openLink(channel.href!);
            }}
          />
        ) : null
      }
    >
      {(requestError && step !== "exhausted") || navigationError ? (
        <Text accessibilityRole="alert" style={styles.error}>
          {navigationError || requestError}
        </Text>
      ) : null}

      {step === "phone" ? (
        <>
          <AuthInput
            label="Телефон"
            appearance="recovery"
            value={formatRecoveryPhone(state.phone)}
            onChangeText={(value) => flow.setPhone(value)}
            error={state.phoneError}
            editable={!busy}
            keyboardType="phone-pad"
            textContentType="telephoneNumber"
            autoComplete="tel"
            returnKeyType="done"
            onSubmitEditing={() => {
              void flow.submitPhone();
            }}
          />
          <AuthSubmitButton
            label="Получить код"
            busy={busy}
            onPress={() => {
              void flow.submitPhone();
            }}
          />
          {!busy && state.failure !== "connection" ? (
            <View style={styles.footer}>
              <Text style={styles.caption}>Нет аккаунта?</Text>
              <TextButton
                label="Зарегистрироваться"
                onPress={() => router.replace("/signup")}
              />
            </View>
          ) : null}
        </>
      ) : null}

      {step === "channels" ? (
        <View style={styles.channels}>
          {session?.channels.map((item) => (
            <AuthChannelOption
              key={item.kind}
              kind={item.kind}
              title={channelTitles[item.kind]}
              subtitle={
                item.kind === "telegram"
                  ? "Пришлём код в чат с ботом"
                  : item.kind === "sms"
                    ? formatRecoveryPhone(item.destination)
                    : item.destination
              }
              cooldownSeconds={flow.channelWaitSeconds(item)}
              disabled={busy || flow.channelWaitSeconds(item) > 0}
              onPress={() => {
                void flow.sendCode(item);
              }}
            />
          ))}
        </View>
      ) : null}

      {step === "code" ? (
        <View style={styles.codeForm}>
          <AuthCodeInput
            value={state.code}
            onChange={(value) => flow.setCode(value)}
            onComplete={(value) => {
              void flow.confirmCode(value);
            }}
            disabled={busy}
            error={codeError}
            autoFocus
            appearance="recovery"
          />
          {busy ? (
            <AuthSubmitButton label="Проверить код" busy onPress={() => {}} />
          ) : ["request", "connection"].includes(state.failure ?? "") ? (
            <TextButton
              label="Проверить код ещё раз"
              onPress={() => {
                void flow.confirmCode();
              }}
            />
          ) : null}
          {state.remainingSeconds > 0 ? (
            <Text style={styles.timer}>
              Получить новый код через{" "}
              {formatRecoveryTimer(state.remainingSeconds)}
            </Text>
          ) : (
            <AuthSubmitButton
              label="Получить новый код"
              busy={busy}
              onPress={() => {
                void flow.resendCode();
              }}
            />
          )}
          {otherChannels.length ? (
            <View style={styles.footer}>
              <Text style={styles.caption}>Не приходит код?</Text>
              <TextButton
                label="Другие способы"
                disabled={busy}
                onPress={() => flow.showOtherChannels()}
              />
            </View>
          ) : null}
        </View>
      ) : null}

      {step === "password" ? (
        <>
          <View style={styles.fields}>
            <AuthInput
              label="Новый пароль"
              appearance="recovery"
              value={state.password}
              onChangeText={(value) => flow.setPassword(value)}
              secureTextEntry
              editable={!busy}
              textContentType="newPassword"
              autoComplete="new-password"
              autoCapitalize="none"
              autoCorrect={false}
              hint="Минимум 8 символов, буквы и цифры"
              error={state.passwordError}
            />
            <AuthInput
              label="Повторите пароль"
              appearance="recovery"
              value={state.confirmation}
              onChangeText={(value) => flow.setConfirmation(value)}
              secureTextEntry
              editable={!busy}
              textContentType="newPassword"
              autoComplete="new-password"
              autoCapitalize="none"
              autoCorrect={false}
              error={state.confirmationError}
              returnKeyType="done"
              onSubmitEditing={() => {
                void flow.savePassword();
              }}
            />
          </View>
          <AuthSubmitButton
            label="Сохранить пароль"
            busy={busy}
            onPress={() => {
              void flow.savePassword();
            }}
          />
        </>
      ) : null}

      {step === "success" ? (
        <AuthSubmitButton
          label="Перейти в личный кабинет"
          busy={opening}
          onPress={() => {
            void openCabinet();
          }}
        />
      ) : null}

      {step === "exhausted" ? (
        <>
          <View style={styles.channels}>
            <AuthChannelOption
              kind="telegram"
              title="Написать в Telegram"
              subtitle="Поддержка ВожуГо в чате"
              onPress={() => {
                void openLink("https://t.me/vozhugo");
              }}
            />
            <AuthChannelOption
              kind="email"
              title="Написать на почту"
              subtitle="info@vozhugo.ru"
              onPress={() => {
                void openLink("mailto:info@vozhugo.ru");
              }}
            />
          </View>
          <View style={styles.footer}>
            <Text style={styles.caption}>Вспомнили пароль?</Text>
            <TextButton label="Войти" onPress={() => router.replace("/")} />
          </View>
        </>
      ) : null}
    </AuthPageLayout>
  );
}

const styles = StyleSheet.create({
  channels: { width: "100%", gap: 12 },
  fields: { width: "100%", gap: 16 },
  codeForm: { width: "100%", gap: 24, alignItems: "center" },
  footer: {
    width: "100%",
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    alignItems: "center",
    columnGap: 8,
  },
  caption: {
    color: "#808080",
    fontFamily: "Roboto_400Regular",
    fontSize: 14,
    lineHeight: 18,
  },
  textButton: { minHeight: 44, justifyContent: "center", paddingVertical: 8 },
  link: {
    color: "#808080",
    fontFamily: "Roboto_400Regular",
    fontSize: 14,
    lineHeight: 18,
    textAlign: "center",
  },
  timer: {
    color: "#808080",
    fontFamily: "Roboto_400Regular",
    fontSize: 12,
    lineHeight: 16,
    textAlign: "center",
  },
  error: {
    width: "100%",
    paddingVertical: 8,
    paddingHorizontal: 20,
    backgroundColor: "#fdd9d3",
    borderRadius: 12,
    color: "#e0533b",
    fontFamily: "Roboto_400Regular",
    fontSize: 14,
    lineHeight: 18,
    textAlign: "center",
  },
});
