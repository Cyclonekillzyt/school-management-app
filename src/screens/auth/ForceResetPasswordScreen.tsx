import { useState } from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@/hooks/useTheme";
import InputField from "@/components/auth/InputField";
import LoginButton from "@/components/auth/LoginButton";
import PwdVisibility from "@/components/auth/PwdVisibility";
import { useAuthStore } from "@/store/authStore";
import { checkPasswordStrength } from "@/utils/validators/passwordStrength";
import { showToast } from "@/utils/toast";

export default function ForceResetPasswordScreen() {
  const theme = useTheme();
  const completeForcedPasswordReset = useAuthStore(
    (s) => s.completeForcedPasswordReset,
  );
  const signOut = useAuthStore((s) => s.signOut);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const strength = checkPasswordStrength(password);
  const passwordsMatch =
    password.length > 0 &&
    confirmPassword.length > 0 &&
    password === confirmPassword;

  const handleSubmit = async () => {
    if (!password || !confirmPassword) {
      showToast.error("Missing fields", "Fill both password fields");
      return;
    }
    if (!passwordsMatch) {
      showToast.error("Mismatch", "Passwords do not match");
      return;
    }
    if (strength.label !== "Strong") {
      showToast.error("Weak password", "Choose a stronger password");
      return;
    }
    setLoading(true);
    await completeForcedPasswordReset(password);
    setLoading(false);
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.header}>
        <Ionicons
          name="shield-checkmark-outline"
          size={40}
          color={theme.primary}
        />
        <Text style={[styles.title, { color: theme.foreground }]}>
          Set a New Password
        </Text>
        <Text style={[styles.subtitle, { color: theme.mutedForeground }]}>
          Your account was created by an administrator with a temporary
          password. Choose a new password to continue.
        </Text>
      </View>

      <InputField
        label="NEW PASSWORD"
        placeholder="Enter new password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry={!showPassword}
        icon={
          <Ionicons
            name="lock-closed-outline"
            size={16}
            color={theme.mutedForeground}
          />
        }
        rightIcon={
          <PwdVisibility
            visible={showPassword}
            onToggle={() => setShowPassword((p) => !p)}
          />
        }
      />
      {password.length > 0 && (
        <Text
          style={{
            color:
              strength.label === "Weak"
                ? theme.destructive
                : strength.label === "Medium"
                  ? theme.warning
                  : theme.success,
          }}
        >
          Password strength: {strength.label}
        </Text>
      )}

      <InputField
        label="CONFIRM PASSWORD"
        placeholder="Confirm password"
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        secureTextEntry={!showConfirmPassword}
        icon={
          <Ionicons
            name="lock-closed-outline"
            size={16}
            color={theme.mutedForeground}
          />
        }
        rightIcon={
          <PwdVisibility
            visible={showConfirmPassword}
            onToggle={() => setShowConfirmPassword((p) => !p)}
          />
        }
      />
      {confirmPassword.length > 0 && (
        <Text
          style={{ color: passwordsMatch ? theme.success : theme.destructive }}
        >
          {passwordsMatch ? "Passwords match" : "Passwords do not match"}
        </Text>
      )}

      <LoginButton
        onPress={handleSubmit}
        disabled={loading}
        text="SET PASSWORD"
        loaderText="Updating..."
      />

      <Pressable onPress={() => signOut()} style={styles.logout}>
        <Text style={{ color: theme.mutedForeground, fontWeight: "700" }}>
          Log out instead
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 24, paddingTop: 80, gap: 18 },
  header: { alignItems: "center", gap: 10, marginBottom: 10 },
  title: { fontSize: 22, fontWeight: "800", textAlign: "center" },
  subtitle: { fontSize: 13, textAlign: "center", lineHeight: 19 },
  logout: { marginTop: "auto", alignItems: "center", paddingBottom: 30 },
});
