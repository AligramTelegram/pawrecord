import React, { useState } from 'react';
import {
  View, Text, TextInput, StyleSheet, TextInputProps, ViewStyle,
} from 'react-native';
import { Colors } from '../../constants/colors';
import { Spacing } from '../../constants/typography';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  hint?: string;
  icon?: string;
  containerStyle?: ViewStyle;
}

export function Input({ label, error, hint, icon, containerStyle, ...props }: InputProps) {
  const [focused, setFocused] = useState(false);

  return (
    <View style={[styles.container, containerStyle]}>
      {label && (
        <Text style={[styles.label, focused && styles.labelFocused, error ? styles.labelError : null]}>
          {label}
        </Text>
      )}
      <View style={[
        styles.inputWrap,
        focused && styles.inputWrapFocused,
        error ? styles.inputWrapError : null,
        props.multiline && styles.inputWrapMulti,
      ]}>
        {icon && <Text style={styles.icon}>{icon}</Text>}
        <TextInput
          {...props}
          style={[styles.input, props.multiline && styles.inputMulti, props.style]}
          placeholderTextColor={Colors.neutral[300]}
          onFocus={(e) => { setFocused(true); props.onFocus?.(e); }}
          onBlur={(e) => { setFocused(false); props.onBlur?.(e); }}
        />
      </View>
      {error && <Text style={styles.error}>⚠ {error}</Text>}
      {hint && !error && <Text style={styles.hint}>{hint}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginBottom: 18 },

  label: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.neutral[500],
    marginBottom: 8,
    letterSpacing: 0.2,
  },
  labelFocused: { color: Colors.brand.primary },
  labelError: { color: Colors.semantic.danger },

  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.card,
    borderWidth: 1.5,
    borderColor: Colors.cardBorder,
    borderRadius: 14,
    paddingHorizontal: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  inputWrapFocused: {
    borderColor: Colors.brand.primary,
    shadowColor: Colors.brand.primary,
    shadowOpacity: 0.12,
    shadowRadius: 8,
  },
  inputWrapError: {
    borderColor: Colors.semantic.danger,
  },
  inputWrapMulti: {
    alignItems: 'flex-start',
    paddingTop: 12,
    paddingBottom: 12,
  },

  icon: { fontSize: 18, marginRight: 10 },

  input: {
    flex: 1,
    fontSize: 15,
    color: Colors.neutral[900],
    paddingVertical: 14,
    fontWeight: '500',
  },
  inputMulti: {
    minHeight: 80,
    textAlignVertical: 'top',
    paddingVertical: 0,
  },

  error: { fontSize: 12, color: Colors.semantic.danger, marginTop: 6, fontWeight: '500' },
  hint: { fontSize: 12, color: Colors.neutral[400], marginTop: 6 },
});
