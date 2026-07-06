import { create } from "zustand";
import { supabase } from "@/lib/supabase";
import { showToast } from "@/utils/toast";
import { DashboardState } from "@/types/dashboard.types";
import { useAuthStore } from "./authStore";

export const useDashboardStore = create<DashboardState>((set) => ({
  performance: null,
  workload: [],
  assignments: [],
  loading: false,
  dashboardWorkload: [],
  teacherRanking: [],
  selectedAssignment: null,
  activeGrade: "",

  setSelectedAssignment: (assignment) =>
    set({ selectedAssignment: assignment }),

  initializeDashboard: async () => {
    const user = useAuthStore.getState().user;

    if (!user?.id) return;

    await useDashboardStore.getState().fetchDashboard(user.id);
  },

  setActiveGrade: (grade) => set({ activeGrade: grade }),

  fetchDashboard: async (teacherId: string) => {
    set({ loading: true });

    try {
      const { data: performance, error: perfError } = await supabase
        .from("teacher_performance_view")
        .select("*")
        .eq("teacher_id", teacherId)
        .maybeSingle();

      if (perfError) throw perfError;

      const { data: performanceUi, error: perfErrorUi } = await supabase.rpc(
        "teacher_completion_ranking",
      );

      if (perfErrorUi) throw perfErrorUi;

      const { data: workload, error: workloadError } = await supabase
        .from("teacher_workload_view")
        .select("*")
        .eq("teacher_id", teacherId);

      if (workloadError) throw workloadError;

      const { data: dashboardWorkload, error: dashboardWorkloadError } =
        await supabase
          .from("teacher_workload_dashboard_view")
          .select("*")
          .eq("teacher_id", teacherId);

      if (dashboardWorkloadError) throw dashboardWorkloadError;

      const { data: assignments, error: assignError } = await supabase
        .from("teacher_dashboard_view")
        .select("*")
        .eq("teacher_id", teacherId);

      if (assignError) throw assignError;

      set({
        performance,
        workload: workload ?? [],
        assignments: assignments ?? [],
        dashboardWorkload: dashboardWorkload ?? [],
        teacherRanking: performanceUi ?? [],

        activeGrade: dashboardWorkload?.[0]?.class_name,
      });
    } catch (err: any) {
      console.log(err);
      showToast.error("Dashboard error", err.message);
    } finally {
      set({ loading: false });
    }
  },
}));
