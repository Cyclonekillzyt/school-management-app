import { useEffect, useState } from "react";
import { View, Text, FlatList, Pressable } from "react-native";
import { useTheme } from "@/hooks/useTheme";
import BackButton from "@/components/auth/BackButton";
import InlineLoader from "@/components/admin/InlineLoader";
import { supabase } from "@/lib/supabase";
import { showToast } from "@/utils/toast";

type ClassSummary = {
  class_id: string;
  class_name: string;
  total_students: number;
  average_score: number | null;
  completion_percentage: number | null;
};
type ClassStudent = {
  student_id: string;
  student_name: string;
  average_score: number | null;
  position: number;
};

export default function MyClassScreen() {
  const theme = useTheme();
  const [classes, setClasses] = useState<ClassSummary[]>([]);
  const [selected, setSelected] = useState<ClassSummary | null>(null);
  const [students, setStudents] = useState<ClassStudent[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingStudents, setLoadingStudents] = useState(false);

  useEffect(() => {
    supabase.rpc("my_class_teacher_summary").then(({ data, error }) => {
      if (error) showToast.error("Load failed", error.message);
      setClasses((data as ClassSummary[]) ?? []);
      setLoading(false);
    });
  }, []);

  const openClass = async (c: ClassSummary) => {
    setSelected(c);
    setLoadingStudents(true);
    const { data, error } = await supabase.rpc("my_class_students", {
      p_class_id: c.class_id,
    });
    if (error) showToast.error("Load failed", error.message);
    setStudents((data as ClassStudent[]) ?? []);
    setLoadingStudents(false);
  };

  if (loading) return <InlineLoader />;

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: theme.background,
        paddingTop: 60,
        paddingHorizontal: 24,
      }}
    >
      {selected ? (
        <BackButton label="Back" to={undefined as any} />
      ) : (
        <BackButton label="Back" />
      )}
      {selected && (
        <Pressable onPress={() => setSelected(null)} style={{ marginTop: -10 }}>
          <Text style={{ color: theme.accent, fontWeight: "700" }}>
            ‹ All Classes
          </Text>
        </Pressable>
      )}
      <Text
        style={{
          fontSize: 28,
          fontWeight: "800",
          color: theme.foreground,
          marginTop: 18,
        }}
      >
        {selected ? selected.class_name : "My Class"}
      </Text>
      {!selected && (
        <Text
          style={{
            fontSize: 15,
            color: theme.mutedForeground,
            marginTop: 4,
            marginBottom: 18,
          }}
        >
          Classes where you're the class teacher.
        </Text>
      )}

      {!selected ? (
        classes.length === 0 ? (
          <Text style={{ color: theme.mutedForeground, marginTop: 20 }}>
            You're not set as the class teacher for any class yet.
          </Text>
        ) : (
          <FlatList
            data={classes}
            keyExtractor={(c) => c.class_id}
            renderItem={({ item }) => (
              <Pressable
                onPress={() => openClass(item)}
                style={{
                  padding: 16,
                  borderRadius: 14,
                  borderWidth: 1,
                  borderColor: theme.cardBorder,
                  backgroundColor: theme.card,
                  marginBottom: 10,
                }}
              >
                <Text
                  style={{
                    fontWeight: "800",
                    fontSize: 15,
                    color: theme.foreground,
                  }}
                >
                  {item.class_name}
                </Text>
                <View style={{ flexDirection: "row", gap: 16, marginTop: 8 }}>
                  <Text style={{ fontSize: 12, color: theme.mutedForeground }}>
                    {item.total_students} students
                  </Text>
                  <Text style={{ fontSize: 12, color: theme.primary }}>
                    {item.average_score != null
                      ? `${item.average_score}% avg`
                      : "— avg"}
                  </Text>
                  <Text style={{ fontSize: 12, color: theme.mutedForeground }}>
                    {item.completion_percentage != null
                      ? `${item.completion_percentage}% complete`
                      : "—"}
                  </Text>
                </View>
              </Pressable>
            )}
          />
        )
      ) : loadingStudents ? (
        <InlineLoader />
      ) : (
        <FlatList
          data={students}
          keyExtractor={(s) => s.student_id}
          renderItem={({ item }) => (
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                paddingVertical: 12,
                borderBottomWidth: 1,
                borderColor: theme.border,
              }}
            >
              <Text
                style={{
                  width: 30,
                  fontWeight: "700",
                  color: theme.foreground,
                }}
              >
                {item.position}
              </Text>
              <Text
                style={{ flex: 1, color: theme.foreground, fontWeight: "600" }}
              >
                {item.student_name}
              </Text>
              <Text style={{ fontWeight: "800", color: theme.primary }}>
                {item.average_score != null ? `${item.average_score}%` : "—"}
              </Text>
            </View>
          )}
        />
      )}
    </View>
  );
}
