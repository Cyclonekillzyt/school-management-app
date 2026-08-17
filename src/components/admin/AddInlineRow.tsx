import { useState } from "react";
import { View, TextInput, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@/hooks/useTheme";

type Props = {
  placeholder: string;
  onSubmit: (value: string) => void;
};

export default function AddInlineRow({ placeholder, onSubmit }: Props) {
  const theme = useTheme();
  const [value, setValue] = useState("");

  const handleSubmit = () => {
    if (!value.trim()) return;
    onSubmit(value.trim());
    setValue("");
  };

  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 10,
        paddingHorizontal: 16,
        gap: 10,
      }}
    >
      <TextInput
        value={value}
        onChangeText={setValue}
        placeholder={placeholder}
        placeholderTextColor={theme.mutedForeground}
        style={{
          flex: 1,
          backgroundColor: theme.muted,
          borderRadius: 10,
          paddingHorizontal: 12,
          paddingVertical: 8,
          color: theme.foreground,
          fontSize: 13,
        }}
        onSubmitEditing={handleSubmit}
        returnKeyType="done"
      />

      <Pressable
        onPress={handleSubmit}
        style={{
          width: 36,
          height: 36,
          borderRadius: 10,
          backgroundColor: theme.primary,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Ionicons name="add" size={20} color="#fff" />
      </Pressable>
    </View>
  );
}
