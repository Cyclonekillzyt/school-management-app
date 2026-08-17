import { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Modal,
  FlatList,
} from "react-native";
import { useRoute, useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@/hooks/useTheme";
import BackButton from "@/components/auth/BackButton";
import LoginButton from "@/components/auth/LoginButton";
import { useAdminAssignmentStore } from "@/store/adminAssignmentStore";
import { showToast } from "@/utils/toast";

function PickerField({
  label,
  value,
  options,
  labelKey,
  idKey,
  onChange,
}: {
  label: string;
  value: string | null;
  options: any[];
  labelKey: string;
  idKey: string;
  onChange: (id: string) => void;
}) {
  const theme = useTheme();
  const [open, setOpen] = useState(false);
  const selected = options.find((o) => o[idKey] === value);

  return (
    <View style={{ gap: 8 }}>
      <Text
        style={{
          fontSize: 16,
          fontWeight: "700",
          color: theme.mutedForeground,
        }}
      >
        {label}
      </Text>
      <Pressable
        onPress={() => setOpen(true)}
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          paddingHorizontal: 16,
          paddingVertical: 14,
          borderWidth: 1.5,
          borderRadius: 14,
          borderColor: theme.border,
          backgroundColor: theme.background,
        }}
      >
        <Text
          style={{
            color: selected ? theme.foreground : theme.mutedForeground,
            fontSize: 14,
          }}
        >
          {selected ? selected[labelKey] : `Select ${label.toLowerCase()}`}
        </Text>
        <Ionicons name="chevron-down" size={16} color={theme.mutedForeground} />
      </Pressable>

      <Modal visible={open} transparent animationType="fade">
        <Pressable
          style={{
            flex: 1,
            backgroundColor: "rgba(0,0,0,0.5)",
            justifyContent: "flex-end",
          }}
          onPress={() => setOpen(false)}
        >
          <View
            style={{
              backgroundColor: theme.card,
              borderTopLeftRadius: 20,
              borderTopRightRadius: 20,
              maxHeight: "70%",
              paddingTop: 16,
              paddingBottom: 30,
            }}
          >
            <Text
              style={{
                fontSize: 16,
                fontWeight: "800",
                color: theme.foreground,
                marginHorizontal: 20,
                marginBottom: 10,
              }}
            >
              Select {label}
            </Text>
            <FlatList
              data={options}
              keyExtractor={(item) => item[idKey]}
              renderItem={({ item }) => (
                <Pressable
                  onPress={() => {
                    onChange(item[idKey]);
                    setOpen(false);
                  }}
                  style={{
                    paddingVertical: 14,
                    paddingHorizontal: 20,
                    borderTopWidth: 1,
                    borderColor: theme.border,
                  }}
                >
                  <Text
                    style={{
                      color: theme.foreground,
                      fontSize: 14,
                      fontWeight: value === item[idKey] ? "800" : "500",
                    }}
                  >
                    {item[labelKey]}
                  </Text>
                </Pressable>
              )}
            />
          </View>
        </Pressable>
      </Modal>
    </View>
  );
}

export default function AdminAssignmentFormScreen() {
  const theme = useTheme();
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const { classId, className } = route.params ?? {};

  const {
    teacherOptions,
    classOptions,
    subjectOptions,
    fetchOptions,
    createAssignment,
  } = useAdminAssignmentStore();

  const [teacherId, setTeacherId] = useState<string | null>(null);
  const [subjectId, setSubjectId] = useState<string | null>(null);
  const [selectedClassId, setSelectedClassId] = useState<string | null>(
    classId ?? null,
  );
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchOptions();
  }, []);

  const handleSave = async () => {
    if (!teacherId || !subjectId || !selectedClassId) {
      showToast.error("Missing fields", "Select a teacher, subject, and class");
      return;
    }

    setSaving(true);
    try {
      await createAssignment({
        teacherId,
        subjectId,
        classId: selectedClassId,
      });
      showToast.success("Assignment created");
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
        Assign Teacher
      </Text>
      {className && (
        <Text style={{ color: theme.mutedForeground, fontSize: 14 }}>
          Assigning to {className}
        </Text>
      )}

      <PickerField
        label="Teacher"
        value={teacherId}
        options={teacherOptions}
        labelKey="teacher_name"
        idKey="teacher_id"
        onChange={setTeacherId}
      />

      <PickerField
        label="Subject"
        value={subjectId}
        options={subjectOptions}
        labelKey="subject_name"
        idKey="subject_id"
        onChange={setSubjectId}
      />

      {!classId && (
        <PickerField
          label="Class"
          value={selectedClassId}
          options={classOptions}
          labelKey="class_name"
          idKey="class_id"
          onChange={setSelectedClassId}
        />
      )}

      <Text style={{ fontSize: 12, color: theme.mutedForeground }}>
        Uses the current active academic year automatically.
      </Text>

      <LoginButton
        onPress={handleSave}
        disabled={saving}
        text="CREATE ASSIGNMENT"
        loaderText="Saving..."
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 24, paddingTop: 60, gap: 18 },
  title: { fontSize: 28, fontWeight: "800" },
});
