import { useState } from "react";
import { View, StyleSheet, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Checkbox } from "expo-checkbox";
import { useTheme } from "@/hooks/useTheme";
import InputField from "@/components/auth/InputField";
import LoginButton from "@/components/auth/LoginButton";
import { useAuthStore } from "@/store/authStore";
import PwdVisibility from "./PwdVisibility";
import { showToast } from "@/utils/toast";
import { isValidEmail } from "@/utils/validators/emailValidator";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { AuthStackParamList } from "@/types/navigation.types";
import { Pressable } from "react-native";

export type NavigationProp = NativeStackNavigationProp<AuthStackParamList, "Login">;

export default function LoginForm() {
  const theme = useTheme();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isChecked, setChecked] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const signIn = useAuthStore((s) => s.signIn);
  const loading = useAuthStore((s) => s.signInLoading);
  const emailValid = isValidEmail(email);

  const handleLogin = async () => {
    if (!email || !password) {
      showToast.error("Missing fields", "Please fill all inputs");
      return;
    }
    await signIn(email, password, isChecked);
  };

  const navigation = useNavigation<NavigationProp>();

  return (
    <View style={styles.container}>
      <InputField
        label="Email"
        placeholder="Enter your email"
        value={email}
        onChangeText={setEmail}
        icon={
          <Ionicons
            name="person-outline"
            size={16}
            color={theme.mutedForeground}
          />
        }
        borderColor={
          email.length === 0
            ? theme.border
            : emailValid
              ? theme.primary
              : theme.destructive
        }
      />

      {email.length > 0 && !emailValid && (
        <Text
          style={{
            color: theme.destructive,
            fontSize: 12,
            marginTop: 4,
          }}
        >
          Enter a valid email address
        </Text>
      )}

      <InputField
        label="PASSWORD"
        placeholder="Enter your password"
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
            onToggle={() => setShowPassword((prev) => !prev)}
          />
        }
      />
      <View style={[styles.helperLink]}>
        <View style={{ flexDirection: "row", alignItems: "flex-end" }}>
          <Checkbox
            style={styles.checkbox}
            value={isChecked}
            onValueChange={setChecked}
            color={isChecked ? theme.primary : undefined}
          />
          <Text style={[styles.label, { color: theme.mutedForeground }]}>
            Remeber me
          </Text>
        </View>
        <Pressable onPress={() => navigation.navigate("ResetPassword")}>
          <Text
            style={{
              color: theme.accent,
              fontWeight: "700",
              textDecorationLine: "underline",
            }}
          >
            Forgot Password?
          </Text>
        </Pressable>
      </View>
      <LoginButton
        onPress={handleLogin}
        disabled={loading}
        text="LOG IN"
        loaderText="Logging in..."
      />
      <View style={styles.footer}>
        <Text
          style={{
            color: theme.mutedForeground,
            fontSize: 12,
          }}
        >
          © 2026 School Manager
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 3,
    gap: 25,
  },
  label: {
    fontSize: 16,
    fontWeight: "800",
    letterSpacing: 0.3,
    marginBottom: 8,
  },
  checkbox: {
    margin: 8,
  },

  checkboxContainer: {
    flexDirection: "row",
  },
  helperLink: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  footer: {
    marginTop: "auto",
    alignItems: "center",
    paddingBottom: 25,
  },
});
