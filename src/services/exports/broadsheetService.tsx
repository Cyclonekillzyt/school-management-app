import XLSX from "xlsx-js-style";
import { File, Paths } from "expo-file-system";
import * as Sharing from "expo-sharing";

type BroadsheetRow = {
  student_id: string;
  student_name: string;
  subject_name: string;
  grand_total: number | null;
  grade: string | null;
};

export async function exportClassBroadsheet({
  className,
  rows,
}: {
  className: string;
  rows: BroadsheetRow[];
}) {
  try {
    const subjects = Array.from(
      new Set(rows.map((r) => r.subject_name)),
    ).sort();
    const studentIds = Array.from(new Set(rows.map((r) => r.student_id)));

    const studentNames: Record<string, string> = {};
    rows.forEach((r) => {
      studentNames[r.student_id] = r.student_name;
    });

    const scoreMap: Record<string, Record<string, number | null>> = {};
    rows.forEach((r) => {
      scoreMap[r.student_id] = scoreMap[r.student_id] || {};
      scoreMap[r.student_id][r.subject_name] = r.grand_total;
    });

    const header = ["Student Name", ...subjects, "Average"];

    const dataRows = studentIds.map((id) => {
      const scores = subjects.map((subj) => scoreMap[id]?.[subj] ?? "");
      const numeric = subjects
        .map((subj) => scoreMap[id]?.[subj])
        .filter((v): v is number => v != null);
      const avg =
        numeric.length > 0
          ? Math.round(
              (numeric.reduce((a, b) => a + b, 0) / numeric.length) * 100,
            ) / 100
          : "";
      return [studentNames[id], ...scores, avg];
    });

    const worksheet = XLSX.utils.aoa_to_sheet([header, ...dataRows]);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Broadsheet");

    const base64 = XLSX.write(workbook, { type: "base64", bookType: "xlsx" });

    const file = new File(Paths.document, `${className}_Broadsheet.xlsx`);
    file.write(base64, { encoding: "base64" });

    await Sharing.shareAsync(file.uri);
  } catch (error) {
    console.error("BROADSHEET EXPORT ERROR:", error);
    throw error;
  }
}
