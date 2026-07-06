import { Pressable, Text } from "react-native";

export function SaveButton({
  onSave,
  disabled,
  saving,
  hasUnsavedChanges,
  t,
}: any) {
  return (
    <Pressable
      onPress={onSave}
      disabled={disabled}
      style={{
        margin: 12,
        padding: 14,
        borderRadius: 12,
        backgroundColor: disabled ? t.muted : t.primary,
        alignItems: "center",
      }}
    >
      <Text style={{ color: "#fff", fontWeight: "700" }}>
        {saving
          ? "Saving..."
          : hasUnsavedChanges
            ? "Save Changes"
            : "All Saved"}
      </Text>
    </Pressable>
  );
}
