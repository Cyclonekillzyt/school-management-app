import { useState } from "react";
import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@/hooks/useTheme";
import InputField from "@/components/auth/InputField";
import LoginButton from "@/components/auth/LoginButton";
import PwdVisibility from "@/components/auth/PwdVisibility";
import BackButton from "@/components/auth/BackButton";
import { checkPasswordStrength } from "@/utils/validators/passwordStrength";
import { showToast } from "@/utils/toast";
import { supabase } from "@/lib/supabase";

export default function ChangePasswordScreen() {
  const theme = useTheme();

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
    const { error } = await supabase.auth.updateUser({ password });
    setLoading(false);

    if (error) {
      showToast.error("Update failed", error.message);
      return;
    }

    showToast.success("Password updated");
    setPassword("");
    setConfirmPassword("");
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <BackButton label="Back" />
      <Text style={[styles.title, { color: theme.foreground }]}>
        Change Password
      </Text>
      <Text style={[styles.subtitle, { color: theme.mutedForeground }]}>
        Choose a new password for your account.
      </Text>

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
        placeholder="Confirm new password"
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
        text="UPDATE PASSWORD"
        loaderText="Updating..."
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 24, paddingTop: 60, gap: 18 },
  title: { fontSize: 28, fontWeight: "800" },
  subtitle: { fontSize: 15, lineHeight: 22 },
});
