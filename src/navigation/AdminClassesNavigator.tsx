import { createNativeStackNavigator } from "@react-navigation/native-stack";
import AdminClassesScreen from "@/screens/admin/AdminClassesScreen";
import AdminClassDetailScreen from "@/screens/admin/AdminClassDetailScreen";
import AdminSubjectDetailScreen from "@/screens/admin/AdminSubjectDetailScreen";
import AdminStudentProfileScreen from "@/screens/admin/AdminStudentProfileScreen";
import AdminStudentFormScreen from "@/screens/admin/AdminStudentFormScreen";
import AdminClassFormScreen from "@/screens/admin/AdminClassFormScreen";
import AdminAssignmentFormScreen from "@/screens/admin/AdminAssignmentFormScreen";

export type AdminClassesStackParamList = {
  AdminClassesHome: undefined;
  AdminClassDetail: { classId: string; className: string };
  AdminSubjectDetail: {
    assignmentId: string;
    subjectName: string;
    className: string;
  };
  AdminStudentProfile: { studentId: string; studentName: string };
  AdminStudentForm: {
    studentId?: string;
    classId?: string;
    className?: string;
  };
  AdminClassForm: { classId?: string };
  AdminAssignmentForm: { classId?: string; className?: string };
};

const Stack = createNativeStackNavigator<AdminClassesStackParamList>();

export default function AdminClassesNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="AdminClassesHome" component={AdminClassesScreen} />
      <Stack.Screen
        name="AdminClassDetail"
        component={AdminClassDetailScreen}
      />
      <Stack.Screen
        name="AdminSubjectDetail"
        component={AdminSubjectDetailScreen}
      />
      <Stack.Screen
        name="AdminStudentProfile"
        component={AdminStudentProfileScreen}
      />
      <Stack.Screen
        name="AdminStudentForm"
        component={AdminStudentFormScreen}
      />
      <Stack.Screen name="AdminClassForm" component={AdminClassFormScreen} />
      <Stack.Screen
        name="AdminAssignmentForm"
        component={AdminAssignmentFormScreen}
      />
    </Stack.Navigator>
  );
}
