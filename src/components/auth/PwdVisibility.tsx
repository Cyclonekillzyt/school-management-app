import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@/hooks/useTheme";

type Props = {
  visible: boolean;
  onToggle: () => void;
};

export default function PwdVisibility({ visible, onToggle }: Props) {
  const theme = useTheme();

  return (
    <Ionicons
      onPress={onToggle}
      name={visible ? "eye-off-outline" : "eye-outline"}
      size={20}
      color={theme.mutedForeground}
    />
  );
}


