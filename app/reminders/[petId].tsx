import React, { useEffect, useState } from 'react';
import {
  View, Text, ScrollView, StyleSheet, SafeAreaView,
  TouchableOpacity, Switch, Alert, Modal, Linking,
} from 'react-native';
import { useLocalSearchParams, useNavigation } from 'expo-router';
import { useTranslation } from 'react-i18next';
import DateTimePicker from '@react-native-community/datetimepicker';
import {
  Reminder, ReminderType, getRemindersByPet,
  createReminder, deleteReminder,
  updateReminderEnabled, updateReminderNotificationIds,
  formatTime, parseDays,
} from '../../src/db/reminders';
import { getPetById, Pet } from '../../src/db/pets';
import { scheduleRepeatingReminder, cancelAllRemindersForPet, requestPermissions } from '../../src/services/notifications';
import { Colors } from '../../src/constants/colors';
import { Spacing } from '../../src/constants/typography';

const REMINDER_TYPES: { type: ReminderType; emoji: string; labelKey: string; color: string; bg: string }[] = [
  { type: 'food',       emoji: '🍖', labelKey: 'food',       color: '#F39C12', bg: '#FEF9E7' },
  { type: 'water',      emoji: '💧', labelKey: 'water',      color: '#3498DB', bg: '#EBF5FB' },
  { type: 'medication', emoji: '💊', labelKey: 'medication',  color: '#FF6B9D', bg: '#FFF0F6' },
  { type: 'custom',     emoji: '⏰', labelKey: 'custom',     color: '#5B6EF5', bg: '#EEF0FF' },
];

const DAY_LABELS_FALLBACK = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

function timeToDate(hour: number, minute: number): Date {
  const d = new Date();
  d.setHours(hour, minute, 0, 0);
  return d;
}

