import { create } from "zustand";
import { supabase } from "@/lib/supabase";
import { showToast } from "@/utils/toast";

type AssignmentPickers = {
  teacherOptions: { teacher_id: string; teacher_name: string }[];
  classOptions: { class_id: string; class_name: string }[];
  subjectOptions: { subject_id: string; subject_name: string }[];
  loadingOptions: boolean;
  fetchOptions: () => Promise<void>;
  createAssignment: (input: {
    teacherId: string;
    subjectId: string;
    classId: string;
  }) => Promise<void>;
  deleteAssignment: (assignmentId: string) => Promise<void>;
};

export const useAdminAssignmentStore = create<AssignmentPickers>((set) => ({
  teacherOptions: [],
  classOptions: [],
  subjectOptions: [],
  loadingOptions: false,

  fetchOptions: async () => {
    set({ loadingOptions: true });
    try {
      const [teachersRes, classesRes, subjectsRes] = await Promise.all([
        supabase.rpc("admin_teachers_picker"),
        supabase.rpc("admin_classes_picker"),
        supabase.rpc("admin_subjects_picker"),
      ]);

      if (teachersRes.error) throw teachersRes.error;
      if (classesRes.error) throw classesRes.error;
      if (subjectsRes.error) throw subjectsRes.error;

      set({
        teacherOptions: teachersRes.data ?? [],
        classOptions: classesRes.data ?? [],
        subjectOptions: subjectsRes.data ?? [],
      });
    } catch (err: any) {
      console.log(err);
      showToast.error("Load failed", err.message);
    } finally {
      set({ loadingOptions: false });
    }
  },

  createAssignment: async ({ teacherId, subjectId, classId }) => {
    const { error } = await supabase.rpc("admin_create_assignment", {
      p_teacher_id: teacherId,
      p_subject_id: subjectId,
      p_class_id: classId,
      p_academic_year_id: null,
    });
    if (error) throw error;
  },

  deleteAssignment: async (assignmentId) => {
    const { error } = await supabase.rpc("admin_delete_assignment", {
      p_assignment_id: assignmentId,
    });
    if (error) throw error;
  },
}));
