import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  FlatList,
  StyleProp,
  ViewStyle,
  Dimensions,
  Pressable,
} from "react-native";
import { BlurView } from "expo-blur";
import { useBlurTarget } from "@/context/BlurTargetContext";
import { Ionicons } from "@expo/vector-icons";
import { Colors, BorderRadius, FontSize, FontWeight, Spacing } from "@/constants/theme";
import { GlassCard } from "./GlassCard";

interface Option {
  value: string;
  label: string;
}

interface GlassSelectProps {
  options: Option[];
  value: string;
  onChange: (value: string) => void;
  label?: string;
  placeholder?: string;
  style?: StyleProp<ViewStyle>;
}

const { height: SCREEN_HEIGHT } = Dimensions.get("window");

export function GlassSelect({
  options,
  value,
  onChange,
  label,
  placeholder = "Select an option",
  style,
}: GlassSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const blurTarget = useBlurTarget();
  const selectedOption = options.find((o) => o.value === value);

  const handleSelect = (val: string) => {
    onChange(val);
    setIsOpen(false);
  };

  return (
    <View style={[styles.container, style]}>
      {label && <Text style={styles.label}>{label}</Text>}

      <TouchableOpacity
        onPress={() => setIsOpen(true)}
        activeOpacity={0.8}
        style={styles.selectButtonContainer}
      >
        <BlurView intensity={20} tint="dark" style={styles.selectButtonBlur} blurMethod="dimezisBlurView" blurTarget={blurTarget || undefined}>
          <View style={styles.selectButtonContent}>
            <Text
              style={[
                styles.selectButtonText,
                !selectedOption && { color: "rgba(255, 255, 255, 0.4)" },
              ]}
              numberOfLines={1}
            >
              {selectedOption ? selectedOption.label : placeholder}
            </Text>
            <Ionicons
              name="chevron-down"
              size={18}
              color="rgba(255, 255, 255, 0.5)"
              style={[styles.chevron, isOpen && styles.chevronRotated]}
            />
          </View>
        </BlurView>
      </TouchableOpacity>

      <Modal
        visible={isOpen}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setIsOpen(false)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setIsOpen(false)}
        >
          <BlurView intensity={35} tint="dark" style={StyleSheet.absoluteFill} blurMethod="none">
            <View style={styles.modalContentContainer}>
              <GlassCard
                variant="default"
                intensity="strong"
                style={styles.pickerCard}
              >
                <View style={styles.pickerHeader}>
                  <Text style={styles.pickerTitle}>
                    {label || "Select Option"}
                  </Text>
                  <TouchableOpacity
                    onPress={() => setIsOpen(false)}
                    style={styles.closeButton}
                  >
                    <Ionicons name="close" size={20} color="#FFFFFF" />
                  </TouchableOpacity>
                </View>

                <FlatList
                  data={options}
                  keyExtractor={(item) => item.value}
                  renderItem={({ item }) => {
                    const isActive = item.value === value;
                    return (
                      <TouchableOpacity
                        onPress={() => handleSelect(item.value)}
                        activeOpacity={0.7}
                        style={[
                          styles.optionItem,
                          isActive && styles.optionItemActive,
                        ]}
                      >
                        <Text
                          style={[
                            styles.optionText,
                            isActive && styles.optionTextActive,
                          ]}
                        >
                          {item.label}
                        </Text>
                        {isActive && (
                          <Ionicons
                            name="checkmark"
                            size={18}
                            color="#FFFFFF"
                          />
                        )}
                      </TouchableOpacity>
                    );
                  }}
                  style={styles.optionsList as ViewStyle}
                  showsVerticalScrollIndicator={false}
                />
              </GlassCard>
            </View>
          </BlurView>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    marginBottom: 14,
  },
  label: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.medium,
    color: "#FFFFFF",
    marginBottom: 6,
    textShadowColor: "rgba(0,0,0,0.5)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  selectButtonContainer: {
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.15)",
    borderRadius: BorderRadius.md,
    overflow: "hidden",
  },
  selectButtonBlur: {
    width: "100%",
  },
  selectButtonContent: {
    height: 48,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    backgroundColor: "rgba(255, 255, 255, 0.06)",
  },
  selectButtonText: {
    flex: 1,
    color: "#FFFFFF",
    fontSize: FontSize.base,
    fontWeight: FontWeight.semibold,
  },
  chevron: {
    marginLeft: 8,
  },
  chevronRotated: {
    transform: [{ rotate: "180deg" }],
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  modalContentContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  pickerCard: {
    width: "90%",
    maxWidth: 340,
    maxHeight: SCREEN_HEIGHT * 0.6,
    backgroundColor: "rgba(20, 20, 20, 0.75)",
    borderColor: "rgba(255, 255, 255, 0.15)",
  },
  pickerHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255, 255, 255, 0.1)",
    paddingBottom: 12,
    marginBottom: 12,
  },
  pickerTitle: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.bold,
    color: "#FFFFFF",
  },
  closeButton: {
    padding: 4,
  },
  optionsList: {
    width: "100%",
  },
  optionItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: BorderRadius.sm,
    marginBottom: 6,
    backgroundColor: "rgba(255, 255, 255, 0.03)",
  },
  optionItemActive: {
    backgroundColor: Colors.brand.primary,
  },
  optionText: {
    fontSize: FontSize.base,
    color: "rgba(255, 255, 255, 0.8)",
    fontWeight: FontWeight.medium,
  },
  optionTextActive: {
    color: Colors.dark.background,
    fontWeight: FontWeight.bold,
  },
});
