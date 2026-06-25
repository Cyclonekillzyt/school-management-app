import { View, Text, StyleSheet } from "react-native";
import { useTheme } from "@/hooks/useTheme";
import Avatar from "@/components/common/Avatar";

type Props = {
  name: string;
  scores: number;
  totalStudents: number;
  progress: number;
  position: string;
  color: string;
  rank: number
};

export default function TeacherCard({
  name,
  scores,
  totalStudents,
  progress,
  position,
  color,
  rank
}: Props) {
  const theme = useTheme();

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: theme.card,
          borderColor: theme.cardBorder,
        },
      ]}
    >
      <Avatar name={name} size={40} />

      <View style={styles.content}>
        <View style={styles.row}>
          <Text
            numberOfLines={1}
            style={[
              styles.name,
              {
                color: theme.foreground,
              },
            ]}
          >
            {name}
          </Text>

          <Text
            style={[
              styles.percent,
              {
                color,
              },
            ]}
          >
            {progress}%
          </Text>
        </View>

        <View
          style={[
            styles.track,
            {
              backgroundColor: theme.muted,
            },
          ]}
        >
          <View
            style={[
              styles.bar,
              {
                width: `${progress}%`,
                backgroundColor: color,
              },
            ]}
          />
        </View>

        <Text
          style={[
            styles.subject,
            {
              color: theme.mutedForeground,
            },
          ]}
        >
          {}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderWidth: 1,
    borderRadius: 14,
    gap: 14,
  },

  content: {
    flex: 1,
  },

  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },

  name: {
    fontSize: 13,
    fontWeight: "700",
    flex: 1,
  },

  percent: {
    fontSize: 13,
    fontWeight: "800",
  },

  track: {
    height: 7,
    borderRadius: 99,
    overflow: "hidden",
  },

  bar: {
    height: "100%",
    borderRadius: 99,
  },

  subject: {
    marginTop: 5,
    fontSize: 11,
  },
});
