import { useEffect } from "react";
import { View, FlatList, Text, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@/hooks/useTheme";
import Header from "@/components/common/Header";
import ClassCard from "@/components/admin/ClassCard";
import { useAdminSchoolStore } from "@/store/adminSchoolStore";
import InlineLoader from "@/components/admin/InlineLoader";
import { useNavigation } from "@react-navigation/native";

export default function AdminClassesScreen() {
  const theme = useTheme();
  const navigation = useNavigation<any>();
  const fetchClasses = useAdminSchoolStore((s) => s.fetchClasses);

  const classes = useAdminSchoolStore((s) => s.classes);
  const loading = useAdminSchoolStore((s) => s.loadingClasses);

  useEffect(() => {
    fetchClasses();
  }, []);

  return (
    <View style={{ flex: 1, backgroundColor: theme.background }}>
      <Header />

      <Pressable
        onPress={() => navigation.navigate("AdminClassForm", {})}
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "center",
          gap: 6,
          marginHorizontal: 16,
          marginBottom: 12,
          paddingVertical: 10,
          borderRadius: 12,
          backgroundColor: theme.muted,
        }}
      >
        <Ionicons name="add-circle-outline" size={16} color={theme.primary} />
        <Text style={{ color: theme.primary, fontWeight: "700", fontSize: 13 }}>
          Add Class
        </Text>
      </Pressable>

      {loading && classes.length === 0 ? (
        <InlineLoader />
      ) : (
        <FlatList
          data={classes}
          keyExtractor={(item) => item.class_id}
          contentContainerStyle={{ paddingBottom: 24 }}
          renderItem={({ item }) => (
            <ClassCard
              item={item}
              onPress={() =>
                navigation.navigate("AdminClassDetail", {
                  classId: item.class_id,
                  className: item.class_name,
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
              No classes found.
            </Text>
          }
        />
      )}
    </View>
  );
}
