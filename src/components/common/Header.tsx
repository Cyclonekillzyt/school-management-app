import { useState } from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@/hooks/useTheme";
import { useAuthStore } from "@/store/authStore";
import Avatar from "./Avatar";
import SideMenu from "./SideMenu";

export default function Header() {
  const theme = useTheme();
  const user = useAuthStore((s) => s.user);
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.left}>
        <Pressable onPress={() => setMenuOpen(true)} hitSlop={10}>
          <Ionicons name="menu-outline" size={26} color={theme.foreground} />
        </Pressable>
      </View>

      <View style={styles.right}>
        <Ionicons
          name="notifications-outline"
          size={24}
          color={theme.foreground}
        />
        <Avatar name={user?.userName ?? ""} size={34} />
      </View>

      <SideMenu visible={menuOpen} onClose={() => setMenuOpen(false)} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  left: {
    width: 40,
    justifyContent: "center",
  },
  center: {
    flex: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: "800",
  },
  subtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  right: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
});
