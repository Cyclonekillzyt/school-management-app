import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@/hooks/useTheme";

export default function LoginHeader() {
  const theme = useTheme();

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: theme.primaryGradient,
        },
      ]}
    >
      <View style={styles.logoBox}>
        <Ionicons name="school-outline" size={42} color={theme.foreground} />
      </View>

      <Text
        style={[
          styles.title,
          {
            color: theme.primaryForeground,
          },
        ]}
      >
        School Manager
      </Text>

      <Text
        style={[
          styles.subtitle,
          {
            color: "rgba(255,255,255,0.7)",
          },
        ]}
      >
        Manage smarter, teach better
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    paddingTop: 60,
    paddingBottom: 40,
    gap: 14,
  },

  logoBox: {
    width: 76,
    height: 76,
    borderRadius: 22,
    backgroundColor: "rgba(255,255,255,0.18)",
    justifyContent: "center",
    alignItems: "center",
    
  },

  title: {
    fontSize: 24,
    fontWeight: "800",
  },

  subtitle: {
    fontSize: 15,
  },
});
