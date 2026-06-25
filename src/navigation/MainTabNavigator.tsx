import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";

import DashboardScreen from "@/screens/dashboard/DashboardScreen";
import ClassesScreen from "@/screens/assessment/ClassesScreen";
import RankingsScreen from "@/screens/rankings/RankingsScreen";
import SettingsScreen from "@/screens/settings/SettingsScreens";

import { useTheme } from "@/hooks/useTheme";
import { SafeAreaView } from "react-native-safe-area-context";
import AdminHomeScreen from "@/screens/admin/AdminHomeScreen";

import { TeacherTabsParamList } from "@/types/navigation.types";
import { useAuthStore } from "@/store/authStore";

const Tab = createBottomTabNavigator<TeacherTabsParamList>();

function getTabIcon(routeName: keyof TeacherTabsParamList, focused: boolean) {
  switch (routeName) {
    case "Home":
      return focused ? "home" : "home-outline";

    case "Classes":
      return focused ? "book" : "book-outline";

    case "Rankings":
      return focused ? "podium" : "podium-outline";
    case "Settings":
      return focused ? "settings" : "settings-outline";
  }
}

export default function Navbar() {
  const theme = useTheme();
  const user = useAuthStore((s) => s.user);

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: theme.background }}
      edges={["top"]}
    >
      <Tab.Navigator
        initialRouteName="Home"
        screenOptions={({ route }) => ({
          headerShown: false,

          tabBarStyle: {
            backgroundColor: theme.card,
            borderTopWidth: 1,
            borderColor: theme.border,
            paddingTop: 5,
            paddingBottom: 26,
            flexShrink: 0,
          },

          tabBarActiveTintColor: theme.primary,
          tabBarInactiveTintColor: theme.accent,

          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons
              name={getTabIcon(route.name, focused)}
              size={size}
              color={color}
            />
          ),
        })}
      >
        <Tab.Screen
          name="Home"
          component={user?.role === "admin" ? AdminHomeScreen : DashboardScreen}
        />
        <Tab.Screen name="Classes" component={ClassesScreen} />
        <Tab.Screen name="Rankings" component={RankingsScreen} />
        <Tab.Screen name="Settings" component={SettingsScreen} />
      </Tab.Navigator>
    </SafeAreaView>
  );
}
