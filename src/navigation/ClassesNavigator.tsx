import { createNativeStackNavigator } from "@react-navigation/native-stack";

import ClassesScreen from "@/screens/classes/ClassesScreen";
import AssessmentEntryScreen from "@/screens/assessments/AssessmentEntryScreen";
import AssessmentExportScreen from "@/screens/exports/AssessmentExportScreen";

export type ClassesStackParamList = {
  ClassesHome: undefined;
  AssessmentEntry: { assignmentId: string };
  AssessmentExport: { assignment: string };
};

const Stack = createNativeStackNavigator<ClassesStackParamList>();

export default function ClassesNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="ClassesHome" component={ClassesScreen} />
      <Stack.Screen name="AssessmentEntry" component={AssessmentEntryScreen} />
      <Stack.Screen name="AssessmentExport" component={AssessmentExportScreen} />
    </Stack.Navigator>
  );
}
