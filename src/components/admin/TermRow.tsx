import { View, Text, Pressable } from "react-native";
import { useTheme } from "@/hooks/useTheme";
import { AdminTerm } from "@/types/adminAcademic.types";

type Props = {
  item: AdminTerm;
  onSetActive: () => void;
  onToggleOpen: () => void;
};

export default function TermRow({ item, onSetActive, onToggleOpen }: Props) {
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
          {item.is_current ? "Active" : "Inactive"} ·{" "}
          {item.is_open ? "Open" : "Closed"}
        </Text>
      </View>

      {!item.is_current && (
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
        onPress={onToggleOpen}
        style={{
          paddingVertical: 6,
          paddingHorizontal: 12,
          borderRadius: 10,
          backgroundColor: item.is_open ? theme.muted : "#22c55e20",
        }}
      >
        <Text
          style={{
            color: item.is_open ? theme.mutedForeground : "#22c55e",
            fontWeight: "700",
            fontSize: 11,
          }}
        >
          {item.is_open ? "Close" : "Open"}
        </Text>
      </Pressable>
    </View>
  );
}
