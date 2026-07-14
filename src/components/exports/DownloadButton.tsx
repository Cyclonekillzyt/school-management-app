import { Pressable, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";

type Props = {
  onDownload: () => void;
  t: any;
  loading?: boolean;
};

export default function DownloadButton({
  onDownload,
  t,
  loading = false,
}: Props) {
  return (
    <Pressable
      onPress={onDownload}
      disabled={loading}
      style={{
        marginHorizontal: 16,
        marginVertical: 16,
        paddingVertical: 14,
        borderRadius: 14,
        backgroundColor: t.primary,
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        gap: 8,
        opacity: loading ? 0.6 : 1,
      }}
    >
      <Ionicons name="download-outline" size={20} color="#fff" />

      <Text
        style={{
          color: "#fff",
          fontWeight: "700",
          fontSize: 15,
        }}
      >
        {loading ? "Preparing File..." : "Download Excel"}
      </Text>
    </Pressable>
  );
}
