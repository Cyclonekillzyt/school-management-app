import Header from "@/components/common/Header";
import { View, Text } from "react-native";
import { useTheme } from "@/hooks/useTheme";

export default function RankingsScreen() {
  const theme = useTheme();
  return (
    <View style={{ flex: 1, backgroundColor: theme.background }}>
      <Header />
    </View>
  );
}
