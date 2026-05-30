import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '../../constants/colors';
import { Radius } from '../../constants/typography';

type BadgeVariant = 'success' | 'warning' | 'danger' | 'info' | 'neutral';

interface BadgeProps {
  label: string;
  variant?: BadgeVariant;
}

export function Badge({ label, variant = 'neutral' }: BadgeProps) {
  return (
    <View style={[styles.base, styles[variant]]}>
      <Text style={[styles.text, styles[`text_${variant}`]]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: Radius.full,
    alignSelf: 'flex-start',
  },
  success: { backgroundColor: Colors.semantic.successBg },
  warning: { backgroundColor: Colors.semantic.warningBg },
  danger: { backgroundColor: Colors.semantic.dangerBg },
  info: { backgroundColor: Colors.semantic.infoBg },
  neutral: { backgroundColor: Colors.neutral[200] },
  text: { fontSize: 11, fontWeight: '600' },
  text_success: { color: Colors.semantic.success },
  text_warning: { color: Colors.semantic.warning },
  text_danger: { color: Colors.semantic.danger },
  text_info: { color: Colors.semantic.info },
  text_neutral: { color: Colors.neutral[600] },
});
