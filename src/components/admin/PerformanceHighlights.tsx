import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@/hooks/useTheme";

type Props = {
  topClassName: string | null;
  topClassAverage: number | null;
  lowestClassName: string | null;
  lowestClassAverage: number | null;
  topTeacherName: string | null;
  topTeacherAverage: number | null;
};

function HighlightCard({
  icon,
  color,
  label,
  title,
  value,
}: {
  icon: any;
  color: string;
  label: string;
  title: string | null;
  value: string | null;
}) {
  const theme = useTheme();

  return (
    <View
      style={[
        styles.card,
        { backgroundColor: theme.card, borderColor: theme.cardBorder },
      ]}
    >
      <View style={[styles.iconBox, { backgroundColor: `${color}20` }]}>
        <Ionicons name={icon} size={18} color={color} />
      </View>

      <Text style={[styles.label, { color: theme.mutedForeground }]}>
        {label}
      </Text>

      <Text style={[styles.title, { color: theme.foreground }]}>
        {title ?? "—"}
      </Text>

      {value && <Text style={[styles.value, { color }]}>{value}</Text>}
    </View>
  );
}

export default function PerformanceHighlights({
  topClassName,
  topClassAverage,
  lowestClassName,
  lowestClassAverage,
  topTeacherName,
  topTeacherAverage,
}: Props) {
  return (
    <View style={styles.row}>
      <HighlightCard
        icon="trending-up-outline"
        color="#22c55e"
        label="Top Performing Class"
        title={topClassName}
        value={topClassAverage != null ? `${topClassAverage}%` : null}
      />

      <HighlightCard
        icon="trending-down-outline"
        color="#ef4444"
        label="Lowest Performing Class"
        title={lowestClassName}
        value={lowestClassAverage != null ? `${lowestClassAverage}%` : null}
      />

      <HighlightCard
        icon="ribbon-outline"
        color="#f59e0b"
        label="Top Teacher"
        title={topTeacherName}
        value={topTeacherAverage != null ? `${topTeacherAverage}%` : null}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    paddingHorizontal: 16,
    marginTop: 16,
    gap: 10,
  },
  card: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 16,
    gap: 6,
  },
  iconBox: {
    width: 34,
    height: 34,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
  },
  label: {
    fontSize: 11,
    fontWeight: "600",
  },
  title: {
    fontSize: 16,
    fontWeight: "800",
  },
  value: {
    fontSize: 13,
    fontWeight: "700",
  },
});