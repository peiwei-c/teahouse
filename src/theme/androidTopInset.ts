import { Platform, StatusBar } from 'react-native';

export const ANDROID_TOP_INSET =
  Platform.OS === 'android' ? StatusBar.currentHeight ?? 24 : 0;

/**
 * Extra space under the status bar / phone notch so the HUD isn't cramped.
 * Web has no safe-area inset in the phone frame, so it needs a full bar.
 * Native already gets the notch from SafeAreaView.
 */
export const TOP_BUFFER = Platform.OS === 'web' ? 36 : 10;
