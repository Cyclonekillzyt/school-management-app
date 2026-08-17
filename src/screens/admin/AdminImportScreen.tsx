import { useState } from "react";
import { View, Text, ScrollView, Pressable } from "react-native";
import { useTheme } from "@/hooks/useTheme";
import Header from "@/components/common/Header";
import ImportPanel from "@/components/admin/ImportPanel";
import { useAdminImportStore } from "@/store/adminImportStore";

const TABS = [
  { key: "classes", label: "Classes" },
  { key: "students", label: "Students" },
  { key: "teachers", label: "Teachers" },
  { key: "assignments", label: "Assignments" },
] as const;

type TabKey = (typeof TABS)[number]["key"];

export default function AdminImportScreen() {
  const theme = useTheme();
  const [tab, setTab] = useState<TabKey>("classes");

  const { importClasses, importStudents, importTeachers, importAssignments } =
    useAdminImportStore();

  return (
    <View style={{ flex: 1, backgroundColor: theme.background }}>
      <Header />

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: 16,
          paddingVertical: 14,
          gap: 8,
        }}
        style={{ maxHeight: 54 }}
      >
        {TABS.map((t) => (
          <Pressable
            key={t.key}
            onPress={() => setTab(t.key)}
            style={{
              paddingVertical: 5,
              paddingHorizontal: 16,
              borderRadius: 16,
              backgroundColor: tab === t.key ? theme.primary : theme.muted,
            }}
          >
            <Text
              style={{
                color: tab === t.key ? "#fff" : theme.mutedForeground,
                fontWeight: "700",
                fontSize: 12,
              }}
            >
              {t.label}
            </Text>
          </Pressable>
        ))}
      </ScrollView>

      <ScrollView>
        {tab === "classes" && (
          <ImportPanel
            title="Import Classes"
            description="Bulk-create classes. Optionally set a class teacher by email — leave blank to assign one later."
            requiredColumns={["Name", "Class Teacher Email (optional)"]}
            onImport={async (rows) => {
              const result = await importClasses(rows);
              return {
                successCount: result.inserted,
                failedCount: result.failed,
                errors: result.errors,
              };
            }}
          />
        )}

        {tab === "students" && (
          <ImportPanel
            title="Import Students"
            description="Bulk-add students into existing classes."
            requiredColumns={["Name", "Class"]}
            onImport={async (rows) => {
              const result = await importStudents(rows);
              return {
                successCount: result.inserted,
                failedCount: result.failed,
                errors: result.errors,
              };
            }}
          />
        )}

        {tab === "teachers" && (
          <ImportPanel
            title="Import Teachers"
            description="Invites each teacher by email — they set their own password from the invite. Requires the admin-create-teacher Edge Function to be deployed."
            requiredColumns={["Name", "Email"]}
            onImport={async (rows) => {
              const result = await importTeachers(rows);
              return {
                successCount: result.created,
                failedCount: result.failed,
                errors: result.results
                  .filter((r) => r.status === "failed")
                  .map((r) => ({
                    row: r.row,
                    reason: r.reason ?? "Unknown error",
                  })),
              };
            }}
          />
        )}

        {tab === "assignments" && (
          <ImportPanel
            title="Import Teacher Assignments"
            description="Assign a teacher to a subject + class for an academic year. Leave Academic Year blank to use the current one."
            requiredColumns={[
              "Teacher Email",
              "Subject",
              "Class",
              "Academic Year (optional)",
            ]}
            onImport={async (rows) => {
              const result = await importAssignments(rows);
              return {
                successCount: result.inserted,
                failedCount: result.failed,
                errors: result.errors,
              };
            }}
          />
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}
