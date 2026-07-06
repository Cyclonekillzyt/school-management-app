import { View, Text } from "react-native";
import { useTheme } from "@/hooks/useTheme";
import Header from "@/components/common/Header";
import ClassTab from "@/components/classes/ClassTab";
import ClassesList from "@/components/classes/ClassesList";

export default function ClassesScreen() {
  const theme = useTheme();
  return (
    <View style={{ flex: 1, backgroundColor: theme.background }}>
      <Header />
      <ClassTab />
      <ClassesList />
    </View>
  );
}
