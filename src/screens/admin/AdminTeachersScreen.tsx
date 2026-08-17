import { useEffect, useState } from "react";
import { View, FlatList, Text, TextInput } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@/hooks/useTheme";
import Header from "@/components/common/Header";
import TeacherListCard from "@/components/admin/TeacherListCard";
import { useAdminPeopleStore } from "@/store/adminPeopleStore";
import LoadingAssessment from "@/components/assessment/LoadingAssessment";
import { useNavigation } from "@react-navigation/native";

export default function AdminTeachersScreen() {
  const theme = useTheme();
  const navigation = useNavigation<any>();

  const teachers = useAdminPeopleStore((s) => s.teachers);
  const loading = useAdminPeopleStore((s) => s.loadingTeachers);
  const fetchTeachers = useAdminPeopleStore((s) => s.fetchTeachers);

  const [query, setQuery] = useState("");

  useEffect(() => {
    fetchTeachers();
  }, []);

  const filtered = teachers.filter((t) =>
    t.teacher_name.toLowerCase().includes(query.toLowerCase()),
  );

  if (loading && teachers.length === 0) {
    return <LoadingAssessment />;
  }

  return (
    <View style={{ flex: 1, backgroundColor: theme.background }}>
      <Header />

      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          marginHorizontal: 16,
          marginBottom: 12,
          paddingHorizontal: 14,
          paddingVertical: 10,
          borderRadius: 12,
          backgroundColor: theme.muted,
          gap: 8,
        }}
      >
        <Ionicons
          name="search-outline"
          size={16}
          color={theme.mutedForeground}
        />
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="Search teachers"
          placeholderTextColor={theme.mutedForeground}
          style={{ flex: 1, color: theme.foreground, fontSize: 13 }}
        />
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(item) => item.teacher_id}
        contentContainerStyle={{ paddingBottom: 24 }}
        renderItem={({ item }) => (
          <TeacherListCard
            item={item}
            onPress={() =>
              navigation.navigate("AdminTeacherDetail", {
                teacherId: item.teacher_id,
                teacherName: item.teacher_name,
              })
            }
          />
        )}
        ListEmptyComponent={
          <Text
            style={{
              textAlign: "center",
              marginTop: 40,
              color: theme.mutedForeground,
            }}
          >
            No teachers found.
          </Text>
        }
      />
    </View>
  );
}
