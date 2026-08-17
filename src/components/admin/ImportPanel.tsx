import { useState } from "react";
import { View, Text, Pressable, ActivityIndicator } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@/hooks/useTheme";
import { pickAndParseExcel } from "@/utils/excelImport";
import { showToast } from "@/utils/toast";
import XLSX from "xlsx-js-style";
import { File, Paths } from "expo-file-system";
import * as Sharing from "expo-sharing";

type ImportSummary = {
  successCount: number;
  failedCount: number;
  errors: { row: number; reason: string }[];
};

type Props = {
  title: string;
  description: string;
  requiredColumns: string[];
  onImport: (rows: Record<string, any>[]) => Promise<ImportSummary>;
};

export default function ImportPanel({
  title,
  description,
  requiredColumns,
  onImport,
}: Props) {
  const theme = useTheme();
  const [rows, setRows] = useState<Record<string, any>[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState<ImportSummary | null>(null);

  const handlePick = async () => {
    setSummary(null);
    try {
      const parsed = await pickAndParseExcel();
      if (!parsed) return;
      setRows(parsed);
    } catch (err: any) {
      console.log(err);
      showToast.error("File error", err.message);
    }
  };

  const handleDownloadTemplate = async () => {
    try {
      const cleanHeaders = requiredColumns.map((c) =>
        c.replace(/\s*\(optional\)\s*/i, ""),
      );
      const worksheet = XLSX.utils.aoa_to_sheet([cleanHeaders]);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Template");
      const base64 = XLSX.write(workbook, { type: "base64", bookType: "xlsx" });

      const file = new File(
        Paths.document,
        `${title.replace(/\s+/g, "_")}_Template.xlsx`,
      );
      file.write(base64, { encoding: "base64" });
      await Sharing.shareAsync(file.uri);
    } catch (err: any) {
      showToast.error("Template error", err.message);
    }
  };

  const handleImport = async () => {
    if (!rows || rows.length === 0) return;
    setLoading(true);
    try {
      const result = await onImport(rows);
      setSummary(result);
      setRows(null);
      showToast.success(
        "Import complete",
        `${result.successCount} imported, ${result.failedCount} failed`,
      );
    } catch (err: any) {
      console.log(err);
      showToast.error("Import failed", err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View
      style={{
        marginHorizontal: 16,
        marginTop: 16,
        padding: 16,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: theme.cardBorder,
        backgroundColor: theme.card,
        gap: 12,
      }}
    >
      <Text
        style={{ fontSize: 15, fontWeight: "800", color: theme.foreground }}
      >
        {title}
      </Text>
      <Text style={{ fontSize: 12, color: theme.mutedForeground }}>
        {description}
      </Text>

      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Text style={{ fontSize: 11, color: theme.mutedForeground, flex: 1 }}>
          Required columns: {requiredColumns.join(", ")}
        </Text>
        <Pressable
          onPress={handleDownloadTemplate}
          style={{ flexDirection: "row", alignItems: "center", gap: 4 }}
        >
          <Ionicons name="download-outline" size={14} color={theme.primary} />
          <Text
            style={{ color: theme.primary, fontSize: 11, fontWeight: "700" }}
          >
            Template
          </Text>
        </Pressable>
      </View>

      <Pressable
        onPress={handlePick}
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "center",
          gap: 8,
          paddingVertical: 12,
          borderRadius: 12,
          backgroundColor: theme.muted,
        }}
      >
        <Ionicons
          name="document-attach-outline"
          size={18}
          color={theme.foreground}
        />
        <Text
          style={{ color: theme.foreground, fontWeight: "700", fontSize: 13 }}
        >
          {rows ? `${rows.length} rows selected` : "Choose Excel / CSV file"}
        </Text>
      </Pressable>

      {rows && rows.length > 0 && (
        <View style={{ gap: 8 }}>
          <Text
            style={{
              fontSize: 11,
              fontWeight: "700",
              color: theme.mutedForeground,
            }}
          >
            Preview (first 3 rows)
          </Text>

          <View
            style={{
              borderWidth: 1,
              borderColor: theme.border,
              borderRadius: 10,
              overflow: "hidden",
            }}
          >
            {rows.slice(0, 3).map((row, i) => (
              <View
                key={i}
                style={{
                  paddingVertical: 8,
                  paddingHorizontal: 10,
                  borderTopWidth: i === 0 ? 0 : 1,
                  borderColor: theme.border,
                }}
              >
                <Text style={{ fontSize: 11, color: theme.foreground }}>
                  {Object.values(row).filter(Boolean).join(" · ") ||
                    "(empty row)"}
                </Text>
              </View>
            ))}
          </View>

          <Pressable
            onPress={handleImport}
            disabled={loading}
            style={{
              paddingVertical: 12,
              borderRadius: 12,
              backgroundColor: theme.primary,
              alignItems: "center",
              opacity: loading ? 0.7 : 1,
            }}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={{ color: "#fff", fontWeight: "700", fontSize: 13 }}>
                Import {rows.length} rows
              </Text>
            )}
          </Pressable>
        </View>
      )}

      {summary && (
        <View style={{ marginTop: 4, gap: 6 }}>
          <Text
            style={{ fontSize: 12, fontWeight: "700", color: theme.foreground }}
          >
            {summary.successCount} succeeded · {summary.failedCount} failed
          </Text>

          {summary.errors.slice(0, 5).map((e) => (
            <Text
              key={e.row}
              style={{ fontSize: 11, color: theme.destructive }}
            >
              Row {e.row}: {e.reason}
            </Text>
          ))}

          {summary.errors.length > 5 && (
            <Text style={{ fontSize: 11, color: theme.mutedForeground }}>
              +{summary.errors.length - 5} more errors
            </Text>
          )}
        </View>
      )}
    </View>
  );
}
