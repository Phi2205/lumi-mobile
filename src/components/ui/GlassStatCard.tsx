import React from "react";
import {
  View,
  Text,
  StyleSheet,
  StyleProp,
  ViewStyle,
} from "react-native";
import { Colors, FontSize, FontWeight, Spacing } from "@/constants/theme";
import { GlassCard } from "./GlassCard";

interface GlassStatCardProps {
  label: string;
  value: string | number;
  icon?: React.ReactNode;
  change?: string;
  changeType?: "up" | "down" | "neutral";
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
}

export function GlassStatCard({
  label,
  value,
  icon,
  change,
  changeType = "neutral",
  onPress,
  style,
}: GlassStatCardProps) {
  const getChangeColor = () => {
    switch (changeType) {
      case "up":
        return Colors.status.success; // green
      case "down":
        return Colors.status.error; // red
      case "neutral":
      default:
        return Colors.status.warning; // yellow
    }
  };

  const isInteractive = !!onPress;

  return (
    <GlassCard
      variant="sm"
      interactive={isInteractive}
      onPress={onPress}
      style={style}
    >
      <View style={styles.cardContent}>
        <View style={styles.textContainer}>
          <Text style={styles.label} numberOfLines={1}>
            {label}
          </Text>
          <Text style={styles.value} numberOfLines={1}>
            {value}
          </Text>
          {change && (
            <Text style={[styles.changeText, { color: getChangeColor() }]} numberOfLines={1}>
              {change}
            </Text>
          )}
        </View>

        {icon && (
          <View style={styles.iconContainer}>
            {typeof icon === "string" ? (
              <Text style={styles.emojiIcon}>{icon}</Text>
            ) : (
              icon
            )}
          </View>
        )}
      </View>
    </GlassCard>
  );
}

const styles = StyleSheet.create({
  cardContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  textContainer: {
    flex: 1,
  },
  label: {
    fontSize: FontSize.sm,
    color: "rgba(255, 255, 255, 0.6)",
    marginBottom: 4,
    fontWeight: FontWeight.medium,
  },
  value: {
    fontSize: FontSize["2xl"],
    fontWeight: FontWeight.bold,
    color: "#FFFFFF",
  },
  changeText: {
    fontSize: FontSize.xs,
    marginTop: 6,
    fontWeight: FontWeight.semibold,
  },
  iconContainer: {
    marginLeft: 12,
    alignSelf: "flex-start",
  },
  emojiIcon: {
    fontSize: 24,
  },
});
