import { create } from "zustand";
import { supabase } from "@/lib/supabase";
import { showToast } from "@/utils/toast";
import {
  AssessmentState,
  TeacherAssignment,
  AssessmentStudent,
  AssessmentType,
  AssessmentDraft,
} from "@/types/assessments.types";
import { useAuthStore } from "./authStore";

type AssessmentDraftWithMeta = AssessmentDraft & {
  teacher_assignment_id: string;
  term: string;
};

export const useAssessmentStore = create<AssessmentState>((set, get) => ({
  // =====================
  // STATE
  // =====================
  loading: false,
  saving: false,

  assignments: [],
  selectedAssignment: null,

  students: [],

  selectedAssessment: "classwork",

  drafts: {},

  hasUnsavedChanges: false,

  // =====================
  // INIT
  // =====================
  initializeAssessments: async () => {
    const user = useAuthStore.getState().user;
    if (!user?.id) return;

    await get().loadAssignments();
  },

  // =====================
  // LOAD ASSIGNMENTS
  // =====================
  loadAssignments: async (teacherId?: string) => {
    set({ loading: true });

    if (!teacherId) {
      const user = useAuthStore.getState().user;
      teacherId = user?.id ?? "";
      if (!teacherId) {
        set({ loading: false });
        return;
      }
    }

    try {
      const { data, error } = await supabase
        .from("teacher_dashboard_view")
        .select("*")
        .eq("teacher_id", teacherId);

      if (error) throw error;

      set({
        assignments: (data as TeacherAssignment[]) ?? [],
      });
    } catch (err: any) {
      console.log(err);
      showToast.error("Error", err.message);
    } finally {
      set({ loading: false });
    }
  },

  // =====================
  // SELECT ASSIGNMENT
  // =====================
  selectAssignment: async (assignment: TeacherAssignment) => {
    set({
      selectedAssignment: assignment,
      students: [],
      drafts: {},
      hasUnsavedChanges: false,
      loading: true,
    });

    await get().loadStudents(assignment.assignment_id);
  },

  // =====================
  // LOAD STUDENTS
  // =====================
  loadStudents: async (assignmentId: string) => {
    try {
      const { data, error } = await supabase
        .from("teacher_assignment_students_view")
        .select("*")
        .eq("teacher_assignment_id", assignmentId);

      if (error) throw error;

      set({
        students: (data as AssessmentStudent[]) ?? [],
      });
    } catch (err: any) {
      console.log(err);
      showToast.error("Error", err.message);
    } finally {
      set({ loading: false });
    }
  },

  // =====================
  // SET ASSESSMENT TAB
  // =====================
  setSelectedAssessment: (assessment: AssessmentType) => {
    set({ selectedAssessment: assessment });
  },

  // =====================
  // UPDATE SCORE (OPTIMISTIC UI + DRAFTS)
  // =====================
  updateScore: (studentId, assessment, value) => {
    const { students, drafts, selectedAssignment } = get();

    if (!selectedAssignment) return;

    // 1. Update visible UI immediately
    const updatedStudents = students.map((s) => {
      if (s.student_id !== studentId) return s;

      return {
        ...s,
        [assessment]: value,
      };
    });

    // 2. Find existing student row
    const student = students.find((s) => s.student_id === studentId);
    if (!student) return;

    // 3. Build/update draft
    const existingDraft = drafts[studentId] as
      | AssessmentDraftWithMeta
      | undefined;

    const updatedDraft: AssessmentDraftWithMeta = {
      ...(existingDraft ?? {}),
      score_id: student.score_id ?? "",
      student_id: studentId,
      teacher_assignment_id: selectedAssignment.assignment_id,
      term: selectedAssignment.term,
      [assessment]: value,
    };

    const updatedDrafts = {
      ...drafts,
      [studentId]: updatedDraft,
    };

    set({
      students: updatedStudents,
      drafts: updatedDrafts,
      hasUnsavedChanges: true,
    });
  },

  // =====================
  // SAVE SCORES (UPSERT BATCH)
  // =====================
  saveScores: async () => {
    const { drafts } = get();

    const draftList = Object.values(drafts) as AssessmentDraftWithMeta[];

    if (draftList.length === 0) {
      showToast.error("Nothing to save", "No changes detected");
      return;
    }

    set({ saving: true });

    try {
      const payload = draftList.map((d) => ({
        teacher_assignment_id: d.teacher_assignment_id,
        student_id: d.student_id,
        term: d.term,

        classwork: d.classwork ?? null,
        groupwork: d.groupwork ?? null,
        projectwork: d.projectwork ?? null,
        test: d.test ?? null,
        exam_score: d.exam_score ?? null,
      }));

      const { error } = await supabase.from("scores").upsert(payload, {
        onConflict: "teacher_assignment_id,student_id",
      });

      if (error) throw error;

      // reset after successful save
      set({
        drafts: {},
        hasUnsavedChanges: false,
      });

      showToast.success("Saved", "Scores updated successfully");
    } catch (err: any) {
      console.log(err);
      showToast.error("Save failed", err.message);
    } finally {
      set({ saving: false });
    }
  },

  // =====================
  // RESET DRAFTS
  // =====================
  resetDrafts: () => {
    set({
      drafts: {},
      hasUnsavedChanges: false,
    });
  },
}));
