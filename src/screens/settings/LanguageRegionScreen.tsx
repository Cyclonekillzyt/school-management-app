import { useState } from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@/hooks/useTheme";
import BackButton from "@/components/auth/BackButton";

const LANGUAGES = ["English", "French", "Twi"];

export default function LanguageRegionScreen() {
  const theme = useTheme();
  const [selected, setSelected] = useState("English");

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <BackButton label="Back" />
      <Text style={[styles.title, { color: theme.foreground }]}>
        Language & Region
      </Text>
      <Text style={[styles.subtitle, { color: theme.mutedForeground }]}>
        Choose your preferred language.
      </Text>

      <View
        style={[
          styles.card,
          { backgroundColor: theme.card, borderColor: theme.cardBorder },
        ]}
      >
        {LANGUAGES.map((lang, index) => (
          <Pressable
            key={lang}
            onPress={() => setSelected(lang)}
            style={[
              styles.row,
              index !== 0 && {
                borderTopWidth: 1,
                borderTopColor: theme.border,
              },
            ]}
          >
            <Text style={[styles.label, { color: theme.foreground }]}>
              {lang}
            </Text>
            {selected === lang && (
              <Ionicons
                name="checkmark-circle"
                size={20}
                color={theme.primary}
              />
            )}
          </Pressable>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 24, paddingTop: 60, gap: 18 },
  title: { fontSize: 28, fontWeight: "800" },
  subtitle: { fontSize: 15, lineHeight: 22 },
  card: { borderRadius: 14, borderWidth: 1, overflow: "hidden" },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  label: { fontSize: 14, fontWeight: "600" },
});
