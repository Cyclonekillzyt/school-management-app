import { View, Text } from "react-native";
import { useTheme } from "@/hooks/useTheme";
import { getAvatarColor, getInitials } from "@/utils/avatar";
import { AdminStudentSubjectScore } from "@/types/adminDetail.types";

type Props = {
  item: AdminStudentSubjectScore;
};

export default function StudentSubjectScoreRow({ item }: Props) {
  const theme = useTheme();
  const color = getAvatarColor(item.subject_name);

  return (
    <View
      style={{
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderBottomWidth: 1,
        borderColor: theme.border,
      }}
    >
      <View style={{ flexDirection: "row", alignItems: "center" }}>
        <View
          style={{
            width: 36,
            height: 36,
            borderRadius: 10,
            backgroundColor: `${color}20`,
            alignItems: "center",
            justifyContent: "center",
            marginRight: 10,
          }}
        >
          <Text style={{ fontWeight: "800", fontSize: 11, color }}>
            {getInitials(item.subject_name)}
          </Text>
        </View>

        <View style={{ flex: 1 }}>
          <Text
            style={{ fontWeight: "700", fontSize: 13, color: theme.foreground }}
          >
            {item.subject_name}
          </Text>
          <Text
            style={{ fontSize: 11, color: theme.mutedForeground, marginTop: 1 }}
          >
            {item.teacher_name}
          </Text>
        </View>

        <Text style={{ fontWeight: "800", fontSize: 14, color: theme.primary }}>
          {item.grand_total != null ? `${item.grand_total}%` : "—"}
        </Text>

        {item.grade && (
          <Text
            style={{
              marginLeft: 8,
              fontSize: 11,
              fontWeight: "700",
              color: theme.mutedForeground,
            }}
          >
            {item.grade}
          </Text>
        )}
      </View>
    </View>
  );
}
