export type PickerOption = { id: string; name: string };

export type CreateAssignmentInput = {
  teacherId: string;
  subjectId: string;
  classId: string;
  academicYearId: string | null;
};
