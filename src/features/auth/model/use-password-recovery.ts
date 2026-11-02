import { useEffect, useState, useSyncExternalStore } from "react";
import { AppState } from "react-native";
import { passwordRecoveryApi } from "../api/password-recovery.api";
import { PasswordRecoveryController } from "./password-recovery-controller";
import { peekRecoveryPhone, takeRecoveryPhone } from "./recovery-phone";

export function usePasswordRecovery() {
  const [flow] = useState(
    () =>
      new PasswordRecoveryController(passwordRecoveryApi, peekRecoveryPhone()),
  );
  const state = useSyncExternalStore(
    flow.subscribe,
    flow.getSnapshot,
    flow.getSnapshot,
  );
  useEffect(() => {
    takeRecoveryPhone();
    flow.activate();
    const subscription = AppState.addEventListener("change", (status) => {
      if (status === "active") flow.refreshClock();
    });
    return () => {
      subscription.remove();
      flow.dispose();
    };
  }, [flow]);
  return { state, flow };
}
