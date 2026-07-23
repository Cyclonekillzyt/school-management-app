import Header from "@/components/common/Header";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import { useTheme } from "@/hooks/useTheme";
import Dropdown from "@/components/common/Dropdown";
import RankingsTable from "@/components/rankings/RankingsTable";
import RankingsIllustration from "@/components/rankings/RankingsIllustration";
import { useRankingsStore } from "@/store/rankingsStore";
import { useDashboardStore } from "@/store/dashboardStore";
import { useAuthStore } from "@/store/authStore";

export default function RankingsScreen() {
  const theme = useTheme();

  const selectedAssignment = useDashboardStore((s) => s.selectedAssignment);

  const allRankings = useRankingsStore((s) => s.teacherAssignmentRankings);


  const rankings = allRankings.filter(
    (item) => item.teacher_assignment_id === selectedAssignment?.assignment_id,
  );

  console.log("Rankings:", rankings);

  return (
    <View style={{ flex: 1, backgroundColor: theme.background }}>
      <Header />
      <Dropdown styles={DropdownStyles} />
      <ScrollView showsVerticalScrollIndicator={false}>
        <RankingsIllustration rankings={rankings} />
        <RankingsTable rankings={rankings} />
      </ScrollView>
    </View>
  );
}
const DropdownStyles = StyleSheet.create({
  badge: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 6,
    paddingHorizontal: 15,
    paddingVertical: 15,
    borderRadius: 14,
    marginHorizontal: 16,
  },

  badgeText: {
    fontSize: 15,
    fontWeight: "900",
  },

  dropdown: {
    marginTop: 8,
    borderWidth: 1,
    borderRadius: 14,
    overflow: "hidden",
    paddingHorizontal: 15,
    paddingVertical: 15,
    marginHorizontal: 16,
  },

  option: {
    paddingVertical: 12,
    paddingHorizontal: 12,
    fontSize: 15,
    fontWeight: "900",
  },
});

