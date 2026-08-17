import { useEffect, useState } from "react";
import { View, Text, FlatList, Pressable, ScrollView } from "react-native";
import { useTheme } from "@/hooks/useTheme";
import Header from "@/components/common/Header";
import { useAdminPerformanceStore } from "@/store/adminPerformanceStore";
import LoadingAssessment from "@/components/assessment/LoadingAssessment";
import CompletionSummaryCard from "@/components/admin/CompletionSummaryCard";
import TeacherListCard from "@/components/admin/TeacherListCard";
import ClassCard from "@/components/admin/ClassCard";
import SubjectPerformanceRow from "@/components/admin/SubjectPerformanceRow";
import StudentRankRow from "@/components/admin/StudentRankRow";
import { useNavigation } from "@react-navigation/native";

const TABS = [
  { key: "teachers", label: "Teachers" },
  { key: "classes", label: "Classes" },
  { key: "subjects", label: "Subjects" },
  { key: "students", label: "Students" },
] as const;

type TabKey = (typeof TABS)[number]["key"];

export default function AdminPerformanceScreen() {
  const theme = useTheme();
  const navigation = useNavigation<any>();
  const [tab, setTab] = useState<TabKey>("teachers");

  const {
    teacherRankings,
    classRankings,
    subjectPerformance,
    studentRankings,
    completion,
    loading,
    fetchAll,
  } = useAdminPerformanceStore();

  useEffect(() => {
    fetchAll();
  }, []);

  if (loading && !completion) {
    return <LoadingAssessment />;
  }

  return (
    <View style={{ flex: 1, backgroundColor: theme.background }}>
      <Header />

      <CompletionSummaryCard
        teachersCompleted={completion?.teachers_completed ?? 0}
        teachersPending={completion?.teachers_pending ?? 0}
        classesCompleted={completion?.classes_completed ?? 0}
        classesPending={completion?.classes_pending ?? 0}
        assignmentsPending={completion?.assignments_pending ?? 0}
      />

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: 16,
          paddingVertical: 14,
          gap: 8,
          
        }}
        style={{ maxHeight: 54, minHeight: 54 }}
      >
        {TABS.map((t) => (
          <Pressable
            key={t.key}
            onPress={() => setTab(t.key)}
            style={{
              paddingVertical: 5,
              paddingHorizontal: 16,
              borderRadius: 16,
              backgroundColor: tab === t.key ? theme.primary : theme.muted,
              
            }}
          >
            <Text
              style={{
                color: tab === t.key ? "#fff" : theme.mutedForeground,
                fontWeight: "700",
                fontSize: 12,
              }}
            >
              {t.label}
            </Text>
          </Pressable>
        ))}
      </ScrollView>

      {tab === "teachers" && (
        <FlatList
          data={teacherRankings}
          keyExtractor={(item) => item.teacher_id}
          contentContainerStyle={{ paddingBottom: 24 }}
          renderItem={({ item }) => (
            <TeacherListCard
              item={item}
              onPress={() =>
                navigation.navigate("People", {
                  screen: "AdminTeacherDetail",
                  params: {
                    teacherId: item.teacher_id,
                    teacherName: item.teacher_name,
                  },
                })
              }
            />
          )}
          ListEmptyComponent={
            <Text
              style={{
                textAlign: "center",
                marginTop: 40,
                color: theme.mutedForeground,
              }}
            >
              No teachers found.
            </Text>
          }
        />
      )}

      {tab === "classes" && (
        <FlatList
          data={classRankings}
          keyExtractor={(item) => item.class_id}
          contentContainerStyle={{ paddingBottom: 24, paddingTop: 4 }}
          renderItem={({ item }) => (
            <ClassCard
              item={item}
              onPress={() =>
                navigation.navigate("Classes", {
                  screen: "AdminClassDetail",
                  params: {
                    classId: item.class_id,
                    className: item.class_name,
                  },
                })
              }
            />
          )}
          ListEmptyComponent={
            <Text
              style={{
                textAlign: "center",
                marginTop: 40,
                color: theme.mutedForeground,
              }}
            >
              No classes found.
            </Text>
          }
        />
      )}

      {tab === "subjects" && (
        <View
          style={{
            marginHorizontal: 16,
            marginBottom: 16,
            borderWidth: 1,
            borderColor: theme.cardBorder,
            borderRadius: 14,
            overflow: "hidden",
            backgroundColor: theme.card,
          }}
        >
          {subjectPerformance.length === 0 ? (
            <Text style={{ padding: 16, color: theme.mutedForeground }}>
              No subjects found.
            </Text>
          ) : (
            <FlatList
              data={subjectPerformance}
              keyExtractor={(item) => item.subject_id}
              renderItem={({ item }) => <SubjectPerformanceRow item={item} />}
            />
          )}
        </View>
      )}

      {tab === "students" && (
        <View
          style={{
            marginHorizontal: 16,
            marginBottom: 16,
            borderWidth: 1,
            borderColor: theme.cardBorder,
            borderRadius: 14,
            overflow: "hidden",
            backgroundColor: theme.card,
          }}
        >
          {studentRankings.length === 0 ? (
            <Text style={{ padding: 16, color: theme.mutedForeground }}>
              No students found.
            </Text>
          ) : (
            <FlatList
              data={studentRankings}
              keyExtractor={(item) => item.student_id}
              renderItem={({ item }) => <StudentRankRow item={item} />}
            />
          )}
        </View>
      )}
    </View>
  );
}
