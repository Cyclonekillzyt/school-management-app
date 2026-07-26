import { forwardRef, useMemo } from "react";
import BottomSheet, { BottomSheetScrollView } from "@gorhom/bottom-sheet";
import { View, Text, StyleSheet } from "react-native";
import Svg, { Circle } from "react-native-svg";
import { useTheme } from "@/hooks/useTheme";
import { DashboardWorkload } from "@/types/dashboard.types";
import { getAvatarColor, getInitials } from "@/utils/avatar";

type Props = {
  workload?: DashboardWorkload[];
};

const ProgressBottomSheet = forwardRef<BottomSheet, Props>(
  ({ workload = [] }, ref) => {
    const theme = useTheme();
    const snapPoints = useMemo(() => ["60%", "90%"], []);

    return (
      <BottomSheet
        ref={ref}
        index={-1}
        snapPoints={snapPoints}
        enablePanDownToClose
        backgroundStyle={{ backgroundColor: theme.card }}
        handleIndicatorStyle={{ backgroundColor: theme.mutedForeground }}
      >
        <BottomSheetScrollView contentContainerStyle={styles.container}>
          <Text style={[styles.header, { color: theme.foreground }]}>
            All Classes Progress
          </Text>

          {workload.length === 0 && (
            <Text style={{ color: theme.mutedForeground }}>
              No classes found.
            </Text>
          )}

          {workload.map((item) => (
            <ClassProgressCard
              key={item.assignment_id}
              item={item}
              theme={theme}
            />
          ))}
        </BottomSheetScrollView>
      </BottomSheet>
    );
  },
);

function ClassProgressCard({
  item,
  theme,
}: {
  item: DashboardWorkload;
  theme: any;
}) {
  const color = getAvatarColor(item.class_name);
  const overall = item.grand_total_completion_percentage ?? 0;

  const fields = [
    {
      label: "Classwork",
      value: item.classwork_completion_percentage ?? 0,
      color: theme.chart1,
    },
    {
      label: "Groupwork",
      value: item.groupwork_completion_percentage ?? 0,
      color: theme.chart2,
    },
    {
      label: "Project",
      value: item.projectwork_completion_percentage ?? 0,
      color: theme.chart3,
    },
    {
      label: "Test",
      value: item.test_completion_percentage ?? 0,
      color: theme.chart4,
    },
    {
      label: "Exam",
      value: item.exam_score_completion_percentage ?? 0,
      color: theme.chart5,
    },
  ];

  return (
    <View
      style={[
        styles.card,
        { backgroundColor: theme.background, borderColor: theme.cardBorder },
      ]}
    >
      <View style={styles.cardHeader}>
        <ClassRing name={item.class_name} progress={overall} color={color} />

        <View style={{ flex: 1 }}>
          <Text
            numberOfLines={1}
            style={[styles.className, { color: theme.foreground }]}
          >
            {item.class_name}
          </Text>
          <Text
            numberOfLines={1}
            style={[styles.subjectName, { color: theme.mutedForeground }]}
          >
            {item.subject_name}
          </Text>
          <Text style={[styles.studentsText, { color: theme.mutedForeground }]}>
            {item.total_students} students
          </Text>
        </View>
      </View>

      <View style={styles.fields}>
        {fields.map((f) => (
          <ProgressRow key={f.label} item={f} theme={theme} />
        ))}
      </View>
    </View>
  );
}

function ClassRing({
  name,
  progress,
  color,
  size = 76,
  stroke = 7,
}: {
  name: string;
  progress: number;
  color: string;
  size?: number;
  stroke?: number;
}) {
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (progress / 100) * circumference;

  return (
    <View style={{ width: size, height: size }}>
      <Svg width={size} height={size}>
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={`${color}25`}
          strokeWidth={stroke}
          fill="transparent"
        />
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={stroke}
          fill="transparent"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          rotation="-90"
          origin={`${size / 2}, ${size / 2}`}
        />
      </Svg>

      <View style={ringStyles.center}>
        <Text style={[ringStyles.initials, { color }]}>
          {getInitials(name)}
        </Text>
        <Text style={[ringStyles.percent, { color }]}>
          {Math.round(progress)}%
        </Text>
      </View>
    </View>
  );
}

function ProgressRow({
  item,
  theme,
}: {
  item: { label: string; value: number; color: string };
  theme: any;
}) {
  return (
    <View style={styles.item}>
      <View style={styles.row}>
        <Text style={{ color: theme.mutedForeground, fontSize: 12 }}>
          {item.label}
        </Text>
        <Text
          style={{ color: theme.foreground, fontWeight: "700", fontSize: 12 }}
        >
          {item.value}%
        </Text>
      </View>

      <View style={[styles.track, { backgroundColor: theme.muted }]}>
        <View
          style={{
            width: `${item.value}%`,
            height: "100%",
            backgroundColor: item.color,
            borderRadius: 999,
          }}
        />
      </View>
    </View>
  );
}

export default ProgressBottomSheet;

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
  card: {
    borderRadius: 18,
    borderWidth: 1,
    padding: 16,
    gap: 16,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
  className: {
    fontSize: 15,
    fontWeight: "800",
  },
  subjectName: {
    fontSize: 12,
    marginTop: 2,
  },
  studentsText: {
    fontSize: 11,
    marginTop: 4,
  },
  fields: {
    gap: 10,
  },
  item: {
    gap: 4,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  track: {
    height: 8,
    borderRadius: 999,
    overflow: "hidden",
  },
});

const ringStyles = StyleSheet.create({
  center: {
    position: "absolute",
    inset: 0,
    justifyContent: "center",
    alignItems: "center",
  },
  initials: {
    fontSize: 13,
    fontWeight: "800",
  },
  percent: {
    fontSize: 10,
    marginTop: 2,
    fontWeight: "600",
  },
});
