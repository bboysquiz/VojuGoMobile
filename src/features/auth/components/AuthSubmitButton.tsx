import { Image } from "expo-image";
import { useEffect, useState } from "react";
import { Animated, Easing, Pressable, StyleSheet, Text } from "react-native";

function Loader() {
  const [rotation] = useState(() => new Animated.Value(0));
  useEffect(() => {
    const animation = Animated.loop(
      Animated.timing(rotation, {
        toValue: 1,
        duration: 1000,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
    );
    animation.start();
    return () => animation.stop();
  }, [rotation]);
  return (
    <Animated.View
      style={{
        transform: [
          {
            rotate: rotation.interpolate({
              inputRange: [0, 1],
              outputRange: ["0deg", "360deg"],
            }),
          },
        ],
      }}
    >
      <Image
        source={require("../../../../assets/auth/recovery-loader.svg")}
        style={styles.loader}
      />
    </Animated.View>
  );
}

export function AuthSubmitButton({
  label,
  busy = false,
  onPress,
}: {
  label: string;
  busy?: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ busy, disabled: busy }}
      disabled={busy}
      onPress={onPress}
      style={({ pressed }) => [styles.button, pressed && styles.pressed]}
    >
      {busy ? <Loader /> : <Text style={styles.label}>{label}</Text>}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    width: "100%",
    minHeight: 56,
    padding: 16,
    borderRadius: 12,
    backgroundColor: "#000",
    justifyContent: "center",
    alignItems: "center",
  },
  label: {
    color: "#fff",
    fontFamily: "Roboto_500Medium",
    fontSize: 14,
    lineHeight: 20,
    textAlign: "center",
  },
  loader: { width: 20, height: 20 },
  pressed: { opacity: 0.8 },
});
