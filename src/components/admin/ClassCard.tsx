import { View, Text, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@/hooks/useTheme";
import { AdminClassOverview } from "@/types/adminSchool.types";

type Props = {
  item: AdminClassOverview;
  onPress: () => void;
};

export default function ClassCard({ item, onPress }: Props) {
  const theme = useTheme();

  return (
    <Pressable
      onPress={onPress}
      style={{
        backgroundColor: theme.card,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: theme.cardBorder,
        padding: 16,
        marginHorizontal: 16,
        marginBottom: 10,
      }}
    >
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Text
          style={{ fontSize: 15, fontWeight: "800", color: theme.foreground }}
        >
          {item.class_name}
        </Text>

        <Ionicons
          name="chevron-forward"
          size={16}
          color={theme.mutedForeground}
        />
      </View>

      <View style={{ flexDirection: "row", gap: 16, marginTop: 10 }}>
        <View>
          <Text style={{ fontSize: 11, color: theme.mutedForeground }}>
            Students
          </Text>
          <Text
            style={{ fontSize: 13, fontWeight: "700", color: theme.foreground }}
          >
            {item.total_students}
          </Text>
        </View>

        <View>
          <Text style={{ fontSize: 11, color: theme.mutedForeground }}>
            Subjects
          </Text>
          <Text
            style={{ fontSize: 13, fontWeight: "700", color: theme.foreground }}
          >
            {item.total_subjects}
          </Text>
        </View>

        <View>
          <Text style={{ fontSize: 11, color: theme.mutedForeground }}>
            Average
          </Text>
          <Text
            style={{ fontSize: 13, fontWeight: "700", color: theme.primary }}
          >
            {item.average_score != null ? `${item.average_score}%` : "—"}
          </Text>
        </View>

        <View>
          <Text style={{ fontSize: 11, color: theme.mutedForeground }}>
            Completion
          </Text>
          <Text
            style={{ fontSize: 13, fontWeight: "700", color: theme.foreground }}
          >
            {item.completion_percentage != null
              ? `${item.completion_percentage}%`
              : "—"}
          </Text>
        </View>
      </View>
    </Pressable>
  );
}
