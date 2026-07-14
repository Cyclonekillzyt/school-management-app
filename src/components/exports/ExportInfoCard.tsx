import { View, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";

type Props = {
  assignment: any;
  totalStudents: number;
  t: any;
};

function Row({
  label,
  value,
  t,
}: {
  label: string;
  value: string | number;
  t: any;
}) {
  return (
    <View
      style={{
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingVertical: 8,
      }}
    >
      <Text
        style={{
          color: t.mutedForeground,
          fontSize: 13,
          fontWeight: "500",
        }}
      >
        {label}
      </Text>

      <Text
        style={{
          color: t.foreground,
          fontSize: 14,
          fontWeight: "600",
        }}
      >
        {value}
      </Text>
    </View>
  );
}

export default function ExportInfoCard({
  assignment,
  totalStudents,
  t,
}: Props) {
  return (
    <View
      style={{
        marginHorizontal: 16,
        marginTop: 18,
        backgroundColor: t.card,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: t.border,
        padding: 16,
      }}
    >
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          marginBottom: 14,
        }}
      >
        <Ionicons name="document-text-outline" size={18} color={t.primary} />

        <Text
          style={{
            marginLeft: 8,
            fontSize: 16,
            fontWeight: "700",
            color: t.foreground,
          }}
        >
          Assessment Information
        </Text>
      </View>

      <Row label="School" value="ABC Basic School" t={t} />

      <Row label="Subject" value={assignment.subject_name} t={t} />

      <Row label="Class" value={assignment.class_name} t={t} />

      <Row label="Academic Year" value={assignment.academic_year} t={t} />

      <Row label="Term" value={assignment.term || "-"} t={t} />

      <Row label="Students" value={totalStudents} t={t} />
    </View>
  );
}
