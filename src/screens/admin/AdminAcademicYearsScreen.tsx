import { useEffect } from "react";
import { View, Text, ScrollView } from "react-native";
import { useTheme } from "@/hooks/useTheme";
import BackButton from "@/components/auth/BackButton";
import { useAdminAcademicStore } from "@/store/adminAcademicStore";
import LoadingAssessment from "@/components/assessment/LoadingAssessment";
import AcademicYearRow from "@/components/admin/AcademicYearRow";
import TermRow from "@/components/admin/TermRow";
import AddInlineRow from "@/components/admin/AddInlineRow";

export default function AdminAcademicYearsScreen() {
  const theme = useTheme();

  const {
    academicYears,
    terms,
    loading,
    fetchAll,
    createAcademicYear,
    setActiveAcademicYear,
    toggleArchiveAcademicYear,
    createTerm,
    setActiveTerm,
    toggleTermOpen,
  } = useAdminAcademicStore();

  useEffect(() => {
    fetchAll();
  }, []);

  if (loading && academicYears.length === 0 && terms.length === 0) {
    return <LoadingAssessment />;
  }

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: theme.background,
        paddingTop: 60,
        paddingHorizontal: 24,
      }}
    >
      <BackButton label="Back" />

      <Text
        style={{
          fontSize: 28,
          fontWeight: "800",
          color: theme.foreground,
          marginTop: 18,
        }}
      >
        Academic Years & Terms
      </Text>
      <Text
        style={{
          fontSize: 15,
          color: theme.mutedForeground,
          marginTop: 4,
          marginBottom: 18,
        }}
      >
        Manage the school calendar teachers enter scores against.
      </Text>

      <ScrollView
        showsVerticalScrollIndicator={false}
        style={{ marginHorizontal: -24 }}
      >
        <Text
          style={{
            marginHorizontal: 24,
            fontSize: 14,
            fontWeight: "800",
            color: theme.foreground,
          }}
        >
          Academic Years
        </Text>

        <View
          style={{
            marginTop: 8,
            marginHorizontal: 24,
            borderWidth: 1,
            borderColor: theme.cardBorder,
            borderRadius: 14,
            overflow: "hidden",
            backgroundColor: theme.card,
          }}
        >
          {academicYears.length === 0 ? (
            <Text style={{ padding: 16, color: theme.mutedForeground }}>
              No academic years yet.
            </Text>
          ) : (
            academicYears.map((y) => (
              <AcademicYearRow
                key={y.id}
                item={y}
                onSetActive={() => setActiveAcademicYear(y.id)}
                onToggleArchive={() =>
                  toggleArchiveAcademicYear(y.id, !y.archived)
                }
              />
            ))
          )}

          <AddInlineRow placeholder="e.g. 2027" onSubmit={createAcademicYear} />
        </View>

        <Text
          style={{
            marginTop: 28,
            marginHorizontal: 24,
            fontSize: 14,
            fontWeight: "800",
            color: theme.foreground,
          }}
        >
          Terms
        </Text>

        <View
          style={{
            marginTop: 8,
            marginHorizontal: 24,
            marginBottom: 40,
            borderWidth: 1,
            borderColor: theme.cardBorder,
            borderRadius: 14,
            overflow: "hidden",
            backgroundColor: theme.card,
          }}
        >
          {terms.length === 0 ? (
            <Text style={{ padding: 16, color: theme.mutedForeground }}>
              No terms yet.
            </Text>
          ) : (
            terms.map((t) => (
              <TermRow
                key={t.id}
                item={t}
                onSetActive={() => setActiveTerm(t.id)}
                onToggleOpen={() => toggleTermOpen(t.id, !t.is_open)}
              />
            ))
          )}

          <AddInlineRow placeholder="e.g. Term 3" onSubmit={createTerm} />
        </View>
      </ScrollView>
    </View>
  );
}
