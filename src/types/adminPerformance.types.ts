export type AdminSubjectPerformance = {
  subject_id: string;
  subject_name: string;
  average_score: number | null;
  total_assignments: number;
  total_students: number;
};

export type AdminStudentRanking = {
  student_id: string;
  student_name: string;
  class_id: string;
  class_name: string;
  average_score: number | null;
  position: number;
};

export type AdminCompletionSummary = {
  teachers_completed: number;
  teachers_pending: number;
  classes_completed: number;
  classes_pending: number;
  assignments_pending: number;
};
