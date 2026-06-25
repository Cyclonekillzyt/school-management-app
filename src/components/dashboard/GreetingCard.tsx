import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@/hooks/useTheme";
import { useAuthStore } from "@/store/authStore";

export default function GreetingCard() {
  const theme = useTheme();
  const user = useAuthStore((s) => s.user);

  const name = user?.userName?.split(" ")[0] ?? "Teacher";
  const title = user?.gender == "male" ? "Mr." : "Ms.";

  const getGreeting = () => {
    const hour = new Date().getHours();

    if (hour < 12) return "Good Morning";
    if (hour < 18) return "Good Afternoon";
    return "Good Evening";
  };

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: theme.background,
        },
      ]}
    >
      <View>
        <Text style={[styles.greeting, { color: theme.mutedForeground }]}>
          {getGreeting()}
        </Text>

        <Text style={[styles.subtitle, { color: theme.foreground }]}>
          Hello, {title} {name} 👋
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "column",
    justifyContent: "center",
    padding: 8,
    marginHorizontal: 12,
    marginTop: 1,
  },

  left: {
    flex: 1,
    paddingRight: 10,
  },

  greeting: {
    fontSize: 16,
    fontWeight: "400",
  },

  subtitle: {
    marginTop: 4,
    fontSize: 20,
    fontWeight: "800",
  },
});
