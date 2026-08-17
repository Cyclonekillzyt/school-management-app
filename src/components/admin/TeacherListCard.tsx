import { View, Text, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@/hooks/useTheme";
import { getAvatarColor, getInitials } from "@/utils/avatar";
import { AdminTeacherOverview } from "@/types/adminPeople.types";

type Props = {
  item: AdminTeacherOverview;
  onPress: () => void;
};

export default function TeacherListCard({ item, onPress }: Props) {
  const theme = useTheme();
  const color = getAvatarColor(item.teacher_name);

  return (
    <Pressable
      onPress={onPress}
      style={{
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: theme.card,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: theme.cardBorder,
        padding: 14,
        marginHorizontal: 16,
        marginBottom: 10,
      }}
    >
      <View
        style={{
          width: 44,
          height: 44,
          borderRadius: 22,
          backgroundColor: color,
          alignItems: "center",
          justifyContent: "center",
          marginRight: 12,
        }}
      >
        <Text style={{ color: "#fff", fontWeight: "800" }}>
          {getInitials(item.teacher_name)}
        </Text>
      </View>

      <View style={{ flex: 1 }}>
        <Text
          style={{ fontWeight: "700", fontSize: 14, color: theme.foreground }}
        >
          {item.teacher_name}
        </Text>
        <Text
          style={{ fontSize: 12, color: theme.mutedForeground, marginTop: 2 }}
        >
          {item.total_assignments} assignment
          {item.total_assignments === 1 ? "" : "s"} · {item.total_students}{" "}
          students
        </Text>
      </View>

      <View style={{ alignItems: "flex-end", marginRight: 8 }}>
        <Text style={{ fontWeight: "800", fontSize: 13, color: theme.primary }}>
          {item.completion_percentage != null
            ? `${item.completion_percentage}%`
            : "—"}
        </Text>
        {item.teacher_position && (
          <Text
            style={{ fontSize: 11, color: theme.mutedForeground, marginTop: 2 }}
          >
            {item.teacher_position}
          </Text>
        )}
      </View>

      <Ionicons
        name="chevron-forward"
        size={16}
        color={theme.mutedForeground}
      />
    </Pressable>
  );
}
