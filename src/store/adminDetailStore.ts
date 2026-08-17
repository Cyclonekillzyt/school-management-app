import { create } from "zustand";
import { supabase } from "@/lib/supabase";
import { showToast } from "@/utils/toast";
import {
  AdminAssignmentStudentScore,
  AdminStudentProfile,
  AdminStudentSubjectScore,
  AdminStudentFormInput,
} from "@/types/adminDetail.types";

type AdminDetailState = {
  assignmentStudents: AdminAssignmentStudentScore[];
  loadingAssignmentStudents: boolean;
  fetchAssignmentStudents: (assignmentId: string) => Promise<void>;

  studentProfile: AdminStudentProfile | null;
  studentSubjectScores: AdminStudentSubjectScore[];
  loadingStudentProfile: boolean;
  fetchStudentProfile: (studentId: string) => Promise<void>;

  createStudent: (input: AdminStudentFormInput) => Promise<void>;
  updateStudent: (
    studentId: string,
    input: AdminStudentFormInput,
  ) => Promise<void>;
  setStudentActive: (studentId: string, active: boolean) => Promise<void>;
};

export const useAdminDetailStore = create<AdminDetailState>((set, get) => ({
  assignmentStudents: [],
  loadingAssignmentStudents: false,

  fetchAssignmentStudents: async (assignmentId) => {
    set({ loadingAssignmentStudents: true });
    try {
      const { data, error } = await supabase.rpc("admin_assignment_students", {
        p_assignment_id: assignmentId,
      });
      if (error) throw error;
      set({
        assignmentStudents: (data as AdminAssignmentStudentScore[]) ?? [],
      });
    } catch (err: any) {
      console.log(err);
      showToast.error("Subject detail error", err.message);
    } finally {
      set({ loadingAssignmentStudents: false });
    }
  },

  studentProfile: null,
  studentSubjectScores: [],
  loadingStudentProfile: false,

  fetchStudentProfile: async (studentId) => {
    set({ loadingStudentProfile: true });
    try {
      const [profileRes, scoresRes] = await Promise.all([
        supabase.rpc("admin_student_profile", { p_student_id: studentId }),
        supabase.rpc("admin_student_subject_scores", {
          p_student_id: studentId,
        }),
      ]);

      if (profileRes.error) throw profileRes.error;
      if (scoresRes.error) throw scoresRes.error;

      const profileRow = Array.isArray(profileRes.data)
        ? profileRes.data[0]
        : profileRes.data;

      set({
        studentProfile: profileRow ?? null,
        studentSubjectScores:
          (scoresRes.data as AdminStudentSubjectScore[]) ?? [],
      });
    } catch (err: any) {
      console.log(err);
      showToast.error("Student profile error", err.message);
    } finally {
      set({ loadingStudentProfile: false });
    }
  },

  createStudent: async (input) => {
    const { error } = await supabase.rpc("admin_create_student", {
      p_full_name: input.full_name,
      p_class_id: input.class_id,
      p_admission_number: input.admission_number ?? null,
      p_gender: input.gender ?? null,
      p_date_of_birth: input.date_of_birth ?? null,
      p_parent_name: input.parent_name ?? null,
      p_parent_phone: input.parent_phone ?? null,
      p_address: input.address ?? null,
    });
    if (error) throw error;
  },

  updateStudent: async (studentId, input) => {
    const { error } = await supabase.rpc("admin_update_student", {
      p_student_id: studentId,
      p_full_name: input.full_name,
      p_class_id: input.class_id,
      p_admission_number: input.admission_number ?? null,
      p_gender: input.gender ?? null,
      p_date_of_birth: input.date_of_birth ?? null,
      p_parent_name: input.parent_name ?? null,
      p_parent_phone: input.parent_phone ?? null,
      p_address: input.address ?? null,
    });
    if (error) throw error;
    await get().fetchStudentProfile(studentId);
  },

  setStudentActive: async (studentId, active) => {
    const { error } = await supabase.rpc("admin_set_student_active", {
      p_student_id: studentId,
      p_active: active,
    });
    if (error) throw error;
    await get().fetchStudentProfile(studentId);
  },
}));
