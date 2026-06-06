import { BorderRadius, Colors, Shadow } from "@/constants/theme";
import { BlurView } from "expo-blur";
import { useBlurTarget } from "@/context/BlurTargetContext";
import { LinearGradient } from "expo-linear-gradient";
import React from "react";

// Workaround for React 19 / expo-blur TS2607 type mismatch
const SafeBlurView = BlurView as any;
import {
  Platform,
  Pressable,
  StyleProp,
  StyleSheet,
  View,
  ViewStyle
} from "react-native";

interface GlassCardProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  className?: string;
  intensity?: number | "light" | "medium" | "strong";
  variant?: "default" | "sm" | "lg" | "light" | "dark" | "elevated";
  interactive?: boolean;
  onPress?: () => void;
  vibrant?: boolean;
  noPadding?: boolean;
  tint?: "light" | "dark" | "default";
}

export function GlassCard({
  children,
  style,
  className,
  intensity = "medium",
  variant = "default",
  interactive = false,
  onPress,
  vibrant = false,
  noPadding = false,
  tint = "dark",
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
  const blurTarget = useBlurTarget();

  const cardShadow = Platform.select<any>({
    ios: variant === "elevated" ? Shadow.lg : Shadow.glass,
    web: variant === "elevated" ? Shadow.lg : Shadow.glass,
    android: {
      elevation: 0,
    },
  });
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
      className={className}
      style={({ pressed }: any) => [
        styles.container,
        { borderRadius: cardRadius },
        cardShadow,
        interactive && pressed && { transform: [{ scale: 0.98 }] },
        style as any,
        flatStyle?.backgroundColor && { backgroundColor: "transparent" },
        { borderWidth: 0 },
        { overflow: "hidden" },
        Platform.select({
          web: {
            backdropFilter: `blur(${blurIntensity * 0.3}px)`,
            WebkitBackdropFilter: `blur(${blurIntensity * 0.3}px)`,
          },
        }),
      ]}
    >
      <SafeBlurView
        intensity={blurIntensity}
        style={[styles.blur, { borderRadius: cardRadius }]}
        tint={tint}
        blurMethod="dimezisBlurView"
        blurTarget={blurTarget || undefined}
      >
        {renderInner()}
      </SafeBlurView>
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
    overflow: "hidden",
  },
  content: {
    flex: 1,
    borderWidth: 1,
    borderColor: Colors.glass.lightBorder,
    borderStyle: "solid",
    overflow: "hidden",
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