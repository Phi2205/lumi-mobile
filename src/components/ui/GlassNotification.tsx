import React, { useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  Animated,
  TouchableOpacity,
  Dimensions,
  StyleProp,
  ViewStyle,
  Platform,
} from "react-native";
import { BlurView } from "expo-blur";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Colors, BorderRadius, FontSize, FontWeight } from "@/constants/theme";
import { GlassCard } from "./GlassCard";

export type NotificationType = "success" | "error" | "warning" | "info";

interface GlassNotificationProps {
  isOpen: boolean;
  onClose: () => void;
  message: string;
  title?: string;
  type?: NotificationType;
  duration?: number;
  style?: StyleProp<ViewStyle>;
}

export function GlassNotification({
  isOpen,
  onClose,
  message,
  title,
  type = "info",
  duration = 3000,
  style,
}: GlassNotificationProps) {
  const insets = useSafeAreaInsets();
  const slideAnim = useRef(new Animated.Value(-150)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (isOpen) {
      // Slide down and fade in
      Animated.parallel([
        Animated.spring(slideAnim, {
          toValue: insets.top > 0 ? insets.top + 10 : 20,
          useNativeDriver: true,
          tension: 40,
          friction: 8,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();

      if (duration > 0) {
        const timer = setTimeout(() => {
          handleClose();
        }, duration);
        return () => clearTimeout(timer);
      }
    } else {
      // Reset off screen
      slideAnim.setValue(-150);
      opacityAnim.setValue(0);
    }
  }, [isOpen]);

  const handleClose = () => {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: -150,
        duration: 250,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onClose();
    });
  };

  if (!isOpen) return null;

  const getTypeConfig = () => {
    switch (type) {
      case "success":
        return {
          iconName: "checkmark-circle-outline" as const,
          iconBg: "rgba(34, 197, 94, 0.15)",
          iconColor: Colors.status.success,
          borderColor: "rgba(34, 197, 94, 0.3)",
          titleColor: "#4ADE80",
          defaultTitle: "Success",
        };
      case "error":
        return {
          iconName: "alert-circle-outline" as const,
          iconBg: "rgba(239, 68, 68, 0.15)",
          iconColor: Colors.status.error,
          borderColor: "rgba(239, 68, 68, 0.3)",
          titleColor: "#F87171",
          defaultTitle: "Error",
        };
      case "warning":
        return {
          iconName: "warning-outline" as const,
          iconBg: "rgba(234, 179, 8, 0.15)",
          iconColor: Colors.status.warning,
          borderColor: "rgba(234, 179, 8, 0.3)",
          titleColor: "#FACC15",
          defaultTitle: "Warning",
        };
      case "info":
      default:
        return {
          iconName: "information-circle-outline" as const,
          iconBg: "rgba(59, 130, 246, 0.15)",
          iconColor: Colors.status.info,
          borderColor: "rgba(59, 130, 246, 0.3)",
          titleColor: "#60A5FA",
          defaultTitle: "Info",
        };
    }
  };

  const config = getTypeConfig();

  return (
    <Animated.View
      style={[
        styles.animatedContainer,
        {
          transform: [{ translateY: slideAnim }],
          opacity: opacityAnim,
        },
        style,
      ]}
    >
      <GlassCard
        variant="sm"
        intensity="strong"
        style={[styles.notificationCard, { borderColor: config.borderColor }]}
      >
        <View style={styles.cardInner}>
          {/* Icon Badge */}
          <View style={[styles.iconBadge, { backgroundColor: config.iconBg }]}>
            <Ionicons name={config.iconName} size={24} color={config.iconColor} />
          </View>

          {/* Texts */}
          <View style={styles.textContainer}>
            <Text style={[styles.title, { color: config.titleColor }]}>
              {title || config.defaultTitle}
            </Text>
            <Text style={styles.message}>{message}</Text>
          </View>

          {/* Close button */}
          <TouchableOpacity
            onPress={handleClose}
            style={styles.closeButton}
            activeOpacity={0.7}
          >
            <Ionicons name="close" size={18} color="rgba(255, 255, 255, 0.6)" />
          </TouchableOpacity>
        </View>
      </GlassCard>
    </Animated.View>
  );
}

const { width } = Dimensions.get("window");

const styles = StyleSheet.create({
  animatedContainer: {
    position: "absolute",
    left: 16,
    right: 16,
    zIndex: 9999,
    alignItems: "center",
    ...Platform.select({
      web: {
        position: "fixed",
        top: 20,
        left: "50%",
        transform: [{ translateX: -width * 0.45 }],
        width: "90%",
        maxWidth: 400,
      } as any,
    }),
  },
  notificationCard: {
    width: "100%",
    backgroundColor: "rgba(20, 20, 20, 0.85)",
    borderWidth: 1,
    borderRadius: BorderRadius.xl,
  },
  cardInner: {
    flexDirection: "row",
    alignItems: "center",
  },
  iconBadge: {
    width: 42,
    height: 42,
    borderRadius: BorderRadius.md,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
    paddingRight: 8,
  },
  title: {
    fontSize: FontSize.base,
    fontWeight: FontWeight.bold,
    marginBottom: 2,
  },
  message: {
    fontSize: FontSize.sm,
    color: "rgba(255, 255, 255, 0.8)",
    lineHeight: 18,
  },
  closeButton: {
    padding: 4,
    borderRadius: 8,
    backgroundColor: "rgba(255, 255, 255, 0.08)",
  },
});
