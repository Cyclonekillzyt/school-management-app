import { View, ActivityIndicator } from "react-native";
import { useTheme } from "@/hooks/useTheme";

export default function InlineLoader() {
  const theme = useTheme();
  return (
    <View
      style={{
        paddingVertical: 48,
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <ActivityIndicator size="small" color={theme.primary} />
    </View>
  );
}
