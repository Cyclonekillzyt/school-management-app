import { create } from "zustand";

import { supabase } from "@/lib/supabase";

import { showToast } from "@/utils/toast";

import {
  OverallStudentRanking,
  TeacherAssignmentRanking,
} from "@/types/rankings.types";

type RankingsState = {
  overallStudentRanking: OverallStudentRanking[];

  teacherAssignmentRankings: TeacherAssignmentRanking[];

  loading: boolean;

  fetchOverallRanking: (params: {
    classId: string;
    academicYearId: string;
    term: string;
  }) => Promise<void>;

  fetchTeacherRankings: (params: { teacherId: string }) => Promise<void>;
};

export const useRankingsStore = create<RankingsState>((set) => ({
  overallStudentRanking: [],

  teacherAssignmentRankings: [],

  loading: false,

  fetchOverallRanking: async (params) => {
    set({
      loading: true,
    });

    try {
      const { data, error } = await supabase

        .from("overall_class_student_ranking_view")

        .select("*")

        .eq("class_id", params.classId)

        .eq("academic_year_id", params.academicYearId)

        .eq("term", params.term)

        .order("overall_position", {
          ascending: true,
        });

      if (error) throw error;

      set({
        overallStudentRanking: (data as OverallStudentRanking[]) ?? [],
      });
    } catch (err: any) {
      console.log(err);

      showToast.error("Overall ranking error", err.message);
    } finally {
      set({
        loading: false,
      });
    }
  },

  fetchTeacherRankings: async ({ teacherId }) => {
    set({
      loading: true,
    });

    try {
      const { data, error } = await supabase
        .from("teacher_assignment_rankings_view")
        .select("*")
        .eq("teacher_id", teacherId)
        .order("position", {
          ascending: true,
        });

      if (error) throw error;

      set({
        teacherAssignmentRankings: (data as TeacherAssignmentRanking[]) ?? [],
      });
    } catch (err: any) {
      console.log(err);

      showToast.error("Ranking error", err.message);
    } finally {
      set({
        loading: false,
      });
    }
  },
}));
