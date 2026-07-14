import { View, Text, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";

type Props = {
  assignment: any;
  onBack: () => void;
  t: any;
};

export default function AssessmentExportHeader({
  assignment,
  onBack,
  t,
}: Props) {
  return (
    <View
      style={{
        paddingHorizontal: 20,
        paddingTop: 18,
        paddingBottom: 16,
        borderBottomWidth: 1,
        borderColor: t.border,
        backgroundColor: t.background,
      }}
    >
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 18,
        }}
      >
        <Pressable onPress={onBack}>
          <Ionicons name="arrow-back" size={24} color={t.foreground} />
        </Pressable>
      </View>
      <Text
        style={{
          marginTop: 14,
          fontSize: 18,
          fontWeight: "600",
          color: t.foreground,
        }}
      >
        {assignment.subject_name}
      </Text>

      <Text
        style={{
          marginTop: 4,
          fontSize: 13,
          color: t.mutedForeground,
        }}
      >
        {assignment?.class_name} • {assignment?.academic_year}
        {assignment?.term ? ` • ${assignment?.term}` : ""}
      </Text>
    </View>
  );
}
