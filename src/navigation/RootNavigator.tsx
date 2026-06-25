import { ActivityIndicator, View, StyleSheet } from "react-native";
import { useAuthStore } from "@/store/authStore";
import { SafeAreaView } from "react-native-safe-area-context";

import AuthNavigator from "./AuthNavigator";
import TeacherNavigator from "./MainTabNavigator";


export default function RootNavigator() {
  const user = useAuthStore((s) => s.user);
  const loading = useAuthStore((s) => s.authLoading);
    


  if (loading || (!user && loading)) {
    return (
      <SafeAreaView style={styles.loading}>
        <ActivityIndicator />
      </SafeAreaView>
    );
  }

  if (!user) {
    return <AuthNavigator />;
  }


  return <TeacherNavigator />;
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
});
