import { Image } from "expo-image";
import type { ReactNode } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useResponsiveLayout } from "../../../hooks/use-responsive-layout";

export function AuthPageLayout({
  title,
  description,
  success = false,
  onClose,
  headerExtra,
  children,
}: {
  title: string;
  description?: string;
  success?: boolean;
  onClose: () => void;
  headerExtra?: ReactNode;
  children: ReactNode;
}) {
  const { isLandscape } = useResponsiveLayout();
  return (
    <SafeAreaView style={styles.screen}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          contentContainerStyle={[
            styles.scroll,
            isLandscape && styles.scrollLandscape,
          ]}
        >
          <View style={styles.card}>
            <Image
              source={require("../../../../assets/landing/hazard-stripe.svg")}
              style={styles.hazard}
              contentFit="cover"
            />
            <View style={[styles.body, isLandscape && styles.bodyLandscape]}>
              <Image
                source={require("../../../../assets/landing/logo_mobile.svg")}
                style={styles.logo}
                contentFit="contain"
              />
              <View style={styles.header}>
                {success ? (
                  <Image
                    source={require("../../../../assets/auth/recovery-success.svg")}
                    style={styles.success}
                    contentFit="contain"
                  />
                ) : null}
                <Text accessibilityRole="header" style={styles.title}>
                  {title}
                </Text>
                {description ? (
                  <Text style={styles.description}>{description}</Text>
                ) : null}
                {headerExtra}
              </View>
              {children}
            </View>
          </View>
        </ScrollView>
        {!success ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Закрыть восстановление пароля"
            onPress={onClose}
            style={styles.close}
          >
            <Image
              source={require("../../../../assets/auth/recovery-close.svg")}
              style={styles.closeIcon}
            />
          </Pressable>
        ) : null}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#f1f1f1" },
  flex: { flex: 1 },
  scroll: {
    flexGrow: 1,
    paddingTop: 64,
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  scrollLandscape: { paddingTop: 48, paddingBottom: 16 },
  card: {
    width: "100%",
    maxWidth: 440,
    alignSelf: "center",
    borderRadius: 14,
    backgroundColor: "#fff",
    overflow: "hidden",
  },
  hazard: { width: "100%", height: 8 },
  body: {
    paddingVertical: 40,
    paddingHorizontal: 16,
    alignItems: "center",
    gap: 32,
  },
  bodyLandscape: { paddingVertical: 24, paddingHorizontal: 24, gap: 24 },
  logo: { width: 86, height: 28 },
  header: { width: "100%", alignItems: "center" },
  title: {
    color: "#191919",
    fontFamily: "Roboto_500Medium",
    fontSize: 18,
    lineHeight: 24,
    textAlign: "center",
  },
  description: {
    marginTop: 8,
    color: "#808080",
    fontFamily: "Roboto_400Regular",
    fontSize: 14,
    lineHeight: 18,
    textAlign: "center",
  },
  close: {
    position: "absolute",
    top: 0,
    right: 4,
    width: 48,
    height: 48,
    padding: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  closeIcon: { width: 24, height: 24 },
  success: { width: 56, height: 56, marginBottom: 16 },
});
