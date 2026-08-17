export type AdminClassOverview = {
  class_id: string;
  class_name: string;
  total_students: number;
  total_subjects: number;
  average_score: number | null;
  completion_percentage: number | null;
};

export type AdminClassSummary = {
  class_id: string;
  class_name: string;
  total_students: number;
  average_score: number | null;
  completion_percentage: number | null;
  class_teacher_id: string | null;
  class_teacher_name: string | null;
};

export type AdminClassSubject = {
  assignment_id: string;
  subject_id: string;
  subject_name: string;
  teacher_id: string;
  teacher_name: string;
  average_score: number | null;
  completion_percentage: number | null;
};

export type AdminClassStudent = {
  student_id: string;
  student_name: string;
  average_score: number | null;
  position: number;
};
