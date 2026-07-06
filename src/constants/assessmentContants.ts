export const tabs = [
  "classwork",
  "groupwork",
  "projectwork",
  "test",
  "exam_score",
] as const;

export const activeTabLabel = (tab: string) => {
  switch (tab) {
    case "classwork":
      return "Classwork (30)";
    case "groupwork":
      return "Groupwork (20)";
    case "projectwork":
      return "Project (20)";
    case "test":
      return "Test (30)";
    case "exam_score":
      return "Exam (100)";
    default:
      return tab;
  }
};

export const SCORE_LIMITS = {
  classwork: 30,
  test: 30,
  groupwork: 20,
  projectwork: 20,
  exam_score: 100,
} as const;
