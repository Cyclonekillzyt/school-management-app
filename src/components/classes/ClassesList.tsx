import { View, Text, Pressable } from "react-native";
import { useDashboardStore } from "@/store/dashboardStore";
import { useTheme } from "@/hooks/useTheme";

import { Ionicons } from "@expo/vector-icons";
import { getAvatarColor, getInitials } from "@/utils/avatar";
import { useNavigation } from "@react-navigation/native";

export default function ClassesList() {
  const navigation = useNavigation<any>();
  const theme = useTheme();
  const items = useDashboardStore((s) => s.dashboardWorkload);
  const activeGrade = useDashboardStore((s) => s.activeGrade);
  const assignment = useDashboardStore((s) => s.assignments);

  return (
    <View
      style={{
        flexDirection: "column",
        gap: 10,
        paddingVertical: 16,
        paddingHorizontal: 20,
      }}
    >
      {items.map((s) => (
        <Pressable
          key={s.assignment_id}
          onPress={() => {
            const assignment = {
              assignment_id: s.assignment_id,
              class_name: s.class_name,
              subject_name: s.subject_name,
              academic_year: s.academic_year_name,
              teacher_id: "", // optional if needed later
              class_id: "",
              subject_id: "",
              academic_year_id: "",
              term: "",
            };

            navigation.navigate("AssessmentEntry", {
              assignment,
            });
          }}
          style={{
            backgroundColor: theme.card,
            borderRadius: 14,
            paddingVertical: 14,
            paddingHorizontal: 16,
            borderWidth: 1,
            borderColor: theme.cardBorder,
            flexDirection: "row",
            alignItems: "center",
          }}
        >
          <View
            style={{
              width: 46,
              height: 46,
              borderRadius: 13,
              backgroundColor: `${getAvatarColor(s.subject_name)}18`,
              alignItems: "center",
              justifyContent: "center",
              borderWidth: 1,
              borderColor: `${getAvatarColor(s.subject_name)}30`,
              marginRight: 14,
            }}
          >
            <Text
              style={{
                fontWeight: "900",
                fontSize: 12,
                color: getAvatarColor(s.subject_name),
              }}
            >
              {getInitials(s.subject_name)}
            </Text>
          </View>

          <View style={{ flex: 1 }}>
            <Text
              style={{
                fontWeight: "700",
                fontSize: 14,
                color: theme.foreground,
              }}
            >
              {s.subject_name}
            </Text>

            <Text
              style={{
                fontSize: 12,
                color: theme.mutedForeground,
                marginTop: 3,
              }}
            >
              {activeGrade} · {s.total_students} students
            </Text>
          </View>

          <Ionicons
            name="chevron-forward-outline"
            size={16}
            color={theme.mutedForeground}
          />
        </Pressable>
      ))}
    </View>
  );
}
