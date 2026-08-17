import { View, Text, StyleSheet } from "react-native";
import { useTheme } from "@/hooks/useTheme";

type Props = {
  completed: number;
  pending: number;
};

export default function CompletionCard({ completed, pending }: Props) {
  const theme = useTheme();
  const total = completed + pending;
  const percent = total > 0 ? Math.round((completed / total) * 100) : 0;

  return (
    <View
      style={[
        styles.card,
        { backgroundColor: theme.card, borderColor: theme.cardBorder },
      ]}
    >
      <Text style={[styles.title, { color: theme.foreground }]}>
        Teacher Completion
      </Text>

      <View style={[styles.track, { backgroundColor: theme.muted }]}>
        <View
          style={[
            styles.bar,
            { width: `${percent}%`, backgroundColor: theme.primary },
          ]}
        />
      </View>

      <View style={styles.row}>
        <Text style={[styles.percent, { color: theme.primary }]}>
          {percent}%
        </Text>

        <View style={styles.legendRow}>
          <Text style={{ color: theme.mutedForeground, fontSize: 12 }}>
            {completed} Completed
          </Text>
          <Text style={{ color: theme.mutedForeground, fontSize: 12 }}>
            {pending} Pending
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 16,
    marginTop: 16,
    padding: 18,
    borderRadius: 18,
    borderWidth: 1,
    gap: 12,
  },
  title: {
    fontSize: 15,
    fontWeight: "700",
  },
  track: {
    height: 10,
    borderRadius: 999,
    overflow: "hidden",
  },
  bar: {
    height: "100%",
    borderRadius: 999,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  percent: {
    fontSize: 18,
    fontWeight: "800",
  },
  legendRow: {
    flexDirection: "row",
    gap: 14,
  },
});
