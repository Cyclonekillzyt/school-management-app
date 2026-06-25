import { Pressable, Text, StyleSheet } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useTheme } from "@/hooks/useTheme";
import { Ionicons } from "@expo/vector-icons";

type Props = {
  label?: string;
  to?: string; 
};

export default function BackButton({ label = "Back", to }: Props) {
  const theme = useTheme();
  const navigation = useNavigation();

  const handlePress = () => {
    if (to) {
      navigation.navigate(to as never);
    } else {
      navigation.goBack();
    }
  };

  return (
    <Pressable onPress={handlePress} style={styles.container}>
      <Ionicons name="chevron-back" size={18} color={theme.accent} />
      <Text style={[styles.text, { color: theme.accent }]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  text: {
    fontSize: 14,
    fontWeight: "700",
  },
});
