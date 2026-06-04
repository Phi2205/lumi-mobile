import React from "react";
import {
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
  StyleProp,
  View,
} from "react-native";
import { BlurView } from "expo-blur";
import { Colors, BorderRadius, FontSize, FontWeight } from "@/constants/theme";

interface GlassBadgeProps {
  children: React.ReactNode;
  variant?: "blue" | "cyan" | "yellow" | "purple" | "brand";
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  intensity?: number;
}

export function GlassBadge({
  children,
  variant = "blue",
  style,
  textStyle,
  intensity = 30,
}: GlassBadgeProps) {
  const getStyles = () => {
    switch (variant) {
      case "cyan":
        return {
          bg: "rgba(6, 182, 212, 0.20)",
          border: "rgba(34, 211, 238, 0.30)",
          text: "#E0F7FA",
        };
      case "yellow":
        return {
          bg: "rgba(234, 179, 8, 0.20)",
          border: "rgba(250, 204, 21, 0.30)",
          text: "#FEF9C3",
        };
      case "purple":
        return {
          bg: "rgba(168, 85, 247, 0.20)",
          border: "rgba(192, 132, 252, 0.30)",
          text: "#F3E8FF",
        };
      case "brand":
        return {
          bg: "rgba(182, 196, 162, 0.20)",
          border: "rgba(200, 208, 165, 0.30)",
          text: Colors.brand.primaryLight,
        };
      case "blue":
      default:
        return {
          bg: "rgba(59, 130, 246, 0.20)",
          border: "rgba(96, 165, 250, 0.30)",
          text: "#DBEAFE",
        };
    }
  };

  const themeConfig = getStyles();

  return (
    <View style={[styles.container, { borderColor: themeConfig.border }, style]}>
      <BlurView intensity={intensity} tint="dark" style={styles.blur}>
        <View style={[styles.innerContainer, { backgroundColor: themeConfig.bg }]}>
          <Text style={[styles.text, { color: themeConfig.text }, textStyle]}>
            {children}
          </Text>
        </View>
      </BlurView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: BorderRadius.full,
    overflow: "hidden",
    borderWidth: 1,
    alignSelf: "flex-start",
  },
  blur: {
    flexDirection: "row",
    alignItems: "center",
  },
  innerContainer: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    alignItems: "center",
    justifyContent: "center",
  },
  text: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.semibold,
    textTransform: "lowercase",
  },
});
