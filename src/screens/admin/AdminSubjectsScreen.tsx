import { useEffect } from "react";
import { View, Text, FlatList, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { useTheme } from "@/hooks/useTheme";
import BackButton from "@/components/auth/BackButton";
import InlineLoader from "@/components/admin/InlineLoader";
import SubjectPerformanceRow from "@/components/admin/SubjectPerformanceRow";
import { useAdminSubjectsStore } from "@/store/adminSubjectsStore";

export default function AdminSubjectsScreen() {
  const theme = useTheme();
  const navigation = useNavigation<any>();
  const subjects = useAdminSubjectsStore((s) => s.subjects);
  const loading = useAdminSubjectsStore((s) => s.loading);
  const fetchSubjects = useAdminSubjectsStore((s) => s.fetchSubjects);

  useEffect(() => {
    fetchSubjects();
  }, []);

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: theme.background,
        paddingTop: 60,
        paddingHorizontal: 24,
      }}
    >
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <BackButton label="Back" />
        <Pressable
          onPress={() => navigation.navigate("AdminSubjectForm", {})}
          style={{ flexDirection: "row", alignItems: "center", gap: 4 }}
        >
          <Ionicons name="add-circle-outline" size={18} color={theme.primary} />
          <Text
            style={{ color: theme.primary, fontWeight: "700", fontSize: 13 }}
          >
            Add Subject
          </Text>
        </Pressable>
      </View>

      <Text
        style={{
          fontSize: 28,
          fontWeight: "800",
          color: theme.foreground,
          marginTop: 18,
        }}
      >
        Subjects
      </Text>
      <Text
        style={{
          fontSize: 15,
          color: theme.mutedForeground,
          marginTop: 4,
          marginBottom: 18,
        }}
      >
        Manage the subjects taught across the school.
      </Text>

      {loading && subjects.length === 0 ? (
        <InlineLoader />
      ) : (
        <View
          style={{
            marginHorizontal: -24,
          }}
        >
          <View
            style={{
              marginHorizontal: 24,
              borderWidth: 1,
              borderColor: theme.cardBorder,
              borderRadius: 14,
              overflow: "hidden",
              backgroundColor: theme.card,
            }}
          >
            <FlatList
              data={subjects}
              keyExtractor={(item) => item.subject_id}
              renderItem={({ item }) => (
                <Pressable
                  onPress={() =>
                    navigation.navigate("AdminSubjectForm", {
                      subjectId: item.subject_id,
                      subjectName: item.subject_name,
                    })
                  }
                >
                  <SubjectPerformanceRow item={item} />
                </Pressable>
              )}
              ListEmptyComponent={
                <Text style={{ padding: 16, color: theme.mutedForeground }}>
                  No subjects yet.
                </Text>
              }
            />
          </View>
        </View>
      )}
    </View>
  );
}
