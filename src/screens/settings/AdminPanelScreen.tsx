import { View, Text, StyleSheet } from "react-native";
import { useTheme } from "@/hooks/useTheme";
import BackButton from "@/components/auth/BackButton";

export default function AdminPanelScreen() {
  const theme = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <BackButton label="Back" />
      <Text style={[styles.title, { color: theme.foreground }]}>
        Admin Panel
      </Text>
      <Text style={[styles.subtitle, { color: theme.mutedForeground }]}>
        School-wide administration tools.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 24, paddingTop: 60, gap: 18 },
  title: { fontSize: 28, fontWeight: "800" },
  subtitle: { fontSize: 15, lineHeight: 22 },
});
