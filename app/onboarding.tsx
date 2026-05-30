import React, { useState, useRef } from 'react';
import {
  View, Text, StyleSheet, Dimensions, TouchableOpacity,
  SafeAreaView, Animated,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Colors } from '../src/constants/colors';
import { useSettingsStore } from '../src/store/settings';

const { width } = Dimensions.get('window');

const SLIDE_THEMES = [
  { emoji: '🐾', bg: '#EEF0FF', accent: '#5B6EF5' },
  { emoji: '🔔', bg: '#FFF0F6', accent: '#FF6B9D' },
  { emoji: '📄', bg: '#E0FBF6', accent: '#00C9A7' },
];

export default function OnboardingScreen() {
  const router = useRouter();
  const { setHasSeenOnboarding } = useSettingsStore();
  const { t: tc } = useTranslation('common');
  const [page, setPage] = useState(0);
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;

  const slides = tc('onboarding.slides', { returnObjects: true }) as Array<{
    title: string; sub: string; features: string[];
  }>;
  const theme = SLIDE_THEMES[page];
  const slide = Array.isArray(slides) ? slides[page] : null;
  const isLast = page === SLIDE_THEMES.length - 1;

  function finish() {
    setHasSeenOnboarding(true);
    router.replace('/paywall');
  }

  function goNext() {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 0, duration: 150, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: -30, duration: 150, useNativeDriver: true }),
    ]).start(() => {
      setPage(p => p + 1);
      slideAnim.setValue(30);
      Animated.parallel([
        Animated.timing(fadeAnim, { toValue: 1, duration: 200, useNativeDriver: true }),
        Animated.timing(slideAnim, { toValue: 0, duration: 200, useNativeDriver: true }),
      ]).start();
    });
  }

  if (!slide) return null;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.bg }]}>

      {/* Skip */}
      {!isLast && (
        <TouchableOpacity
          style={styles.skipBtn}
          onPress={finish}
          accessibilityLabel={tc('onboarding.skip')}
        >
          <Text style={[styles.skipText, { color: theme.accent }]}>{tc('onboarding.skip')}</Text>
        </TouchableOpacity>
      )}

      {/* Content */}
      <Animated.View style={[styles.content, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
        <View style={[styles.emojiBubble, { backgroundColor: theme.accent + '20' }]}>
          <View style={[styles.emojiInner, { backgroundColor: theme.accent + '30' }]}>
            <Text style={styles.emoji}>{theme.emoji}</Text>
          </View>
        </View>

        <Text style={[styles.title, { color: theme.accent }]}>{slide.title}</Text>
        <Text style={styles.sub}>{slide.sub}</Text>

        <View style={styles.features}>
          {(slide.features ?? []).map((f, i) => (
            <View key={i} style={[styles.featurePill, { backgroundColor: theme.accent + '15' }]}>
              <Text style={[styles.featureText, { color: theme.accent }]}>{f}</Text>
            </View>
          ))}
        </View>
      </Animated.View>

      {/* Bottom */}
      <View style={styles.bottom}>
        <View style={styles.dots}>
          {SLIDE_THEMES.map((_, i) => (
            <View
              key={i}
              style={[
                styles.dot,
                { backgroundColor: i === page ? theme.accent : theme.accent + '30' },
                i === page && styles.dotActive,
              ]}
            />
          ))}
        </View>

        <TouchableOpacity
          style={[styles.cta, { backgroundColor: theme.accent }]}
          onPress={isLast ? finish : goNext}
          activeOpacity={0.85}
          accessibilityLabel={isLast ? tc('onboarding.get_started') : tc('onboarding.next')}
        >
          <Text style={styles.ctaText}>
            {isLast ? tc('onboarding.get_started') : tc('onboarding.next')}
          </Text>
        </TouchableOpacity>

        {isLast && (
          <TouchableOpacity
            onPress={() => { setHasSeenOnboarding(true); router.replace('/(tabs)'); }}
            accessibilityLabel={tc('onboarding.free_plan')}
          >
            <Text style={[styles.freeText, { color: theme.accent }]}>{tc('onboarding.free_plan')}</Text>
          </TouchableOpacity>
        )}
      </View>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  skipBtn: { alignSelf: 'flex-end', padding: 20, paddingBottom: 0 },
  skipText: { fontSize: 15, fontWeight: '600' },

  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },

  emojiBubble: {
    width: 160,
    height: 160,
    borderRadius: 80,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 36,
  },
  emojiInner: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emoji: { fontSize: 64 },

  title: {
    fontSize: 30,
    fontWeight: '800',
    textAlign: 'center',
    letterSpacing: -0.5,
    lineHeight: 36,
    marginBottom: 14,
  },
  sub: {
    fontSize: 16,
    color: Colors.neutral[500],
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 28,
  },

  features: { gap: 10, alignItems: 'flex-start', alignSelf: 'stretch', paddingHorizontal: 16 },
  featurePill: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  featureText: { fontSize: 14, fontWeight: '600' },

  bottom: { paddingHorizontal: 28, paddingBottom: 36, gap: 16, alignItems: 'center' },
  dots: { flexDirection: 'row', gap: 8 },
  dot: { height: 8, borderRadius: 4, width: 8 },
  dotActive: { width: 24 },

  cta: {
    width: width - 56,
    paddingVertical: 18,
    borderRadius: 32,
    alignItems: 'center',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  ctaText: { color: '#fff', fontSize: 17, fontWeight: '800', letterSpacing: 0.2 },
  freeText: { fontSize: 14, fontWeight: '500', opacity: 0.7 },
});
