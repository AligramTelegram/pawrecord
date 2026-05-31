import React, { useEffect, useState } from 'react';
import {
  View, Text, ScrollView, StyleSheet, SafeAreaView,
  TouchableOpacity, Alert, Image,
} from 'react-native';
import { useLocalSearchParams, useRouter, useNavigation } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { getPetById, Pet } from '../../src/db/pets';
import { getVaccinesByPet, Vaccine } from '../../src/db/vaccines';
import { getMedicationsByPet, Medication } from '../../src/db/medications';
import { getWeightsByPet, WeightLog } from '../../src/db/weights';
import { getVisitsByPet, VetVisit } from '../../src/db/visits';
import { Colors } from '../../src/constants/colors';
import { Spacing } from '../../src/constants/typography';
import { SPECIES_EMOJI } from '../../src/constants/species';
import { formatDate, getVaccineStatus, getPetAge } from '../../src/utils/dates';
import { formatCurrency } from '../../src/utils/currency';
import { usePetsStore } from '../../src/store/pets';
import { generatePetPDF } from '../../src/services/pdf-generator';
import { usePremium } from '../../src/hooks/usePremium';

const AVATAR_COLORS = ['#5B6EF5', '#FF6B9D', '#00C9A7', '#F39C12'];

export default function PetDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const navigation = useNavigation();
  const { t, i18n } = useTranslation('pets');
  const { t: tc } = useTranslation('common');

  const VACCINE_STATUS_COLOR = {
    overdue:    { bg: Colors.semantic.dangerBg,  text: Colors.semantic.danger,  label: tc('time.overdue')   },
    due_soon:   { bg: Colors.semantic.warningBg, text: Colors.semantic.warning, label: tc('time.due_soon')  },
    up_to_date: { bg: Colors.semantic.successBg, text: Colors.semantic.success, label: tc('time.upcoming')  },
  };
  const { removePet } = usePetsStore();
  const { isPremium, isLoading: premiumLoading } = usePremium();

  const [pet, setPet] = useState<Pet | null>(null);
  const [vaccines, setVaccines] = useState<Vaccine[]>([]);
  const [medications, setMedications] = useState<Medication[]>([]);
  const [weights, setWeights] = useState<WeightLog[]>([]);
  const [visits, setVisits] = useState<VetVisit[]>([]);

  useEffect(() => {
    if (!id) return;
    Promise.all([
      getPetById(id).then(setPet),
      getVaccinesByPet(id).then(setVaccines),
      getMedicationsByPet(id).then(setMedications),
      getWeightsByPet(id).then(setWeights),
      getVisitsByPet(id).then(setVisits),
    ]);
  }, [id]);

  useEffect(() => {
    if (pet) navigation.setOptions({ title: pet.name });
  }, [pet]);

  async function handleExportPDF() {
    if (premiumLoading) return; // RC yükleniyor, bekle
    if (!isPremium) { router.push('/paywall'); return; }
    if (!pet) return;
    await generatePetPDF({ pet, vaccines, medications, weights, visits });
  }

  function handleDelete() {
    Alert.alert(
      tc('pet_detail.delete_title', { name: pet?.name }),
      tc('pet_detail.delete_msg'),
      [
        { text: tc('actions.cancel'), style: 'cancel' },
        { text: tc('actions.delete'), style: 'destructive', onPress: async () => { await removePet(id!); router.back(); } },
      ]
    );
  }

  if (!pet) return null;

  const age = getPetAge(pet.date_of_birth);
  const emoji = SPECIES_EMOJI[pet.species as keyof typeof SPECIES_EMOJI] ?? '🐾';
  const avatarColor = AVATAR_COLORS[pet.name.charCodeAt(0) % AVATAR_COLORS.length];
  const ageStr = age.years > 0
    ? `${age.years}y${age.months > 0 ? ` ${age.months}m` : ''}`
    : age.months > 0 ? `${age.months}m` : null;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

        {/* Hero */}
        <View style={styles.hero}>
          <View style={[styles.avatarRing, { borderColor: avatarColor + '40' }]}>
            {pet.photo_uri ? (
              <Image source={{ uri: pet.photo_uri }} style={styles.avatarImg} />
            ) : (
              <View style={[styles.avatarFallback, { backgroundColor: avatarColor + '20' }]}>
                <Text style={styles.avatarEmoji}>{emoji}</Text>
              </View>
            )}
          </View>

          <Text style={styles.petName}>{pet.name}</Text>

          <View style={styles.tagRow}>
            <View style={[styles.tag, { backgroundColor: avatarColor + '18' }]}>
              <Text style={[styles.tagText, { color: avatarColor }]}>
                {i18n.t(`pets:species.${pet.species}` as any)}
              </Text>
            </View>
            {pet.breed ? (
              <View style={styles.tag}>
                <Text style={styles.tagText}>{pet.breed}</Text>
              </View>
            ) : null}
            {ageStr ? (
              <View style={styles.tag}>
                <Text style={styles.tagText}>🎂 {ageStr}</Text>
              </View>
            ) : null}
          </View>

          <View style={styles.heroActions}>
            <TouchableOpacity style={styles.remindersBtn} onPress={() => router.push(`/reminders/${id}` as any)} accessibilityLabel={tc('reminders.title')} accessibilityRole="button">
              <Text style={styles.remindersBtnEmoji}>⏰</Text>
              <Text style={styles.remindersBtnText}>{tc('reminders.title')}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.pdfBtn} onPress={handleExportPDF} accessibilityLabel={tc('pet_detail.export_pdf')} accessibilityRole="button">
              <Text style={styles.pdfBtnEmoji}>📄</Text>
              <Text style={styles.pdfBtnText}>PDF{!isPremium ? ' ⭐' : ''}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.deleteBtn} onPress={handleDelete} accessibilityLabel={tc('actions.delete')} accessibilityRole="button">
              <Text style={styles.deleteBtnEmoji}>🗑️</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Stats bar */}
        <View style={styles.statsBar}>
          {[
            { label: tc('pet_detail.vaccines_stat'),  count: vaccines.length,    emoji: '💉' },
            { label: tc('pet_detail.meds_stat'),      count: medications.length,  emoji: '💊' },
            { label: tc('pet_detail.visits_stat'),    count: visits.length,       emoji: '🏥' },
          ].map((s) => (
            <View key={s.label} style={styles.stat}>
              <Text style={styles.statEmoji}>{s.emoji}</Text>
              <Text style={styles.statCount}>{s.count}</Text>
              <Text style={styles.statLabel}>{s.label}</Text>
            </View>
          ))}
        </View>

        {/* Vaccines */}
        <SectionHeader
          emoji="💉" title={t('sections.vaccines')} color="#5B6EF5"
          onAdd={() => router.push({ pathname: '/health/vaccine/new', params: { petId: id } })}
        />
        {vaccines.length === 0 && <EmptySection label={tc('pet_detail.no_vaccines')} />}
        {vaccines.map((v) => {
          const st = getVaccineStatus(v.next_due);
          const cfg = VACCINE_STATUS_COLOR[st];
          return (
            <View key={v.id} style={styles.card}>
              <View style={styles.cardIconWrap}>
                <Text style={styles.cardIcon}>💉</Text>
              </View>
              <View style={styles.cardBody}>
                <Text style={styles.cardTitle}>{v.name}</Text>
                <Text style={styles.cardMeta}>{i18n.t('health:vaccine.fields.date_given' as any)}: {formatDate(v.date_given, i18n.language)}</Text>
                {v.next_due ? (
                  <Text style={styles.cardMeta}>{i18n.t('health:vaccine.fields.next_due' as any)}: {formatDate(v.next_due, i18n.language)}</Text>
                ) : null}
              </View>
              <View style={[styles.statusBadge, { backgroundColor: cfg.bg }]}>
                <Text style={[styles.statusText, { color: cfg.text }]}>{cfg.label}</Text>
              </View>
            </View>
          );
        })}

        {/* Medications */}
        <SectionHeader
          emoji="💊" title={t('sections.medications')} color="#FF6B9D"
          onAdd={() => router.push({ pathname: '/health/medication/new', params: { petId: id } })}
        />
        {medications.length === 0 && <EmptySection label={tc('pet_detail.no_medications')} />}
        {medications.map((m) => (
          <View key={m.id} style={styles.card}>
            <View style={[styles.cardIconWrap, { backgroundColor: '#FFF0F6' }]}>
              <Text style={styles.cardIcon}>💊</Text>
            </View>
            <View style={styles.cardBody}>
              <Text style={styles.cardTitle}>{m.name}</Text>
              <Text style={styles.cardMeta}>{m.dosage} · {m.frequency}</Text>
              {m.start_date ? <Text style={styles.cardMeta}>{i18n.t('health:medication.fields.start_date' as any)}: {formatDate(m.start_date, i18n.language)}</Text> : null}
            </View>
          </View>
        ))}

        {/* Weight */}
        <SectionHeader
          emoji="⚖️" title={t('sections.weight')} color="#00C9A7"
          onAdd={() => router.push({ pathname: '/health/weight/new', params: { petId: id } })}
        />
        {weights.length === 0 && <EmptySection label={tc('pet_detail.no_weight')} />}
        {weights.length > 0 && (
          <View style={styles.weightChart}>
            {weights.slice(0, 6).reverse().map((w, i) => {
              const max = Math.max(...weights.slice(0, 6).map(x => x.weight_kg));
              const pct = max > 0 ? (w.weight_kg / max) : 1;
              return (
                <View key={w.id} style={styles.weightBar}>
                  <Text style={styles.weightVal}>{w.weight_kg}</Text>
                  <View style={styles.weightBarBg}>
                    <View style={[styles.weightBarFill, { height: `${Math.max(pct * 100, 10)}%` }]} />
                  </View>
                  <Text style={styles.weightDate} numberOfLines={1}>
                    {formatDate(w.date, i18n.language, 'MMM d')}
                  </Text>
                </View>
              );
            })}
          </View>
        )}

        {/* Vet Visits */}
        <SectionHeader
          emoji="🏥" title={t('sections.visits')} color="#F39C12"
          onAdd={() => router.push({ pathname: '/health/visit/new', params: { petId: id } })}
        />
        {visits.length === 0 && <EmptySection label={tc('pet_detail.no_visits')} />}
        {visits.map((v) => (
          <View key={v.id} style={styles.card}>
            <View style={[styles.cardIconWrap, { backgroundColor: '#FEF9E7' }]}>
              <Text style={styles.cardIcon}>🏥</Text>
            </View>
            <View style={styles.cardBody}>
              <Text style={styles.cardTitle}>{v.reason}</Text>
              <Text style={styles.cardMeta}>{formatDate(v.date, i18n.language)}</Text>
              {v.vet_name ? <Text style={styles.cardMeta}>{tc('pet_detail_labels.dr_prefix')} {v.vet_name}</Text> : null}
              {v.cost ? <Text style={styles.cardMeta}>{formatCurrency(v.cost, i18n.language)}</Text> : null}
            </View>
          </View>
        ))}

      </ScrollView>
    </SafeAreaView>
  );
}

