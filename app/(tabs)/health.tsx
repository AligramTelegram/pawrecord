import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, SafeAreaView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Colors } from '../../src/constants/colors';
import { Spacing } from '../../src/constants/typography';
import { getUpcomingVaccines } from '../../src/db/vaccines';
import { formatDate } from '../../src/utils/dates';

export default function HealthScreen() {
  const { t: tc, i18n } = useTranslation('common');
  const it = (key: string) => i18n.t(key as any);
  const router = useRouter();
  const [upcoming, setUpcoming] = useState<any[]>([]);

  useEffect(() => { getUpcomingVaccines(60).then(setUpcoming); }, []);

  const ACTIONS = [
    { labelKey: 'health_screen.vaccine',    emoji: '💉', route: '/health/vaccine/new',   bg: '#EEF0FF', color: '#5B6EF5' },
    { labelKey: 'health_screen.medication', emoji: '💊', route: '/health/medication/new', bg: '#FFF0F6', color: '#FF6B9D' },
    { labelKey: 'health_screen.weight',     emoji: '⚖️', route: '/health/weight/new',    bg: '#E0FBF6', color: '#00C9A7' },
    { labelKey: 'health_screen.vet_visit',  emoji: '🏥', route: '/health/visit/new',     bg: '#FEF9E7', color: '#F39C12' },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>{tc('nav.health')}</Text>

        <Text style={styles.sectionLabel}>{tc('health_screen.quick_add')}</Text>
        <View style={styles.grid}>
          {ACTIONS.map((item) => (
            <TouchableOpacity
              key={item.route}
              style={[styles.gridCard, { backgroundColor: item.bg }]}
              onPress={() => router.push(item.route as any)}
              activeOpacity={0.8}
            >
              <View style={[styles.gridIconWrap, { backgroundColor: item.color + '20' }]}>
                <Text style={styles.gridEmoji}>{item.emoji}</Text>
              </View>
              <Text style={[styles.gridLabel, { color: item.color }]}>{it(item.labelKey)}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {upcoming.length > 0 && (
          <>
            <Text style={styles.sectionLabel}>{tc('health_screen.upcoming_vaccines')}</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.upcomingScroll}>
              {upcoming.map((item) => (
                <View key={item.id} style={styles.upcomingCard}>
                  <View style={styles.upcomingTop}>
                    <Text style={styles.upcomingEmoji}>💉</Text>
                    <View style={styles.dueBadge}>
                      <Text style={styles.dueBadgeText}>{tc('time.due_soon')}</Text>
                    </View>
                  </View>
                  <Text style={styles.upcomingName} numberOfLines={1}>{item.name}</Text>
                  <Text style={styles.upcomingPet} numberOfLines={1}>🐾 {item.pet_name}</Text>
                  <Text style={styles.upcomingDate}>{formatDate(item.next_due, i18n.language)}</Text>
                </View>
              ))}
            </ScrollView>
          </>
        )}

        {upcoming.length === 0 && (
          <View style={styles.allGood}>
            <Text style={styles.allGoodEmoji}>✅</Text>
            <Text style={styles.allGoodText}>{tc('health_screen.all_good')}</Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  content: { padding: Spacing.lg, paddingBottom: 120 },
  title: { fontSize: 26, fontWeight: '800', color: Colors.neutral[900], letterSpacing: -0.5, marginBottom: Spacing.xl },
  sectionLabel: { fontSize: 13, fontWeight: '700', color: Colors.neutral[500], marginBottom: 12, marginTop: 4 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: Spacing.xl },
  gridCard: { width: '47%', borderRadius: 20, padding: 18, gap: 10 },
  gridIconWrap: { width: 48, height: 48, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  gridEmoji: { fontSize: 26 },
  gridLabel: { fontSize: 14, fontWeight: '700' },
  upcomingScroll: { gap: 12, paddingBottom: 4, marginBottom: Spacing.xl },
  upcomingCard: { width: 150, backgroundColor: Colors.card, borderRadius: 18, padding: 16, gap: 6, borderWidth: 1, borderColor: Colors.cardBorder, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.07, shadowRadius: 8, elevation: 3 },
  upcomingTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  upcomingEmoji: { fontSize: 24 },
  dueBadge: { backgroundColor: Colors.semantic.warningBg, borderRadius: 8, paddingHorizontal: 7, paddingVertical: 3 },
  dueBadgeText: { fontSize: 10, fontWeight: '700', color: Colors.semantic.warning },
  upcomingName: { fontSize: 14, fontWeight: '700', color: Colors.neutral[900] },
  upcomingPet: { fontSize: 11, color: Colors.neutral[500] },
  upcomingDate: { fontSize: 12, fontWeight: '600', color: Colors.brand.primary, marginTop: 2 },
  allGood: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: Colors.semantic.successBg, borderRadius: 16, padding: 16, marginTop: 8 },
  allGoodEmoji: { fontSize: 22 },
  allGoodText: { fontSize: 14, fontWeight: '600', color: Colors.semantic.success },
});
