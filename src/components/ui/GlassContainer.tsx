import React from "react";
import {
  View,
  StyleSheet,
  ViewStyle,
  StyleProp,
  Platform,
} from "react-native";
import { BlurView } from "expo-blur";
import { Colors, BorderRadius, Shadow } from "@/constants/theme";
import { useBlurTarget } from "@/context/BlurTargetContext";

interface GlassContainerProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  intensity?: number;
  noPadding?: boolean;
}

export function GlassContainer({
  children,
  style,
  intensity = 50,
  noPadding = false,
}: GlassContainerProps) {
  const blurTarget = useBlurTarget();

  return (
    <View style={[styles.container, Platform.OS === "android" ? { ...Shadow.lg, elevation: 0 } : Shadow.lg, style]}>
      <BlurView intensity={intensity} style={styles.blur} tint="dark" blurMethod="dimezisBlurView" blurTarget={blurTarget || undefined}>
        <View style={[styles.content, noPadding && styles.noPadding]}>
          {children}
        </View>
      </BlurView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: BorderRadius["2xl"], // 24px matches rounded-3xl
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.15)",
  },
  blur: {
    flex: 1,
    overflow: "hidden",
  },
  content: {
    flex: 1,
    padding: 24,
    backgroundColor: "rgba(255, 255, 255, 0.08)",
    overflow: "hidden",
  },
  noPadding: {
    padding: 0,
  },
});
