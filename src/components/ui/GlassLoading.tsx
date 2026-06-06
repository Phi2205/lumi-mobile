import React, { useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Easing,
  StyleProp,
  ViewStyle,
  Modal,
} from "react-native";
import { BlurView } from "expo-blur";
import { Ionicons } from "@expo/vector-icons";
import { Colors, BorderRadius, FontSize, FontWeight } from "@/constants/theme";
import { GlassCard } from "./GlassCard";

interface GlassLoadingProps {
  text?: string;
  subtext?: string;
  visible?: boolean;
  style?: StyleProp<ViewStyle>;
}

export function GlassLoading({
  text = "Loading...",
  subtext = "Please wait while we process your request",
  visible = true,
  style,
}: GlassLoadingProps) {
  // Animation refs
  const spinOuter = useRef(new Animated.Value(0)).current;
  const spinMiddle = useRef(new Animated.Value(0)).current;
  const pulseInner = useRef(new Animated.Value(0.7)).current;
  const shimmerValue = useRef(new Animated.Value(0)).current;
  const dot1 = useRef(new Animated.Value(0.3)).current;
  const dot2 = useRef(new Animated.Value(0.3)).current;
  const dot3 = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    if (!visible) return;

    // 1. Spinner rotation
    const spinOuterAnim = Animated.loop(
      Animated.timing(spinOuter, {
        toValue: 1,
        duration: 1200,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    );

    const spinMiddleAnim = Animated.loop(
      Animated.timing(spinMiddle, {
        toValue: 1,
        duration: 1800,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    );

    // 2. Pulse icon
    const pulseInnerAnim = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseInner, {
          toValue: 1.1,
          duration: 1000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulseInner, {
          toValue: 0.8,
          duration: 1000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    );

    // 3. Shimmer loading bar
    const shimmerAnim = Animated.loop(
      Animated.sequence([
        Animated.timing(shimmerValue, {
          toValue: 1,
          duration: 1800,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(shimmerValue, {
          toValue: 0,
          duration: 0,
          useNativeDriver: true,
        }),
      ])
    );

    // 4. Dot pulsations
    const makeDotAnim = (anim: Animated.Value, delay: number) => {
      return Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(anim, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true,
          }),
          Animated.timing(anim, {
            toValue: 0.3,
            duration: 500,
            useNativeDriver: true,
          }),
        ])
      );
    };

    const d1 = makeDotAnim(dot1, 0);
    const d2 = makeDotAnim(dot2, 200);
    const d3 = makeDotAnim(dot3, 400);

    // Start all
    Animated.parallel([
      spinOuterAnim,
      spinMiddleAnim,
      pulseInnerAnim,
      shimmerAnim,
      d1,
      d2,
      d3,
    ]).start();

    return () => {
      spinOuterAnim.stop();
      spinMiddleAnim.stop();
      pulseInnerAnim.stop();
      shimmerAnim.stop();
      d1.stop();
      d2.stop();
      d3.stop();
    };
  }, [visible]);

  if (!visible) return null;

  // Interps
  const spinOuterDeg = spinOuter.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  const spinMiddleDeg = spinMiddle.interpolate({
    inputRange: [0, 1],
    outputRange: ["360deg", "0deg"],
  });

  const shimmerTranslateX = shimmerValue.interpolate({
    inputRange: [0, 1],
    outputRange: [-180, 180],
  });

  return (
    <Modal transparent visible={visible} animationType="fade">
      <View style={styles.fullscreenOverlay}>
        <BlurView intensity={35} tint="dark" style={StyleSheet.absoluteFill} blurMethod="none">
          <View style={styles.centerContainer}>
            <GlassCard
              variant="default"
              intensity="strong"
              style={[styles.loadingCard, style]}
            >
              {/* Spinner Section */}
              <View style={styles.spinnerContainer}>
                {/* Outer Ring */}
                <Animated.View
                  style={[
                    styles.ring,
                    styles.outerRing,
                    { transform: [{ rotate: spinOuterDeg }] },
                  ]}
                />
                
                {/* Middle Ring */}
                <Animated.View
                  style={[
                    styles.ring,
                    styles.middleRing,
                    { transform: [{ rotate: spinMiddleDeg }] },
                  ]}
                />

                {/* Inner Icon Circle */}
                <Animated.View
                  style={[
                    styles.innerCircle,
                    { transform: [{ scale: pulseInner }] },
                  ]}
                >
                  <Ionicons name="flash" size={22} color="rgba(255, 255, 255, 0.9)" />
                </Animated.View>
              </View>

              {/* Text */}
              <Text style={styles.text}>{text}</Text>

              {/* Pulsing Dots */}
              <View style={styles.dotsRow}>
                <Animated.View style={[styles.dot, { opacity: dot1 }]} />
                <Animated.View style={[styles.dot, { opacity: dot2 }]} />
                <Animated.View style={[styles.dot, { opacity: dot3 }]} />
              </View>

              {/* Subtext */}
              <Text style={styles.subtext}>{subtext}</Text>

              {/* Shimmer Progress Bar */}
              <View style={styles.progressBarBg}>
                <Animated.View
                  style={[
                    styles.progressBarFill,
                    { transform: [{ translateX: shimmerTranslateX }] },
                  ]}
                />
              </View>
            </GlassCard>
          </View>
        </BlurView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  fullscreenOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  loadingCard: {
    width: 280,
    paddingVertical: 36,
    paddingHorizontal: 24,
    alignItems: "center",
    backgroundColor: "rgba(20, 20, 20, 0.8)",
    borderColor: "rgba(255, 255, 255, 0.15)",
  },
  spinnerContainer: {
    width: 84,
    height: 84,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  ring: {
    position: "absolute",
    borderRadius: 999,
    borderWidth: 3,
    borderColor: "rgba(255, 255, 255, 0.08)",
  },
  outerRing: {
    width: 80,
    height: 80,
    borderTopColor: "rgba(255, 255, 255, 0.8)",
  },
  middleRing: {
    width: 60,
    height: 60,
    borderRightColor: "rgba(255, 255, 255, 0.6)",
  },
  innerCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.25)",
    justifyContent: "center",
    alignItems: "center",
  },
  text: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.bold,
    color: "#FFFFFF",
    textAlign: "center",
    marginBottom: 8,
  },
  dotsRow: {
    flexDirection: "row",
    gap: 6,
    justifyContent: "center",
    marginBottom: 16,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#FFFFFF",
  },
  subtext: {
    fontSize: FontSize.sm,
    color: "rgba(255, 255, 255, 0.65)",
    textAlign: "center",
    lineHeight: 18,
    marginBottom: 24,
  },
  progressBarBg: {
    width: 180,
    height: 4,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 2,
    overflow: "hidden",
  },
  progressBarFill: {
    width: 180,
    height: "100%",
    backgroundColor: "rgba(255, 255, 255, 0.7)",
    borderRadius: 2,
  },
});
