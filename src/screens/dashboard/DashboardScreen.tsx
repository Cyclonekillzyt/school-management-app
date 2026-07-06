import { View } from "react-native";
import { useTheme } from "@/hooks/useTheme";
import DashboardHeader from "@/components/common/Header";
import GreetingCard from "@/components/dashboard/GreetingCard";
import ProgressCard from "@/components/dashboard/ProgressCard";
import TeachersSection from "@/components/dashboard/TeacherSection";
import { useDashboardStore } from "@/store/dashboardStore";
import { useEffect } from "react";

export default function DashboardScreen() {
  const theme = useTheme();
  const initializeDashboard = useDashboardStore((s) => s.initializeDashboard);

  useEffect(() => {
    initializeDashboard();
  }, []);
  return (
    <View style={{ flex: 1, backgroundColor: theme.background }}>
      <DashboardHeader />
      <GreetingCard />
      <ProgressCard />
      <TeachersSection />
    </View>
  );
}
