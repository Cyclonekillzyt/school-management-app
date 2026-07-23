import { useEffect, useState } from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@/hooks/useTheme";
import { useDashboardStore } from "@/store/dashboardStore";

type props = {
  styles: any;
};

export default function AssignmentDropdown({styles}: props) {
  const theme = useTheme();
  const assignments = useDashboardStore((s) => s.assignments);
  const selectedAssignment = useDashboardStore((s) => s.selectedAssignment);
  const setSelectedAssignment = useDashboardStore(
    (s) => s.setSelectedAssignment,
  );


  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!selectedAssignment && assignments.length > 0) {
      setSelectedAssignment(assignments[0]);
    }
  }, [assignments]);

  return (
    <View>
      <Pressable
        onPress={() => setOpen((prev) => !prev)}
        style={[styles.badge, { backgroundColor: theme.muted }]}
      >
        <Text style={[styles.badgeText, { color: theme.mutedForeground }]}>
          {selectedAssignment
            ? `${selectedAssignment.subject_name} · ${selectedAssignment.class_name}`
            : "No Assignment"}
        </Text>

        <Ionicons
          name={open ? "chevron-up" : "chevron-down"}
          size={14}
          color={theme.mutedForeground}
        />
      </Pressable>

      {open && (
        <View
          style={[
            styles.dropdown,
            {
              backgroundColor: theme.card,
              borderColor: theme.cardBorder,
            },
          ]}
        >
          {assignments.map((assignment) => (
            <Pressable
              key={assignment.assignment_id}
              style={styles.option}
              onPress={() => {
                setSelectedAssignment(assignment);
                setOpen(false);
              }}
            >
              <Text
                style={{
                  color: theme.foreground,
                  fontSize: 13,
                }}
              >
                {assignment.subject_name} · {assignment.class_name}
              </Text>
            </Pressable>
          ))}
        </View>
      )}
    </View>
  );
}