export default function RemindersScreen() {
  const { petId } = useLocalSearchParams<{ petId: string }>();
  const navigation = useNavigation();
  const { t: tc } = useTranslation('common');
  const ri = tc('reminders', { returnObjects: true }) as Record<string, any>;

  const [pet, setPet] = useState<Pet | null>(null);
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [showAdd, setShowAdd] = useState(false);

  const [newType, setNewType] = useState<ReminderType>('food');
  const [newTime, setNewTime] = useState(new Date());
  const [newDays, setNewDays] = useState<'daily' | number[]>('daily');
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [saving, setSaving] = useState(false);

  const dayLabels: string[] = Array.isArray(ri.days_short) ? ri.days_short : DAY_LABELS_FALLBACK;

  useEffect(() => {
    if (!petId) return;
    getPetById(petId).then(p => { if (p) { setPet(p); navigation.setOptions({ title: p.name }); } });
    loadReminders();
  }, [petId]);

  async function loadReminders() {
    if (!petId) return;
    setReminders(await getRemindersByPet(petId));
  }

  async function handleToggle(reminder: Reminder, enabled: boolean) {
    await updateReminderEnabled(reminder.id, enabled);
    if (!enabled && reminder.notification_ids) {
      const ids = JSON.parse(reminder.notification_ids) as string[];
      await cancelAllRemindersForPet(ids);
    } else if (enabled && pet) {
      const ids = await scheduleRepeatingReminder({ ...reminder, enabled: 1 }, pet.name);
      await updateReminderNotificationIds(reminder.id, ids);
    }
    loadReminders();
  }

  async function handleDelete(reminder: Reminder) {
    Alert.alert(ri.delete_title, ri.delete_msg?.replace('{{label}}', reminder.label), [
      { text: tc('actions.cancel'), style: 'cancel' },
      {
        text: tc('actions.delete'), style: 'destructive',
        onPress: async () => {
          if (reminder.notification_ids) {
            const ids = JSON.parse(reminder.notification_ids) as string[];
            await cancelAllRemindersForPet(ids);
          }
          await deleteReminder(reminder.id);
          loadReminders();
        },
      },
    ]);
  }

  async function handleSave() {
    if (!petId || !pet) return;
    const granted = await requestPermissions();
    if (!granted) {
      Alert.alert(
        ri.permission_title ?? 'Permission Required',
        ri.permission_body ?? 'Enable notifications in Settings to receive reminders.',
        [
          { text: tc('actions.cancel'), style: 'cancel' },
          { text: ri.permission_settings ?? 'Settings', onPress: () => Linking.openSettings() },
        ]
      );
      return;
    }
    setSaving(true);
    try {
      const cfg = REMINDER_TYPES.find(t => t.type === newType)!;
      const newReminder = await createReminder({
        pet_id: petId,
        type: newType,
        label: cfg.emoji + ' ' + (ri[cfg.labelKey] ?? cfg.labelKey),
        hour: newTime.getHours(),
        minute: newTime.getMinutes(),
        days: newDays,
      });
      const ids = await scheduleRepeatingReminder(newReminder, pet.name);
      await updateReminderNotificationIds(newReminder.id, ids);
      setShowAdd(false);
      setNewType('food');
      setNewDays('daily');
      setNewTime(new Date());
      loadReminders();
    } finally {
      setSaving(false);
    }
  }

  function toggleDay(day: number) {
    if (newDays === 'daily') {
      setNewDays([day]);
    } else {
      const arr = newDays as number[];
      if (arr.includes(day)) {
        const next = arr.filter(d => d !== day);
        setNewDays(next.length === 0 ? 'daily' : next);
      } else {
        setNewDays([...arr, day].sort());
      }
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>
            {pet ? `${pet.name} — ${ri.title}` : ri.title}
          </Text>
          <TouchableOpacity style={styles.addBtn} onPress={() => setShowAdd(true)} activeOpacity={0.85}>
            <Text style={styles.addBtnText}>{ri.add}</Text>
          </TouchableOpacity>
        </View>

        {/* Empty */}
        {reminders.length === 0 && (
          <View style={styles.empty}>
            <Text style={styles.emptyEmoji}>⏰</Text>
            <Text style={styles.emptyTitle}>{ri.no_reminders}</Text>
            <Text style={styles.emptySub}>{ri.no_reminders_sub}</Text>
          </View>
        )}

        {/* Reminder cards */}
        {reminders.map((rem) => {
          const cfg = REMINDER_TYPES.find(t => t.type === rem.type) ?? REMINDER_TYPES[3];
          const days = parseDays(rem.days);
          const daysStr = days === 'daily'
            ? (ri.every_day ?? 'Every day')
            : (days as number[]).map(d => dayLabels[d - 1]).join(', ');
          return (
            <View key={rem.id} style={styles.card}>
              <View style={[styles.cardIcon, { backgroundColor: cfg.bg }]}>
                <Text style={styles.cardEmoji}>{cfg.emoji}</Text>
              </View>
              <View style={styles.cardBody}>
                <Text style={styles.cardLabel}>{rem.label}</Text>
                <Text style={styles.cardTime}>{formatTime(rem.hour, rem.minute)}</Text>
                <Text style={styles.cardDays}>{daysStr}</Text>
              </View>
              <View style={styles.cardRight}>
                <Switch
                  value={rem.enabled === 1}
                  onValueChange={(v) => handleToggle(rem, v)}
                  trackColor={{ false: Colors.neutral[200], true: cfg.color + '80' }}
                  thumbColor={rem.enabled === 1 ? cfg.color : Colors.neutral[400]}
                />
                <TouchableOpacity onPress={() => handleDelete(rem)} style={styles.deleteBtn}>
                  <Text style={styles.deleteBtnText}>🗑</Text>
                </TouchableOpacity>
              </View>
            </View>
          );
        })}
      </ScrollView>

      {/* Add Modal */}
      <Modal visible={showAdd} transparent animationType="slide" statusBarTranslucent>
        <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={() => setShowAdd(false)} />
        <View style={styles.sheet}>
          <View style={styles.sheetHandle} />
          <Text style={styles.sheetTitle}>{ri.new}</Text>

          {/* Type selector */}
          <Text style={styles.sheetLabel}>{ri.type}</Text>
          <View style={styles.typeGrid}>
            {REMINDER_TYPES.map((t) => (
              <TouchableOpacity
                key={t.type}
                style={[styles.typeCard, newType === t.type && { backgroundColor: t.bg, borderColor: t.color }]}
                onPress={() => setNewType(t.type)}
                activeOpacity={0.75}
              >
                <Text style={styles.typeEmoji}>{t.emoji}</Text>
                <Text style={[styles.typeLabel, newType === t.type && { color: t.color, fontWeight: '700' }]}>
                  {ri[t.labelKey] ?? t.labelKey}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Time picker */}
          <Text style={styles.sheetLabel}>{ri.time}</Text>
          <TouchableOpacity style={styles.timeTrigger} onPress={() => setShowTimePicker(true)} activeOpacity={0.8}>
            <Text style={styles.timeEmoji}>🕐</Text>
            <Text style={styles.timeText}>{formatTime(newTime.getHours(), newTime.getMinutes())}</Text>
          </TouchableOpacity>

          {showTimePicker && (
            <DateTimePicker
              value={newTime}
              mode="time"
              display="spinner"
              onChange={(_, d) => { if (d) setNewTime(d); }}
              style={{ height: 160 }}
              textColor={Colors.neutral[900]}
            />
          )}

          {/* Day selector */}
          <Text style={styles.sheetLabel}>{ri.days}</Text>
          <View style={styles.daysRow}>
            <TouchableOpacity
              style={[styles.dayChip, newDays === 'daily' && styles.dayChipActive]}
              onPress={() => setNewDays('daily')}
            >
              <Text style={[styles.dayChipText, newDays === 'daily' && styles.dayChipTextActive]}>
                {ri.every_day}
              </Text>
            </TouchableOpacity>
            {[1,2,3,4,5,6,7].map((d) => {
              const active = newDays !== 'daily' && (newDays as number[]).includes(d);
              return (
                <TouchableOpacity
                  key={d}
                  style={[styles.dayDot, active && styles.dayDotActive]}
                  onPress={() => toggleDay(d)}
                >
                  <Text style={[styles.dayDotText, active && styles.dayDotTextActive]}>
                    {dayLabels[d - 1][0]}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <TouchableOpacity
            style={[styles.saveBtn, saving && { opacity: 0.6 }]}
            onPress={handleSave}
            disabled={saving}
            activeOpacity={0.85}
          >
            <Text style={styles.saveBtnText}>{ri.save}</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  content: { padding: Spacing.lg, paddingBottom: 100 },

  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.xl },
  title: { fontSize: 22, fontWeight: '800', color: Colors.neutral[900], letterSpacing: -0.5 },
  addBtn: { backgroundColor: Colors.brand.primary, paddingHorizontal: 16, paddingVertical: 9, borderRadius: 20, shadowColor: Colors.brand.primary, shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.3, shadowRadius: 6, elevation: 4 },
  addBtnText: { color: '#fff', fontWeight: '700', fontSize: 14 },

  empty: { alignItems: 'center', paddingTop: 60 },
  emptyEmoji: { fontSize: 56, marginBottom: 16 },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: Colors.neutral[800] },
  emptySub: { fontSize: 13, color: Colors.neutral[500], marginTop: 6, textAlign: 'center' },

  card: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.card, borderRadius: 18, padding: 14, marginBottom: 12, gap: 14, borderWidth: 1, borderColor: Colors.cardBorder, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 3 },
  cardIcon: { width: 52, height: 52, borderRadius: 15, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  cardEmoji: { fontSize: 26 },
  cardBody: { flex: 1, gap: 3 },
  cardLabel: { fontSize: 15, fontWeight: '700', color: Colors.neutral[900] },
  cardTime: { fontSize: 22, fontWeight: '900', color: Colors.brand.primary, letterSpacing: -0.5 },
  cardDays: { fontSize: 11, color: Colors.neutral[500] },
  cardRight: { alignItems: 'center', gap: 8 },
  deleteBtn: { padding: 4 },
  deleteBtnText: { fontSize: 18 },

  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)' },
  sheet: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: Colors.card, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: Spacing.lg, paddingBottom: 40 },
  sheetHandle: { width: 36, height: 4, borderRadius: 2, backgroundColor: Colors.neutral[300], alignSelf: 'center', marginBottom: 20 },
  sheetTitle: { fontSize: 20, fontWeight: '800', color: Colors.neutral[900], marginBottom: Spacing.lg, textAlign: 'center' },
  sheetLabel: { fontSize: 12, fontWeight: '700', color: Colors.neutral[500], marginBottom: 10, marginTop: 4 },

  typeGrid: { flexDirection: 'row', gap: 10, marginBottom: Spacing.lg },
  typeCard: { flex: 1, backgroundColor: Colors.neutral[100], borderRadius: 14, paddingVertical: 12, alignItems: 'center', gap: 6, borderWidth: 2, borderColor: Colors.cardBorder },
  typeEmoji: { fontSize: 24 },
  typeLabel: { fontSize: 10, fontWeight: '500', color: Colors.neutral[500] },

  timeTrigger: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.neutral[100], borderRadius: 14, padding: 16, gap: 12, marginBottom: Spacing.lg },
  timeEmoji: { fontSize: 22 },
  timeText: { fontSize: 32, fontWeight: '900', color: Colors.brand.primary, letterSpacing: -1 },

  daysRow: { flexDirection: 'row', gap: 8, marginBottom: Spacing.xl, flexWrap: 'wrap' },
  dayChip: { paddingHorizontal: 14, paddingVertical: 9, borderRadius: 20, backgroundColor: Colors.neutral[100], borderWidth: 1.5, borderColor: Colors.cardBorder },
  dayChipActive: { backgroundColor: Colors.brand.primaryLight, borderColor: Colors.brand.primary },
  dayChipText: { fontSize: 13, fontWeight: '600', color: Colors.neutral[500] },
  dayChipTextActive: { color: Colors.brand.primary },
  dayDot: { width: 36, height: 36, borderRadius: 18, backgroundColor: Colors.neutral[100], alignItems: 'center', justifyContent: 'center', borderWidth: 1.5, borderColor: Colors.cardBorder },
  dayDotActive: { backgroundColor: Colors.brand.primary, borderColor: Colors.brand.primary },
  dayDotText: { fontSize: 12, fontWeight: '700', color: Colors.neutral[500] },
  dayDotTextActive: { color: '#fff' },

  saveBtn: { backgroundColor: Colors.brand.primary, borderRadius: 28, paddingVertical: 16, alignItems: 'center', shadowColor: Colors.brand.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 10, elevation: 6 },
  saveBtnText: { color: '#fff', fontSize: 16, fontWeight: '800' },
});
