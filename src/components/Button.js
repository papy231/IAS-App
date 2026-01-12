import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { palette } from '../theme/colors';

const variantStyles = {
  default: {
    backgroundColor: palette.accent,
    color: palette.primaryText,
    borderColor: 'transparent',
  },
  secondary: {
    backgroundColor: palette.secondary,
    color: palette.secondaryText,
    borderColor: 'transparent',
  },
  outline: {
    backgroundColor: 'transparent',
    color: palette.foreground,
    borderColor: palette.border,
  },
  destructive: {
    backgroundColor: palette.danger,
    color: '#fff',
    borderColor: 'transparent',
  },
  ghost: {
    backgroundColor: 'transparent',
    color: palette.foreground,
    borderColor: 'transparent',
  },
};

const sizeStyles = {
  sm: { paddingVertical: 8, paddingHorizontal: 12, fontSize: 13, borderRadius: 10 },
  md: { paddingVertical: 10, paddingHorizontal: 16, fontSize: 14, borderRadius: 12 },
  lg: { paddingVertical: 12, paddingHorizontal: 20, fontSize: 16, borderRadius: 14 },
  icon: { paddingVertical: 10, paddingHorizontal: 10, fontSize: 14, borderRadius: 999 },
};

export default function Button({
  children,
  variant = 'default',
  size = 'md',
  style,
  textStyle,
  disabled,
  onPress,
  ...rest
}) {
  const v = variantStyles[variant] || variantStyles.default;
  const s = sizeStyles[size] || sizeStyles.md;
  const handlePress = React.useCallback(
    (event) => {
      if (onPress) {
        onPress(event);
      }
    },
    [onPress],
  );
  return (
    <TouchableOpacity
      onPress={handlePress}
      disabled={disabled}
      style={[
        styles.base,
        { backgroundColor: v.backgroundColor, borderColor: v.borderColor, borderRadius: s.borderRadius },
        size === 'icon' ? styles.iconFrame : null,
        style,
      ]}
      {...rest}
    >
      {typeof children === 'string' ? (
        <Text style={[styles.text, { color: v.color, fontSize: s.fontSize }, textStyle]}>{children}</Text>
      ) : (
        children
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  text: {
    fontWeight: '600',
  },
  iconFrame: {
    width: 44,
    height: 44,
  },
});
