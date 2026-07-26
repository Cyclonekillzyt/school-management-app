import { createNativeStackNavigator } from "@react-navigation/native-stack";
import SettingsScreen from "@/screens/settings/SettingsScreens";
import EditProfileScreen from "@/screens/settings/EditProfileScreen";
import ChangePasswordScreen from "@/screens/settings/ChangePasswordScreen";
import NotificationsScreen from "@/screens/settings/NotificationsScreen";
import LanguageRegionScreen from "@/screens/settings/LanguageRegionScreen";
import PrivacyScreen from "@/screens/settings/PrivacyScreen";
import AdminPanelScreen from "@/screens/settings/AdminPanelScreen";

export type SettingsStackParamList = {
  SettingsHome: undefined;
  EditProfile: undefined;
  ChangePassword: undefined;
  Notifications: undefined;
  LanguageRegion: undefined;
  Privacy: undefined;
  AdminPanel: undefined;
};

const Stack = createNativeStackNavigator<SettingsStackParamList>();

export default function SettingsNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="SettingsHome" component={SettingsScreen} />
      <Stack.Screen name="EditProfile" component={EditProfileScreen} />
      <Stack.Screen name="ChangePassword" component={ChangePasswordScreen} />
      <Stack.Screen name="Notifications" component={NotificationsScreen} />
      <Stack.Screen name="LanguageRegion" component={LanguageRegionScreen} />
      <Stack.Screen name="Privacy" component={PrivacyScreen} />
      <Stack.Screen name="AdminPanel" component={AdminPanelScreen} />
    </Stack.Navigator>
  );
}
