import React from "react";
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
  StyleProp,
  View,
} from "react-native";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import { Colors, BorderRadius, FontSize, FontWeight } from "@/constants/theme";

interface GlassButtonProps {
  children: React.ReactNode;
  onPress?: () => void;
  variant?: "primary" | "secondary" | "accent" | "ghost";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
  disabled?: boolean;
  intensity?: number;
  depth?: number;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  icon?: React.ReactNode;
  iconPosition?: "left" | "right";
}

export function GlassButton({
  children,
  onPress,
  variant = "primary",
  size = "md",
  loading = false,
  disabled = false,
  intensity = 20,
  depth = 3,
  style,
  textStyle,
  icon,
  iconPosition = "left",
}: GlassButtonProps) {
  const isDisabled = disabled || loading;

  const getSizeStyles = () => {
    switch (size) {
      case "sm":
        return {
          container: styles.sizeSm,
          text: styles.textSm,
          paddingHorizontal: 12,
          paddingVertical: 8,
          borderRadius: BorderRadius.sm,
        };
      case "lg":
        return {
          container: styles.sizeLg,
          text: styles.textLg,
          paddingHorizontal: 24,
          paddingVertical: 16,
          borderRadius: BorderRadius.xl,
        };
      case "md":
      default:
        return {
          container: styles.sizeMd,
          text: styles.textMd,
          paddingHorizontal: 20,
          paddingVertical: 12,
          borderRadius: BorderRadius.lg,
        };
    }
  };

  const getVariantStyles = () => {
    switch (variant) {
      case "secondary":
        return {
          colors: ["rgba(255, 255, 255, 0.15)", "rgba(255, 255, 255, 0.05)"],
          borderColor: "rgba(255, 255, 255, 0.25)",
          textColor: "#FFFFFF",
        };
      case "accent":
        return {
          colors: ["rgba(250, 204, 21, 0.20)", "rgba(234, 179, 8, 0.08)"],
          borderColor: "rgba(250, 204, 21, 0.25)",
          textColor: "#FEF9C3",
        };
      case "ghost":
        return {
          colors: ["rgba(255, 255, 255, 0.06)", "rgba(255, 255, 255, 0.01)"],
          borderColor: "rgba(255, 255, 255, 0.12)",
          textColor: "rgba(255, 255, 255, 0.8)",
        };
      case "primary":
      default:
        return {
          colors: ["rgba(182, 196, 162, 0.25)", "rgba(182, 196, 162, 0.10)"],
          borderColor: "rgba(182, 196, 162, 0.30)",
          textColor: Colors.brand.primaryLight,
        };
    }
  };

  const sizeConfig = getSizeStyles();
  const variantConfig = getVariantStyles();

  // Shadow calculation based on depth (max 10)
  const shadowOpacity = Math.max(0.05, Math.min(0.4, 0.1 + depth * 0.03));
  const shadowRadius = Math.max(2, Math.min(24, depth * 3));
  const elevation = Math.max(1, Math.min(8, depth));

  const buttonShadowStyle: ViewStyle = {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: Math.ceil(depth) },
    shadowOpacity,
    shadowRadius,
    elevation,
  };

  const renderContent = () => {
    if (loading) {
      return (
        <ActivityIndicator
          color={variantConfig.textColor}
          size="small"
        />
      );
    }

    return (
      <View style={styles.contentRow}>
        {icon && iconPosition === "left" && (
          <View style={styles.iconLeft}>{icon}</View>
        )}
        {typeof children === "string" ? (
          <Text
            style={[
              styles.text,
              sizeConfig.text,
              { color: variantConfig.textColor },
              textStyle,
            ]}
          >
            {children}
          </Text>
        ) : (
          children
        )}
        {icon && iconPosition === "right" && (
          <View style={styles.iconRight}>{icon}</View>
        )}
      </View>
    );
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.8}
      style={[
        styles.buttonContainer,
        {
          borderRadius: sizeConfig.borderRadius,
          borderColor: variantConfig.borderColor,
        },
        buttonShadowStyle,
        isDisabled && styles.disabled,
        style,
      ]}
    >
      <BlurView
        intensity={intensity}
        tint="dark"
        style={[styles.blurView, { borderRadius: sizeConfig.borderRadius }]}
      >
        <LinearGradient
          colors={variantConfig.colors as [string, string]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[sizeConfig.container, styles.gradient]}
        >
          {renderContent()}
        </LinearGradient>
      </BlurView>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  buttonContainer: {
    borderWidth: 1,
    overflow: "hidden",
    alignSelf: "stretch",
  },
  blurView: {
    width: "100%",
  },
  gradient: {
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
  contentRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  disabled: {
    opacity: 0.5,
  },
  text: {
    fontWeight: FontWeight.semibold,
    textAlign: "center",
  },
  sizeSm: {
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  sizeMd: {
    paddingVertical: 12,
    paddingHorizontal: 20,
  },
  sizeLg: {
    paddingVertical: 16,
    paddingHorizontal: 24,
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
  iconLeft: {
    marginRight: 6,
  },
  iconRight: {
    marginLeft: 6,
  },
});