function SectionHeader({ emoji, title, color, onAdd }: { emoji: string; title: string; color: string; onAdd: () => void }) {
  const { t: tc } = useTranslation('common');
  return (
    <View style={sectionStyles.row}>
      <View style={sectionStyles.left}>
        <Text style={sectionStyles.emoji}>{emoji}</Text>
        <Text style={sectionStyles.title}>{title}</Text>
      </View>
      <TouchableOpacity onPress={onAdd} style={[sectionStyles.btn, { backgroundColor: color + '18' }]}>
        <Text style={[sectionStyles.btnText, { color }]}>+ {tc('actions.add')}</Text>
      </TouchableOpacity>
    </View>
  );
}

function EmptySection({ label }: { label: string }) {
  return (
    <View style={emptyStyles.wrap}>
      <Text style={emptyStyles.text}>{label}</Text>
    </View>
  );
}

const emptyStyles = StyleSheet.create({
  wrap: {
    backgroundColor: Colors.neutral[100],
    borderRadius: 14,
    paddingVertical: 20,
    alignItems: 'center',
    marginBottom: 12,
  },
  text: { fontSize: 13, color: Colors.neutral[400], fontStyle: 'italic' },
});

const sectionStyles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: Spacing.xl,
    marginBottom: 10,
  },
  left: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  emoji: { fontSize: 18 },
  title: { fontSize: 17, fontWeight: '700', color: Colors.neutral[900] },
  btn: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
  },
  btnText: { fontSize: 13, fontWeight: '700' },
});

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  content: { paddingBottom: 120 },

  // Hero
  hero: { alignItems: 'center', paddingTop: Spacing.xl, paddingBottom: Spacing.lg, paddingHorizontal: Spacing.lg },
  avatarRing: {
    width: 108,
    height: 108,
    borderRadius: 54,
    borderWidth: 3,
    padding: 4,
    marginBottom: Spacing.md,
  },
  avatarImg: { width: '100%', height: '100%', borderRadius: 48 },
  avatarFallback: {
    width: '100%',
    height: '100%',
    borderRadius: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarEmoji: { fontSize: 52 },
  petName: {
    fontSize: 28,
    fontWeight: '800',
    color: Colors.neutral[900],
    letterSpacing: -0.5,
    marginBottom: 10,
  },
  tagRow: { flexDirection: 'row', gap: 8, flexWrap: 'wrap', justifyContent: 'center', marginBottom: Spacing.lg },
  tag: {
    backgroundColor: Colors.neutral[150],
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 5,
  },
  tagText: { fontSize: 12, fontWeight: '600', color: Colors.neutral[600] },
  heroActions: { flexDirection: 'row', gap: 10 },
  remindersBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    backgroundColor: '#FEF9E7', borderRadius: 20,
    paddingHorizontal: 14, paddingVertical: 10,
    borderWidth: 1, borderColor: '#F39C1230',
  },
  remindersBtnEmoji: { fontSize: 15 },
  remindersBtnText: { color: '#F39C12', fontWeight: '700', fontSize: 12 },
  pdfBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: Colors.brand.primary, borderRadius: 20,
    paddingHorizontal: 14, paddingVertical: 10,
    shadowColor: Colors.brand.primary, shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3, shadowRadius: 6, elevation: 4,
  },
  pdfBtnEmoji: { fontSize: 16 },
  pdfBtnText: { color: '#fff', fontWeight: '700', fontSize: 13 },
  deleteBtn: {
    width: 42, height: 42, borderRadius: 14,
    backgroundColor: Colors.semantic.dangerBg,
    alignItems: 'center', justifyContent: 'center',
  },
  deleteBtnEmoji: { fontSize: 18 },

  // Stats bar
  statsBar: {
    flexDirection: 'row',
    marginHorizontal: Spacing.lg,
    backgroundColor: Colors.card,
    borderRadius: 20,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  stat: { flex: 1, alignItems: 'center', gap: 2 },
  statEmoji: { fontSize: 22 },
  statCount: { fontSize: 20, fontWeight: '800', color: Colors.neutral[900] },
  statLabel: { fontSize: 11, color: Colors.neutral[400], fontWeight: '500' },

  // Cards
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.card,
    borderRadius: 16,
    marginHorizontal: Spacing.lg,
    marginBottom: 10,
    padding: 14,
    gap: 12,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  cardIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: Colors.brand.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  cardIcon: { fontSize: 22 },
  cardBody: { flex: 1, gap: 3 },
  cardTitle: { fontSize: 15, fontWeight: '700', color: Colors.neutral[900] },
  cardMeta: { fontSize: 12, color: Colors.neutral[500] },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
    flexShrink: 0,
  },
  statusText: { fontSize: 11, fontWeight: '700' },

  // Weight chart
  weightChart: {
    flexDirection: 'row',
    backgroundColor: Colors.card,
    borderRadius: 20,
    marginHorizontal: Spacing.lg,
    marginBottom: 12,
    padding: 16,
    gap: 8,
    alignItems: 'flex-end',
    height: 140,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  weightBar: { flex: 1, alignItems: 'center', gap: 4, height: '100%', justifyContent: 'flex-end' },
  weightVal: { fontSize: 9, color: Colors.neutral[500], fontWeight: '600' },
  weightBarBg: {
    flex: 1,
    width: '60%',
    backgroundColor: Colors.neutral[100],
    borderRadius: 6,
    justifyContent: 'flex-end',
    overflow: 'hidden',
  },
  weightBarFill: {
    width: '100%',
    backgroundColor: Colors.brand.tertiary,
    borderRadius: 6,
  },
  weightDate: { fontSize: 8, color: Colors.neutral[400], textAlign: 'center' },
});
