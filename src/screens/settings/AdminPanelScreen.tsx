import { View, Text, StyleSheet, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { useTheme } from "@/hooks/useTheme";
import BackButton from "@/components/auth/BackButton";

export default function AdminPanelScreen() {
  const theme = useTheme();
  const navigation = useNavigation<any>();

  const items = [
    { icon: "calendar-outline", label: "Academic Years & Terms", description: "Set the active year/term and open or close score entry", route: "AdminAcademicYears" },
    { icon: "book-outline", label: "Subjects", description: "Add and edit the subjects taught across the school", route: "AdminSubjects" },
    { icon: "cloud-upload-outline", label: "Bulk Import", description: "Import students, teachers, and assignments from Excel", route: "BulkImport" },
    { icon: "time-outline", label: "Activity Log", description: "See everything that's happened across the school", route: "AdminActivityLog" },
  ];

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <BackButton label="Back" />
      <Text style={[styles.title, { color: theme.foreground }]}>Admin Panel</Text>
      <Text style={[styles.subtitle, { color: theme.mutedForeground }]}>School-wide administration tools.</Text>

      <View style={{ gap: 12 }}>
        {items.map((item) => (
          <Pressable
            key={item.route}
            onPress={() => navigation.navigate(item.route)}
            style={{ flexDirection: "row", alignItems: "center", gap: 12, padding: 16, borderRadius: 14, borderWidth: 1, borderColor: theme.cardBorder, backgroundColor: theme.card }}
          >
            <Ionicons name={item.icon as any} size={20} color={theme.primary} />
            <View style={{ flex: 1 }}>
              <Text style={{ fontWeight: "700", color: theme.foreground }}>{item.label}</Text>
              <Text style={{ fontSize: 12, color: theme.mutedForeground, marginTop: 2 }}>{item.description}</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={theme.mutedForeground} />
          </Pressable>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 24, paddingTop: 60, gap: 18 },
  title: { fontSize: 28, fontWeight: "800" },
  subtitle: { fontSize: 15, lineHeight: 22 },
});