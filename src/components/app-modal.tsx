import type { ReactNode } from 'react';
import {
  KeyboardAvoidingView, Modal, Platform, Pressable, ScrollView, StyleSheet, View,
  type ModalProps, type StyleProp, type ViewStyle,
} from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';

interface Props extends Omit<ModalProps, 'children' | 'transparent' | 'onRequestClose' | 'supportedOrientations'> {
  children: ReactNode;
  onRequestClose?: () => void;
  dismissOnBackdrop?: boolean;
  contentContainerStyle?: StyleProp<ViewStyle>;
}

export function AppModal({ children, onRequestClose, dismissOnBackdrop = false, contentContainerStyle, ...props }: Props) {
  return (
    <Modal animationType="fade" {...props} transparent onRequestClose={onRequestClose}
      supportedOrientations={['portrait', 'landscape-left', 'landscape-right']}>
      <SafeAreaProvider style={styles.backdrop}>
        <KeyboardAvoidingView style={styles.safeArea} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <SafeAreaView style={styles.safeArea}>
            <View style={styles.container}>
              <Pressable style={StyleSheet.absoluteFill} accessible={false}
                onPress={dismissOnBackdrop ? onRequestClose : undefined} />
              <View style={styles.panel} accessibilityViewIsModal>
                <ScrollView keyboardShouldPersistTaps="handled" keyboardDismissMode="on-drag"
                  style={styles.scroll}
                  contentContainerStyle={[styles.content, contentContainerStyle]}>
                  {children}
                </ScrollView>
              </View>
            </View>
          </SafeAreaView>
        </KeyboardAvoidingView>
      </SafeAreaProvider>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)' },
  safeArea: { flex: 1 },
  container: { flex: 1, padding: 16, justifyContent: 'center', alignItems: 'center' },
  panel: { width: '100%', maxWidth: 560, maxHeight: '100%', backgroundColor: '#ffffff', borderRadius: 16, overflow: 'hidden' },
  content: { padding: 24 },
  scroll: { flexGrow: 0 },
});
