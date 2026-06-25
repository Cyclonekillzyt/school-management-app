import { View, Text, StyleSheet, Pressable } from "react-native";
import { getAvatarColor, getInitials } from "@/utils/avatar";
import { useNavigation } from "@react-navigation/native";

type Props = {
  name: string;
  size?: number;
};

export default function Avatar({ name, size = 40 }: Props) {
  const navigation = useNavigation<any>();

  const bg = getAvatarColor(name);
  const initials = getInitials(name);

  const goToSettings = () => {
    navigation.navigate("Settings");
  };

  return (
    <Pressable onPress={goToSettings}>
      <View
        style={[
          styles.container,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            backgroundColor: bg,
          },
        ]}
      >
        <Text style={[styles.text, { fontSize: size * 0.4 }]}>{initials}</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
  },
  text: {
    color: "white",
    fontWeight: "800",
  },
});
