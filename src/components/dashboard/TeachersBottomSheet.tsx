import { forwardRef } from "react";
import BottomSheet, { BottomSheetScrollView } from "@gorhom/bottom-sheet";
import { View, Text, StyleSheet } from "react-native";
import { useTheme } from "@/hooks/useTheme";
import TeacherCard from "./TeacherCard";

type Teacher = {
  name: string;
  scores: number;
  totalStudents: number;
  progress: number;
  position: string;
  color: string;
  rank: number;
};

type Props = {
  teachers: Teacher[];
};

const TeachersBottomSheet = forwardRef<BottomSheet, Props>(
  ({ teachers }, ref) => {
    const theme = useTheme();

    return (
      <BottomSheet
        ref={ref}
        index={-1}
        snapPoints={["90%"]}
        enablePanDownToClose
        backgroundStyle={{ backgroundColor: theme.card }}
        handleIndicatorStyle={{ backgroundColor: theme.mutedForeground }}
      >
        <BottomSheetScrollView contentContainerStyle={styles.container}>
          <Text style={[styles.header, { color: theme.foreground }]}>
            All Teachers Progress
          </Text>

          <View style={styles.list}>
            {teachers.map((teacher) => (
              <TeacherCard key={teacher.name} {...teacher} />
            ))}

            {teachers.length === 0 && (
              <Text style={{ color: theme.mutedForeground }}>
                No teachers found.
              </Text>
            )}
          </View>
        </BottomSheetScrollView>
      </BottomSheet>
    );
  },
);

export default TeachersBottomSheet;

const styles = StyleSheet.create({
  container: {
    padding: 20,
    paddingBottom: 40,
    gap: 16,
  },
  header: {
    fontSize: 18,
    fontWeight: "800",
    marginBottom: 4,
  },
  list: {
    gap: 10,
  },
});
