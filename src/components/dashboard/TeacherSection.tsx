import { View, Text, StyleSheet, Pressable } from "react-native";
import { useTheme } from "@/hooks/useTheme";
import TeacherCard from "./TeacherCard";
import { useDashboardStore } from "@/store/dashboardStore";
import { getAvatarColor } from "@/utils/avatar";

export default function TeachersSection() {
  const theme = useTheme();

  const uiPerformance = useDashboardStore((s) => s.teacherRanking);

  const teachers = uiPerformance.map((t) => ({
    name: t.teacher_name,
    scores: t.scores_entered,
    totalStudents: t.total_students,
    progress: t.completion_percentage,
    position: t.teacher_position,
    color: getAvatarColor(t.teacher_name),
    rank: t.teacher_rank,
  }));

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text
          style={[
            styles.title,
            {
              color: theme.foreground,
            },
          ]}
        >
          Other Teachers Progress
        </Text>

        <Pressable>
          <Text
            style={{
              color: theme.primary,
              fontSize: 12,
              fontWeight: "700",
            }}
          >
            See All
          </Text>
        </Pressable>
      </View>

      <View style={styles.list}>
        {teachers.map((teacher) => (
          <TeacherCard key={teacher.name} {...teacher} />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
    marginTop: 16,
    padding: 2,
    borderRadius: 20,
    borderWidth: 1,
    gap: 12,
  },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  title: {
    fontSize: 15,
    fontWeight: "800",
  },

  list: {
    gap: 10,
  },
});
