import { View } from "react-native";
import { useTheme } from "@/hooks/useTheme";
import DashboardHeader from "@/components/common/Header";
import GreetingCard from "@/components/dashboard/GreetingCard";
import ProgressCard from "@/components/dashboard/ProgressCard";
import TeachersSection from "@/components/dashboard/TeacherSection";
import { useDashboardStore } from "@/store/dashboardStore";
import { useEffect, useRef } from "react";
import ProgressBottomSheet from "@/components/dashboard/ProgressBottomSheet";
import TeachersBottomSheet from "@/components/dashboard/TeachersBottomSheet";
import BottomSheet from "@gorhom/bottom-sheet";
import { getAvatarColor } from "@/utils/avatar";

export default function DashboardScreen() {
  const theme = useTheme();
  const initializeDashboard = useDashboardStore((s) => s.initializeDashboard);

  const progressSheetRef = useRef<BottomSheet>(null);
  const teachersSheetRef = useRef<BottomSheet>(null);

  const openProgressSheet = () => {
    progressSheetRef.current?.expand();
  };

  const openTeachersSheet = () => {
    teachersSheetRef.current?.expand();
  };

  useEffect(() => {
    initializeDashboard();
  }, []);

  const selectedAssignment = useDashboardStore((s) => s.selectedAssignment);
  const dashboardWorkload = useDashboardStore((s) => s.dashboardWorkload);
  const teacherRanking = useDashboardStore((s) => s.teacherRanking);

  const selected =
    dashboardWorkload.find(
      (item) =>
        selectedAssignment &&
        item.assignment_id === selectedAssignment.assignment_id,
    ) || null;

  const totalCompleted = selected?.grand_total_completion_percentage ?? 0;

  const items = selected
    ? [
        {
          label: "Classwork",
          value: selected.classwork_completion_percentage ?? 0,
          color: theme.primary,
        },
        {
          label: "Groupwork",
          value: selected.groupwork_completion_percentage ?? 0,
          color: theme.chart2,
        },
        {
          label: "Project",
          value: selected.projectwork_completion_percentage ?? 0,
          color: theme.chart3,
        },
      ]
    : [];

  const teachers = teacherRanking.map((t) => ({
    name: t.teacher_name,
    scores: t.scores_entered,
    totalStudents: t.total_students,
    progress: t.completion_percentage,
    position: t.teacher_position,
    color: getAvatarColor(t.teacher_name),
    rank: t.teacher_rank,
  }));

  return (
    <View style={{ flex: 1, backgroundColor: theme.background }}>
      <DashboardHeader />
      <GreetingCard />
      <ProgressCard
        onOpenSheet={openProgressSheet}
        items={items}
        totalCompleted={totalCompleted}
      />

      <TeachersSection onSeeAll={openTeachersSheet} />

      <ProgressBottomSheet
        ref={progressSheetRef}
        workload={dashboardWorkload}
      />
      <TeachersBottomSheet ref={teachersSheetRef} teachers={teachers} />
    </View>
  );
}
