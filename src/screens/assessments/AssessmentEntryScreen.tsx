import { View, ScrollView, TextInput } from "react-native";
import { useAssessmentStore } from "@/store/assessmentStore";
import LoadingAssessment from "@/components/assessment/LoadingAssessment";
import { SaveButton } from "@/components/assessment/SaveButton";
import { useTheme } from "@/hooks/useTheme";
import { useNavigation } from "@react-navigation/native";
import { useRoute } from "@react-navigation/native";
import WarningModal from "@/components/common/warningModal";
import { AssessmentHeader } from "@/components/assessment/AssessmentHeader";
import EmptyAssessment from "@/components/assessment/EmptyAssessment";
import { AssessmentTabs } from "@/components/assessment/AssessmentTabs";
import StudentsList from "@/components/assessment/StudentsList";
import AssessmentTableHeader from "@/components/assessment/AssessmentTableHeader";

import useAssessmentEntry from "@/hooks/useAssessmentEntry";

export default function AssessmentEntryScreen() {
  const t = useTheme();
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const assignmentFromNav = route.params?.assignment;

  const {
    loading,
    saving,
    selectedAssignment,
    students,
    selectedAssessment,
    hasUnsavedChanges,
    setSelectedAssessment,
    updateScore,
    saveScores,
  } = useAssessmentStore();
  
  const {
    inputStatus,
    setInputStatus,
    inputRefs,
    showWarningModal,
    setShowWarningModal,
    getValue,
    handleBackPress,
    handleExportNavigation,
  } = useAssessmentEntry({
    selectedAssessment,
    assignmentFromNav,
    navigation,
    hasUnsavedChanges,
  });
  
  if (loading && students.length === 0) {
    return <LoadingAssessment />;
  }

  return (
    <View style={{ flex: 1, backgroundColor: t.background }}>
      <AssessmentHeader onBack={handleBackPress} download={handleExportNavigation} t={t} />

      {selectedAssignment && (
        <>
          <AssessmentTabs
            t={t}
            selectedAssessment={selectedAssessment}
            setSelectedAssessment={setSelectedAssessment}
          />
          <AssessmentTableHeader t={t} />
        </>
      )}

      <ScrollView style={{ flex: 1 }}>
        {!selectedAssignment ? (
          <EmptyAssessment t={t} />
        ) : (
          <StudentsList
            students={students}
            selectedAssessment={selectedAssessment}
            inputStatus={inputStatus}
            inputRefs={inputRefs}
            setInputStatus={setInputStatus}
            updateScore={updateScore}
            getValue={getValue}
            t={t}
          />
        )}
      </ScrollView>

      {selectedAssignment && (
        <SaveButton
          onSave={saveScores}
          disabled={saving || !hasUnsavedChanges}
          saving={saving}
          hasUnsavedChanges={hasUnsavedChanges}
          t={t}
        />
      )}

      <WarningModal
        visible={showWarningModal}
        title="Unsaved Changes"
        message="You have unsaved changes. Are you sure you want to go back?"
        confirmText="Discard"
        cancelText="Cancel"
        onConfirm={() => {
          useAssessmentStore.setState({ hasUnsavedChanges: false });
          navigation.goBack();
        }}
        onCancel={() => {
          useAssessmentStore.setState({ hasUnsavedChanges: true });
          setShowWarningModal(false);
        }}
      />
    </View>
  );
}
