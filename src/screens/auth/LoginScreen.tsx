import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "@/hooks/useTheme";
import LoginHeader from "@/components/auth/LoginHeader";
import LoginForm from "@/components/auth/LoginForm";


export default function LoginScreen() {
  const theme = useTheme();
 

  return (
    <>
      <SafeAreaView
        edges={["top"]}
        style={{
          backgroundColor: theme.primary,
        }}
      >
        <LoginHeader />
      </SafeAreaView>
      <SafeAreaView
        style={[
          {
            flex: 1,
            backgroundColor: theme.background,
          },
        ]}
      >
        <LoginForm />
      </SafeAreaView>
    </>
  );
}
