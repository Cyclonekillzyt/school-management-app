import { View, Text, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@/hooks/useTheme";
import { getAvatarColor, getInitials } from "@/utils/avatar";
import { AdminClassSubject } from "@/types/adminSchool.types";

type Props = {
  item: AdminClassSubject;
  onPress?: () => void;
  onRemove?: () => void;
};

export default function ClassSubjectRow({ item, onPress, onRemove }: Props) {
  const theme = useTheme();
  const color = getAvatarColor(item.subject_name);

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
          {getInitials(item.subject_name)}
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
          {item.teacher_name}
        </Text>
      </View>

      <View style={{ alignItems: "flex-end", marginRight: onRemove ? 12 : 0 }}>
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

      {onRemove && (
        <Pressable onPress={onRemove} hitSlop={8}>
          <Ionicons name="trash-outline" size={18} color={theme.destructive} />
        </Pressable>
      )}
    </Pressable>
  );
}
