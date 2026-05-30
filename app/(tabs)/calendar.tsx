import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, SafeAreaView } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Colors } from '../../src/constants/colors';
import { Spacing } from '../../src/constants/typography';
import { getUpcomingVaccines } from '../../src/db/vaccines';
import { formatDate, getVaccineStatus } from '../../src/utils/dates';

export default function CalendarScreen() {
  const { t: tc, i18n } = useTranslation('common');
  const [upcoming, setUpcoming] = useState<any[]>([]);

  useEffect(() => { getUpcomingVaccines(90).then(setUpcoming); }, []);

  const overdueCount = upcoming.filter(v => getVaccineStatus(v.next_due) === 'overdue').length;
  const dueSoonCount = upcoming.filter(v => getVaccineStatus(v.next_due) === 'due_soon').length;

  const STATUS_CONFIG = {
    overdue:    { label: tc('time.overdue'),  bg: Colors.semantic.dangerBg,  color: Colors.semantic.danger,  dot: Colors.semantic.danger,  icon: '🚨' },
    due_soon:   { label: tc('time.due_soon'), bg: Colors.semantic.warningBg, color: Colors.semantic.warning, dot: Colors.semantic.warning, icon: '⚠️' },
    up_to_date: { label: tc('time.upcoming'), bg: Colors.semantic.infoBg,    color: Colors.semantic.info,    dot: Colors.semantic.info,    icon: '📅' },
  };

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={upcoming}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <View>
            <Text style={styles.title}>{tc('nav.calendar')}</Text>
            {upcoming.length > 0 && (
              <View style={styles.summaryRow}>
                {overdueCount > 0 && (
                  <View style={[styles.chip, { backgroundColor: Colors.semantic.dangerBg }]}>
                    <Text style={styles.chipEmoji}>🚨</Text>
                    <Text style={[styles.chipText, { color: Colors.semantic.danger }]}>
                      {overdueCount} {tc('time.overdue').toLowerCase()}
                    </Text>
                  </View>
                )}
                {dueSoonCount > 0 && (
                  <View style={[styles.chip, { backgroundColor: Colors.semantic.warningBg }]}>
                    <Text style={styles.chipEmoji}>⚠️</Text>
                    <Text style={[styles.chipText, { color: Colors.semantic.warning }]}>
                      {dueSoonCount} {tc('time.due_soon').toLowerCase()}
                    </Text>
                  </View>
                )}
                {overdueCount === 0 && dueSoonCount === 0 && (
                  <View style={[styles.chip, { backgroundColor: Colors.semantic.successBg }]}>
                    <Text style={styles.chipEmoji}>✅</Text>
                    <Text style={[styles.chipText, { color: Colors.semantic.success }]}>{tc('health_screen.all_good')}</Text>
                  </View>
                )}
              </View>
            )}
            {upcoming.length > 0 && <Text style={styles.sectionLabel}>{tc('calendar_screen.next_90')}</Text>}
          </View>
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            <View style={styles.emptyIconWrap}>
              <Text style={styles.emptyEmoji}>📅</Text>
            </View>
            <Text style={styles.emptyTitle}>{tc('calendar_screen.no_events')}</Text>
            <Text style={styles.emptySub}>{tc('calendar_screen.no_events_sub')}</Text>
          </View>
        }
        renderItem={({ item }) => {
          const status = getVaccineStatus(item.next_due);
          const cfg = STATUS_CONFIG[status];
          return (
            <View style={styles.card}>
              <View style={[styles.cardLeft, { backgroundColor: cfg.bg }]}>
                <Text style={styles.cardIcon}>{cfg.icon}</Text>
              </View>
              <View style={styles.cardBody}>
                <Text style={styles.cardName} numberOfLines={1}>{item.name}</Text>
                <Text style={styles.cardPet} numberOfLines={1}>🐾 {item.pet_name}</Text>
                <Text style={[styles.cardDate, { color: cfg.color }]}>{formatDate(item.next_due, i18n.language)}</Text>
              </View>
              <View style={[styles.statusBadge, { backgroundColor: cfg.bg }]}>
                <View style={[styles.statusDot, { backgroundColor: cfg.dot }]} />
                <Text style={[styles.statusText, { color: cfg.color }]}>{cfg.label}</Text>
              </View>
            </View>
          );
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  content: { padding: Spacing.lg, paddingBottom: 120 },
  title: { fontSize: 26, fontWeight: '800', color: Colors.neutral[900], letterSpacing: -0.5, marginBottom: Spacing.lg },
  summaryRow: { flexDirection: 'row', gap: 8, marginBottom: Spacing.lg, flexWrap: 'wrap' },
  chip: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 12, paddingVertical: 7, borderRadius: 20 },
  chipEmoji: { fontSize: 14 },
  chipText: { fontSize: 13, fontWeight: '700' },
  sectionLabel: { fontSize: 13, fontWeight: '700', color: Colors.neutral[500], marginBottom: 12 },
  card: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.card, borderRadius: 18, marginBottom: 10, overflow: 'hidden', borderWidth: 1, borderColor: Colors.cardBorder, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 3, gap: 14, paddingRight: 14 },
  cardLeft: { width: 60, height: 70, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  cardIcon: { fontSize: 26 },
  cardBody: { flex: 1, paddingVertical: 14, gap: 3 },
  cardName: { fontSize: 15, fontWeight: '700', color: Colors.neutral[900] },
  cardPet: { fontSize: 12, color: Colors.neutral[500] },
  cardDate: { fontSize: 12, fontWeight: '600', marginTop: 2 },
  statusBadge: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 12 },
  statusDot: { width: 6, height: 6, borderRadius: 3 },
  statusText: { fontSize: 11, fontWeight: '700' },
  empty: { alignItems: 'center', paddingTop: 80 },
  emptyIconWrap: { width: 100, height: 100, borderRadius: 50, backgroundColor: Colors.brand.primaryLight, alignItems: 'center', justifyContent: 'center', marginBottom: Spacing.lg },
  emptyEmoji: { fontSize: 48 },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: Colors.neutral[800] },
  emptySub: { fontSize: 13, color: Colors.neutral[500], textAlign: 'center', marginTop: 8, lineHeight: 18, maxWidth: 240 },
});
