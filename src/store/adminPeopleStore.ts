import { create } from "zustand";
import { supabase } from "@/lib/supabase";
import { showToast } from "@/utils/toast";
import {
  AdminTeacherOverview,
  AdminTeacherSummary,
  AdminTeacherAssignment,
} from "@/types/adminPeople.types";

type AdminPeopleState = {
  teachers: AdminTeacherOverview[];
  loadingTeachers: boolean;
  fetchTeachers: () => Promise<void>;

  teacherSummary: AdminTeacherSummary | null;
  teacherAssignments: AdminTeacherAssignment[];
  loadingTeacherDetail: boolean;
  fetchTeacherDetail: (teacherId: string) => Promise<void>;

  resetTeacherPassword: (teacherId: string) => Promise<void>;
  setTeacherActive: (teacherId: string, active: boolean) => Promise<void>;
};

export const useAdminPeopleStore = create<AdminPeopleState>((set, get) => ({
  teachers: [],
  loadingTeachers: false,

  fetchTeachers: async () => {
    set({ loadingTeachers: true });
    try {
      const { data, error } = await supabase.rpc("admin_teachers_overview");
      if (error) throw error;
      set({ teachers: (data as AdminTeacherOverview[]) ?? [] });
    } catch (err: any) {
      console.log(err);
      showToast.error("Teachers error", err.message);
    } finally {
      set({ loadingTeachers: false });
    }
  },

  teacherSummary: null,
  teacherAssignments: [],
  loadingTeacherDetail: false,

  fetchTeacherDetail: async (teacherId: string) => {
    set({ loadingTeacherDetail: true });
    try {
      const [summaryRes, assignmentsRes] = await Promise.all([
        supabase.rpc("admin_teacher_summary", { p_teacher_id: teacherId }),
        supabase.rpc("admin_teacher_assignments", { p_teacher_id: teacherId }),
      ]);

      if (summaryRes.error) throw summaryRes.error;
      if (assignmentsRes.error) throw assignmentsRes.error;

      const summaryRow = Array.isArray(summaryRes.data)
        ? summaryRes.data[0]
        : summaryRes.data;

      set({
        teacherSummary: summaryRow ?? null,
        teacherAssignments:
          (assignmentsRes.data as AdminTeacherAssignment[]) ?? [],
      });
    } catch (err: any) {
      console.log(err);
      showToast.error("Teacher detail error", err.message);
    } finally {
      set({ loadingTeacherDetail: false });
    }
  },

  resetTeacherPassword: async (teacherId) => {
    const { error } = await supabase.functions.invoke("admin-manage-teacher", {
      body: { action: "reset_password", teacherId },
    });
    if (error) throw error;
  },

  setTeacherActive: async (teacherId, active) => {
    const { error } = await supabase.functions.invoke("admin-manage-teacher", {
      body: { action: active ? "reactivate" : "deactivate", teacherId },
    });
    if (error) throw error;
    await get().fetchTeacherDetail(teacherId);
  },
}));
