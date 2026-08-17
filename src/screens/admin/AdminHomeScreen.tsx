import { useEffect } from "react";
import { View, ScrollView, Text, StyleSheet } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useTheme } from "@/hooks/useTheme";
import Header from "@/components/common/Header";
import GreetingCard from "@/components/dashboard/GreetingCard";
import StatGrid from "@/components/admin/StatGrid";
import CompletionCard from "@/components/admin/CompletionCard";
import PerformanceHighlights from "@/components/admin/PerformanceHighlights";
import RecentActivityCard from "@/components/admin/RecentActivityCard";
import { useAdminDashboardStore } from "@/store/adminDashboardStore";
import { useAdminActivityStore } from "@/store/adminActivityStore";
import InlineLoader from "@/components/admin/InlineLoader";

export default function AdminHomeScreen() {
  const theme = useTheme();
  const navigation = useNavigation<any>();
  const summary = useAdminDashboardStore((s) => s.summary);
  const fetchSummary = useAdminDashboardStore((s) => s.fetchSummary);
  const recentActivity = useAdminActivityStore((s) => s.recent);
  const fetchRecent = useAdminActivityStore((s) => s.fetchRecent);

  useEffect(() => {
    fetchSummary();
    fetchRecent(5);
  }, []);

  return (
    <View style={{ flex: 1, backgroundColor: theme.background }}>
      <Header />

      <ScrollView showsVerticalScrollIndicator={false}>
        <GreetingCard />

        {!summary ? (
          <InlineLoader />
        ) : (
          <>
            {(summary?.current_academic_year || summary?.current_term) && (
              <View style={styles.periodRow}>
                <Text style={[styles.period, { color: theme.mutedForeground }]}>
                  {summary?.current_term ?? "Current Term"} · {summary?.current_academic_year ?? "—"}
                </Text>
              </View>
            )}

            <StatGrid
              stats={[
                { label: "Students", value: summary?.total_students ?? 0 },
                { label: "Teachers", value: summary?.total_teachers ?? 0 },
                { label: "Classes", value: summary?.total_classes ?? 0 },
                { label: "Subjects", value: summary?.total_subjects ?? 0 },
                { label: "Assignments", value: summary?.total_assignments ?? 0 },
              ]}
            />

            <CompletionCard completed={summary?.teachers_completed ?? 0} pending={summary?.teachers_pending ?? 0} />

            <PerformanceHighlights
              topClassName={summary?.top_class_name ?? null}
              topClassAverage={summary?.top_class_average ?? null}
              lowestClassName={summary?.lowest_class_name ?? null}
              lowestClassAverage={summary?.lowest_class_average ?? null}
              topTeacherName={summary?.top_teacher_name ?? null}
              topTeacherAverage={summary?.top_teacher_average ?? null}
            />
          </>
        )}

        <RecentActivityCard
          items={recentActivity}
          onSeeAll={() => navigation.navigate("Settings", { screen: "AdminActivityLog" })}
        />

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  periodRow: { paddingHorizontal: 16, marginTop: 2, marginBottom: 6 },
  period: { fontSize: 12, fontWeight: "600" },
});