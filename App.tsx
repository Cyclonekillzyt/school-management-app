import { useEffect } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { useAuthStore } from "@/store/authStore";
import RootNavigator from "@/navigation/RootNavigator";
import Toast from "react-native-toast-message";
import { AuthListener } from "@/services/AuthListener";

export default function App() {
  const getSession = useAuthStore((s) => s.getSession);
  const logOut = useAuthStore((s) => s.signOut)

  useEffect(() => {
    getSession();

  }, []);
  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <AuthListener />
        <RootNavigator />
      </NavigationContainer>
      <Toast />
    </SafeAreaProvider>
  );
}
