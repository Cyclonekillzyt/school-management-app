import { Modal, View, Text, TouchableOpacity } from "react-native";
import { useTheme } from "@/hooks/useTheme";
import {WarningModalProps} from "@/types/warningModal.types";


export default function WarningModal({
  visible,
  title,
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  onConfirm,
  onCancel,
}: WarningModalProps) {
  const theme = useTheme();

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "rgba(0,0,0,0.5)",
          padding: 20,
        }}
      >
        <View
          style={{
            width: "100%",
            borderRadius: 16,
            padding: 20,
            backgroundColor: theme.card,
          }}
        >
          <Text
            style={{
              color: theme.foreground,
              fontSize: 18,
              fontWeight: "700",
              marginBottom: 10,
            }}
          >
            {title}
          </Text>

          <Text
            style={{
              color: theme.mutedForeground,
              marginBottom: 20,
            }}
          >
            {message}
          </Text>

          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              gap: 12,
            }}
          >
            <TouchableOpacity
              onPress={onConfirm}
              style={{
                flex: 1,
                backgroundColor: theme.cardBorder,
                paddingVertical: 10,
                borderRadius: 8,
                alignItems: "center",
              }}
            >
              <Text
                style={{
                  color: theme.destructive,
                  fontWeight: "600",
                }}
              >
                {confirmText}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={onCancel}
              style={{
                flex: 1,
                backgroundColor: theme.accent,
                paddingVertical: 10,
                borderRadius: 8,
                alignItems: "center",
              }}
            >
              <Text
                style={{
                  color: theme.foreground,
                  fontWeight: "600",
                }}
              >
                {cancelText}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}
