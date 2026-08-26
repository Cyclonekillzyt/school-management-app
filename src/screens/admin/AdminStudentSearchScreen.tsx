import { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  FlatList,
  Pressable,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { useTheme } from "@/hooks/useTheme";
import BackButton from "@/components/auth/BackButton";
import { supabase } from "@/lib/supabase";

type Result = {
  student_id: string;
  student_name: string;
  class_name: string;
  active: boolean;
};

export default function AdminStudentSearchScreen() {
  const theme = useTheme();
  const navigation = useNavigation<any>();

  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Result[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const trimmedQuery = query.trim();

    if (trimmedQuery.length === 0) {
      setResults([]);
      setLoading(false);
      return;
    }

    const timeout = setTimeout(async () => {
      setLoading(true);

      try {
        const { data, error } = await supabase.rpc("admin_search_students", {
          p_query: trimmedQuery,
        });

        if (error) {
          console.error("Student search error:", error);
          setResults([]);
          return;
        }

        setResults((data as Result[]) ?? []);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => {
      clearTimeout(timeout);
    };
  }, [query]);

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: theme.background,
        paddingTop: 60,
        paddingHorizontal: 24,
      }}
    >
      <BackButton label="Back" />

      <Text
        style={{
          fontSize: 28,
          fontWeight: "800",
          color: theme.foreground,
          marginTop: 18,
          marginBottom: 18,
        }}
      >
        Find a Student
      </Text>

      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
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
          placeholder="Search by name"
          placeholderTextColor={theme.mutedForeground}
          style={{
            flex: 1,
            color: theme.foreground,
            fontSize: 13,
          }}
          autoFocus
        />

        {loading && <ActivityIndicator size="small" color={theme.primary} />}
      </View>

      <FlatList
        data={results}
        keyExtractor={(r) => r.student_id}
        style={{ marginTop: 12 }}
        renderItem={({ item }) => (
          <Pressable
            onPress={() =>
              navigation.navigate("Classes", {
                screen: "AdminStudentProfile",
                params: {
                  studentId: item.student_id,
                  studentName: item.student_name,
                },
              })
            }
            style={{
              paddingVertical: 14,
              borderBottomWidth: 1,
              borderColor: theme.border,
              flexDirection: "row",
              justifyContent: "space-between",
            }}
          >
            <Text
              style={{
                color: theme.foreground,
                fontWeight: "600",
              }}
            >
              {item.student_name}
            </Text>

            <Text
              style={{
                color: theme.mutedForeground,
                fontSize: 12,
              }}
            >
              {item.class_name}
              {!item.active ? " · Inactive" : ""}
            </Text>
          </Pressable>
        )}
      />
    </View>
  );
}
