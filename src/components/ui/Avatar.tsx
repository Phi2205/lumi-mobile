import React from "react";
import { View, Text, StyleSheet, Image, TouchableOpacity } from "react-native";
import { Colors, BorderRadius, Spacing, FontSize } from "@/constants/theme";

interface AvatarProps {
  source?: string;
  name?: string;
  size?: "sm" | "md" | "lg" | "xl";
  showOnline?: boolean;
  isOnline?: boolean;
  onPress?: () => void;
  showStoryRing?: boolean;
  hasStory?: boolean;
}

export function Avatar({
  source,
  name,
  size = "md",
  showOnline = false,
  isOnline = false,
  onPress,
  showStoryRing = false,
  hasStory = false,
}: AvatarProps) {
  const getSize = () => {
    switch (size) {
      case "sm":
        return 32;
      case "lg":
        return 56;
      case "xl":
        return 80;
      default:
        return 44;
    }
  };

  const getFontSize = () => {
    switch (size) {
      case "sm":
        return FontSize.xs;
      case "lg":
        return FontSize.xl;
      case "xl":
        return FontSize["2xl"];
      default:
        return FontSize.base;
    }
  };

  const getInitials = () => {
    if (!name) return "?";
    const parts = name.split(" ");
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  const avatarSize = getSize();
  const onlineSize = avatarSize * 0.25;

  const content = (
    <View
      style={[
        styles.container,
        showStoryRing && hasStory && styles.storyRing,
        { width: avatarSize + (showStoryRing ? 6 : 0), height: avatarSize + (showStoryRing ? 6 : 0) },
      ]}
    >
      <View
        style={[
          styles.avatar,
          { width: avatarSize, height: avatarSize, borderRadius: avatarSize / 2 },
        ]}
      >
        {source ? (
          <Image
            source={{ uri: source }}
            style={[
              styles.image,
              { width: avatarSize, height: avatarSize, borderRadius: avatarSize / 2 },
            ]}
          />
        ) : (
          <View
            style={[
              styles.placeholder,
              { width: avatarSize, height: avatarSize, borderRadius: avatarSize / 2 },
            ]}
          >
            <Text style={[styles.initials, { fontSize: getFontSize() }]}>
              {getInitials()}
            </Text>
          </View>
        )}
      </View>
      {showOnline && (
        <View
          style={[
            styles.onlineIndicator,
            {
              width: onlineSize,
              height: onlineSize,
              borderRadius: onlineSize / 2,
              backgroundColor: isOnline
                ? Colors.status.online
                : Colors.status.offline,
            },
          ]}
        />
      )}
    </View>
  );

  if (onPress) {
    return (
      <TouchableOpacity onPress={onPress} activeOpacity={0.8}>
        {content}
      </TouchableOpacity>
    );
  }

  return content;
}

const styles = StyleSheet.create({
  container: {
    position: "relative",
    alignItems: "center",
    justifyContent: "center",
  },
  storyRing: {
    borderWidth: 2,
    borderColor: Colors.brand.primary,
    borderRadius: 9999,
    padding: 2,
  },
  avatar: {
    backgroundColor: Colors.dark.elevated,
    overflow: "hidden",
  },
  image: {
    resizeMode: "cover",
  },
  placeholder: {
    backgroundColor: Colors.brand.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  initials: {
    color: Colors.text.dark,
    fontWeight: "600",
  },
  onlineIndicator: {
    position: "absolute",
    bottom: 0,
    right: 0,
    borderWidth: 2,
    borderColor: Colors.dark.background,
  },
});