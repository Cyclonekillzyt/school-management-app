import { create } from "zustand";
import { supabase } from "@/lib/supabase";
import { showToast } from "@/utils/toast";

type TeacherOption = { teacher_id: string; teacher_name: string };

type AdminPickersState = {
  teacherOptions: TeacherOption[];
  loadingTeacherOptions: boolean;
  fetchTeacherOptions: () => Promise<void>;
};

export const useAdminPickersStore = create<AdminPickersState>((set) => ({
  teacherOptions: [],
  loadingTeacherOptions: false,

  fetchTeacherOptions: async () => {
    set({ loadingTeacherOptions: true });
    try {
      const { data, error } = await supabase.rpc("admin_teachers_picker");
      if (error) throw error;
      set({ teacherOptions: (data as TeacherOption[]) ?? [] });
    } catch (err: any) {
      console.log(err);
      showToast.error("Load failed", err.message);
    } finally {
      set({ loadingTeacherOptions: false });
    }
  },
}));
