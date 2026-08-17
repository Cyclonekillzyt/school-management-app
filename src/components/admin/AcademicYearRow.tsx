import { View, Text, Pressable } from "react-native";
import { useTheme } from "@/hooks/useTheme";
import { AdminAcademicYear } from "@/types/adminAcademic.types";

type Props = {
  item: AdminAcademicYear;
  onSetActive: () => void;
  onToggleArchive: () => void;
};

export default function AcademicYearRow({
  item,
  onSetActive,
  onToggleArchive,
}: Props) {
  const theme = useTheme();

  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderBottomWidth: 1,
        borderColor: theme.border,
        opacity: item.archived ? 0.5 : 1,
      }}
    >
      <View style={{ flex: 1 }}>
        <Text
          style={{ fontWeight: "700", fontSize: 14, color: theme.foreground }}
        >
          {item.name}
        </Text>
        <Text
          style={{ fontSize: 11, color: theme.mutedForeground, marginTop: 2 }}
        >
          {item.current ? "Active" : item.archived ? "Archived" : "Inactive"}
        </Text>
      </View>

      {!item.current && (
        <Pressable
          onPress={onSetActive}
          style={{
            paddingVertical: 6,
            paddingHorizontal: 12,
            borderRadius: 10,
            backgroundColor: theme.primary,
            marginRight: 8,
          }}
        >
          <Text style={{ color: "#fff", fontWeight: "700", fontSize: 11 }}>
            Activate
          </Text>
        </Pressable>
      )}

      <Pressable
        onPress={onToggleArchive}
        style={{
          paddingVertical: 6,
          paddingHorizontal: 12,
          borderRadius: 10,
          backgroundColor: theme.muted,
        }}
      >
        <Text
          style={{
            color: theme.mutedForeground,
            fontWeight: "700",
            fontSize: 11,
          }}
        >
          {item.archived ? "Unarchive" : "Archive"}
        </Text>
      </Pressable>
    </View>
  );
}
