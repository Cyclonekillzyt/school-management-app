import { useEffect, useState } from "react";
import { View, Text, Pressable, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@/hooks/useTheme";
import { useRoute, useNavigation } from "@react-navigation/native";
import { useAdminDetailStore } from "@/store/adminDetailStore";
import InlineLoader from "@/components/admin/InlineLoader";
import StudentSubjectScoreRow from "@/components/admin/StudentSubjectScoreRow";
import WarningModal from "@/components/common/warningModal";
import { getAvatarColor, getInitials } from "@/utils/avatar";
import { showToast } from "@/utils/toast";
import { exportStudentReportCard } from "@/services/exports/reportCardService";
import { useAdminActivityStore } from "@/store/adminActivityStore";

function DetailRow({
  label,
  value,
  theme,
}: {
  label: string;
  value: string | null | undefined;
  theme: any;
}) {
  return (
    <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
      <Text style={{ fontSize: 12, color: theme.mutedForeground }}>
        {label}
      </Text>
      <Text
        style={{ fontSize: 13, fontWeight: "600", color: theme.foreground }}
      >
        {value || "—"}
      </Text>
    </View>
  );
}

export default function AdminStudentProfileScreen() {
  const theme = useTheme();
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const { studentId, studentName } = route.params;

  const profile = useAdminDetailStore((s) => s.studentProfile);
  const subjectScores = useAdminDetailStore((s) => s.studentSubjectScores);
  const loading = useAdminDetailStore((s) => s.loadingStudentProfile);
  const fetchStudentProfile = useAdminDetailStore((s) => s.fetchStudentProfile);
  const setStudentActive = useAdminDetailStore((s) => s.setStudentActive);

  const [showDeactivateModal, setShowDeactivateModal] = useState(false);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    fetchStudentProfile(studentId);
  }, [studentId]);

  const name = profile?.student_name ?? studentName;
  const color = getAvatarColor(name ?? "");

  const handleToggleActive = async () => {
    setShowDeactivateModal(false);
    try {
      await setStudentActive(studentId, !profile?.active);
      showToast.success(
        profile?.active ? "Student deactivated" : "Student reactivated",
      );
    } catch (err: any) {
      showToast.error("Update failed", err.message);
    }
  };

  const logExport = useAdminActivityStore((s) => s.logExport);

  const handleDownloadReportCard = async () => {
    if (!profile) return;
    setDownloading(true);
    try {
      await exportStudentReportCard({
        studentName: profile.student_name,
        className: profile.class_name,
        overallAverage: profile.overall_average,
        classPosition: profile.class_position,
        subjects: subjectScores,
      });
      await logExport(
        "student",
        studentId,
        `${profile.student_name}'s report card`,
      );
    } catch (err: any) {
      showToast.error("Export failed", err.message);
    } finally {
      setDownloading(false);
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
            <Pressable
              onPress={handleDownloadReportCard}
              disabled={downloading}
            >
              <Ionicons
                name="document-text-outline"
                size={22}
                color={theme.primary}
              />
            </Pressable>
            <Pressable
              onPress={() =>
                navigation.navigate("AdminStudentForm", {
                  studentId,
                  classId: profile?.class_id,
                })
              }
            >
              <Ionicons name="create-outline" size={22} color={theme.primary} />
            </Pressable>
            <Pressable onPress={() => setShowDeactivateModal(true)}>
              <Ionicons
                name={
                  profile?.active === false
                    ? "checkmark-circle-outline"
                    : "close-circle-outline"
                }
                size={22}
                color={
                  profile?.active === false ? theme.success : theme.destructive
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
            <Text
              style={{
                fontSize: 12,
                color: theme.mutedForeground,
                marginTop: 2,
              }}
            >
              {profile?.class_name ?? "—"}
              {profile?.active === false ? " · Inactive" : ""}
            </Text>
          </View>
        </View>

        <View style={{ flexDirection: "row", gap: 20, marginTop: 16 }}>
          <View>
            <Text style={{ fontSize: 11, color: theme.mutedForeground }}>
              Overall Average
            </Text>
            <Text
              style={{ fontSize: 14, fontWeight: "800", color: theme.primary }}
            >
              {profile?.overall_average != null
                ? `${profile.overall_average}%`
                : "—"}
            </Text>
          </View>
          <View>
            <Text style={{ fontSize: 11, color: theme.mutedForeground }}>
              Class Position
            </Text>
            <Text
              style={{
                fontSize: 14,
                fontWeight: "800",
                color: theme.foreground,
              }}
            >
              {profile?.class_position != null
                ? `#${profile.class_position}`
                : "—"}
            </Text>
          </View>
          <View>
            <Text style={{ fontSize: 11, color: theme.mutedForeground }}>
              Subjects
            </Text>
            <Text
              style={{
                fontSize: 14,
                fontWeight: "800",
                color: theme.foreground,
              }}
            >
              {subjectScores.length}
            </Text>
          </View>
        </View>
      </View>

      {loading && !profile ? (
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
            Details
          </Text>

          <View
            style={{
              marginTop: 8,
              marginHorizontal: 16,
              borderWidth: 1,
              borderColor: theme.cardBorder,
              borderRadius: 14,
              overflow: "hidden",
              backgroundColor: theme.card,
              padding: 16,
              gap: 10,
            }}
          >
            <DetailRow
              label="Admission Number"
              value={profile?.admission_number}
              theme={theme}
            />
            <DetailRow label="Gender" value={profile?.gender} theme={theme} />
            <DetailRow
              label="Date of Birth"
              value={profile?.date_of_birth}
              theme={theme}
            />
            <DetailRow
              label="Parent / Guardian"
              value={profile?.parent_name}
              theme={theme}
            />
            <DetailRow
              label="Parent Phone"
              value={profile?.parent_phone}
              theme={theme}
            />
            <DetailRow label="Address" value={profile?.address} theme={theme} />
          </View>

          <Text
            style={{
              marginTop: 24,
              marginHorizontal: 16,
              fontSize: 14,
              fontWeight: "800",
              color: theme.foreground,
            }}
          >
            Subject Performance
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
            {subjectScores.length === 0 ? (
              <Text style={{ padding: 16, color: theme.mutedForeground }}>
                No scores recorded yet.
              </Text>
            ) : (
              subjectScores.map((s) => (
                <StudentSubjectScoreRow key={s.subject_id} item={s} />
              ))
            )}
          </View>
        </ScrollView>
      )}

      <WarningModal
        visible={showDeactivateModal}
        title={
          profile?.active === false
            ? "Reactivate Student"
            : "Deactivate Student"
        }
        message={
          profile?.active === false
            ? "This student will be marked active again and appear in class rosters and rankings."
            : "This student will be marked inactive and excluded from rosters and rankings. Their score history is kept."
        }
        confirmText={profile?.active === false ? "Reactivate" : "Deactivate"}
        cancelText="Cancel"
        onConfirm={handleToggleActive}
        onCancel={() => setShowDeactivateModal(false)}
      />
    </View>
  );
}
