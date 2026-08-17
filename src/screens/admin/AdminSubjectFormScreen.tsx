import { useState } from "react";
import { View, Text, StyleSheet } from "react-native";
import { useRoute, useNavigation } from "@react-navigation/native";
import { useTheme } from "@/hooks/useTheme";
import BackButton from "@/components/auth/BackButton";
import InputField from "@/components/auth/InputField";
import LoginButton from "@/components/auth/LoginButton";
import { useAdminSubjectsStore } from "@/store/adminSubjectsStore";
import { showToast } from "@/utils/toast";

export default function AdminSubjectFormScreen() {
  const theme = useTheme();
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const { subjectId, subjectName } = route.params ?? {};
  const isEdit = !!subjectId;

  const createSubject = useAdminSubjectsStore((s) => s.createSubject);
  const updateSubject = useAdminSubjectsStore((s) => s.updateSubject);

  const [name, setName] = useState(subjectName ?? "");
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!name.trim()) {
      showToast.error("Missing name", "Subject name is required");
      return;
    }
    setSaving(true);
    try {
      if (isEdit) {
        await updateSubject(subjectId, name);
        showToast.success("Subject updated");
      } else {
        await createSubject(name);
        showToast.success("Subject created");
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
      <Text style={[styles.title, { color: theme.foreground }]}>
        {isEdit ? "Edit Subject" : "Add Subject"}
      </Text>

      <InputField
        label="SUBJECT NAME"
        placeholder="e.g. Mathematics"
        value={name}
        onChangeText={setName}
        icon={null}
      />

      <LoginButton
        onPress={handleSave}
        disabled={saving}
        text={isEdit ? "SAVE CHANGES" : "CREATE SUBJECT"}
        loaderText="Saving..."
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 24, paddingTop: 60, gap: 18 },
  title: { fontSize: 28, fontWeight: "800" },
});
