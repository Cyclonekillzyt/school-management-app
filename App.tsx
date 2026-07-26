import { useEffect, useState } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { useAuthStore } from "@/store/authStore";
import RootNavigator from "@/navigation/RootNavigator";
import Toast from "react-native-toast-message";
import { AuthListener } from "@/services/AuthListener";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import AnimatedSplash from "@/components/splash/AnimatedSplash";

export default function App() {
  const getSession = useAuthStore((s) => s.getSession);
  const authLoading = useAuthStore((s) => s.authLoading);

  const [showSplash, setShowSplash] = useState(true);
  const [animationDone, setAnimationDone] = useState(false);

  useEffect(() => {
    getSession();
  }, []);

  useEffect(() => {
    if (animationDone && !authLoading) {
      setShowSplash(false);
    }
  }, [animationDone, authLoading]);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <NavigationContainer>
          <AuthListener />
          <RootNavigator />
          {showSplash && (
            <AnimatedSplash
              waitFor={authLoading}
              onFinish={() => setAnimationDone(true)}
            />
          )}
        </NavigationContainer>
        <Toast />
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
