import {
  Pressable,
  Text,
  StyleSheet,
  ActivityIndicator,
  View,
} from "react-native";
import { useTheme } from "@/hooks/useTheme";
import { useEffect, useRef } from "react";
import { Animated } from "react-native";

type Props = {
  onPress: () => void;
  disabled?: boolean;
  text: string;
  loaderText: string;
};

export default function LoginButton({ onPress, disabled, text, loaderText }: Props) {
  const theme = useTheme();
  const pulse = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (disabled) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulse, {
            toValue: 0.6,
            duration: 500,
            useNativeDriver: true,
          }),
          Animated.timing(pulse, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true,
          }),
        ]),
      ).start();
    }
  }, [disabled]);

  return (
    <Pressable
      disabled={disabled}
      onPress={onPress}
      style={[
        styles.button,
        {
          backgroundColor: disabled ? theme.muted : theme.primary,
          opacity: disabled ? 0.8 : 1,
        },
      ]}
    >
      <View style={styles.content}>
        {disabled ? (
          <>
            <ActivityIndicator color={theme.primaryForeground} />
            <Text style={[styles.text, { color: theme.primaryForeground }]}>
              {loaderText}
            </Text>
          </>
        ) : (
          <Text style={[styles.text, { color: theme.primaryForeground }]}>
            {text}
          </Text>
        )}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    paddingVertical: 18,
    borderRadius: 16,
    alignItems: "center",
    marginTop: 16,
  },

  content: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },

  text: {
    fontSize: 16,
    fontWeight: "700",
  },
});
