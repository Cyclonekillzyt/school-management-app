import { create } from "zustand";
import { supabase } from "@/lib/supabase";
import { showToast } from "@/utils/toast";
import { AdminSubjectPerformance } from "@/types/adminPerformance.types";

type AdminSubjectsState = {
  subjects: AdminSubjectPerformance[];
  loading: boolean;
  fetchSubjects: () => Promise<void>;
  createSubject: (name: string) => Promise<void>;
  updateSubject: (subjectId: string, name: string) => Promise<void>;
};

export const useAdminSubjectsStore = create<AdminSubjectsState>((set, get) => ({
  subjects: [],
  loading: false,

  fetchSubjects: async () => {
    set({ loading: true });
    try {
      const { data, error } = await supabase.rpc("admin_subject_performance");
      if (error) throw error;
      set({ subjects: (data as AdminSubjectPerformance[]) ?? [] });
    } catch (err: any) {
      console.log(err);
      showToast.error("Load failed", err.message);
    } finally {
      set({ loading: false });
    }
  },

  createSubject: async (name) => {
    const { error } = await supabase.rpc("admin_create_subject", {
      p_name: name,
    });
    if (error) throw error;
    await get().fetchSubjects();
  },

  updateSubject: async (subjectId, name) => {
    const { error } = await supabase.rpc("admin_update_subject", {
      p_subject_id: subjectId,
      p_name: name,
    });
    if (error) throw error;
    await get().fetchSubjects();
  },
}));
