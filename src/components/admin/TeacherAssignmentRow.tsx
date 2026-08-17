import { View, Text, Pressable } from "react-native";
import { useTheme } from "@/hooks/useTheme";
import { getAvatarColor, getInitials } from "@/utils/avatar";
import { AdminTeacherAssignment } from "@/types/adminPeople.types";

type Props = {
  item: AdminTeacherAssignment;
  onPress?: () => void;
};

export default function TeacherAssignmentRow({ item, onPress }: Props) {
  const theme = useTheme();
  const color = getAvatarColor(item.class_name);

  return (
    <Pressable
      onPress={onPress}
      style={{
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderBottomWidth: 1,
        borderColor: theme.border,
      }}
    >
      <View
        style={{
          width: 40,
          height: 40,
          borderRadius: 12,
          backgroundColor: `${color}20`,
          alignItems: "center",
          justifyContent: "center",
          marginRight: 12,
        }}
      >
        <Text style={{ fontWeight: "800", fontSize: 12, color }}>
          {getInitials(item.class_name)}
        </Text>
      </View>

      <View style={{ flex: 1 }}>
        <Text
          style={{ fontWeight: "700", fontSize: 14, color: theme.foreground }}
        >
          {item.subject_name}
        </Text>
        <Text
          style={{ fontSize: 12, color: theme.mutedForeground, marginTop: 2 }}
        >
          {item.class_name} · {item.total_students} students
        </Text>
      </View>

      <View style={{ alignItems: "flex-end" }}>
        <Text style={{ fontWeight: "800", fontSize: 13, color: theme.primary }}>
          {item.average_score != null ? `${item.average_score}%` : "—"}
        </Text>
        <Text
          style={{ fontSize: 11, color: theme.mutedForeground, marginTop: 2 }}
        >
          {item.completion_percentage != null
            ? `${item.completion_percentage}% done`
            : "—"}
        </Text>
      </View>
    </Pressable>
  );
}
