import { View, Text } from "react-native"
type AssessmentTableHeaderProps = {
  t: any;
};
export default function AssessmentTableHeader({ t }: AssessmentTableHeaderProps) {
  return (
    <View
      style={{
        flexDirection: "row",
        padding: 12,
        backgroundColor: t.muted,
        marginTop: 10,
        justifyContent: "space-between",
      }}
    >
      <Text
        style={{
          flex: 1,
          fontWeight: "700",
          fontSize: 12,
          color: t.foreground,
        }}
      >
        Student
      </Text>
      <Text
        style={{
          width: 80,
          fontWeight: "700",
          fontSize: 12,
          color: t.foreground,
        }}
      >
        Scores
      </Text>
    </View>
  );
}