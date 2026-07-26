import { View, Text, StyleSheet, ScrollView } from "react-native";
import { useTheme } from "@/hooks/useTheme";
import BackButton from "@/components/auth/BackButton";

export default function PrivacyScreen() {
  const theme = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <BackButton label="Back" />
      <Text style={[styles.title, { color: theme.foreground }]}>Privacy</Text>

      <ScrollView contentContainerStyle={{ gap: 14 }}>
        <Text style={[styles.body, { color: theme.mutedForeground }]}>
          Your student and class data is only visible to teachers assigned to
          that class and to school administrators.
        </Text>
        <Text style={[styles.body, { color: theme.mutedForeground }]}>
          Scores you enter are stored securely and only used to calculate
          progress and rankings for your assigned classes.
        </Text>
        <Text style={[styles.body, { color: theme.mutedForeground }]}>
          Contact your school administrator for questions about data retention
          or to request account deletion.
        </Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 24, paddingTop: 60, gap: 18 },
  title: { fontSize: 28, fontWeight: "800" },
  body: { fontSize: 14, lineHeight: 21 },
});
