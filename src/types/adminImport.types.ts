export type ImportRowError = {
  row: number;
  reason: string;
};

export type StudentImportResult = {
  inserted: number;
  failed: number;
  errors: ImportRowError[];
};

export type AssignmentImportResult = {
  inserted: number;
  failed: number;
  errors: ImportRowError[];
};

export type ClassImportResult = {
  inserted: number;
  failed: number;
  errors: ImportRowError[];
};

export type TeacherImportRowResult = {
  row: number;
  status: "created" | "failed";
  email?: string;
  reason?: string;
};

export type TeacherImportResult = {
  created: number;
  failed: number;
  results: TeacherImportRowResult[];
};
