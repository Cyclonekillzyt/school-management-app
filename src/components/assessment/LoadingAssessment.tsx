import { ActivityIndicator, View } from "react-native";

export default function LoadingAssessment() {
  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <ActivityIndicator />
    </View>
  );
}
