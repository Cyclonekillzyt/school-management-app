import { createNativeStackNavigator } from "@react-navigation/native-stack";

import LoginScreen from "@/screens/auth/LoginScreen";
import ResetPasswordScreen from "@/screens/auth/ResetPasswordScreen";
import VerifyResetCodeScreen from "@/screens/auth/VerifyResetCodeScreen";
import NewPasswordScreen from "@/screens/auth/NewPasswordScreen";
import { usePasswordRecoveryStore } from "@/store/passwordRecoveryStore";
import { useNavigation } from "@react-navigation/native";
import { useEffect } from "react";

const Stack = createNativeStackNavigator();
export default function AuthNavigator() {
  const step = usePasswordRecoveryStore((s) => s.step);
  const mode = usePasswordRecoveryStore((s) => s.mode);
  const navigation = useNavigation();

  useEffect(() => {
    if (mode !== "recovery" ) {
      navigation.navigate("Login" as never);
      return
    };

    if (step === "otp") {
      navigation.navigate("VerifyResetCode" as never);
    }

    if (step === "newPassword") {
      navigation.navigate("NewPassword" as never);
    }

    if (step === "email") {
      navigation.navigate("ResetPassword" as never);
    }
  }, [step, mode]);

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="ResetPassword" component={ResetPasswordScreen} />
      <Stack.Screen name="VerifyResetCode" component={VerifyResetCodeScreen} />
      <Stack.Screen name="NewPassword" component={NewPasswordScreen} />
    </Stack.Navigator>
  );
}