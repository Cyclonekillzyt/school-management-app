import { useEffect, useMemo, useRef, useState } from "react";
import { View, Animated, StyleSheet, Easing, Dimensions } from "react-native";
import Svg, { Circle, Defs, LinearGradient, Stop } from "react-native-svg";
import { Ionicons } from "@expo/vector-icons";
import * as SplashScreen from "expo-splash-screen";
import { useTheme } from "@/hooks/useTheme";

SplashScreen.preventAutoHideAsync().catch(() => {});
const AnimatedCircle = Animated.createAnimatedComponent(Circle);

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get("window");
const REVEAL_SIZE = Math.hypot(SCREEN_W, SCREEN_H) * 1.15;

type Props = {
  onFinish: () => void;
  /** Pass true while the app is still doing async work (e.g. auth check). */
  waitFor?: boolean;
};

const TITLE = "School Manager";

export default function AnimatedSplash({ onFinish, waitFor = false }: Props) {
  const theme = useTheme();

  // entrance reveal (iris wipe)
  const revealScale = useRef(new Animated.Value(0)).current;

  // ring
  const ringProgress = useRef(new Animated.Value(0)).current;
  const ringSpinAnim = useRef(new Animated.Value(0)).current;

  // orbiting particles
  const orbitAnim = useRef(new Animated.Value(0)).current;

  // logo
  const logoScale = useRef(new Animated.Value(0.3)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const logoWobble = useRef(new Animated.Value(0)).current;
  const glowScale = useRef(new Animated.Value(0.5)).current;
  const glowOpacity = useRef(new Animated.Value(0)).current;

  // title letters
  const letters = useMemo(() => TITLE.split(""), []);
  const letterAnims = useRef(letters.map(() => new Animated.Value(0))).current;

  const subtitleOpacity = useRef(new Animated.Value(0)).current;
  const subtitleY = useRef(new Animated.Value(8)).current;

  // exit
  const screenOpacity = useRef(new Animated.Value(1)).current;
  const screenScale = useRef(new Animated.Value(1)).current;

  // idle "still working" breathing pulse
  const pulse = useRef(new Animated.Value(1)).current;

  const [introDone, setIntroDone] = useState(false);
  const waitForRef = useRef(waitFor);
  waitForRef.current = waitFor;

  const size = 120;
  const stroke = 6;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;

  useEffect(() => {
    SplashScreen.hideAsync().catch(() => {});

    // continuous slow ring rotation, runs for the whole splash lifetime
    Animated.loop(
      Animated.timing(ringSpinAnim, {
        toValue: 1,
        duration: 6000,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
    ).start();

    // orbiting particles, opposite direction, faster
    Animated.loop(
      Animated.timing(orbitAnim, {
        toValue: 1,
        duration: 4000,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
    ).start();

    Animated.sequence([
      // 1. iris reveal wipes the background in
      Animated.timing(revealScale, {
        toValue: 1,
        duration: 550,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      // 2. ring draws + glow blooms + logo pops in with a little wobble
      Animated.parallel([
        Animated.timing(ringProgress, {
          toValue: 1,
          duration: 700,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: false, // strokeDashoffset can't use native driver
        }),
        Animated.timing(glowOpacity, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.spring(glowScale, {
          toValue: 1,
          friction: 6,
          tension: 60,
          useNativeDriver: true,
        }),
        Animated.spring(logoScale, {
          toValue: 1,
          friction: 5,
          tension: 80,
          useNativeDriver: true,
        }),
        Animated.timing(logoOpacity, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.sequence([
          Animated.timing(logoWobble, {
            toValue: 1,
            duration: 180,
            useNativeDriver: true,
          }),
          Animated.timing(logoWobble, {
            toValue: -1,
            duration: 180,
            useNativeDriver: true,
          }),
          Animated.timing(logoWobble, {
            toValue: 0,
            duration: 150,
            useNativeDriver: true,
          }),
        ]),
      ]),
      // 3. title letters cascade in
      Animated.stagger(
        28,
        letterAnims.map((a) =>
          Animated.timing(a, {
            toValue: 1,
            duration: 220,
            easing: Easing.out(Easing.quad),
            useNativeDriver: true,
          }),
        ),
      ),
      // 4. subtitle
      Animated.parallel([
        Animated.timing(subtitleOpacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(subtitleY, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]),
    ]).start(() => setIntroDone(true));
  }, []);

  // Once the intro has played, either exit immediately (auth already
  // resolved) or gently pulse the logo/glow while we keep waiting.
  useEffect(() => {
    if (!introDone) return;

    if (!waitForRef.current) {
      playExit();
      return;
    }

    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 0.85,
          duration: 550,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulse, {
          toValue: 1,
          duration: 550,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ]),
    );
    loop.start();

    return () => loop.stop();
  }, [introDone]);

  // Watch for waitFor turning false *after* the intro is done.
  useEffect(() => {
    if (introDone && !waitFor) {
      pulse.stopAnimation();
      playExit();
    }
  }, [waitFor, introDone]);

  const exitedRef = useRef(false);
  const playExit = () => {
    if (exitedRef.current) return;
    exitedRef.current = true;

    Animated.parallel([
      Animated.timing(screenOpacity, {
        toValue: 0,
        duration: 350,
        useNativeDriver: true,
      }),
      Animated.timing(screenScale, {
        toValue: 1.08,
        duration: 350,
        useNativeDriver: true,
      }),
    ]).start(() => onFinish());
  };

  const strokeDashoffset = ringProgress.interpolate({
    inputRange: [0, 1],
    outputRange: [circumference, 0],
  });

  const ringSpin = ringSpinAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });
  const orbitSpin = orbitAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "-360deg"],
  });
  const wobbleRotate = logoWobble.interpolate({
    inputRange: [-1, 1],
    outputRange: ["-8deg", "8deg"],
  });

  const orbitDots = [0, 120, 240];

  return (
    <Animated.View
      style={[
        styles.container,
        {
          opacity: screenOpacity,
          transform: [{ scale: screenScale }],
        },
      ]}
      pointerEvents="none"
    >
      {/* Iris reveal wipe */}
      <View style={styles.centerFill}>
        <Animated.View
          style={[
            styles.revealCircle,
            {
              backgroundColor: theme.primary,
              width: REVEAL_SIZE,
              height: REVEAL_SIZE,
              borderRadius: REVEAL_SIZE / 2,
              transform: [{ scale: revealScale }],
            },
          ]}
        />
      </View>

      {/* Content */}
      <View style={styles.centerFill}>
        <View style={styles.logoArea}>
          {/* soft glow */}
          <Animated.View
            style={[
              styles.glow,
              {
                opacity: glowOpacity,
                transform: [{ scale: Animated.multiply(glowScale, pulse) }],
              },
            ]}
          />

          {/* orbiting particles */}
          <Animated.View
            style={[styles.orbitLayer, { transform: [{ rotate: orbitSpin }] }]}
          >
            {orbitDots.map((angle) => (
              <View
                key={angle}
                style={[
                  styles.orbitDot,
                  {
                    transform: [
                      { rotate: `${angle}deg` },
                      { translateY: -(size / 2 + 16) },
                    ],
                  },
                ]}
              />
            ))}
          </Animated.View>

          {/* ring + logo */}
          <View
            style={{
              width: size,
              height: size,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Animated.View style={{ transform: [{ rotate: ringSpin }] }}>
              <Svg width={size} height={size}>
                <Defs>
                  <LinearGradient
                    id="ringGrad"
                    x1="0%"
                    y1="0%"
                    x2="100%"
                    y2="100%"
                  >
                    <Stop offset="0%" stopColor="#ffffff" stopOpacity={1} />
                    <Stop
                      offset="100%"
                      stopColor="#ffffff"
                      stopOpacity={0.35}
                    />
                  </LinearGradient>
                </Defs>
                <Circle
                  cx={size / 2}
                  cy={size / 2}
                  r={radius}
                  stroke="rgba(255,255,255,0.18)"
                  strokeWidth={stroke}
                  fill="transparent"
                />
                <AnimatedCircle
                  cx={size / 2}
                  cy={size / 2}
                  r={radius}
                  stroke="url(#ringGrad)"
                  strokeWidth={stroke}
                  fill="transparent"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                  rotation="-90"
                  origin={`${size / 2}, ${size / 2}`}
                />
              </Svg>
            </Animated.View>

            <Animated.View
              style={{
                position: "absolute",
                opacity: logoOpacity,
                transform: [
                  { scale: Animated.multiply(logoScale, pulse) },
                  { rotate: wobbleRotate },
                ],
              }}
            >
              <Ionicons name="school-outline" size={44} color="#fff" />
            </Animated.View>
          </View>
        </View>

        <View style={styles.titleRow}>
          {letters.map((ch, i) => (
            <Animated.Text
              key={i}
              style={[
                styles.title,
                {
                  opacity: letterAnims[i],
                  transform: [
                    {
                      translateY: letterAnims[i].interpolate({
                        inputRange: [0, 1],
                        outputRange: [10, 0],
                      }),
                    },
                  ],
                },
              ]}
            >
              {ch === " " ? "\u00A0" : ch}
            </Animated.Text>
          ))}
        </View>

        <Animated.Text
          style={[
            styles.subtitle,
            {
              opacity: subtitleOpacity,
              transform: [{ translateY: subtitleY }],
            },
          ]}
        >
          Manage smarter, teach better
        </Animated.Text>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFill,
    zIndex: 999,
    overflow: "hidden",
  },
  centerFill: {
    ...StyleSheet.absoluteFill,
    alignItems: "center",
    justifyContent: "center",
  },
  revealCircle: {
    position: "absolute",
  },
  logoArea: {
    width: 172,
    height: 172,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 18,
  },
  glow: {
    position: "absolute",
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: "rgba(255,255,255,0.22)",
  },
  orbitLayer: {
    ...StyleSheet.absoluteFill,
    alignItems: "center",
    justifyContent: "center",
  },
  orbitDot: {
    position: "absolute",
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#fff",
    opacity: 0.65,
  },
  titleRow: {
    flexDirection: "row",
  },
  title: {
    fontSize: 22,
    fontWeight: "800",
    color: "#fff",
  },
  subtitle: {
    fontSize: 13,
    color: "rgba(255,255,255,0.75)",
    marginTop: 6,
  },
});
