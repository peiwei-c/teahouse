import React, { Component, type ErrorInfo, type ReactNode } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { TEA, FONTS } from '../theme/tea';
import { UiText } from './UiText';

type Props = { children: ReactNode };
type State = { error: Error | null };

export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('[TeaHouse]', error, info.componentStack);
  }

  render() {
    if (!this.state.error) return this.props.children;
    return (
      <View style={styles.box}>
        <UiText numberOfLines={2} style={styles.title}>
          The table wobbled.
        </UiText>
        <UiText numberOfLines={4} style={styles.body}>
          {this.state.error.message}
        </UiText>
        <Pressable style={styles.btn} onPress={() => this.setState({ error: null })}>
          <UiText fit style={styles.btnText}>
            Try again
          </UiText>
        </Pressable>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  box: {
    flex: 1,
    backgroundColor: TEA.woodDark,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  title: {
    fontFamily: FONTS.display,
    fontSize: 28,
    color: TEA.ivory,
  },
  body: {
    marginTop: 12,
    fontFamily: FONTS.uiBold,
    fontSize: 16,
    color: TEA.goldLight,
    textAlign: 'center',
  },
  btn: {
    marginTop: 24,
    backgroundColor: TEA.creamBtn,
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 16,
  },
  btnText: {
    fontFamily: FONTS.ui,
    fontSize: 18,
    color: TEA.ink,
  },
});
