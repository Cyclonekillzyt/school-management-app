import { useEffect } from "react";
import { View, Text, FlatList } from "react-native";
import { useTheme } from "@/hooks/useTheme";
import BackButton from "@/components/auth/BackButton";
import InlineLoader from "@/components/admin/InlineLoader";
import ActivityRow from "@/components/admin/ActivityRow";
import { useAdminActivityStore } from "@/store/adminActivityStore";

export default function AdminActivityLogScreen() {
  const theme = useTheme();
  const recent = useAdminActivityStore((s) => s.recent);
  const loading = useAdminActivityStore((s) => s.loading);
  const fetchRecent = useAdminActivityStore((s) => s.fetchRecent);

  useEffect(() => {
    fetchRecent(100);
  }, []);

  return (
    <View style={{ flex: 1, backgroundColor: theme.background, paddingTop: 60, paddingHorizontal: 24 }}>
      <BackButton label="Back" />
      <Text style={{ fontSize: 28, fontWeight: "800", color: theme.foreground, marginTop: 18 }}>Activity Log</Text>
      <Text style={{ fontSize: 15, color: theme.mutedForeground, marginTop: 4, marginBottom: 18 }}>
        Everything that's happened across the school recently.
      </Text>

      {loading && recent.length === 0 ? (
        <InlineLoader />
      ) : (
        <View style={{ marginHorizontal: -24 }}>
          <View
            style={{
              marginHorizontal: 24,
              marginBottom: 30,
              borderWidth: 1,
              borderColor: theme.cardBorder,
              borderRadius: 14,
              overflow: "hidden",
              backgroundColor: theme.card,
            }}
          >
            <FlatList
              data={recent}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => <ActivityRow item={item} />}
              ListEmptyComponent={
                <Text style={{ padding: 16, color: theme.mutedForeground }}>No activity recorded yet.</Text>
              }
            />
          </View>
        </View>
      )}
    </View>
  );
}