import { View, Text, StyleSheet, Pressable } from "react-native";
import { useTheme } from "@/hooks/useTheme";
import AssignmentDropdown from "@/components/dashboard/AssignmentDropdown";
import ProgressRing from "./ProgressRing";
import { useDashboardStore } from "@/store/dashboardStore";

export default function ProgressCard() {
  const theme = useTheme();

  const selectedAssignment = useDashboardStore((s) => s.selectedAssignment);
  const dashboardWorkload = useDashboardStore((s) => s.dashboardWorkload);

  const selected =
    dashboardWorkload.find(
      (item) =>
        selectedAssignment &&
        item.assignment_id === selectedAssignment.assignment_id,
    ) || null;


  const totalCompleted = selected?.grand_total_completion_percentage ?? 0;

  const items = selected
    ? [
        {
          label: "Classwork",
          value: selected.classwork_completion_percentage ?? 0,
          color: theme.primary,
        },
        {
          label: "Groupwork",
          value: selected.groupwork_completion_percentage ?? 0,
          color: theme.chart2,
        },
        {
          label: "Project",
          value: selected.projectwork_completion_percentage ?? 0,
          color: theme.chart3,
        },
      
      ]
    : [];

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: theme.card,
          borderColor: theme.cardBorder,
        },
      ]}
    >
      {/* HEADER */}
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.foreground }]}>
          My Progress
        </Text>

        <AssignmentDropdown />
      </View>

      {/* CONTENT */}
      <View style={styles.content}>
        <ProgressRing progress={totalCompleted} />

        <View style={styles.stats}>
          {selected &&
            items.map((item) => (
              <View key={item.label}>
                <View style={styles.row}>
                  <Text
                    style={{
                      color: theme.mutedForeground,
                      fontSize: 11,
                    }}
                  >
                    {item.label}
                  </Text>

                  <Text
                    style={{
                      color: theme.foreground,
                      fontWeight: "700",
                      fontSize: 11,
                    }}
                  >
                    {item.value}%
                  </Text>
                </View>

                <View style={[styles.track, { backgroundColor: theme.muted }]}>
                  <View
                    style={{
                      height: "100%",
                      width: `${item.value}%`,
                      backgroundColor: item.color,
                      borderRadius: 999,
                    }}
                  />
                </View>
              </View>
            ))}
        </View>
      </View>

      {/* BUTTON */}
      <Pressable style={[styles.button, { backgroundColor: theme.primary }]}>
        <Text
          style={{
            color: theme.primaryForeground,
            fontWeight: "700",
          }}
        >
          View Progress
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 16,
    marginTop: 16,
    padding: 20,
    borderRadius: 18,
    borderWidth: 1,
    gap: 16,
  },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  title: {
    fontSize: 15,
    fontWeight: "700",
  },

  content: {
    flexDirection: "row",
    gap: 18,
    alignItems: "center",
  },

  stats: {
    flex: 1,
    gap: 12,
  },

  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 4,
  },

  track: {
    height: 8,
    borderRadius: 999,
    overflow: "hidden",
  },

  button: {
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
  },
});
