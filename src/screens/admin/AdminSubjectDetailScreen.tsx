import { useEffect } from "react";
import { View, Text, Pressable, FlatList } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@/hooks/useTheme";
import { useRoute, useNavigation } from "@react-navigation/native";
import { useAdminDetailStore } from "@/store/adminDetailStore";
import LoadingAssessment from "@/components/assessment/LoadingAssessment";
import SubjectStudentScoreRow from "@/components/admin/SubjectStudentScoreRow";

export default function AdminSubjectDetailScreen() {
  const theme = useTheme();
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const { assignmentId, subjectName, className } = route.params;

  const students = useAdminDetailStore((s) => s.assignmentStudents);
  const loading = useAdminDetailStore((s) => s.loadingAssignmentStudents);
  const fetchAssignmentStudents = useAdminDetailStore(
    (s) => s.fetchAssignmentStudents,
  );

  useEffect(() => {
    fetchAssignmentStudents(assignmentId);
  }, [assignmentId]);

  if (loading && students.length === 0) {
    return <LoadingAssessment />;
  }

  return (
    <View style={{ flex: 1, backgroundColor: theme.background }}>
      <View
        style={{ padding: 16, borderBottomWidth: 1, borderColor: theme.border }}
      >
        <Pressable onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={26} color={theme.foreground} />
        </Pressable>

        <Text
          style={{
            marginTop: 12,
            fontSize: 20,
            fontWeight: "800",
            color: theme.foreground,
          }}
        >
          {subjectName}
        </Text>
        <Text
          style={{ marginTop: 4, fontSize: 13, color: theme.mutedForeground }}
        >
          {className} · {students.length} students
        </Text>
      </View>

      <FlatList
        data={students}
        keyExtractor={(item) => item.student_id}
        renderItem={({ item }) => <SubjectStudentScoreRow item={item} />}
        contentContainerStyle={{ paddingBottom: 24 }}
        ListEmptyComponent={
          <Text
            style={{
              textAlign: "center",
              marginTop: 40,
              color: theme.mutedForeground,
            }}
          >
            No students found.
          </Text>
        }
      />
    </View>
  );
}
