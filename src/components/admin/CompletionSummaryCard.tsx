import { View, Text, StyleSheet } from "react-native";
import { useTheme } from "@/hooks/useTheme";

type Props = {
  teachersCompleted: number;
  teachersPending: number;
  classesCompleted: number;
  classesPending: number;
  assignmentsPending: number;
};

function StatBlock({ label, value, color, mutedColor }: any) {
  return (
    <View style={{ alignItems: "center", flex: 1 }}>
      <Text style={{ fontSize: 18, fontWeight: "800", color }}>{value}</Text>
      <Text
        style={{
          fontSize: 11,
          color: mutedColor,
          marginTop: 2,
          textAlign: "center",
        }}
      >
        {label}
      </Text>
    </View>
  );
}

export default function CompletionSummaryCard({
  teachersCompleted,
  teachersPending,
  classesCompleted,
  classesPending,
  assignmentsPending,
}: Props) {
  const theme = useTheme();

  return (
    <View
      style={[
        styles.card,
        { backgroundColor: theme.card, borderColor: theme.cardBorder },
      ]}
    >
      <Text style={[styles.title, { color: theme.foreground }]}>
        Completion Dashboard
      </Text>

      <View style={styles.row}>
        <StatBlock
          label="Teachers Done"
          value={teachersCompleted}
          color={theme.success}
          mutedColor={theme.mutedForeground}
        />
        <StatBlock
          label="Teachers Pending"
          value={teachersPending}
          color={theme.warning}
          mutedColor={theme.mutedForeground}
        />
        <StatBlock
          label="Classes Done"
          value={classesCompleted}
          color={theme.success}
          mutedColor={theme.mutedForeground}
        />
        <StatBlock
          label="Classes Pending"
          value={classesPending}
          color={theme.warning}
          mutedColor={theme.mutedForeground}
        />
      </View>

      <Text
        style={{ marginTop: 10, fontSize: 12, color: theme.mutedForeground }}
      >
        {assignmentsPending} assignment{assignmentsPending === 1 ? "" : "s"}{" "}
        still have missing scores
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 16,
    marginTop: 16,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    gap: 10,
  },
  title: {
    fontSize: 14,
    fontWeight: "800",
  },
  row: {
    flexDirection: "row",
  },
});
