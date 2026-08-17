import { create } from "zustand";
import { supabase } from "@/lib/supabase";
import {
  StudentImportResult,
  AssignmentImportResult,
  ClassImportResult,
  TeacherImportResult,
} from "@/types/adminImport.types";

type AdminImportState = {
  importStudents: (rows: Record<string, any>[]) => Promise<StudentImportResult>;
  importAssignments: (
    rows: Record<string, any>[],
  ) => Promise<AssignmentImportResult>;
  importClasses: (rows: Record<string, any>[]) => Promise<ClassImportResult>;
  importTeachers: (rows: Record<string, any>[]) => Promise<TeacherImportResult>;
};

export const useAdminImportStore = create<AdminImportState>(() => ({
  importStudents: async (rows) => {
    const payload = rows.map((r) => ({
      full_name: r["Name"] ?? r["full_name"] ?? "",
      class_name: r["Class"] ?? r["class_name"] ?? "",
    }));

    const { data, error } = await supabase.rpc("admin_bulk_import_students", {
      payload,
    });
    if (error) throw error;
    return data as StudentImportResult;
  },

  importAssignments: async (rows) => {
    const payload = rows.map((r) => ({
      teacher_email: r["Teacher Email"] ?? r["teacher_email"] ?? "",
      subject_name: r["Subject"] ?? r["subject_name"] ?? "",
      class_name: r["Class"] ?? r["class_name"] ?? "",
      academic_year_name: r["Academic Year"] ?? r["academic_year_name"] ?? "",
    }));

    const { data, error } = await supabase.rpc(
      "admin_bulk_import_assignments",
      { payload },
    );
    if (error) throw error;
    return data as AssignmentImportResult;
  },

  importClasses: async (rows) => {
    const payload = rows.map((r) => ({
      name: r["Name"] ?? r["name"] ?? "",
      class_teacher_email:
        r["Class Teacher Email"] ?? r["class_teacher_email"] ?? "",
    }));

    const { data, error } = await supabase.rpc("admin_bulk_import_classes", {
      payload,
    });
    if (error) throw error;
    return data as ClassImportResult;
  },

  importTeachers: async (rows) => {
    const payload = rows.map((r) => ({
      full_name: r["Name"] ?? r["full_name"] ?? "",
      email: r["Email"] ?? r["email"] ?? "",
      gender: r["Gender"] ?? r["gender"] ?? "",
    }));

    const { data, error } = await supabase.functions.invoke(
      "admin-create-teacher",
      {
        body: { rows: payload },
      },
    );

    if (error) throw error;
    return data as TeacherImportResult;
  },
}));
