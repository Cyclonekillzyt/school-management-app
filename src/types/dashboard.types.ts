export type TeacherPerformance = {
  total_students: number;
  average_score: number;
  highest_score: number;
  lowest_score: number;
  teacher_rank: number;
  teacher_position: string;
};

export type TeacherPerformanceUi = {
  teacher_id: string;
  teacher_name: string;
  scores_entered: number;
  total_students: number;
  completion_percentage: number;
  teacher_rank: number;
  teacher_position: string;
};

export type Workload = {
  assignment_id: string;
  class_id: string;
  subject_id: string;
  academic_year_id: string;
  scores_entered: number;
  total_students: number;
  completion_percentage: number;
};

export type DashboardWorkload = {
  assignment_id: string;
  subject_name: string;
  class_name: string;
  academic_year_name: string;
  teacher_name: string;

  total_students: number;

  classwork_completed: number;
  groupwork_completed: number;
  projectwork_completed: number;
  test_completed: number;
  exam_score_completed: number;

  classwork_completion_percentage: number | null;
  groupwork_completion_percentage: number | null;
  projectwork_completion_percentage: number | null;
  test_completion_percentage: number | null;
  exam_score_completion_percentage: number | null;

  // 🔥 NEW FIELD FROM VIEW
  grand_total_completion_percentage: number | null;
};

export type Assignment = {
  assignment_id: string;
  class_name: string;
  subject_name: string;
  academic_year: string;
};

export type DashboardState = {
  performance: TeacherPerformance | null;
  workload: Workload[];
  assignments: Assignment[];
  loading: boolean;
  dashboardWorkload: DashboardWorkload[];
  teacherRanking: TeacherPerformanceUi[];
  selectedAssignment: Assignment | null;
  setSelectedAssignment: (assignment: Assignment | null) => void;

  fetchDashboard: (teacherId: string) => Promise<void>;
  initializeDashboard: () => Promise<void>;
};
