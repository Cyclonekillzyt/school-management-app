import { View, ScrollView } from "react-native";
import { useTheme } from "@/hooks/useTheme";
import ExportHeader from "@/components/exports/ExportHeader";
import ExportInfoCard from "@/components/exports/ExportInfoCard";
import ExportTable from "@/components/exports/ExportTable";

import { useAssessmentStore } from "@/store/assessmentStore";
import { useNavigation, useRoute } from "@react-navigation/native";
import DownloadButton from "@/components/exports/DownloadButton";
import { exportAssessmentToExcel } from "@/services/exports/exportService";


export default function AssessmentExportScreen() {
  const theme = useTheme();

  const navigation = useNavigation<any>();

  const route = useRoute<any>();

  const assignmentFromNav = route.params?.assignment;

  const {
    students,
  } = useAssessmentStore();

  const assignment = assignmentFromNav;

  if (!assignment) return null;

  const handleDownload = async () => {
    await exportAssessmentToExcel({
      assignment,
      students,
    });
  };

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: theme.background,
      }}
    >
      <ExportHeader
        assignment={assignment}
        onBack={() => navigation.goBack()}
        t={theme}
      />

      <ScrollView>
        <ExportInfoCard
          assignment={assignment}
          totalStudents={students.length}
          t={theme}
        />

        <ExportTable students={students} t={theme} />
        <DownloadButton
          t={theme}
          onDownload={handleDownload}
        />
      </ScrollView>
    </View>
  );
}
