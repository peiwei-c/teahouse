import React from 'react';
import { Pressable, StyleSheet, View, type PressableProps } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { TEA } from '../theme/tea';

type Props = PressableProps & {
  children: React.ReactNode;
};

export function TeaScene({ children }: { children: React.ReactNode }) {
  return (
    <View style={styles.wood}>
      <View style={styles.gold}>
        <LinearGradient
          colors={['#1f6a45', TEA.feltLit, TEA.felt]}
          locations={[0, 0.28, 1]}
          style={styles.felt}
        >
          {children}
        </LinearGradient>
      </View>
    </View>
  );
}

export function CreamButton({ children, style, accessibilityRole = 'button', ...rest }: Props) {
  return (
    <Pressable
      {...rest}
      accessibilityRole={accessibilityRole}
      style={(state) => [
        styles.cream,
        state.pressed && styles.pressed,
        typeof style === 'function' ? style(state) : style,
      ]}
    >
      {children}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wood: {
    flex: 1,
    backgroundColor: TEA.wood,
    padding: 10,
  },
  gold: {
    flex: 1,
    borderWidth: 5,
    borderColor: TEA.gold,
    borderRadius: 26,
    overflow: 'hidden',
    backgroundColor: TEA.woodDark,
    padding: 4,
  },
  felt: {
    flex: 1,
    borderRadius: 18,
    overflow: 'hidden',
  },
  cream: {
    minHeight: 54,
    borderRadius: 16,
    backgroundColor: TEA.creamBtn,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    shadowColor: TEA.shadow,
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 4,
  },
  pressed: {
    transform: [{ scale: 0.97 }],
  },
});
