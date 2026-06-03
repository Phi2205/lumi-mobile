import React from "react";
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
  StyleProp,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Colors, BorderRadius, FontSize, FontWeight } from "@/constants/theme";

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: "primary" | "secondary" | "outline" | "ghost" | "destructive";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  icon?: React.ReactNode;
  iconPosition?: "left" | "right";
}

export function Button({
  title,
  onPress,
  variant = "primary",
  size = "md",
  loading = false,
  disabled = false,
  style,
  textStyle,
  icon,
  iconPosition = "left",
}: ButtonProps) {
  const isDisabled = disabled || loading;

  const getSizeStyle = () => {
    switch (size) {
      case "sm":
        return styles.sizeSm;
      case "lg":
        return styles.sizeLg;
      default:
        return styles.sizeMd;
    }
  };

  const getTextSize = () => {
    switch (size) {
      case "sm":
        return styles.textSm;
      case "lg":
        return styles.textLg;
      default:
        return styles.textMd;
    }
  };

  const getVariantStyle = () => {
    switch (variant) {
      case "secondary":
        return styles.secondary;
      case "outline":
        return styles.outline;
      case "ghost":
        return styles.ghost;
      case "destructive":
        return styles.destructive;
      default:
        return null;
    }
  };

  const getTextColor = () => {
    switch (variant) {
      case "outline":
      case "ghost":
        return Colors.brand.primary;
      case "destructive":
        return "#FFFFFF";
      case "secondary":
        return Colors.text.primary;
      default:
        return Colors.text.dark;
    }
  };

  const renderContent = () => (
    <>
      {loading ? (
        <ActivityIndicator
          color={getTextColor()}
          size={size === "sm" ? "small" : "small"}
        />
      ) : (
        <>
          {icon && iconPosition === "left" && icon}
          <Text
            style={[
              styles.text,
              getTextSize(),
              { color: getTextColor() },
              icon && iconPosition === "left" ? styles.textWithIconLeft : null,
              icon && iconPosition === "right" ? styles.textWithIconRight : null,
              textStyle,
            ]}
          >
            {title}
          </Text>
          {icon && iconPosition === "right" && icon}
        </>
      )}
    </>
  );

  if (variant === "primary") {
    return (
      <TouchableOpacity
        onPress={onPress}
        disabled={isDisabled}
        activeOpacity={0.8}
        style={[getSizeStyle(), isDisabled && styles.disabled, style]}
      >
        <LinearGradient
          colors={Colors.gradients.brand}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={[styles.gradient, getSizeStyle()]}
        >
          {renderContent()}
        </LinearGradient>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.7}
      style={[
        styles.button,
        getSizeStyle(),
        getVariantStyle(),
        isDisabled && styles.disabled,
        style,
      ]}
    >
      {renderContent()}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: BorderRadius.lg,
  },
  gradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: BorderRadius.lg,
  },
  sizeSm: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: BorderRadius.sm,
  },
  sizeMd: {
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  sizeLg: {
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderRadius: BorderRadius.xl,
  },
  secondary: {
    backgroundColor: Colors.dark.elevated,
  },
  outline: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: Colors.brand.primary,
  },
  ghost: {
    backgroundColor: "transparent",
  },
  destructive: {
    backgroundColor: Colors.status.error,
  },
  disabled: {
    opacity: 0.5,
  },
  text: {
    fontWeight: FontWeight.semibold,
    textAlign: "center",
  },
  textSm: {
    fontSize: FontSize.sm,
  },
  textMd: {
    fontSize: FontSize.base,
  },
  textLg: {
    fontSize: FontSize.md,
  },
  textWithIconLeft: {
    marginLeft: 8,
  },
  textWithIconRight: {
    marginRight: 8,
  },
});