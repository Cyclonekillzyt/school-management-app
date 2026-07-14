import { useEffect, useRef, useState } from "react";
import { TextInput } from "react-native";
import { useAssessmentStore } from "@/store/assessmentStore";

type Props = {
  selectedAssessment: any;
  assignmentFromNav: any;
  navigation: any;
  hasUnsavedChanges: boolean;
};

export default function useAssessmentEntry({
  selectedAssessment,
  assignmentFromNav,
  navigation,
  hasUnsavedChanges,
}: Props) {
  const [inputStatus, setInputStatus] = useState<
    Record<string, "valid" | "invalid" | "empty">
  >({});

  const inputRefs = useRef<Record<string, TextInput | null>>({});

  const [showWarningModal, setShowWarningModal] = useState(false);

  useEffect(() => {
    setInputStatus({});
  }, [selectedAssessment]);

  useEffect(() => {
    if (assignmentFromNav) {
      useAssessmentStore.setState({
        selectedAssignment: assignmentFromNav,
      });

      useAssessmentStore
        .getState()
        .loadStudents(assignmentFromNav.assignment_id);
    }
  }, [assignmentFromNav]);

  const getValue = (s: any) => {
    return s[selectedAssessment] ?? "";
  };

  const handleBackPress = () => {
    if (hasUnsavedChanges) {
      setShowWarningModal(true);
    } else {
      navigation.goBack();
    }
  };

  const handleExportNavigation = () =>{
     if (hasUnsavedChanges) {
       setShowWarningModal(true);
     } else {
       navigation.navigate("AssessmentExport", {
         assignment: useAssessmentStore.getState().selectedAssignment,
       });
     }
  }

  return {
    inputStatus,
    setInputStatus,
    inputRefs,

    showWarningModal,
    setShowWarningModal,

    getValue,
    handleBackPress,
    handleExportNavigation,
  };
}
