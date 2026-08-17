import { View, Text } from "react-native";
import { useTheme } from "@/hooks/useTheme";
import { getAvatarColor, getInitials } from "@/utils/avatar";
import { AdminSubjectPerformance } from "@/types/adminPerformance.types";

type Props = {
  item: AdminSubjectPerformance;
};

export default function SubjectPerformanceRow({ item }: Props) {
  const theme = useTheme();
  const color = getAvatarColor(item.subject_name);

  return (
    <View
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
          {item.total_assignments} classes · {item.total_students} students
        </Text>
      </View>

      <Text style={{ fontWeight: "800", fontSize: 14, color: theme.primary }}>
        {item.average_score != null ? `${item.average_score}%` : "—"}
      </Text>
    </View>
  );
}
