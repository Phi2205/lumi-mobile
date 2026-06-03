import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { router } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { GlassCard, Button, TextInput } from "@/components/ui";
import { Colors, Spacing, FontSize, BorderRadius } from "@/constants/theme";

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    if (!email) {
      setError("Email is required");
      return;
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      setError("Please enter a valid email");
      return;
    }

    setIsLoading(true);
    setError("");
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      setIsSuccess(true);
    }, 1500);
  };

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.keyboardView}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {/* Back Button */}
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => router.back()}
            >
              <Ionicons
                name="arrow-back"
                size={24}
                color={Colors.text.primary}
              />
            </TouchableOpacity>

            {/* Header */}
            <View style={styles.headerSection}>
              <View style={styles.iconContainer}>
                <LinearGradient
                  colors={Colors.gradients.brand}
                  style={styles.iconGradient}
                >
                  <Ionicons
                    name={isSuccess ? "checkmark-circle" : "key"}
                    size={32}
                    color={Colors.text.dark}
                  />
                </LinearGradient>
              </View>
              <Text style={styles.headerTitle}>
                {isSuccess ? "Email Sent!" : "Forgot Password?"}
              </Text>
              <Text style={styles.headerSubtitle}>
                {isSuccess
                  ? "Check your inbox for password reset instructions"
                  : "No worries, we'll send you reset instructions"}
              </Text>
            </View>

            {/* Form */}
            <GlassCard style={styles.formCard}>
              {isSuccess ? (
                <View style={styles.successContent}>
                  <Text style={styles.successEmail}>{email}</Text>
                  <Button
                    title="Back to Login"
                    onPress={() => router.replace("/auth/login")}
                    size="lg"
                    style={styles.submitButton}
                  />
                  <TouchableOpacity
                    style={styles.resendContainer}
                    onPress={() => setIsSuccess(false)}
                  >
                    <Text style={styles.resendText}>
                      {"Didn't receive the email? "}
                    </Text>
                    <Text style={styles.resendLink}>Try again</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <View style={styles.form}>
                  <TextInput
                    label="Email"
                    placeholder="Enter your email"
                    value={email}
                    onChangeText={(text) => {
                      setEmail(text);
                      setError("");
                    }}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoComplete="email"
                    leftIcon="mail-outline"
                    error={error}
                  />

                  <Button
                    title="Send Reset Link"
                    onPress={handleSubmit}
                    loading={isLoading}
                    size="lg"
                    style={styles.submitButton}
                  />
                </View>
              )}
            </GlassCard>

            {/* Back to Login */}
            {!isSuccess && (
              <TouchableOpacity
                style={styles.backToLogin}
                onPress={() => router.back()}
              >
                <Ionicons
                  name="arrow-back"
                  size={16}
                  color={Colors.text.secondary}
                />
                <Text style={styles.backToLoginText}>Back to Login</Text>
              </TouchableOpacity>
            )}
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "transparent",
  },
  gradient: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
  safeArea: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing["2xl"],
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: BorderRadius.lg,
    backgroundColor: Colors.glass.light,
    alignItems: "center",
    justifyContent: "center",
    marginTop: Spacing.md,
    marginBottom: Spacing["2xl"],
  },
  headerSection: {
    alignItems: "center",
    marginBottom: Spacing.xl,
  },
  iconContainer: {
    marginBottom: Spacing.lg,
  },
  iconGradient: {
    width: 72,
    height: 72,
    borderRadius: BorderRadius.xl,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: FontSize["2xl"],
    fontWeight: "700",
    color: Colors.text.primary,
    marginBottom: Spacing.sm,
    textAlign: "center",
  },
  headerSubtitle: {
    fontSize: FontSize.base,
    color: Colors.text.secondary,
    textAlign: "center",
    paddingHorizontal: Spacing.lg,
  },
  formCard: {
    marginBottom: Spacing.xl,
  },
  form: {
    gap: Spacing.md,
  },
  submitButton: {
    marginTop: Spacing.md,
  },
  successContent: {
    alignItems: "center",
  },
  successEmail: {
    fontSize: FontSize.md,
    color: Colors.brand.primary,
    fontWeight: "600",
    marginBottom: Spacing.xl,
  },
  resendContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: Spacing.xl,
  },
  resendText: {
    color: Colors.text.secondary,
    fontSize: FontSize.sm,
  },
  resendLink: {
    color: Colors.brand.primary,
    fontSize: FontSize.sm,
    fontWeight: "600",
  },
  backToLogin: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.xs,
  },
  backToLoginText: {
    color: Colors.text.secondary,
    fontSize: FontSize.base,
  },
});