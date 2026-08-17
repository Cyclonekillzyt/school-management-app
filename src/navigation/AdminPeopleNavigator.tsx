import { createNativeStackNavigator } from "@react-navigation/native-stack";
import AdminTeachersScreen from "@/screens/admin/AdminTeachersScreen";
import AdminTeacherDetailScreen from "@/screens/admin/AdminTeacherDetailScreen";
import AdminSubjectDetailScreen from "@/screens/admin/AdminSubjectDetailScreen";

export type AdminPeopleStackParamList = {
  AdminTeachersHome: undefined;
  AdminTeacherDetail: { teacherId: string; teacherName: string };
  AdminSubjectDetail: {
    assignmentId: string;
    subjectName: string;
    className: string;
  };
};

const Stack = createNativeStackNavigator<AdminPeopleStackParamList>();

export default function AdminPeopleNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="AdminTeachersHome" component={AdminTeachersScreen} />
      <Stack.Screen
        name="AdminTeacherDetail"
        component={AdminTeacherDetailScreen}
      />
      <Stack.Screen
        name="AdminSubjectDetail"
        component={AdminSubjectDetailScreen}
      />
    </Stack.Navigator>
  );
}
