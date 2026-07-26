import { useEffect, useRef } from "react";
import {
  Modal,
  View,
  Text,
  Pressable,
  StyleSheet,
  Animated,
  Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { useTheme } from "@/hooks/useTheme";
import { useAuthStore } from "@/store/authStore";
import { getAvatarColor, getInitials } from "@/utils/avatar";
import WarningModal from "./warningModal";
import { useState } from "react";

const MENU_WIDTH = Dimensions.get("window").width * 0.78;

type Props = {
  visible: boolean;
  onClose: () => void;
};

export default function SideMenu({ visible, onClose }: Props) {
  const theme = useTheme();
  const navigation = useNavigation<any>();
  const user = useAuthStore((s) => s.user);
  const signOut = useAuthStore((s) => s.signOut);

  const [showLogoutWarning, setShowLogoutWarning] = useState(false);

  const translateX = useRef(new Animated.Value(-MENU_WIDTH)).current;

  useEffect(() => {
    Animated.timing(translateX, {
      toValue: visible ? 0 : -MENU_WIDTH,
      duration: 240,
      useNativeDriver: true,
    }).start();
  }, [visible]);

  const links = [
    { icon: "home-outline", label: "Home", route: "Home" },
    { icon: "book-outline", label: "Classes", route: "Classes" },
    { icon: "podium-outline", label: "Rankings", route: "Rankings" },
    { icon: "settings-outline", label: "Settings", route: "Settings" },
  ];

  const goTo = (route: string) => {
    onClose();
    navigation.navigate(route);
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <Pressable style={styles.backdrop} onPress={onClose} />

        <Animated.View
          style={[
            styles.panel,
            {
              width: MENU_WIDTH,
              backgroundColor: theme.card,
              transform: [{ translateX }],
            },
          ]}
        >
          {/* Profile */}
          <View style={styles.profile}>
            <View
              style={[
                styles.avatar,
                { backgroundColor: getAvatarColor(user?.userName ?? "") },
              ]}
            >
              <Text style={styles.avatarText}>
                {getInitials(user?.userName ?? "")}
              </Text>
            </View>

            <Text
              numberOfLines={1}
              style={[styles.name, { color: theme.foreground }]}
            >
              {user?.userName ?? "User"}
            </Text>
            <Text style={[styles.role, { color: theme.mutedForeground }]}>
              {user?.role ?? "Teacher"}
            </Text>
          </View>

          {/* Nav links */}
          <View style={styles.links}>
            {links.map((item) => (
              <Pressable
                key={item.route}
                onPress={() => goTo(item.route)}
                style={styles.linkRow}
              >
                <View
                  style={[styles.iconBox, { backgroundColor: theme.muted }]}
                >
                  <Ionicons
                    name={item.icon as any}
                    size={18}
                    color={theme.primary}
                  />
                </View>
                <Text style={[styles.linkLabel, { color: theme.foreground }]}>
                  {item.label}
                </Text>
                <Ionicons
                  name="chevron-forward"
                  size={16}
                  color={theme.mutedForeground}
                />
              </Pressable>
            ))}
          </View>

          {/* Logout */}
          <Pressable
            onPress={() => setShowLogoutWarning(true)}
            style={[styles.logout, { borderTopColor: theme.border }]}
          >
            <View style={[styles.iconBox, { backgroundColor: "#ef444420" }]}>
              <Ionicons name="log-out-outline" size={18} color="#ef4444" />
            </View>
            <Text style={[styles.linkLabel, { color: "#ef4444" }]}>
              Log Out
            </Text>
          </Pressable>
        </Animated.View>
      </View>

      <WarningModal
        visible={showLogoutWarning}
        title="Logging Out"
        message="Are you sure you want to log out?"
        confirmText="Log Out"
        cancelText="Cancel"
        onConfirm={() => {
          setShowLogoutWarning(false);
          onClose();
          signOut();
        }}
        onCancel={() => setShowLogoutWarning(false)}
      />
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    flexDirection: "row",
  },
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  panel: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    paddingTop: 60,
    paddingHorizontal: 20,
  },
  profile: {
    alignItems: "flex-start",
    marginBottom: 28,
    gap: 4,
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },
  avatarText: {
    color: "#fff",
    fontWeight: "800",
    fontSize: 18,
  },
  name: {
    fontSize: 16,
    fontWeight: "800",
  },
  role: {
    fontSize: 12,
  },
  links: {
    gap: 4,
  },
  linkRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 12,
  },
  iconBox: {
    width: 34,
    height: 34,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  linkLabel: {
    flex: 1,
    fontSize: 14,
    fontWeight: "600",
  },
  logout: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginTop: "auto",
    marginBottom: 40,
    paddingTop: 16,
    borderTopWidth: 1,
  },
});
