import { View, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@/hooks/useTheme";
import { AdminActivityEntry } from "@/types/adminActivity.types";

const ACTION_META: Record<string, { icon: string; color: string; describe: (item: AdminActivityEntry) => string }> = {
  student_created: { icon: "person-add-outline", color: "#22c55e", describe: (i) => `${i.entity_label} was added as a new student` },
  student_updated: { icon: "create-outline", color: "#60a5fa", describe: (i) => `${i.entity_label}'s details were updated` },
  student_deactivated: { icon: "person-remove-outline", color: "#ef4444", describe: (i) => `${i.entity_label} was deactivated` },
  student_reactivated: { icon: "person-outline", color: "#22c55e", describe: (i) => `${i.entity_label} was reactivated` },
  class_created: { icon: "school-outline", color: "#22c55e", describe: (i) => `Class ${i.entity_label} was created` },
  class_updated: { icon: "create-outline", color: "#60a5fa", describe: (i) => `Class ${i.entity_label} was updated` },
  subject_created: { icon: "book-outline", color: "#22c55e", describe: (i) => `Subject ${i.entity_label} was created` },
  subject_updated: { icon: "create-outline", color: "#60a5fa", describe: (i) => `Subject ${i.entity_label} was updated` },
  assignment_created: { icon: "link-outline", color: "#22c55e", describe: (i) => `${i.entity_label} assigned` },
  assignment_removed: { icon: "unlink-outline", color: "#ef4444", describe: (i) => `${i.entity_label} unassigned` },
  teacher_invited: { icon: "mail-outline", color: "#22c55e", describe: (i) => `${i.entity_label} was invited as a teacher` },
  teacher_password_reset: { icon: "key-outline", color: "#f59e0b", describe: (i) => `Password reset sent to ${i.entity_label}` },
  teacher_deactivated: { icon: "person-remove-outline", color: "#ef4444", describe: () => `A teacher account was deactivated` },
  teacher_reactivated: { icon: "person-outline", color: "#22c55e", describe: () => `A teacher account was reactivated` },
  academic_year_activated: { icon: "calendar-outline", color: "#6c5ff5", describe: (i) => `${i.entity_label} set as active academic year` },
  academic_year_archived: { icon: "archive-outline", color: "#7a789a", describe: (i) => `${i.entity_label} was archived` },
  academic_year_unarchived: { icon: "archive-outline", color: "#22c55e", describe: (i) => `${i.entity_label} was unarchived` },
  term_activated: { icon: "calendar-outline", color: "#6c5ff5", describe: (i) => `${i.entity_label} set as active term` },
  term_closed: { icon: "lock-closed-outline", color: "#ef4444", describe: (i) => `${i.entity_label} was closed for score entry` },
  term_opened: { icon: "lock-open-outline", color: "#22c55e", describe: (i) => `${i.entity_label} was reopened for score entry` },
  scores_saved: { icon: "checkmark-done-outline", color: "#22c55e", describe: (i) => `${i.entity_label} saved ${i.metadata?.count ?? ""} score${i.metadata?.count === 1 ? "" : "s"}` },
  export_generated: { icon: "download-outline", color: "#60a5fa", describe: (i) => `${i.entity_label} was exported` },
};

function timeAgo(dateStr: string) {
  const diffMs = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export default function ActivityRow({ item }: { item: AdminActivityEntry }) {
  const theme = useTheme();
  const meta =
    ACTION_META[item.action] ?? { icon: "ellipse-outline", color: theme.mutedForeground, describe: () => item.action };

  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "flex-start",
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderBottomWidth: 1,
        borderColor: theme.border,
        gap: 12,
      }}
    >
      <View
        style={{
          width: 32,
          height: 32,
          borderRadius: 10,
          backgroundColor: `${meta.color}20`,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Ionicons name={meta.icon as any} size={16} color={meta.color} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={{ fontSize: 13, color: theme.foreground, fontWeight: "600" }}>{meta.describe(item)}</Text>
        <Text style={{ fontSize: 11, color: theme.mutedForeground, marginTop: 2 }}>
          {item.actor_name ?? "System"} · {timeAgo(item.created_at)}
        </Text>
      </View>
    </View>
  );
}