import { useEffect, useState } from "react";
import { View, Text, ScrollView, StyleSheet } from "react-native";
import { useRoute, useNavigation } from "@react-navigation/native";
import { useTheme } from "@/hooks/useTheme";
import BackButton from "@/components/auth/BackButton";
import InputField from "@/components/auth/InputField";
import LoginButton from "@/components/auth/LoginButton";
import TeacherPickerField from "@/components/admin/TeacherPickerField";
import { useAdminSchoolStore } from "@/store/adminSchoolStore";
import { showToast } from "@/utils/toast";

export default function AdminClassFormScreen() {
  const theme = useTheme();
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const { classId } = route.params ?? {};
  const isEdit = !!classId;

  const classSummary = useAdminSchoolStore((s) => s.classSummary);
  const fetchClassDetail = useAdminSchoolStore((s) => s.fetchClassDetail);
  const createClass = useAdminSchoolStore((s) => s.createClass);
  const updateClass = useAdminSchoolStore((s) => s.updateClass);
  const fetchClasses = useAdminSchoolStore((s) => s.fetchClasses);

  const [name, setName] = useState("");
  const [teacherId, setTeacherId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (isEdit) fetchClassDetail(classId);
  }, [classId]);

  useEffect(() => {
    if (isEdit && classSummary && classSummary.class_id === classId) {
      setName(classSummary.class_name ?? "");
      setTeacherId(classSummary.class_teacher_id ?? null);
    }
  }, [classSummary]);

  const handleSave = async () => {
    if (!name.trim()) {
      showToast.error("Missing name", "Class name is required");
      return;
    }

    setSaving(true);
    try {
      if (isEdit) {
        await updateClass(classId, name, teacherId);
        showToast.success("Class updated");
      } else {
        await createClass(name, teacherId);
        showToast.success("Class created");
      }
      await fetchClasses();
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
          {isEdit ? "Edit Class" : "Add Class"}
        </Text>

        <InputField
          label="CLASS NAME"
          placeholder="e.g. JHS 2A"
          value={name}
          onChangeText={setName}
          icon={null}
        />

        <TeacherPickerField
          label="CLASS TEACHER"
          value={teacherId}
          onChange={setTeacherId}
        />

        <LoginButton
          onPress={handleSave}
          disabled={saving}
          text={isEdit ? "SAVE CHANGES" : "CREATE CLASS"}
          loaderText="Saving..."
        />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 24, paddingTop: 60 },
  title: { fontSize: 28, fontWeight: "800" },
});
