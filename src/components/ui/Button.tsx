import React from 'react';
import {
  TouchableOpacity,
  Text,
  ActivityIndicator,
  StyleSheet,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { Colors } from '../../constants/colors';
import { Radius } from '../../constants/typography';

interface ButtonProps {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  fullWidth?: boolean;
}

export function Button({
  label,
  onPress,
  variant = 'primary',
  loading = false,
  disabled = false,
  style,
  textStyle,
  fullWidth = false,
}: ButtonProps) {
  const isDisabled = disabled || loading;

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.75}
      style={[
        styles.base,
        styles[variant],
        fullWidth && styles.fullWidth,
        isDisabled && styles.disabled,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator
          color={variant === 'primary' ? Colors.white : Colors.brand.primary}
          size="small"
        />
      ) : (
        <Text style={[styles.label, styles[`label_${variant}`], textStyle]}>{label}</Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: Radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 50,
  },
  fullWidth: {
    width: '100%',
  },
  primary: {
    backgroundColor: Colors.brand.primary,
  },
  secondary: {
    backgroundColor: Colors.neutral[100],
    borderWidth: 1,
    borderColor: Colors.neutral[200],
  },
  ghost: {
    backgroundColor: Colors.transparent,
  },
  danger: {
    backgroundColor: Colors.semantic.danger,
  },
  disabled: {
    opacity: 0.5,
  },
  label: {
    fontSize: 15,
    fontWeight: '600',
  },
  label_primary: {
    color: Colors.white,
  },
  label_secondary: {
    color: Colors.neutral[900],
  },
  label_ghost: {
    color: Colors.brand.primary,
  },
  label_danger: {
    color: Colors.white,
  },
});
