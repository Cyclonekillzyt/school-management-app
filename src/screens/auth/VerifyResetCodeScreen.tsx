import { useRef, useState, useEffect } from "react";
import { View, Text, TextInput, StyleSheet } from "react-native";
import { useTheme } from "@/hooks/useTheme";
import LoginButton from "@/components/auth/LoginButton";
import { showToast } from "@/utils/toast";
import { usePasswordRecoveryStore } from "@/store/passwordRecoveryStore";
import { isValidOtp } from "@/utils/validators/otpValidator";
import { Pressable } from "react-native";
import BackButton from "@/components/auth/BackButton";
import { AuthStackParamList } from "@/types/navigation.types";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useNavigation } from "@react-navigation/core";
import { useAuthStore } from "@/store/authStore";

export default function VerifyResetCodeScreen() {
  const theme = useTheme();
  const signOut = useAuthStore((s) => s.signOut);

  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const [cooldown, setCooldown] = useState(0);

  const otp = code.join("");
  const otpValid = isValidOtp(otp);

  const inputs = useRef<Array<TextInput | null>>([]);

  const verifyResetCode = usePasswordRecoveryStore((s) => s.verifyResetCode);

  const sendResetCode = usePasswordRecoveryStore((s) => s.sendResetCode);
  const email = usePasswordRecoveryStore((s) => s.email);
  const loading = usePasswordRecoveryStore((s) => s.loading);

  const handleChange = (text: string, index: number) => {
    if (!/^\d?$/.test(text)) return;

    const updated = [...code];
    updated[index] = text;

    setCode(updated);

    if (text && index < 5) {
      inputs.current[index + 1]?.focus();
    }
  };

  const handleResend = async () => {
    if (cooldown > 0) return;
    if (!email) return;
    await sendResetCode(email);
    setCooldown(30);
  };

  const handleBackspace = (key: string, digit: string, index: number) => {
    if (key === "Backspace" && digit === "" && index > 0) {
      inputs.current[index - 1]?.focus();
    }
  };

  const handleVerify = async () => {
    if (!otpValid) {
      showToast.error("Invalid code", "Please enter all 6 digits");
      return;
    }

    await verifyResetCode(otp);
  };

  useEffect(() => {
    if (cooldown === 0) return;

    const t = setInterval(() => {
      setCooldown((c) => c - 1);
    }, 1000);

    return () => clearInterval(t);
  }, [cooldown]);

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: theme.background,
        },
      ]}
    >
      <BackButton label="Change email" to="ResetPassword" />
      <Text
        style={[
          styles.title,
          {
            color: theme.foreground,
          },
        ]}
      >
        Verify Code
      </Text>

      <Text
        style={[
          styles.subtitle,
          {
            color: theme.mutedForeground,
          },
        ]}
      >
        Enter the 6-digit code sent to your email.
      </Text>

      <View style={styles.codeContainer}>
        {code.map((digit, index) => (
          <TextInput
            key={index}
            ref={(ref) => {
              inputs.current[index] = ref;
            }}
            value={digit}
            onChangeText={(text) => handleChange(text, index)}
            onKeyPress={({ nativeEvent }) =>
              handleBackspace(nativeEvent.key, digit, index)
            }
            keyboardType="number-pad"
            maxLength={1}
            textAlign="center"
            style={[
              styles.input,
              {
                backgroundColor: theme.input,
                color: theme.foreground,
                borderColor:
                  otp.length === 0
                    ? theme.border
                    : otpValid
                      ? theme.success
                      : theme.destructive,
              },
            ]}
          />
        ))}
      </View>

      <Pressable onPress={handleResend} disabled={loading}>
        <Text
          style={{
            color: theme.accent,
            fontWeight: "700",
            textAlign: "center",
            marginTop: 10,
          }}
        >
          Resend code
        </Text>
      </Pressable>
      <Text>{cooldown > 0 ? `Resend in ${cooldown}s` : "Resend code"}</Text>

      {otp.length > 0 && !otpValid && (
        <Text
          style={{
            color: theme.destructive,
            fontSize: 12,
          }}
        >
          Enter all six digits
        </Text>
      )}

      <LoginButton onPress={handleVerify} disabled={loading} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 60,
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

  codeContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },

  input: {
    width: 50,
    height: 60,
    borderWidth: 1.5,
    borderRadius: 14,
    fontSize: 22,
    fontWeight: "700",
  },
});
