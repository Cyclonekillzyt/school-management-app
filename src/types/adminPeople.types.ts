export type AdminTeacherOverview = {
  teacher_id: string;
  teacher_name: string;
  email: string;
  gender: string | null;
  total_assignments: number;
  total_students: number;
  completion_percentage: number | null;
  average_score: number | null;
  teacher_rank: number | null;
  teacher_position: string | null;
};

export type AdminTeacherSummary = {
  teacher_id: string;
  teacher_name: string;
  email: string;
  gender: string | null;
  joined_at: string;
  active: boolean;
  total_assignments: number;
  total_students: number;
  completion_percentage: number | null;
  average_score: number | null;
  teacher_rank: number | null;
  teacher_position: string | null;
};

export type AdminTeacherAssignment = {
  assignment_id: string;
  class_id: string;
  class_name: string;
  subject_id: string;
  subject_name: string;
  total_students: number;
  completion_percentage: number | null;
  average_score: number | null;
};
