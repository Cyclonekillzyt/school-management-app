import { View, Text, Pressable } from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";

type AssessmentHeaderProps = {
  onBack: () => void;
  download?: () => void;
  t: any;
};

export function AssessmentHeader({ onBack, download, t }: AssessmentHeaderProps) {
  return (
    <View
      style={{
        padding: 16,
        borderBottomWidth: 1,
        borderColor: t.border,
      }}
    >
      <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
        <Pressable onPress={onBack}>
          <Ionicons name="chevron-back" size={26} color={t.foreground} />
        </Pressable>
        <Pressable onPress={download}>
          <MaterialCommunityIcons name="file-download" size={26} color={t.foreground} />
        </Pressable>
      </View>
    </View>
  );
}
