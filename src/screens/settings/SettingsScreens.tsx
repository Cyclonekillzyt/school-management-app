import { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  Switch,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";

import Header from "@/components/common/Header";
import { useTheme } from "@/hooks/useTheme";
import { useThemeStore } from "@/store/themeStore";
import { useAuthStore } from "@/store/authStore";
import WarningModal from "@/components/common/warningModal";
import { useAssessmentStore } from "@/store/assessmentStore";

export default function SettingsScreen() {
  const theme = useTheme();
  const navigation = useNavigation<any>();
  const [showWarningModal, setShowWarningModal] = useState(false);
  const profile = useAuthStore((s) => s.user);
  const logOut = useAuthStore((s) => s.signOut);

  const mode = useThemeStore((s) => s.mode);
  const toggleTheme = useThemeStore((s) => s.toggleTheme);

  const items = [
    {
      icon: "person-outline",
      label: "Edit Profile",
      color: "#6c5ff5",
      onPress: () => navigation.navigate("EditProfile"),
    },
    {
      icon: "lock-closed-outline",
      label: "Change Password",
      color: "#60a5fa",
      onPress: () => navigation.navigate("ChangePassword"),
    },
    {
      icon: "notifications-outline",
      label: "Notifications",
      color: "#f59e0b",
      onPress: () => navigation.navigate("Notifications"),
    },
    {
      icon: "globe-outline",
      label: "Language & Region",
      color: "#22c55e",
      onPress: () => navigation.navigate("LanguageRegion"),
    },
    {
      icon: "eye-outline",
      label: "Privacy",
      color: "#f472b6",
      onPress: () => navigation.navigate("Privacy"),
    },
    ...(profile?.role === "admin"
      ? [
          {
            icon: "shield-outline",
            label: "Admin Panel",
            color: "#ef4444",
            onPress: () => navigation.navigate("AdminPanel"),
          },
        ]
      : []),
  ];

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Header />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        <View style={[styles.profileCard, { backgroundColor: theme.primary }]}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {profile?.userName?.charAt(0) ?? "U"}
            </Text>
          </View>
          <View>
            <Text style={styles.name}>{profile?.userName ?? "User"}</Text>
            <Text style={styles.role}>{profile?.role ?? "Teacher"}</Text>
          </View>
        </View>

        {/* Appearance */}
        <View
          style={[
            styles.card,
            { backgroundColor: theme.card, borderColor: theme.cardBorder },
          ]}
        >
          <View style={styles.item}>
            <View style={[styles.iconBox, { backgroundColor: "#6c5ff520" }]}>
              <Ionicons
                name={mode === "dark" ? "moon-outline" : "sunny-outline"}
                size={18}
                color="#6c5ff5"
              />
            </View>
            <Text style={[styles.label, { color: theme.foreground }]}>
              Dark Mode
            </Text>
            <Switch
              value={mode === "dark"}
              onValueChange={toggleTheme}
              trackColor={{ true: theme.primary, false: theme.muted }}
              thumbColor="#fff"
            />
          </View>
        </View>

        <View
          style={[
            styles.card,
            { backgroundColor: theme.card, borderColor: theme.cardBorder },
          ]}
        >
          {items.map((item, index) => (
            <Pressable
              key={item.label}
              onPress={item.onPress}
              style={[
                styles.item,
                index !== 0 && {
                  borderTopWidth: 1,
                  borderTopColor: theme.border,
                },
              ]}
            >
              <View
                style={[styles.iconBox, { backgroundColor: `${item.color}20` }]}
              >
                <Ionicons
                  name={item.icon as any}
                  size={18}
                  color={item.color}
                />
              </View>
              <Text style={[styles.label, { color: theme.foreground }]}>
                {item.label}
              </Text>
              <Ionicons
                name="chevron-forward"
                size={18}
                color={theme.mutedForeground}
              />
            </Pressable>
          ))}

          <Pressable
            onPress={() => setShowWarningModal(true)}
            style={[
              styles.item,
              { borderTopWidth: 1, borderTopColor: theme.border },
            ]}
          >
            <View style={[styles.iconBox, { backgroundColor: "#ef444420" }]}>
              <Ionicons name="log-out-outline" size={18} color="#ef4444" />
            </View>
            <Text style={[styles.label, { color: "#ef4444" }]}>Log Out</Text>
            <Ionicons
              name="chevron-forward"
              size={18}
              color={theme.mutedForeground}
            />
          </Pressable>
        </View>
      </ScrollView>

      <WarningModal
        visible={showWarningModal}
        title="Logging Out"
        message="Are you sure you want to log out?"
        confirmText="Log Out"
        cancelText="Cancel"
        onConfirm={() => {
          logOut();
          setShowWarningModal(false);
        }}
        onCancel={() => {
          useAssessmentStore.setState({ hasUnsavedChanges: true });
          setShowWarningModal(false);
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 16, gap: 16 },
  profileCard: {
    borderRadius: 18,
    padding: 20,
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
  avatar: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: { color: "#fff", fontSize: 22, fontWeight: "800" },
  name: { color: "#fff", fontSize: 16, fontWeight: "800" },
  role: { color: "rgba(255,255,255,0.7)", marginTop: 4, fontSize: 12 },
  card: { borderRadius: 14, borderWidth: 1, overflow: "hidden" },
  item: {
    height: 64,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  iconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  label: { flex: 1, fontSize: 14, fontWeight: "600" },
});
