export type AdminDashboardSummary = {
  total_students: number;
  total_teachers: number;
  total_classes: number;
  total_subjects: number;
  total_assignments: number;
  current_academic_year: string | null;
  current_term: string | null;
  teachers_completed: number;
  teachers_pending: number;
  top_class_name: string | null;
  top_class_average: number | null;
  lowest_class_name: string | null;
  lowest_class_average: number | null;
  top_teacher_name: string | null;
  top_teacher_average: number | null;
};

export type AdminDashboardState = {
  summary: AdminDashboardSummary | null;
  loading: boolean;
  fetchSummary: () => Promise<void>;
};