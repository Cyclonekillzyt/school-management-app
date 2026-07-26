import { useState } from "react";
import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@/hooks/useTheme";
import { useAuthStore } from "@/store/authStore";
import InputField from "@/components/auth/InputField";
import LoginButton from "@/components/auth/LoginButton";
import BackButton from "@/components/auth/BackButton";
import { showToast } from "@/utils/toast";

export default function EditProfileScreen() {
  const theme = useTheme();
  const user = useAuthStore((s) => s.user);
  const updateProfile = useAuthStore((s) => s.updateProfile);

  const [fullName, setFullName] = useState(user?.userName ?? "");
  const [gender, setGender] = useState(user?.gender ?? "");
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!fullName.trim()) {
      showToast.error("Missing name", "Full name can't be empty");
      return;
    }
    setSaving(true);
    await updateProfile({ full_name: fullName.trim(), gender });
    setSaving(false);
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <BackButton label="Back" />
      <Text style={[styles.title, { color: theme.foreground }]}>
        Edit Profile
      </Text>
      <Text style={[styles.subtitle, { color: theme.mutedForeground }]}>
        Update your name and details.
      </Text>

      <InputField
        label="FULL NAME"
        placeholder="Enter your full name"
        value={fullName}
        onChangeText={setFullName}
        icon={
          <Ionicons
            name="person-outline"
            size={16}
            color={theme.mutedForeground}
          />
        }
      />

      <View style={{ gap: 8 }}>
        <Text
          style={{
            fontSize: 16,
            fontWeight: "700",
            color: theme.mutedForeground,
          }}
        >
          GENDER
        </Text>
        <View style={{ flexDirection: "row", gap: 10 }}>
          {["male", "female"].map((g) => (
            <Text
              key={g}
              onPress={() => setGender(g)}
              style={{
                paddingVertical: 10,
                paddingHorizontal: 18,
                borderRadius: 12,
                fontSize: 13,
                fontWeight: "700",
                overflow: "hidden",
                backgroundColor: gender === g ? theme.primary : theme.muted,
                color: gender === g ? "#fff" : theme.mutedForeground,
              }}
            >
              {g === "male" ? "Male" : "Female"}
            </Text>
          ))}
        </View>
      </View>

      <LoginButton
        onPress={handleSave}
        disabled={saving}
        text="SAVE CHANGES"
        loaderText="Saving..."
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 24, paddingTop: 60, gap: 18 },
  title: { fontSize: 28, fontWeight: "800" },
  subtitle: { fontSize: 15, lineHeight: 22 },
});
