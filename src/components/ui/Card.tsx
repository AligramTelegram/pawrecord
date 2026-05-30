import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { Colors } from '../../constants/colors';
import { Radius, Spacing } from '../../constants/typography';

interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  padding?: number;
}

export function Card({ children, style, padding = Spacing.lg }: CardProps) {
  return (
    <View style={[styles.card, { padding }, style]}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.neutral[100],
    borderRadius: Radius.md,
    borderWidth: 0.5,
    borderColor: Colors.neutral[200],
  },
});
