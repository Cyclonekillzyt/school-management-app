import { create } from "zustand";
import { supabase } from "@/lib/supabase";
import { showToast } from "@/utils/toast";
import { AdminDashboardState } from "@/types/admin.types";

export const useAdminDashboardStore = create<AdminDashboardState>((set) => ({
  summary: null,
  loading: false,

  fetchSummary: async () => {
    set({ loading: true });

    try {
      const { data, error } = await supabase.rpc("admin_dashboard_summary");

      if (error) throw error;

      const row = Array.isArray(data) ? data[0] : data;

      set({ summary: row ?? null });
    } catch (err: any) {
      console.log(err);
      showToast.error("Dashboard error", err.message);
    } finally {
      set({ loading: false });
    }
  },
}));
