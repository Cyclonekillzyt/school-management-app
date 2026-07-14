import XLSX from "xlsx-js-style";
import { File, Paths } from "expo-file-system";
import * as Sharing from "expo-sharing";

type ExportData = {
  assignment: any;
  students: any[];
};

export async function exportAssessmentToExcel({
  assignment,
  students,
}: ExportData) {
  try {
    const rows = [
      [
        "Student Name",
        "Classwork",
        "Groupwork",
        "Projectwork",
        "Test",
        "Exam Score",
      ],
      ...students.map((student) => [
        student.student_name,
        student.classwork ?? "",
        student.groupwork ?? "",
        student.projectwork ?? "",
        student.test ?? "",
        student.exam_score ?? "",
      ]),
    ];

    const worksheet = XLSX.utils.aoa_to_sheet(rows);

    const workbook = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(workbook, worksheet, "Results");

    const base64 = XLSX.write(workbook, {
      type: "base64",
      bookType: "xlsx",
    });

    const file = new File(
      Paths.document,
      `${assignment.subject_name}_${assignment.class_name}.xlsx`,
    );

    file.write(base64, {
      encoding: "base64",
    });

    await Sharing.shareAsync(file.uri);
  } catch (error) {
    console.error("EXPORT ERROR:", error);
  }
}
