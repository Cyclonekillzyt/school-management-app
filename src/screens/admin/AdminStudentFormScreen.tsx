import { useEffect, useState } from "react";
import { View, Text, ScrollView, StyleSheet } from "react-native";
import { useRoute, useNavigation } from "@react-navigation/native";
import { useTheme } from "@/hooks/useTheme";
import BackButton from "@/components/auth/BackButton";
import InputField from "@/components/auth/InputField";
import LoginButton from "@/components/auth/LoginButton";
import { useAdminDetailStore } from "@/store/adminDetailStore";
import { useAdminSchoolStore } from "@/store/adminSchoolStore";
import { showToast } from "@/utils/toast";

export default function AdminStudentFormScreen() {
  const theme = useTheme();
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const { studentId, classId, className } = route.params ?? {};
  const isEdit = !!studentId;

  const studentProfile = useAdminDetailStore((s) => s.studentProfile);
  const fetchStudentProfile = useAdminDetailStore((s) => s.fetchStudentProfile);
  const createStudent = useAdminDetailStore((s) => s.createStudent);
  const updateStudent = useAdminDetailStore((s) => s.updateStudent);
  const fetchClassDetail = useAdminSchoolStore((s) => s.fetchClassDetail);

  const [fullName, setFullName] = useState("");
  const [admissionNumber, setAdmissionNumber] = useState("");
  const [gender, setGender] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [parentName, setParentName] = useState("");
  const [parentPhone, setParentPhone] = useState("");
  const [address, setAddress] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (isEdit) fetchStudentProfile(studentId);
  }, [studentId]);

  useEffect(() => {
    if (isEdit && studentProfile && studentProfile.student_id === studentId) {
      setFullName(studentProfile.student_name ?? "");
      setAdmissionNumber(studentProfile.admission_number ?? "");
      setGender(studentProfile.gender ?? "");
      setDateOfBirth(studentProfile.date_of_birth ?? "");
      setParentName(studentProfile.parent_name ?? "");
      setParentPhone(studentProfile.parent_phone ?? "");
      setAddress(studentProfile.address ?? "");
    }
  }, [studentProfile]);

  const handleSave = async () => {
    if (!fullName.trim()) {
      showToast.error("Missing name", "Student name is required");
      return;
    }

    setSaving(true);
    try {
      if (isEdit) {
        await updateStudent(studentId, {
          full_name: fullName,
          class_id: studentProfile?.class_id ?? classId,
          admission_number: admissionNumber,
          gender,
          date_of_birth: dateOfBirth || null,
          parent_name: parentName,
          parent_phone: parentPhone,
          address,
        });
        showToast.success("Student updated");
      } else {
        await createStudent({
          full_name: fullName,
          class_id: classId,
          admission_number: admissionNumber,
          gender,
          date_of_birth: dateOfBirth || null,
          parent_name: parentName,
          parent_phone: parentPhone,
          address,
        });
        showToast.success("Student added");
        if (classId) await fetchClassDetail(classId);
      }
      navigation.goBack();
    } catch (err: any) {
      showToast.error("Save failed", err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <BackButton label="Back" />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ gap: 18, paddingBottom: 40 }}
      >
        <Text style={[styles.title, { color: theme.foreground }]}>
          {isEdit ? "Edit Student" : "Add Student"}
        </Text>
        <Text style={[styles.subtitle, { color: theme.mutedForeground }]}>
          {isEdit ? studentProfile?.class_name : className}
        </Text>

        <InputField
          label="FULL NAME"
          placeholder="Student's full name"
          value={fullName}
          onChangeText={setFullName}
          icon={null}
        />
        <InputField
          label="ADMISSION NUMBER"
          placeholder="Optional"
          value={admissionNumber}
          onChangeText={setAdmissionNumber}
          icon={null}
        />

        <View style={{ gap: 8 }}>
          <Text
            style={{
              fontSize: 16,
              fontWeight: "700",
              color: theme.mutedForeground,
            }}
          >
            GENDER
          </Text>
          <View style={{ flexDirection: "row", gap: 10 }}>
            {["male", "female"].map((g) => (
              <Text
                key={g}
                onPress={() => setGender(g)}
                style={{
                  paddingVertical: 10,
                  paddingHorizontal: 18,
                  borderRadius: 12,
                  fontSize: 13,
                  fontWeight: "700",
                  overflow: "hidden",
                  backgroundColor: gender === g ? theme.primary : theme.muted,
                  color: gender === g ? "#fff" : theme.mutedForeground,
                }}
              >
                {g === "male" ? "Male" : "Female"}
              </Text>
            ))}
          </View>
        </View>

        <InputField
          label="DATE OF BIRTH"
          placeholder="YYYY-MM-DD"
          value={dateOfBirth}
          onChangeText={setDateOfBirth}
          icon={null}
        />
        <InputField
          label="PARENT / GUARDIAN NAME"
          placeholder="Optional"
          value={parentName}
          onChangeText={setParentName}
          icon={null}
        />
        <InputField
          label="PARENT / GUARDIAN PHONE"
          placeholder="Optional"
          value={parentPhone}
          onChangeText={setParentPhone}
          icon={null}
        />
        <InputField
          label="ADDRESS"
          placeholder="Optional"
          value={address}
          onChangeText={setAddress}
          icon={null}
        />

        <LoginButton
          onPress={handleSave}
          disabled={saving}
          text={isEdit ? "SAVE CHANGES" : "ADD STUDENT"}
          loaderText="Saving..."
        />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 24, paddingTop: 60 },
  title: { fontSize: 28, fontWeight: "800" },
  subtitle: { fontSize: 15 },
});
