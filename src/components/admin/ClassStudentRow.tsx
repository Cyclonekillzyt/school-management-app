import { View, Text, Pressable } from "react-native";
import { useTheme } from "@/hooks/useTheme";
import { getAvatarColor, getInitials } from "@/utils/avatar";
import { AdminClassStudent } from "@/types/adminSchool.types";

type Props = {
  item: AdminClassStudent;
  onPress?: () => void;
};

export default function ClassStudentRow({ item, onPress }: Props) {
  const theme = useTheme();

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
      <Text style={{ width: 30, fontWeight: "700", color: theme.foreground }}>
        {item.position}
      </Text>

      <View
        style={{
          width: 36,
          height: 36,
          borderRadius: 18,
          backgroundColor: getAvatarColor(item.student_name),
          alignItems: "center",
          justifyContent: "center",
          marginRight: 12,
        }}
      >
        <Text style={{ color: "#fff", fontWeight: "800", fontSize: 11 }}>
          {getInitials(item.student_name)}
        </Text>
      </View>

      <Text
        style={{
          flex: 1,
          fontWeight: "700",
          fontSize: 13,
          color: theme.foreground,
        }}
      >
        {item.student_name}
      </Text>

      <Text style={{ fontWeight: "800", fontSize: 13, color: theme.primary }}>
        {item.average_score != null ? `${item.average_score}%` : "—"}
      </Text>
    </Pressable>
  );
}
