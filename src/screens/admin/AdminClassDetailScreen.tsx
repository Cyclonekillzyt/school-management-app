import { useEffect, useState } from "react";
import { View, Text, ScrollView, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@/hooks/useTheme";
import { useRoute, useNavigation } from "@react-navigation/native";
import { useAdminSchoolStore } from "@/store/adminSchoolStore";
import { useAdminAssignmentStore } from "@/store/adminAssignmentStore";
import InlineLoader from "@/components/admin/InlineLoader";
import ClassSubjectRow from "@/components/admin/ClassSubjectRow";
import ClassStudentRow from "@/components/admin/ClassStudentRow";
import WarningModal from "@/components/common/warningModal";
import DownloadButton from "@/components/exports/DownloadButton";
import { exportClassBroadsheet } from "@/services/exports/broadsheetService";
import { showToast } from "@/utils/toast";
import { useAdminActivityStore } from "@/store/adminActivityStore";

export default function AdminClassDetailScreen() {
  const theme = useTheme();
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const { classId, className } = route.params;

  const summary = useAdminSchoolStore((s) => s.classSummary);
  const subjects = useAdminSchoolStore((s) => s.classSubjects);
  const students = useAdminSchoolStore((s) => s.classStudents);
  const loading = useAdminSchoolStore((s) => s.loadingClassDetail);
  const fetchClassDetail = useAdminSchoolStore((s) => s.fetchClassDetail);
  const fetchClassBroadsheetRows = useAdminSchoolStore(
    (s) => s.fetchClassBroadsheetRows,
  );
  const deleteAssignment = useAdminAssignmentStore((s) => s.deleteAssignment);

  const [removeTarget, setRemoveTarget] = useState<{
    id: string;
    label: string;
  } | null>(null);
  const [downloadingBroadsheet, setDownloadingBroadsheet] = useState(false);

  useEffect(() => {
    fetchClassDetail(classId);
  }, [classId]);

  const handleRemove = async () => {
    if (!removeTarget) return;
    try {
      await deleteAssignment(removeTarget.id);
      showToast.success("Assignment removed");
      await fetchClassDetail(classId);
    } catch (err: any) {
      showToast.error("Could not remove", err.message);
    } finally {
      setRemoveTarget(null);
    }
  };

  const logExport = useAdminActivityStore((s) => s.logExport);

  const handleDownloadBroadsheet = async () => {
    setDownloadingBroadsheet(true);
    try {
      const rows = await fetchClassBroadsheetRows(classId);
      await exportClassBroadsheet({
        className: summary?.class_name ?? className,
        rows,
      });
      await logExport(
        "class",
        classId,
        `${summary?.class_name ?? className} broadsheet`,
      );
    } catch (err: any) {
      showToast.error("Export failed", err.message);
    } finally {
      setDownloadingBroadsheet(false);
    }
  };
  return (
    <View style={{ flex: 1, backgroundColor: theme.background }}>
      <View
        style={{ padding: 16, borderBottomWidth: 1, borderColor: theme.border }}
      >
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Pressable onPress={() => navigation.goBack()}>
            <Ionicons name="chevron-back" size={26} color={theme.foreground} />
          </Pressable>

          <Pressable
            onPress={() => navigation.navigate("AdminClassForm", { classId })}
          >
            <Ionicons name="create-outline" size={22} color={theme.primary} />
          </Pressable>
        </View>

        <Text
          style={{
            marginTop: 12,
            fontSize: 20,
            fontWeight: "800",
            color: theme.foreground,
          }}
        >
          {summary?.class_name ?? className}
        </Text>

        {summary?.class_teacher_name && (
          <Text
            style={{ marginTop: 2, fontSize: 12, color: theme.mutedForeground }}
          >
            Class Teacher: {summary.class_teacher_name}
          </Text>
        )}

        <View style={{ flexDirection: "row", gap: 20, marginTop: 12 }}>
          <View>
            <Text style={{ fontSize: 11, color: theme.mutedForeground }}>
              Students
            </Text>
            <Text
              style={{
                fontSize: 14,
                fontWeight: "800",
                color: theme.foreground,
              }}
            >
              {summary?.total_students ?? 0}
            </Text>
          </View>
          <View>
            <Text style={{ fontSize: 11, color: theme.mutedForeground }}>
              Average
            </Text>
            <Text
              style={{ fontSize: 14, fontWeight: "800", color: theme.primary }}
            >
              {summary?.average_score != null
                ? `${summary.average_score}%`
                : "—"}
            </Text>
          </View>
          <View>
            <Text style={{ fontSize: 11, color: theme.mutedForeground }}>
              Completion
            </Text>
            <Text
              style={{
                fontSize: 14,
                fontWeight: "800",
                color: theme.foreground,
              }}
            >
              {summary?.completion_percentage != null
                ? `${summary.completion_percentage}%`
                : "—"}
            </Text>
          </View>
        </View>
      </View>

      {loading && !summary ? (
        <InlineLoader />
      ) : (
        <ScrollView>
          <View
            style={{
              marginTop: 16,
              marginHorizontal: 16,
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Text
              style={{
                fontSize: 14,
                fontWeight: "800",
                color: theme.foreground,
              }}
            >
              Subjects
            </Text>
            <Pressable
              onPress={() =>
                navigation.navigate("AdminAssignmentForm", {
                  classId,
                  className: summary?.class_name ?? className,
                })
              }
              style={{ flexDirection: "row", alignItems: "center", gap: 4 }}
            >
              <Ionicons
                name="add-circle-outline"
                size={16}
                color={theme.primary}
              />
              <Text
                style={{
                  color: theme.primary,
                  fontWeight: "700",
                  fontSize: 12,
                }}
              >
                Assign Teacher
              </Text>
            </Pressable>
          </View>

          <View
            style={{
              marginTop: 8,
              marginHorizontal: 16,
              borderWidth: 1,
              borderColor: theme.cardBorder,
              borderRadius: 14,
              overflow: "hidden",
              backgroundColor: theme.card,
            }}
          >
            {subjects.length === 0 ? (
              <Text style={{ padding: 16, color: theme.mutedForeground }}>
                No subjects assigned yet.
              </Text>
            ) : (
              subjects.map((s) => (
                <ClassSubjectRow
                  key={s.assignment_id}
                  item={s}
                  onPress={() =>
                    navigation.navigate("AdminSubjectDetail", {
                      assignmentId: s.assignment_id,
                      subjectName: s.subject_name,
                      className: summary?.class_name ?? className,
                    })
                  }
                  onRemove={() =>
                    setRemoveTarget({
                      id: s.assignment_id,
                      label: `${s.subject_name} · ${s.teacher_name}`,
                    })
                  }
                />
              ))
            )}
          </View>

          <View
            style={{
              marginTop: 24,
              marginHorizontal: 16,
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Text
              style={{
                fontSize: 14,
                fontWeight: "800",
                color: theme.foreground,
              }}
            >
              Students
            </Text>
            <Pressable
              onPress={() =>
                navigation.navigate("AdminStudentForm", {
                  classId,
                  className: summary?.class_name ?? className,
                })
              }
              style={{ flexDirection: "row", alignItems: "center", gap: 4 }}
            >
              <Ionicons
                name="add-circle-outline"
                size={16}
                color={theme.primary}
              />
              <Text
                style={{
                  color: theme.primary,
                  fontWeight: "700",
                  fontSize: 12,
                }}
              >
                Add Student
              </Text>
            </Pressable>
          </View>

          <View
            style={{
              marginTop: 8,
              marginHorizontal: 16,
              marginBottom: 20,
              borderWidth: 1,
              borderColor: theme.cardBorder,
              borderRadius: 14,
              overflow: "hidden",
              backgroundColor: theme.card,
            }}
          >
            {students.length === 0 ? (
              <Text style={{ padding: 16, color: theme.mutedForeground }}>
                No students found.
              </Text>
            ) : (
              students.map((s) => (
                <ClassStudentRow
                  key={s.student_id}
                  item={s}
                  onPress={() =>
                    navigation.navigate("AdminStudentProfile", {
                      studentId: s.student_id,
                      studentName: s.student_name,
                    })
                  }
                />
              ))
            )}
          </View>

          <DownloadButton
            t={theme}
            loading={downloadingBroadsheet}
            onDownload={handleDownloadBroadsheet}
          />
        </ScrollView>
      )}

      <WarningModal
        visible={!!removeTarget}
        title="Remove Assignment"
        message={`Remove ${removeTarget?.label ?? ""} from this class? This is blocked if scores have already been entered.`}
        confirmText="Remove"
        cancelText="Cancel"
        onConfirm={handleRemove}
        onCancel={() => setRemoveTarget(null)}
      />
    </View>
  );
}
