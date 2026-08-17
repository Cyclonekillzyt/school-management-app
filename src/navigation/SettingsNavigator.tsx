import { createNativeStackNavigator } from "@react-navigation/native-stack";
import SettingsScreen from "@/screens/settings/SettingsScreens";
import EditProfileScreen from "@/screens/settings/EditProfileScreen";
import ChangePasswordScreen from "@/screens/settings/ChangePasswordScreen";
import NotificationsScreen from "@/screens/settings/NotificationsScreen";
import LanguageRegionScreen from "@/screens/settings/LanguageRegionScreen";
import PrivacyScreen from "@/screens/settings/PrivacyScreen";
import AdminPanelScreen from "@/screens/settings/AdminPanelScreen";
import AdminImportScreen from "@/screens/admin/AdminImportScreen";
import AdminAcademicYearsScreen from "@/screens/admin/AdminAcademicYearsScreen";
import AdminSubjectsScreen from "@/screens/admin/AdminSubjectsScreen";
import AdminSubjectFormScreen from "@/screens/admin/AdminSubjectFormScreen";
import AdminActivityLogScreen from "@/screens/admin/AdminActivityLogScreen";

export type SettingsStackParamList = {
  SettingsHome: undefined;
  EditProfile: undefined;
  ChangePassword: undefined;
  Notifications: undefined;
  LanguageRegion: undefined;
  Privacy: undefined;
  AdminPanel: undefined;
  BulkImport: undefined;
  AdminAcademicYears: undefined;
  AdminSubjects: undefined;
  AdminSubjectForm: { subjectId?: string; subjectName?: string };
  AdminActivityLog: undefined;
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
      <Stack.Screen name="BulkImport" component={AdminImportScreen} />
      <Stack.Screen name="AdminAcademicYears" component={AdminAcademicYearsScreen} />
      <Stack.Screen name="AdminSubjects" component={AdminSubjectsScreen} />
      <Stack.Screen name="AdminSubjectForm" component={AdminSubjectFormScreen} />
      <Stack.Screen name="AdminActivityLog" component={AdminActivityLogScreen} />
    </Stack.Navigator>
  );
}