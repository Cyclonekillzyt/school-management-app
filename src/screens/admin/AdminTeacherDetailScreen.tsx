import { useEffect, useState } from "react";
import { View, Text, ScrollView, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@/hooks/useTheme";
import { useRoute, useNavigation } from "@react-navigation/native";
import { useAdminPeopleStore } from "@/store/adminPeopleStore";
import InlineLoader from "@/components/admin/InlineLoader";
import TeacherAssignmentRow from "@/components/admin/TeacherAssignmentRow";
import WarningModal from "@/components/common/warningModal";
import { getAvatarColor, getInitials } from "@/utils/avatar";
import { showToast } from "@/utils/toast";

export default function AdminTeacherDetailScreen() {
  const theme = useTheme();
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const { teacherId, teacherName } = route.params;

  const summary = useAdminPeopleStore((s) => s.teacherSummary);
  const assignments = useAdminPeopleStore((s) => s.teacherAssignments);
  const loading = useAdminPeopleStore((s) => s.loadingTeacherDetail);
  const fetchTeacherDetail = useAdminPeopleStore((s) => s.fetchTeacherDetail);
  const resetTeacherPassword = useAdminPeopleStore(
    (s) => s.resetTeacherPassword,
  );
  const setTeacherActive = useAdminPeopleStore((s) => s.setTeacherActive);

  const [showDeactivateModal, setShowDeactivateModal] = useState(false);
  const [resetting, setResetting] = useState(false);

  useEffect(() => {
    fetchTeacherDetail(teacherId);
  }, [teacherId]);

  const name = summary?.teacher_name ?? teacherName;
  const color = getAvatarColor(name ?? "");

  const handleResetPassword = async () => {
    setResetting(true);
    try {
      await resetTeacherPassword(teacherId);
      showToast.success(
        "Reset email sent",
        `A password reset link was sent to ${summary?.email}`,
      );
    } catch (err: any) {
      showToast.error("Reset failed", err.message);
    } finally {
      setResetting(false);
    }
  };

  const handleToggleActive = async () => {
    setShowDeactivateModal(false);
    try {
      await setTeacherActive(teacherId, summary?.active === false);
      showToast.success(
        summary?.active === false
          ? "Teacher reactivated"
          : "Teacher deactivated",
      );
    } catch (err: any) {
      showToast.error("Update failed", err.message);
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

          <View style={{ flexDirection: "row", gap: 18 }}>
            <Pressable onPress={handleResetPassword} disabled={resetting}>
              <Ionicons name="key-outline" size={22} color={theme.primary} />
            </Pressable>
            <Pressable onPress={() => setShowDeactivateModal(true)}>
              <Ionicons
                name={
                  summary?.active === false
                    ? "checkmark-circle-outline"
                    : "close-circle-outline"
                }
                size={22}
                color={
                  summary?.active === false ? theme.success : theme.destructive
                }
              />
            </Pressable>
          </View>
        </View>

        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            marginTop: 14,
            gap: 14,
          }}
        >
          <View
            style={{
              width: 56,
              height: 56,
              borderRadius: 28,
              backgroundColor: color,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Text style={{ color: "#fff", fontWeight: "800", fontSize: 18 }}>
              {getInitials(name ?? "")}
            </Text>
          </View>

          <View style={{ flex: 1 }}>
            <Text
              style={{
                fontSize: 18,
                fontWeight: "800",
                color: theme.foreground,
              }}
            >
              {name}
            </Text>
            {summary?.email && (
              <Text
                style={{
                  fontSize: 12,
                  color: theme.mutedForeground,
                  marginTop: 2,
                }}
              >
                {summary.email}
              </Text>
            )}
            <Text
              style={{
                fontSize: 12,
                marginTop: 2,
                fontWeight: "700",
                color:
                  summary?.active === false ? theme.destructive : theme.primary,
              }}
            >
              {summary?.active === false
                ? "Inactive"
                : (summary?.teacher_position ?? "Active")}
            </Text>
          </View>
        </View>

        <View style={{ flexDirection: "row", gap: 20, marginTop: 16 }}>
          <View>
            <Text style={{ fontSize: 11, color: theme.mutedForeground }}>
              Assignments
            </Text>
            <Text
              style={{
                fontSize: 14,
                fontWeight: "800",
                color: theme.foreground,
              }}
            >
              {summary?.total_assignments ?? 0}
            </Text>
          </View>
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
          <Text
            style={{
              marginTop: 16,
              marginHorizontal: 16,
              fontSize: 14,
              fontWeight: "800",
              color: theme.foreground,
            }}
          >
            Assignments
          </Text>

          <View
            style={{
              marginTop: 8,
              marginHorizontal: 16,
              marginBottom: 30,
              borderWidth: 1,
              borderColor: theme.cardBorder,
              borderRadius: 14,
              overflow: "hidden",
              backgroundColor: theme.card,
            }}
          >
            {assignments.length === 0 ? (
              <Text style={{ padding: 16, color: theme.mutedForeground }}>
                No assignments yet.
              </Text>
            ) : (
              assignments.map((a) => (
                <TeacherAssignmentRow
                  key={a.assignment_id}
                  item={a}
                  onPress={() =>
                    navigation.navigate("AdminSubjectDetail", {
                      assignmentId: a.assignment_id,
                      subjectName: a.subject_name,
                      className: a.class_name,
                    })
                  }
                />
              ))
            )}
          </View>
        </ScrollView>
      )}

      <WarningModal
        visible={showDeactivateModal}
        title={
          summary?.active === false
            ? "Reactivate Teacher"
            : "Deactivate Teacher"
        }
        message={
          summary?.active === false
            ? "This teacher will be able to log in again."
            : "This teacher will be signed out and blocked from logging in. Their assignments and history are kept."
        }
        confirmText={summary?.active === false ? "Reactivate" : "Deactivate"}
        cancelText="Cancel"
        onConfirm={handleToggleActive}
        onCancel={() => setShowDeactivateModal(false)}
      />
    </View>
  );
}
