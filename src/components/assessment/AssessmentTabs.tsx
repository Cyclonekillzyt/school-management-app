import { tabs, activeTabLabel } from "@/constants/assessmentContants";
import { Pressable, ScrollView, Text } from "react-native";

type AssessmentTabsProps = {
  t: any;
  selectedAssessment: string;
  setSelectedAssessment: (tab: any) => void;
};
export function AssessmentTabs({
  t,
  selectedAssessment,
  setSelectedAssessment,
}: AssessmentTabsProps) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{
        paddingHorizontal: 12,
        paddingVertical: 6,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 6,
      }}
      style={{
        maxHeight: 50,
      }}
    >
      {tabs.map((tab) => (
        <Pressable
          key={tab}
          onPress={() => setSelectedAssessment(tab)}
          style={{
            paddingVertical: 5,
            paddingHorizontal: 5,
            borderRadius: 16,
            flex: 1,
            backgroundColor: selectedAssessment === tab ? t.primary : t.muted,
          }}
        >
          <Text
            style={{
              color: selectedAssessment === tab ? "#fff" : t.mutedForeground,
              fontSize: 11,
              fontWeight: "700",
            }}
          >
            {activeTabLabel(tab)}
          </Text>
        </Pressable>
      ))}
    </ScrollView>
  );
}
