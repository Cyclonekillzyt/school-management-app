import { createNativeStackNavigator } from "@react-navigation/native-stack";

import ClassesScreen from "@/screens/classes/ClassesScreen";
import AssessmentEntryScreen from "@/screens/assessments/AssessmentEntryScreen";

export type ClassesStackParamList = {
  ClassesHome: undefined;
  AssessmentEntry: { assignmentId: string };
};

const Stack = createNativeStackNavigator<ClassesStackParamList>();

export default function ClassesNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="ClassesHome" component={ClassesScreen} />
      <Stack.Screen name="AssessmentEntry" component={AssessmentEntryScreen} />
    </Stack.Navigator>
  );
}
