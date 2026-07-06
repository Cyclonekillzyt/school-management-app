import { View, Text, Pressable } from "react-native";

type AssessmentHeaderProps = {
  onBack: () => void;
  t: any;
};

export function AssessmentHeader({ onBack, t }: AssessmentHeaderProps) {
  return (
    <View
      style={{
        padding: 16,
        borderBottomWidth: 1,
        borderColor: t.border,
      }}
    >
      <Text style={{ fontSize: 18, fontWeight: "700", color: t.foreground }}>
        Assessment Entry
      </Text>

      <Pressable onPress={onBack} style={{ marginTop: 6 }}>
        <Text style={{ color: t.mutedForeground }}>← Back</Text>
      </Pressable>
    </View>
  );
}
