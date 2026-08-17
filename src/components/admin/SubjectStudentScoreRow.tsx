import { View, Text } from "react-native";
import { useTheme } from "@/hooks/useTheme";
import { getAvatarColor, getInitials } from "@/utils/avatar";
import { AdminAssignmentStudentScore } from "@/types/adminDetail.types";

type Props = {
  item: AdminAssignmentStudentScore;
};

function ScoreChip({
  label,
  value,
  theme,
}: {
  label: string;
  value: number | null;
  theme: any;
}) {
  return (
    <View>
      <Text style={{ fontSize: 10, color: theme.mutedForeground }}>
        {label}
      </Text>
      <Text
        style={{ fontSize: 12, fontWeight: "700", color: theme.foreground }}
      >
        {value ?? "—"}
      </Text>
    </View>
  );
}

export default function SubjectStudentScoreRow({ item }: Props) {
  const theme = useTheme();

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
            width: 34,
            height: 34,
            borderRadius: 17,
            backgroundColor: getAvatarColor(item.student_name),
            alignItems: "center",
            justifyContent: "center",
            marginRight: 10,
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

      <View
        style={{ flexDirection: "row", gap: 14, marginTop: 8, paddingLeft: 44 }}
      >
        <ScoreChip label="CW" value={item.classwork} theme={theme} />
        <ScoreChip label="GW" value={item.groupwork} theme={theme} />
        <ScoreChip label="PW" value={item.projectwork} theme={theme} />
        <ScoreChip label="Test" value={item.test} theme={theme} />
        <ScoreChip label="Exam" value={item.exam_score} theme={theme} />
      </View>
    </View>
  );
}
