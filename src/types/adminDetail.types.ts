export type AdminAssignmentStudentScore = {
  student_id: string;
  student_name: string;
  classwork: number | null;
  groupwork: number | null;
  projectwork: number | null;
  test: number | null;
  exam_score: number | null;
  grand_total: number | null;
  grade: string | null;
};

export type AdminStudentProfile = {
  student_id: string;
  student_name: string;
  class_id: string;
  class_name: string;
  active: boolean;
  admission_number: string | null;
  gender: string | null;
  date_of_birth: string | null;
  parent_name: string | null;
  parent_phone: string | null;
  address: string | null;
  overall_average: number | null;
  class_position: number | null;
};

export type AdminStudentSubjectScore = {
  subject_id: string;
  subject_name: string;
  teacher_name: string;
  term: string;
  classwork: number | null;
  groupwork: number | null;
  projectwork: number | null;
  test: number | null;
  exam_score: number | null;
  grand_total: number | null;
  grade: string | null;
};

export type AdminStudentFormInput = {
  full_name: string;
  class_id: string;
  admission_number?: string | null;
  gender?: string | null;
  date_of_birth?: string | null;
  parent_name?: string | null;
  parent_phone?: string | null;
  address?: string | null;
};
