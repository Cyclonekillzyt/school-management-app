import { ActivityIndicator, View } from "react-native";
import { useTheme } from "@/hooks/useTheme";

export default function LoadingAssessment() {
  const theme = useTheme();
  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: theme.background,
      }}
    >
      <ActivityIndicator color={theme.primary} />
    </View>
  );
}
