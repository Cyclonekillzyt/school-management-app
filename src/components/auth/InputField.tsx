import { View, Text, StyleSheet } from "react-native";
import { TextInput as PaperTextInput } from "react-native-paper";

import { useTheme } from "@/hooks/useTheme";
import { Props } from "@/types/auth.types";

export default function InputField({
  label,
  placeholder,
  value,
  onChangeText,
  icon,
  secureTextEntry = false,
  rightIcon,
  borderColor,
}: Props) {
  const theme = useTheme();

  return (
    <View style={styles.wrapper}>
      <Text
        style={[
          styles.label,
          {
            color: theme.mutedForeground,
          },
        ]}
      >
        {label}
      </Text>

      <PaperTextInput
        value={value}
        placeholder={placeholder}
        onChangeText={onChangeText}
        secureTextEntry={secureTextEntry}
        mode="outlined"
        left={icon ? <PaperTextInput.Icon icon={() => icon} /> : undefined}
        right={
          rightIcon ? <PaperTextInput.Icon icon={() => rightIcon} /> : undefined
        }
        outlineColor={borderColor ?? theme.border}
        activeOutlineColor={theme.primary}
        textColor={theme.foreground}
        placeholderTextColor={theme.mutedForeground}
        style={[
          styles.input,
          {
            backgroundColor: theme.background,
          },
        ]}
        outlineStyle={styles.outline}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    gap: 8,
  },

  label: {
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: 0.3,
    marginBottom: 8,
  },

  input: {
    fontSize: 17,
    paddingHorizontal: 5,
    paddingVertical: 6,
    borderWidth: 1.5,
    borderRadius: 14,
  },

  outline: {
    borderRadius: 14,
    borderWidth: 1.5,
  },
});
