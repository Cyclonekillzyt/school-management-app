import { useEffect, useState } from "react";
import { View, Text, ScrollView, Pressable, FlatList } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@/hooks/useTheme";
import BackButton from "@/components/auth/BackButton";
import LoginButton from "@/components/auth/LoginButton";
import WarningModal from "@/components/common/warningModal";
import InlineLoader from "@/components/admin/InlineLoader";
import { usePromotionStore } from "@/store/promotionStore";
import { showToast } from "@/utils/toast";

function ClassPickerRow({
  label,
  value,
  options,
  onChange,
  disabled,
}: {
  label: string;
  value: string | null;
  options: { id: string; name: string }[];
  onChange: (id: string) => void;
  disabled?: boolean;
}) {
  const theme = useTheme();
  const selected = options.find((o) => o.id === value);
  return (
    <View style={{ gap: 8 }}>
      <Text
        style={{
          fontSize: 13,
          fontWeight: "700",
          color: theme.mutedForeground,
        }}
      >
        {label}
      </Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={{ maxHeight: 44 }}
      >
        <View style={{ flexDirection: "row", gap: 8 }}>
          {options.map((o) => (
            <Pressable
              key={o.id}
              disabled={disabled}
              onPress={() => onChange(o.id)}
              style={{
                paddingVertical: 8,
                paddingHorizontal: 16,
                borderRadius: 12,
                backgroundColor: value === o.id ? theme.primary : theme.muted,
                opacity: disabled ? 0.5 : 1,
              }}
            >
              <Text
                style={{
                  color: value === o.id ? "#fff" : theme.mutedForeground,
                  fontWeight: "700",
                  fontSize: 13,
                }}
              >
                {o.name}
              </Text>
            </Pressable>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

export default function PromoteStudentsScreen() {
  const theme = useTheme();
  const {
    manageableClasses,
    allClasses,
    students,
    loadingClasses,
    loadingStudents,
    fetchManageableClasses,
    fetchAllClasses,
    fetchStudents,
    promoteStudents,
  } = usePromotionStore();

  const [sourceClassId, setSourceClassId] = useState<string | null>(null);
  const [targetClassId, setTargetClassId] = useState<string | null>(null);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [deactivate, setDeactivate] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const recentPromotions = usePromotionStore((s) => s.recentPromotions);
  const fetchRecentPromotions = usePromotionStore(
    (s) => s.fetchRecentPromotions,
  );
  const undoPromotion = usePromotionStore((s) => s.undoPromotion);
  const [undoingId, setUndoingId] = useState<string | null>(null);

  const handleUndo = async (promotionId: string) => {
    setUndoingId(promotionId);
    try {
      await undoPromotion(promotionId);
      showToast.success("Promotion undone");
      if (sourceClassId) fetchStudents(sourceClassId);
    } catch (err: any) {
      showToast.error("Undo failed", err.message);
    } finally {
      setUndoingId(null);
    }
  };

  useEffect(() => {
    fetchManageableClasses();
    fetchAllClasses();
    fetchRecentPromotions();
  }, []);

  useEffect(() => {
    setSelected(new Set());
    if (sourceClassId) fetchStudents(sourceClassId);
  }, [sourceClassId]);

  const toggleStudent = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selected.size === students.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(students.map((s) => s.student_id)));
    }
  };

  const handleConfirm = async () => {
    if (!targetClassId || selected.size === 0) return;
    setShowConfirm(false);
    setSubmitting(true);
    try {
      await promoteStudents(Array.from(selected), targetClassId, deactivate);
      showToast.success(
        "Promotion complete",
        `${selected.size} student${selected.size === 1 ? "" : "s"} moved`,
      );
      fetchRecentPromotions();
      setSelected(new Set());
      if (sourceClassId) fetchStudents(sourceClassId);
    } catch (err: any) {
      showToast.error("Promotion failed", err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const targetOptions = allClasses.filter((c) => c.id !== sourceClassId);

  if (loadingClasses) return <InlineLoader />;

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
        }}
      >
        Promote Students
      </Text>
      <Text
        style={{
          fontSize: 14,
          color: theme.mutedForeground,
          marginTop: 4,
          marginBottom: 18,
        }}
      >
        Move students to a new class at the end of the year. Anyone not selected
        stays put.
      </Text>

      <View
        style={{
          borderWidth: 1,
          borderColor: theme.cardBorder,
          borderRadius: 14,
          backgroundColor: theme.card,
          padding: 14,
          marginBottom: 18,
          gap: 6,
        }}
      >
        <Text
          style={{ fontSize: 12, fontWeight: "800", color: theme.foreground }}
        >
          End-of-year order
        </Text>
        <Text
          style={{ fontSize: 12, color: theme.mutedForeground, lineHeight: 18 }}
        >
          1. Activate the new academic year and term (Admin Panel → Academic
          Years).{"\n"}
          2. Promote students to their next class (this screen).{"\n"}
          3. Create or import teacher assignments for the new year.
        </Text>
      </View>

      {manageableClasses.length === 0 ? (
        <Text style={{ color: theme.mutedForeground }}>
          You don't manage any classes yet — only admins and class teachers can
          promote students.
        </Text>
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          style={{ marginHorizontal: -24 }}
        >
          <View style={{ marginHorizontal: 24, gap: 20 }}>
            <ClassPickerRow
              label="FROM CLASS"
              value={sourceClassId}
              options={manageableClasses.map((c) => ({
                id: c.class_id,
                name: c.class_name,
              }))}
              onChange={setSourceClassId}
            />

            {sourceClassId && (
              <>
                {loadingStudents ? (
                  <InlineLoader />
                ) : (
                  <View
                    style={{
                      borderWidth: 1,
                      borderColor: theme.cardBorder,
                      borderRadius: 14,
                      overflow: "hidden",
                      backgroundColor: theme.card,
                    }}
                  >
                    <Pressable
                      onPress={toggleSelectAll}
                      style={{
                        flexDirection: "row",
                        justifyContent: "space-between",
                        alignItems: "center",
                        padding: 14,
                        borderBottomWidth: 1,
                        borderColor: theme.border,
                      }}
                    >
                      <Text
                        style={{
                          fontWeight: "700",
                          fontSize: 13,
                          color: theme.foreground,
                        }}
                      >
                        {selected.size} of {students.length} selected
                      </Text>
                      <Text
                        style={{
                          color: theme.primary,
                          fontWeight: "700",
                          fontSize: 12,
                        }}
                      >
                        {selected.size === students.length
                          ? "Deselect All"
                          : "Select All"}
                      </Text>
                    </Pressable>
                    <FlatList
                      data={students}
                      keyExtractor={(item) => item.student_id}
                      renderItem={({ item }) => (
                        <Pressable
                          onPress={() => toggleStudent(item.student_id)}
                          style={{
                            flexDirection: "row",
                            alignItems: "center",
                            padding: 14,
                            borderBottomWidth: 1,
                            borderColor: theme.border,
                            gap: 12,
                          }}
                        >
                          <Ionicons
                            name={
                              selected.has(item.student_id)
                                ? "checkbox"
                                : "square-outline"
                            }
                            size={20}
                            color={
                              selected.has(item.student_id)
                                ? theme.primary
                                : theme.mutedForeground
                            }
                          />
                          <Text
                            style={{
                              color: theme.foreground,
                              fontSize: 13,
                              flex: 1,
                            }}
                          >
                            {item.student_name}
                          </Text>
                          {!item.active && (
                            <Text
                              style={{ fontSize: 11, color: theme.destructive }}
                            >
                              Inactive
                            </Text>
                          )}
                        </Pressable>
                      )}
                      ListEmptyComponent={
                        <Text
                          style={{ padding: 16, color: theme.mutedForeground }}
                        >
                          No students in this class.
                        </Text>
                      }
                    />
                  </View>
                )}

                <ClassPickerRow
                  label="TO CLASS"
                  value={targetClassId}
                  options={targetOptions}
                  onChange={setTargetClassId}
                  disabled={selected.size === 0}
                />

                <Pressable
                  onPress={() => setDeactivate((p) => !p)}
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 10,
                  }}
                >
                  <Ionicons
                    name={deactivate ? "checkbox" : "square-outline"}
                    size={20}
                    color={deactivate ? theme.primary : theme.mutedForeground}
                  />
                  <Text
                    style={{ color: theme.foreground, fontSize: 13, flex: 1 }}
                  >
                    Also deactivate (use for graduating students — removes them
                    from active rosters and rankings)
                  </Text>
                </Pressable>

                <LoginButton
                  onPress={() => setShowConfirm(true)}
                  disabled={submitting || selected.size === 0 || !targetClassId}
                  text={`PROMOTE ${selected.size} STUDENT${selected.size === 1 ? "" : "S"}`}
                  loaderText="Promoting..."
                />
              </>
            )}
          </View>
          <View style={{ height: 60 }} />
          {recentPromotions.length > 0 && (
            <View style={{ marginTop: 30, gap: 10 }}>
              <Text
                style={{
                  fontSize: 14,
                  fontWeight: "800",
                  color: theme.foreground,
                }}
              >
                Recent Promotions
              </Text>
              {recentPromotions.map((p) => {
                const isRecent =
                  Date.now() - new Date(p.created_at).getTime() <
                  24 * 60 * 60 * 1000;
                return (
                  <View
                    key={p.id}
                    style={{
                      borderWidth: 1,
                      borderColor: theme.cardBorder,
                      borderRadius: 12,
                      padding: 12,
                      backgroundColor: theme.card,
                      opacity: p.undone ? 0.5 : 1,
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 12,
                        color: theme.foreground,
                        fontWeight: "600",
                      }}
                    >
                      {p.student_count} student
                      {p.student_count === 1 ? "" : "s"}: {p.source_class_name}{" "}
                      → {p.target_class_name}
                      {p.deactivated ? " (deactivated)" : ""}
                    </Text>
                    <View
                      style={{
                        flexDirection: "row",
                        justifyContent: "space-between",
                        alignItems: "center",
                        marginTop: 6,
                      }}
                    >
                      <Text
                        style={{ fontSize: 11, color: theme.mutedForeground }}
                      >
                        {p.undone
                          ? "Undone"
                          : new Date(p.created_at).toLocaleString()}
                      </Text>
                      {!p.undone && isRecent && (
                        <Pressable
                          onPress={() => handleUndo(p.id)}
                          disabled={undoingId === p.id}
                        >
                          <Text
                            style={{
                              color: theme.destructive,
                              fontWeight: "700",
                              fontSize: 12,
                            }}
                          >
                            {undoingId === p.id ? "Undoing..." : "Undo"}
                          </Text>
                        </Pressable>
                      )}
                    </View>
                  </View>
                );
              })}
            </View>
          )}
        </ScrollView>
      )}

      <WarningModal
        visible={showConfirm}
        title="Confirm Promotion"
        message={`Move ${selected.size} student${selected.size === 1 ? "" : "s"} to ${
          targetOptions.find((c) => c.id === targetClassId)?.name ??
          "the selected class"
        }${deactivate ? " and deactivate them" : ""}? This can be adjusted later per student if needed.`}
        confirmText="Promote"
        cancelText="Cancel"
        onConfirm={handleConfirm}
        onCancel={() => setShowConfirm(false)}
      />
    </View>
  );
}
