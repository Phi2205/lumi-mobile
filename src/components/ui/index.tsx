import React from 'react';
import {
  View,
  Text,
  TextInput as RNTextInput,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  ViewProps,
  TouchableOpacityProps,
  TextInputProps as RNTextInputProps,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/theme';

// ==========================================
// 1. GlassCard Component
// ==========================================
export function GlassCard({ style, children, ...props }: ViewProps) {
  return (
    <View style={[styles.glassCard, style]} {...props}>
      {children}
    </View>
  );
}

// ==========================================
// 2. Button Component
// ==========================================
interface ButtonProps extends TouchableOpacityProps {
  title: string;
  loading?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export function Button({ title, loading, size = 'md', style, ...props }: ButtonProps) {
  return (
    <TouchableOpacity
      style={[
        styles.button,
        styles[size],
        loading && styles.buttonDisabled,
        style,
      ]}
      disabled={loading || props.disabled}
      activeOpacity={0.8}
      {...props}
    >
      {loading ? (
        <ActivityIndicator color={Colors.dark.background} />
      ) : (
        <Text style={styles.buttonText}>{title}</Text>
      )}
    </TouchableOpacity>
  );
}

// ==========================================
// 3. TextInput Component
// ==========================================
interface TextInputProps extends RNTextInputProps {
  label?: string;
  leftIcon?: keyof typeof Ionicons.glyphMap;
  error?: string;
  hint?: string;
}

export function TextInput({ label, leftIcon, error, hint, style, ...props }: TextInputProps) {
  return (
    <View style={styles.inputContainer}>
      {label && <Text style={styles.inputLabel}>{label}</Text>}
      <View style={[styles.inputWrapper, error ? styles.inputError : null]}>
        {leftIcon && (
          <Ionicons
            name={leftIcon}
            size={20}
            color="#999"
            style={styles.inputIcon}
          />
        )}
        <RNTextInput
          style={[styles.inputField, style]}
          placeholderTextColor="#666"
          {...props}
        />
      </View>
      {error ? (
        <Text style={styles.inputErrorText}>{error}</Text>
      ) : hint ? (
        <Text style={styles.inputHintText}>{hint}</Text>
      ) : null}
    </View>
  );
}

// ==========================================
// Styles
// ==========================================
const styles = StyleSheet.create({
  // GlassCard
  glassCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 4,
  },
  // Button
  button: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  sm: {
    height: 36,
    paddingHorizontal: 12,
  },
  md: {
    height: 44,
    paddingHorizontal: 16,
  },
  lg: {
    height: 52,
    paddingHorizontal: 24,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#000000',
    fontSize: 16,
    fontWeight: '600',
  },
  // TextInput
  inputContainer: {
    marginBottom: 12,
    alignSelf: 'stretch',
  },
  inputLabel: {
    color: '#B0B4BA',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 6,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    height: 48,
    paddingHorizontal: 12,
  },
  inputError: {
    borderColor: '#FF3B30',
  },
  inputIcon: {
    marginRight: 8,
  },
  inputField: {
    flex: 1,
    color: '#ffffff',
    fontSize: 16,
    height: '100%',
  },
  inputErrorText: {
    color: '#FF3B30',
    fontSize: 12,
    marginTop: 4,
  },
  inputHintText: {
    color: '#8E8E93',
    fontSize: 12,
    marginTop: 4,
  },
});
export { Collapsible } from './collapsible';
export { Avatar } from './Avatar';
