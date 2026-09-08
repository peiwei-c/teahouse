import React from 'react';
import { StyleSheet, Text, type TextProps } from 'react-native';

type Props = TextProps & {
  /** Keep the whole word on one line. Shrinks a little if the box is tight. */
  fit?: boolean;
};

export function UiText({ fit = false, numberOfLines, style, ...rest }: Props) {
  const lines = numberOfLines ?? (fit ? 1 : undefined);
  return (
    <Text
      numberOfLines={lines}
      adjustsFontSizeToFit={fit}
      minimumFontScale={0.72}
      maxFontSizeMultiplier={1.2}
      android_hyphenationFrequency="none"
      textBreakStrategy="simple"
      {...rest}
      style={[styles.base, style]}
    />
  );
}

const styles = StyleSheet.create({
  base: {
    includeFontPadding: false,
  },
});
