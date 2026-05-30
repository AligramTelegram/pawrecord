import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, SafeAreaView } from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { usePetsStore } from '../../src/store/pets';
import { PetCard } from '../../src/components/pets/PetCard';
import { Colors } from '../../src/constants/colors';
import { Spacing } from '../../src/constants/typography';
import { getUpcomingVaccines } from '../../src/db/vaccines';
import { getVaccineStatus } from '../../src/utils/dates';

export default function PetsScreen() {
  const { t } = useTranslation('pets');
  const { t: tc } = useTranslation('common');
  const router = useRouter();
  const { pets, loadPets, loading } = usePetsStore();
  const [overdueCount, setOverdueCount] = useState(0);
  const [dueSoonCount, setDueSoonCount] = useState(0);

  useEffect(() => {
    loadPets();
    getUpcomingVaccines(30).then((vaccines) => {
      setOverdueCount(vaccines.filter(v => getVaccineStatus(v.next_due) === 'overdue').length);
      setDueSoonCount(vaccines.filter(v => getVaccineStatus(v.next_due) === 'due_soon').length);
    });
  }, []);

  const hasAlert = overdueCount > 0 || dueSoonCount > 0;

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={pets}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <View>
            <View style={styles.header}>
              <View>
                <Text style={styles.greeting}>{tc('home.greeting')}</Text>
                <Text style={styles.title}>{t('title')}</Text>
              </View>
              <View style={styles.headerRight}>
                <Text style={styles.petCount}>
                  {tc(pets.length === 1 ? 'home.pet_count_one' : 'home.pet_count_other', { count: pets.length })}
                </Text>
              </View>
            </View>

            {hasAlert && (
              <TouchableOpacity
                style={[styles.alertBanner, overdueCount > 0 ? styles.alertDanger : styles.alertWarning]}
                onPress={() => router.push('/(tabs)/calendar')}
                activeOpacity={0.85}
              >
                <View style={styles.alertLeft}>
                  <Text style={styles.alertEmoji}>{overdueCount > 0 ? '🚨' : '⚠️'}</Text>
                  <View>
                    <Text style={[styles.alertTitle, { color: overdueCount > 0 ? Colors.semantic.danger : Colors.semantic.warning }]}>
                      {overdueCount > 0
                        ? tc(overdueCount === 1 ? 'home.overdue_alert_one' : 'home.overdue_alert_other', { count: overdueCount })
                        : tc(dueSoonCount === 1 ? 'home.due_soon_alert_one' : 'home.due_soon_alert_other', { count: dueSoonCount })}
                    </Text>
                    <Text style={styles.alertSub}>{tc('home.view_calendar')}</Text>
                  </View>
                </View>
              </TouchableOpacity>
            )}

            {pets.length > 0 && (
              <View style={styles.statsRow}>
                <View style={styles.statCard}>
                  <Text style={styles.statNum}>{pets.length}</Text>
                  <Text style={styles.statLabel}>{t('title')}</Text>
                </View>
                <View style={[styles.statCard, { backgroundColor: '#FFF0F6' }]}>
                  <Text style={[styles.statNum, { color: '#FF6B9D' }]}>{dueSoonCount}</Text>
                  <Text style={styles.statLabel}>{tc('time.due_soon')}</Text>
                </View>
                <View style={[styles.statCard, { backgroundColor: Colors.semantic.dangerBg }]}>
                  <Text style={[styles.statNum, { color: Colors.semantic.danger }]}>{overdueCount}</Text>
                  <Text style={styles.statLabel}>{tc('time.overdue')}</Text>
                </View>
              </View>
            )}

            {pets.length > 0 && <Text style={styles.sectionLabel}>{tc('home.your_pets')}</Text>}
          </View>
        }
        renderItem={({ item }) => (
          <PetCard pet={item} onPress={() => router.push(`/pet/${item.id}`)} />
        )}
        ListEmptyComponent={
          !loading ? (
            <View style={styles.empty}>
              <View style={styles.emptyIconWrap}>
                <Text style={styles.emptyEmoji}>🐾</Text>
              </View>
              <Text style={styles.emptyTitle}>{t('empty_title')}</Text>
              <Text style={styles.emptySub}>{t('empty_subtitle')}</Text>
              <TouchableOpacity
                style={styles.emptyBtn}
                onPress={() => router.push('/pet/new')}
                activeOpacity={0.85}
                accessibilityLabel={t('empty_cta')}
                accessibilityRole="button"
              >
                <Text style={styles.emptyBtnText}>+ {t('empty_cta')}</Text>
              </TouchableOpacity>
            </View>
          ) : null
        }
      />
      <TouchableOpacity
        style={styles.fab}
        onPress={() => router.push('/pet/new')}
        activeOpacity={0.85}
        accessibilityLabel={tc('forms.add_pet')}
        accessibilityRole="button"
      >
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  list: { paddingHorizontal: Spacing.lg, paddingBottom: 140 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: Spacing.lg, paddingBottom: Spacing.md },
  greeting: { fontSize: 13, color: Colors.neutral[500], fontWeight: '500', marginBottom: 2 },
  title: { fontSize: 26, fontWeight: '800', color: Colors.neutral[900], letterSpacing: -0.5 },
  headerRight: { backgroundColor: Colors.brand.primaryLight, paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20 },
  petCount: { fontSize: 13, fontWeight: '700', color: Colors.brand.primary },
  alertBanner: { borderRadius: 16, padding: 14, marginBottom: 14 },
  alertDanger: { backgroundColor: Colors.semantic.dangerBg, borderWidth: 1, borderColor: Colors.semantic.danger + '30' },
  alertWarning: { backgroundColor: Colors.semantic.warningBg, borderWidth: 1, borderColor: Colors.semantic.warning + '30' },
  alertLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  alertEmoji: { fontSize: 26 },
  alertTitle: { fontSize: 14, fontWeight: '700' },
  alertSub: { fontSize: 11, color: Colors.neutral[500], marginTop: 2 },
  statsRow: { flexDirection: 'row', gap: 10, marginBottom: 20 },
  statCard: { flex: 1, backgroundColor: Colors.brand.primaryLight, borderRadius: 16, paddingVertical: 12, paddingHorizontal: 6, alignItems: 'center', gap: 2 },
  statNum: { fontSize: 22, fontWeight: '900', color: Colors.brand.primary },
  statLabel: { fontSize: 10, color: Colors.neutral[500], fontWeight: '500', textAlign: 'center' },
  sectionLabel: { fontSize: 13, fontWeight: '700', color: Colors.neutral[500], marginBottom: 12 },
  empty: { alignItems: 'center', paddingTop: 80 },
  emptyIconWrap: { width: 110, height: 110, borderRadius: 55, backgroundColor: Colors.brand.primaryLight, alignItems: 'center', justifyContent: 'center', marginBottom: Spacing.lg },
  emptyEmoji: { fontSize: 52 },
  emptyTitle: { fontSize: 20, fontWeight: '700', color: Colors.neutral[800] },
  emptySub: { fontSize: 14, color: Colors.neutral[500], textAlign: 'center', marginTop: 8, lineHeight: 20, maxWidth: 240 },
  emptyBtn: { marginTop: 20, backgroundColor: Colors.brand.primary, borderRadius: 28, paddingHorizontal: 28, paddingVertical: 14, shadowColor: Colors.brand.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.35, shadowRadius: 10, elevation: 6 },
  emptyBtnText: { color: '#fff', fontSize: 15, fontWeight: '700' },
  fab: { position: 'absolute', bottom: 110, right: 24, width: 60, height: 60, borderRadius: 30, backgroundColor: Colors.brand.primary, alignItems: 'center', justifyContent: 'center', shadowColor: Colors.brand.primary, shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.45, shadowRadius: 14, elevation: 10 },
  fabText: { color: '#fff', fontSize: 32, lineHeight: 36, fontWeight: '300' },
});
