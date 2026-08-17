import { create } from "zustand";
import { supabase } from "@/lib/supabase";
import { showToast } from "@/utils/toast";
import { AdminActivityEntry } from "@/types/adminActivity.types";

type AdminActivityState = {
  recent: AdminActivityEntry[];
  loading: boolean;
  fetchRecent: (limit?: number) => Promise<void>;
  logExport: (entityType: string, entityId: string | null, entityLabel: string) => Promise<void>;
};

export const useAdminActivityStore = create<AdminActivityState>((set) => ({
  recent: [],
  loading: false,

  fetchRecent: async (limit = 20) => {
    set({ loading: true });
    try {
      const { data, error } = await supabase.rpc("admin_recent_activity", { p_limit: limit });
      if (error) throw error;
      set({ recent: (data as AdminActivityEntry[]) ?? [] });
    } catch (err: any) {
      console.log(err);
      showToast.error("Activity error", err.message);
    } finally {
      set({ loading: false });
    }
  },

  logExport: async (entityType, entityId, entityLabel) => {
    try {
      await supabase.rpc("admin_log_export", {
        p_entity_type: entityType,
        p_entity_id: entityId,
        p_entity_label: entityLabel,
      });
    } catch (err) {
      console.log(err);
    }
  },
}));