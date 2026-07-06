import { View, Text } from "react-native";

type Props = {
  t: any;
};

export default function EmptyAssessment({ t }: Props) {
  return (
    <View style={{ padding: 20 }}>
      <Text style={{ color: t.mutedForeground }}>
        Select an assignment to continue
      </Text>
    </View>
  );
}
