import { Image } from "expo-image";
import { Pressable, StyleSheet, Text, View } from "react-native";
import type { RecoveryChannelKind } from "../model/password-recovery";
import { formatRecoveryTimer } from "../model/password-recovery-controller";

const icons = {
  telegram: require("../../../../assets/auth/recovery-telegram.svg"),
  email: require("../../../../assets/auth/recovery-email.svg"),
  sms: require("../../../../assets/auth/recovery-sms.svg"),
};

export function AuthChannelOption({
  kind,
  title,
  subtitle,
  disabled = false,
  cooldownSeconds = 0,
  onPress,
}: {
  kind: RecoveryChannelKind;
  title: string;
  subtitle: string;
  disabled?: boolean;
  cooldownSeconds?: number;
  onPress: () => void;
}) {
  const caption = cooldownSeconds
    ? `Получить новый код через ${formatRecoveryTimer(cooldownSeconds)}`
    : subtitle;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${title}. ${caption}`}
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [styles.option, pressed && styles.pressed]}
    >
      <View style={styles.iconCircle}>
        <Image source={icons[kind]} style={styles.icon} />
      </View>
      <View style={styles.text}>
        <Text style={styles.title}>{title}</Text>
        {caption ? <Text style={styles.subtitle}>{caption}</Text> : null}
      </View>
      <Image
        source={require("../../../../assets/auth/recovery-chevron.svg")}
        style={styles.chevron}
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  option: {
    width: "100%",
    minHeight: 72,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: "#f1f1f1",
    borderRadius: 12,
  },
  iconCircle: {
    width: 40,
    height: 40,
    flexShrink: 0,
    borderRadius: 20,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
  },
  icon: { width: 24, height: 24 },
  text: { flex: 1, minWidth: 0, gap: 4 },
  title: {
    color: "#191919",
    fontFamily: "Roboto_400Regular",
    fontSize: 16,
    lineHeight: 20,
  },
  subtitle: {
    color: "#808080",
    fontFamily: "Roboto_400Regular",
    fontSize: 14,
    lineHeight: 18,
  },
  chevron: { width: 20, height: 20, flexShrink: 0 },
  pressed: { opacity: 0.75 },
});
