export type OverallStudentRanking = {
  class_id: string;
  class_name: string;

  academic_year_id: string;
  academic_year: string;

  term: string;

  student_id: string;
  student_name: string;

  overall_average_score: number;

  overall_position: number;
};

export type TeacherAssignmentRanking = {
  teacher_assignment_id: string;

  teacher_id: string;

  class_id: string;
  class_name: string;

  subject_id: string;
  subject_name: string;

  academic_year_id: string;
  academic_year: string;

  term: string;

  student_id: string;
  student_name: string;

  total_score: number;
  percentage_score: number;

  position: number;
};
