import { create } from "zustand";
import { supabase } from "@/lib/supabase";
import { showToast } from "@/utils/toast";
import { AdminTeacherOverview } from "@/types/adminPeople.types";
import { AdminClassOverview } from "@/types/adminSchool.types";
import {
  AdminSubjectPerformance,
  AdminStudentRanking,
  AdminCompletionSummary,
} from "@/types/adminPerformance.types";

type AdminPerformanceState = {
  teacherRankings: AdminTeacherOverview[];
  classRankings: AdminClassOverview[];
  subjectPerformance: AdminSubjectPerformance[];
  studentRankings: AdminStudentRanking[];
  completion: AdminCompletionSummary | null;

  loading: boolean;
  fetchAll: () => Promise<void>;
};

export const useAdminPerformanceStore = create<AdminPerformanceState>(
  (set) => ({
    teacherRankings: [],
    classRankings: [],
    subjectPerformance: [],
    studentRankings: [],
    completion: null,
    loading: false,

    fetchAll: async () => {
      set({ loading: true });
      try {
        const [
          teachersRes,
          classesRes,
          subjectsRes,
          studentsRes,
          completionRes,
        ] = await Promise.all([
          supabase.rpc("admin_teachers_overview"),
          supabase.rpc("admin_classes_overview"),
          supabase.rpc("admin_subject_performance"),
          supabase.rpc("admin_student_rankings", {
            p_class_id: null,
            p_limit: 50,
          }),
          supabase.rpc("admin_completion_summary"),
        ]);

        if (teachersRes.error) throw teachersRes.error;
        if (classesRes.error) throw classesRes.error;
        if (subjectsRes.error) throw subjectsRes.error;
        if (studentsRes.error) throw studentsRes.error;
        if (completionRes.error) throw completionRes.error;

        const teacherSorted = [
          ...((teachersRes.data as AdminTeacherOverview[]) ?? []),
        ].sort((a, b) => (a.teacher_rank ?? 999) - (b.teacher_rank ?? 999));

        const classSorted = [
          ...((classesRes.data as AdminClassOverview[]) ?? []),
        ].sort((a, b) => (b.average_score ?? -1) - (a.average_score ?? -1));

        const completionRow = Array.isArray(completionRes.data)
          ? completionRes.data[0]
          : completionRes.data;

        set({
          teacherRankings: teacherSorted,
          classRankings: classSorted,
          subjectPerformance:
            (subjectsRes.data as AdminSubjectPerformance[]) ?? [],
          studentRankings: (studentsRes.data as AdminStudentRanking[]) ?? [],
          completion: completionRow ?? null,
        });
      } catch (err: any) {
        console.log(err);
        showToast.error("Performance error", err.message);
      } finally {
        set({ loading: false });
      }
    },
  }),
);
