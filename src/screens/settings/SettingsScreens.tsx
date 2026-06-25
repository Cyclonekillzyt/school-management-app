import { View, Button } from "react-native";
import { useAuthStore } from "@/store/authStore";

export default function SettingsScreen() {
  const logOut = useAuthStore((s) => s.signOut);
  return (
    <View>
      <Button onPress={() => logOut()} title="Log Out" />
    </View>
  );
}
