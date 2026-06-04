import React from "react";
import {
  View,
  StyleSheet,
  ViewStyle,
  StyleProp,
  TouchableOpacity,
  Pressable,
  Platform,
} from "react-native";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import { Colors, BorderRadius, Shadow } from "@/constants/theme";

interface GlassCardProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  intensity?: number | "light" | "medium" | "strong";
  variant?: "default" | "sm" | "lg" | "light" | "dark" | "elevated";
  interactive?: boolean;
  onPress?: () => void;
  vibrant?: boolean;
  noPadding?: boolean;
}

export function GlassCard({
  children,
  style,
  intensity = "medium",
  variant = "default",
  interactive = false,
  onPress,
  vibrant = false,
  noPadding = false,
}: GlassCardProps) {
  // Convert text intensity to number
  const getIntensityValue = (): number => {
    if (typeof intensity === "number") return intensity;
    switch (intensity) {
      case "light":
        return 20;
      case "strong":
        return 65;
      case "medium":
      default:
        return 40;
    }
  };

  // Convert variant to padding and shadow styles
  const getPaddingStyle = () => {
    if (noPadding) return styles.noPadding;
    switch (variant) {
      case "sm":
        return styles.paddingSm;
      case "lg":
        return styles.paddingLg;
      case "default":
      case "light":
      case "dark":
      case "elevated":
      default:
        return styles.paddingDefault;
    }
  };

  const getBackgroundColor = () => {
    if (vibrant) {
      return "transparent"; // will use LinearGradient instead
    }
    switch (variant) {
      case "dark":
        return Colors.glass.dark;
      case "elevated":
        return "rgba(255, 255, 255, 0.20)";
      default:
        return Colors.glass.light;
    }
  };

  const flatStyle = StyleSheet.flatten(style);
  const blurIntensity = getIntensityValue();
  const isPressable = interactive || !!onPress;
  
  const cardShadow = variant === "elevated" ? Shadow.lg : Shadow.glass;
  const cardRadius = flatStyle?.borderRadius !== undefined ? flatStyle.borderRadius : BorderRadius.glass;

  const renderInner = () => {
    const contentStyle = [
      styles.content,
      getPaddingStyle(),
      { backgroundColor: (flatStyle?.backgroundColor as string) || getBackgroundColor() },
      { borderRadius: cardRadius },
      flatStyle?.borderWidth !== undefined && { borderWidth: flatStyle.borderWidth },
      flatStyle?.borderColor !== undefined && { borderColor: flatStyle.borderColor },
    ];

    if (vibrant) {
      return (
        <LinearGradient
          colors={[
            "rgba(99, 102, 241, 0.15)",
            "rgba(168, 85, 247, 0.15)",
            "rgba(236, 72, 153, 0.15)",
          ]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={contentStyle}
        >
          {children}
        </LinearGradient>
      );
    }

    return <View style={contentStyle}>{children}</View>;
  };

  const CardWrapper = isPressable ? Pressable : View;

  return (
    <CardWrapper
      onPress={onPress}
      disabled={!isPressable}
      style={({ pressed }: any) => [
        styles.container,
        { borderRadius: cardRadius },
        cardShadow,
        interactive && pressed && { transform: [{ scale: 0.98 }] },
        style as any,
        flatStyle?.backgroundColor && { backgroundColor: "transparent" },
        { borderWidth: 0 },
        Platform.select({
          web: {
            backdropFilter: `blur(${blurIntensity * 0.3}px)`,
            WebkitBackdropFilter: `blur(${blurIntensity * 0.3}px)`,
          },
        }),
      ]}
    >
      <BlurView intensity={blurIntensity} style={[styles.blur, { borderRadius: cardRadius }]} tint="dark">
        {renderInner()}
      </BlurView>
    </CardWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: BorderRadius.glass,
    overflow: "hidden",
  },
  blur: {
    flex: 1,
  },
  content: {
    flex: 1,
    borderWidth: 1,
    borderColor: Colors.glass.lightBorder,
    borderStyle: "solid",
  },
  paddingDefault: {
    padding: 20,
  },
  paddingSm: {
    padding: 12,
  },
  paddingLg: {
    padding: 28,
  },
  noPadding: {
    padding: 0,
  },
});