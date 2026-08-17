import { View, Text, Pressable } from "react-native";
import { useTheme } from "@/hooks/useTheme";
import ActivityRow from "./ActivityRow";
import { AdminActivityEntry } from "@/types/adminActivity.types";

type Props = {
  items: AdminActivityEntry[];
  onSeeAll: () => void;
};

export default function RecentActivityCard({ items, onSeeAll }: Props) {
  const theme = useTheme();

  return (
    <View
      style={{
        marginHorizontal: 16,
        marginTop: 16,
        marginBottom: 16,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: theme.cardBorder,
        backgroundColor: theme.card,
        overflow: "hidden",
      }}
    >
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          padding: 16,
          paddingBottom: 8,
        }}
      >
        <Text style={{ fontSize: 14, fontWeight: "800", color: theme.foreground }}>Recent Activity</Text>
        <Pressable onPress={onSeeAll}>
          <Text style={{ color: theme.primary, fontSize: 12, fontWeight: "700" }}>See All</Text>
        </Pressable>
      </View>

      {items.length === 0 ? (
        <Text style={{ padding: 16, paddingTop: 0, color: theme.mutedForeground, fontSize: 12 }}>
          Nothing recent to show.
        </Text>
      ) : (
        items.slice(0, 5).map((item) => <ActivityRow key={item.id} item={item} />)
      )}
    </View>
  );
}