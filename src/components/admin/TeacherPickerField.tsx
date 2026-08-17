import { useEffect, useState } from "react";
import { View, Text, Pressable, Modal, FlatList } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@/hooks/useTheme";
import { useAdminPickersStore } from "@/store/adminPickersStore";

type Props = {
  label: string;
  value: string | null;
  onChange: (teacherId: string | null) => void;
};

export default function TeacherPickerField({ label, value, onChange }: Props) {
  const theme = useTheme();
  const [open, setOpen] = useState(false);
  const teacherOptions = useAdminPickersStore((s) => s.teacherOptions);
  const fetchTeacherOptions = useAdminPickersStore(
    (s) => s.fetchTeacherOptions,
  );

  useEffect(() => {
    fetchTeacherOptions();
  }, []);

  const selected = teacherOptions.find((t) => t.teacher_id === value);

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
          {selected ? selected.teacher_name : "None"}
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
              Select Class Teacher
            </Text>

            <Pressable
              onPress={() => {
                onChange(null);
                setOpen(false);
              }}
              style={{
                paddingVertical: 14,
                paddingHorizontal: 20,
                borderTopWidth: 1,
                borderColor: theme.border,
              }}
            >
              <Text style={{ color: theme.mutedForeground, fontSize: 14 }}>
                None
              </Text>
            </Pressable>

            <FlatList
              data={teacherOptions}
              keyExtractor={(item) => item.teacher_id}
              renderItem={({ item }) => (
                <Pressable
                  onPress={() => {
                    onChange(item.teacher_id);
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
                      fontWeight: value === item.teacher_id ? "800" : "500",
                    }}
                  >
                    {item.teacher_name}
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
