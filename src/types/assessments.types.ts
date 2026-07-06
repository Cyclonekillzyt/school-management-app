export type AssessmentType =
  | "classwork"
  | "groupwork"
  | "projectwork"
  | "test"
  | "exam_score";

export interface TeacherAssignment {
  assignment_id: string;
  teacher_id: string;

  class_id: string;
  class_name: string;

  subject_id: string;
  subject_name: string;

  academic_year_id: string;
  academic_year: string;

  term: string;
}

export interface AssessmentStudent {
  score_id: string | null;

  teacher_assignment_id: string;
  teacher_id: string;

  student_id: string;
  student_name: string;

  class_id: string;
  academic_year_id: string;

  term: string;

  classwork: number | null;
  groupwork: number | null;
  projectwork: number | null;
  test: number | null;
  exam_score: number | null;
}

export interface AssessmentDraft {
  score_id: string;

  student_id: string;

  classwork?: number | null;

  groupwork?: number | null;

  projectwork?: number | null;

  test?: number | null;

  exam_score?: number | null;
}

export interface AssessmentState {
  loading: boolean;
  saving: boolean;

  assignments: TeacherAssignment[];
  selectedAssignment: TeacherAssignment | null;

  students: AssessmentStudent[];

  selectedAssessment: AssessmentType;

  drafts: Record<string, AssessmentDraft>;

  hasUnsavedChanges: boolean;

  initializeAssessments: () => Promise<void>;

  loadAssignments: (teacherId?: string) => Promise<void>;

  selectAssignment: (assignment: TeacherAssignment) => Promise<void>;

  loadStudents: (assignmentId: string) => Promise<void>;

  setSelectedAssessment: (assessment: AssessmentType) => void;

  updateScore: (
    studentId: string,
    assessment: AssessmentType,
    value: number | null,
  ) => void;

  saveScores: () => Promise<void>;

  resetDrafts: () => void;
}