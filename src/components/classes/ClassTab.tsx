import { View, Text, Pressable } from "react-native";
import { useDashboardStore } from "@/store/dashboardStore";
import { useTheme } from "@/hooks/useTheme";

export default function ClassTab() {
  const items = useDashboardStore((s) => s.dashboardWorkload);
  const theme = useTheme();
  const classList = items.map((item) => item.class_name);
  const activeGrade = useDashboardStore((s) => s.activeGrade);
  const setActiveGrade = useDashboardStore((s) => s.setActiveGrade);
  const grade  = useDashboardStore((s) => s.activeGrade);
  return (
    <View
      style={{
        paddingVertical: 16,
        paddingHorizontal: 20,
        flexDirection: "column",
        gap: 14,
      }}
    >
      <View
        style={{
          flexDirection: "row",
          gap: 6,
          backgroundColor: theme.muted,
          borderRadius: 13,
          padding: 4,
        }}
      >
        {classList.map((g) => (
          
          <Pressable
            key={g}
            onPress={() => setActiveGrade(g)}
            style={({ pressed }) => ({
              flex: 1,
              paddingVertical: 9,
              paddingHorizontal: 4,
              borderRadius: 10,
              backgroundColor:
                activeGrade === g ? theme.primary : "transparent",
              alignItems: "center",
              justifyContent: "center",
              opacity: pressed ? 0.7 : 1,
            })}
          >
            <Text
              style={{
                fontWeight: "700",
                fontSize: 12,
                color: activeGrade === g ? "#fff" : theme.mutedForeground,
              }}
            >
              {g}
            </Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

/*        
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {filtered.map((s) => (
            <button
              key={s.name}
              onClick={() => navigate("assessment")}
              style={{
                background: t.card,
                borderRadius: 14,
                padding: "14px 16px",
                border: `1px solid ${t.cardBorder}`,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: 14,
                textAlign: "left",
                width: "100%",
              }}
            >
              <div
                style={{
                  width: 46,
                  height: 46,
                  borderRadius: 13,
                  background: `${s.color}18`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  border: `1px solid ${s.color}30`,
                }}
              >
                <span style={{ fontWeight: 900, fontSize: 12, color: s.color }}>{s.ini}</span>
              </div>
              <div style={{ flex: 1 }}>
                <p style={{ fontWeight: 700, fontSize: 14, color: t.foreground, margin: 0 }}>{s.name}</p>
                <p style={{ fontSize: 12, color: t.mutedForeground, margin: "3px 0 0" }}>
                  {activeGrade} · {s.students} students
                </p>
              </div>
              <ChevronRight size={16} color={t.mutedForeground} />
            </button>
          ))}
        </div>
      </div>
    </div>*/
