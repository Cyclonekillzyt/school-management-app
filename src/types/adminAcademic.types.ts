export type AdminAcademicYear = {
  id: string;
  name: string;
  current: boolean;
  archived: boolean;
  created_at: string;
};

export type AdminTerm = {
  id: string;
  name: string;
  is_current: boolean;
  is_open: boolean;
  created_at: string;
};
