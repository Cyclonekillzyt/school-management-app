import {  useRef } from "react";
import { View, Text, TextInput, StyleSheet } from "react-native";
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
  borderColor
}: Props) {
  const theme = useTheme();
  const focused = useRef(false);

  const getBorderColor = () =>{
    if (focused) return theme.primary;
    if(borderColor) return borderColor;
    return theme.border;
  }

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

      <View
        style={[
          styles.inputContainer,
          {
            backgroundColor: theme.input,
            borderColor: getBorderColor(),
            shadowColor: focused ? theme.primary : "transparent",
            shadowOpacity: focused ? 0.2 : 0,
            shadowRadius: 8,
          },
        ]}
      >
        {icon}

        <TextInput
          value={value}
          placeholder={placeholder}
          placeholderTextColor={theme.mutedForeground}
          onChangeText={onChangeText}
          secureTextEntry={secureTextEntry}
          onFocus={() => (focused.current = true)}
          onBlur={() => {
            focused.current = false;
          }}
          style={[
            styles.input,
            {
              color: theme.foreground,
            },
          ]}
        />
        {rightIcon}
      </View>
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
    letterSpacing : 0.3,
    marginBottom: 8
  },

  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderWidth: 1.5,
    borderRadius: 14,
    gap: 10,
  },

  input: {
    flex: 1,
    fontSize: 14,
  },
});
