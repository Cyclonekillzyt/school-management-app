import { useState } from "react";
import { View, StyleSheet, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@/hooks/useTheme";

import InputField from "@/components/auth/InputField";
import LoginButton from "@/components/auth/LoginButton";
import { showToast } from "@/utils/toast";
import { usePasswordRecoveryStore } from "@/store/passwordRecoveryStore";
import BackButton from "@/components/auth/BackButton";



export default function ResetPasswordScreen() {
  const theme = useTheme();

  const [email, setEmail] = useState("");


  const sendResetCode = usePasswordRecoveryStore((s) => s.sendResetCode);

  const loading = usePasswordRecoveryStore((s) => s.loading);

  const handleReset = async () => {
    if (!email) {
      showToast.error("Missing email", "Please enter your email");
      return;
    }

    const success = await sendResetCode(email);


  };

  
  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: theme.background,
        },
      ]}
    >
      <BackButton label="Back to Login" to="Login" />
      <Text
        style={[
          styles.title,
          {
            color: theme.foreground,
          },
        ]}
      >
        Reset Password
      </Text>

      <Text
        style={[
          styles.subtitle,
          {
            color: theme.mutedForeground,
          },
        ]}
      >
        Enter your email and we'll send you a verification code.
      </Text>

      <InputField
        label="EMAIL"
        placeholder="Enter your email"
        value={email}
        onChangeText={setEmail}
        icon={
          <Ionicons
            name="mail-outline"
            size={16}
            color={theme.mutedForeground}
          />
        }
      />

      <LoginButton onPress={handleReset} disabled={loading} />

      <Text
        style={[
          styles.backText,
          {
            color: theme.accent,
          },
        ]}
      >
        Back to Login
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 50,
    gap: 25,
  },

  title: {
    fontSize: 28,
    fontWeight: "800",
  },

  subtitle: {
    fontSize: 15,
    lineHeight: 22,
  },

  backText: {
    marginTop: 10,
    fontSize: 15,
    fontWeight: "700",
    alignSelf: "center",
  },
});
