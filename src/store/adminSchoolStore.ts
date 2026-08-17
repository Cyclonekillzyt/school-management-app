import { create } from "zustand";
import { supabase } from "@/lib/supabase";
import { showToast } from "@/utils/toast";
import {
  AdminClassOverview,
  AdminClassSummary,
  AdminClassSubject,
  AdminClassStudent,
} from "@/types/adminSchool.types";

type BroadsheetRow = {
  student_id: string;
  student_name: string;
  subject_name: string;
  grand_total: number | null;
  grade: string | null;
};

type AdminSchoolState = {
  classes: AdminClassOverview[];
  loadingClasses: boolean;
  fetchClasses: () => Promise<void>;

  classSummary: AdminClassSummary | null;
  classSubjects: AdminClassSubject[];
  classStudents: AdminClassStudent[];
  loadingClassDetail: boolean;
  fetchClassDetail: (classId: string) => Promise<void>;

  createClass: (name: string, classTeacherId: string | null) => Promise<void>;
  updateClass: (
    classId: string,
    name: string,
    classTeacherId: string | null,
  ) => Promise<void>;

  fetchClassBroadsheetRows: (classId: string) => Promise<BroadsheetRow[]>;
};

export const useAdminSchoolStore = create<AdminSchoolState>((set, get) => ({
  classes: [],
  loadingClasses: false,

  fetchClasses: async () => {
    set({ loadingClasses: true });
    try {
      const { data, error } = await supabase.rpc("admin_classes_overview");
      if (error) throw error;
      set({ classes: (data as AdminClassOverview[]) ?? [] });
    } catch (err: any) {
      console.log(err);
      showToast.error("Classes error", err.message);
    } finally {
      set({ loadingClasses: false });
    }
  },

  classSummary: null,
  classSubjects: [],
  classStudents: [],
  loadingClassDetail: false,

  fetchClassDetail: async (classId: string) => {
    set({ loadingClassDetail: true });
    try {
      const [summaryRes, subjectsRes, studentsRes] = await Promise.all([
        supabase.rpc("admin_class_summary", { p_class_id: classId }),
        supabase.rpc("admin_class_subjects", { p_class_id: classId }),
        supabase.rpc("admin_class_students", { p_class_id: classId }),
      ]);

      if (summaryRes.error) throw summaryRes.error;
      if (subjectsRes.error) throw subjectsRes.error;
      if (studentsRes.error) throw studentsRes.error;

      const summaryRow = Array.isArray(summaryRes.data)
        ? summaryRes.data[0]
        : summaryRes.data;

      set({
        classSummary: summaryRow ?? null,
        classSubjects: (subjectsRes.data as AdminClassSubject[]) ?? [],
        classStudents: (studentsRes.data as AdminClassStudent[]) ?? [],
      });
    } catch (err: any) {
      console.log(err);
      showToast.error("Class detail error", err.message);
    } finally {
      set({ loadingClassDetail: false });
    }
  },

  createClass: async (name, classTeacherId) => {
    const { error } = await supabase.rpc("admin_create_class", {
      p_name: name,
      p_class_teacher_id: classTeacherId,
    });
    if (error) throw error;
  },

  updateClass: async (classId, name, classTeacherId) => {
    const { error } = await supabase.rpc("admin_update_class", {
      p_class_id: classId,
      p_name: name,
      p_class_teacher_id: classTeacherId,
    });
    if (error) throw error;
    await get().fetchClassDetail(classId);
  },

  fetchClassBroadsheetRows: async (classId) => {
    const { data, error } = await supabase.rpc("admin_class_broadsheet", {
      p_class_id: classId,
    });
    if (error) throw error;
    return (data as BroadsheetRow[]) ?? [];
  },
}));
