import React from "react";
import {
  View,
  StyleSheet,
  ViewStyle,
  StyleProp,
} from "react-native";
import { BlurView } from "expo-blur";
import { Colors, BorderRadius, Shadow } from "@/constants/theme";

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
  return (
    <View style={[styles.container, Shadow.lg, style]}>
      <BlurView intensity={intensity} style={styles.blur} tint="dark">
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
  },
  content: {
    flex: 1,
    padding: 24,
    backgroundColor: "rgba(255, 255, 255, 0.08)",
  },
  noPadding: {
    padding: 0,
  },
});
