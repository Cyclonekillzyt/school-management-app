import { useEffect } from "react";
import { useNavigation } from "@react-navigation/native";
import { usePasswordRecoveryStore } from "@/store/passwordRecoveryStore";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { AuthStackParamList } from "@/types/navigation.types";

type NavigationProp = NativeStackNavigationProp<AuthStackParamList, "Login">;

export function useRecoveryRouter() {
  const navigation = useNavigation<NavigationProp>();
  const step = usePasswordRecoveryStore((s) => s.step);

  useEffect(() => {
  
    if (step === "otp") {
      navigation.navigate("VerifyResetCode");
    }

    if (step === "newPassword") {
      navigation.navigate("NewPassword");
    }
  }, [step]);
}
