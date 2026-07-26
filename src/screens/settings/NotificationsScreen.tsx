import { useState } from "react";
import { View, Text, StyleSheet, Switch } from "react-native";
import { useTheme } from "@/hooks/useTheme";
import BackButton from "@/components/auth/BackButton";

const OPTIONS = [
  { key: "scoreReminders", label: "Score entry reminders" },
  { key: "rankingUpdates", label: "Ranking updates" },
  { key: "announcements", label: "School announcements" },
];

export default function NotificationsScreen() {
  const theme = useTheme();
  const [prefs, setPrefs] = useState<Record<string, boolean>>({
    scoreReminders: true,
    rankingUpdates: true,
    announcements: false,
  });

  const toggle = (key: string) => setPrefs((p) => ({ ...p, [key]: !p[key] }));

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <BackButton label="Back" />
      <Text style={[styles.title, { color: theme.foreground }]}>
        Notifications
      </Text>
      <Text style={[styles.subtitle, { color: theme.mutedForeground }]}>
        Choose what you want to be notified about.
      </Text>

      <View
        style={[
          styles.card,
          { backgroundColor: theme.card, borderColor: theme.cardBorder },
        ]}
      >
        {OPTIONS.map((opt, index) => (
          <View
            key={opt.key}
            style={[
              styles.row,
              index !== 0 && {
                borderTopWidth: 1,
                borderTopColor: theme.border,
              },
            ]}
          >
            <Text style={[styles.label, { color: theme.foreground }]}>
              {opt.label}
            </Text>
            <Switch
              value={prefs[opt.key]}
              onValueChange={() => toggle(opt.key)}
              trackColor={{ true: theme.primary, false: theme.muted }}
              thumbColor="#fff"
            />
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 24, paddingTop: 60, gap: 18 },
  title: { fontSize: 28, fontWeight: "800" },
  subtitle: { fontSize: 15, lineHeight: 22 },
  card: { borderRadius: 14, borderWidth: 1, overflow: "hidden" },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  label: { fontSize: 14, fontWeight: "600", flex: 1, marginRight: 12 },
});
