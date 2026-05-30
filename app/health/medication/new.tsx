import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, SafeAreaView, Alert, View, Text, TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslation } from 'react-i18next';
import { Input } from '../../../src/components/ui/Input';
import { DatePickerInput } from '../../../src/components/ui/DatePickerInput';
import { Button } from '../../../src/components/ui/Button';
import { Colors } from '../../../src/constants/colors';
import { Spacing } from '../../../src/constants/typography';
import { createMedication } from '../../../src/db/medications';
import { getAllPets, Pet } from '../../../src/db/pets';

const schema = z.object({
  pet_id: z.string().min(1),
  name: z.string().min(1),
  dosage: z.string().min(1),
  frequency: z.enum(['daily', 'weekly', 'monthly', 'as_needed']),
  start_date: z.string().min(1),
  end_date: z.string().optional(),
  notes: z.string().optional(),
});
type FormData = z.infer<typeof schema>;
type FreqValue = 'daily' | 'weekly' | 'monthly' | 'as_needed';

export default function NewMedicationScreen() {
  const { t: tc, i18n } = useTranslation('common');
  const it = (key: string) => i18n.t(key as any);
  const router = useRouter();
  const { petId } = useLocalSearchParams<{ petId?: string }>();
  const f = tc('forms', { returnObjects: true }) as Record<string, string>;

  const FREQUENCIES: { value: FreqValue; labelKey: string }[] = [
    { value: 'daily',     labelKey: 'forms.freq_daily'     },
    { value: 'weekly',    labelKey: 'forms.freq_weekly'    },
    { value: 'monthly',   labelKey: 'forms.freq_monthly'   },
    { value: 'as_needed', labelKey: 'forms.freq_as_needed' },
  ];

  const [pets, setPets] = useState<Pet[]>([]);
  useEffect(() => {
    getAllPets().then(p => {
      setPets(p);
      if (!petId && p.length === 1) setValue('pet_id', p[0].id);
    });
  }, []);

  const { control, handleSubmit, watch, setValue, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { pet_id: petId ?? '', frequency: 'daily', start_date: new Date().toISOString().split('T')[0] },
  });

  const selectedFreq = watch('frequency');

  async function onSubmit(data: FormData) {
    try {
      await createMedication({ ...data, times_per_day: 1, is_active: 1 });
      router.back();
    } catch {
      Alert.alert(tc('errors.generic'), f.error_save);
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        <View style={styles.headerCard}>
          <Text style={styles.headerEmoji}>💊</Text>
          <Text style={styles.headerTitle}>{f.add_med_title}</Text>
          <Text style={styles.headerSub}>{f.add_med_sub}</Text>
        </View>
        {!petId && pets.length > 0 && (
          <Controller control={control} name="pet_id"
            render={({ field: { onChange, value } }) => (
              <View style={{ marginBottom: 16 }}>
                <Text style={{ fontSize: 13, fontWeight: '700', color: Colors.neutral[500], marginBottom: 8 }}>{f.species}</Text>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                  {pets.map(p => (
                    <TouchableOpacity key={p.id} onPress={() => onChange(p.id)}
                      style={{ paddingHorizontal: 14, paddingVertical: 10, borderRadius: 20, borderWidth: 2,
                        borderColor: value === p.id ? '#FF6B9D' : Colors.cardBorder,
                        backgroundColor: value === p.id ? '#FFF0F6' : Colors.card }}>
                      <Text style={{ color: value === p.id ? '#FF6B9D' : Colors.neutral[600], fontWeight: '600' }}>{p.name}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}
          />
        )}
        <Controller control={control} name="name"
          render={({ field: { onChange, value } }) => (
            <Input icon="💊" label={f.med_name} placeholder={f.med_placeholder} value={value} onChangeText={onChange} error={errors.name?.message} />
          )}
        />
        <Controller control={control} name="dosage"
          render={({ field: { onChange, value } }) => (
            <Input icon="⚖️" label={f.dosage} placeholder={f.dosage_placeholder} value={value} onChangeText={onChange} error={errors.dosage?.message} />
          )}
        />
        <Text style={styles.freqLabel}>{f.frequency}</Text>
        <View style={styles.freqGrid}>
          {FREQUENCIES.map((freq) => (
            <TouchableOpacity
              key={freq.value}
              style={[styles.freqChip, selectedFreq === freq.value && styles.freqChipActive]}
              onPress={() => setValue('frequency', freq.value)}
            >
              <Text style={[styles.freqText, selectedFreq === freq.value && styles.freqTextActive]}>
                {it(freq.labelKey)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        <Controller control={control} name="start_date"
          render={({ field: { onChange, value } }) => (
            <DatePickerInput label={f.start_date} value={value} onChange={onChange} />
          )}
        />
        <Controller control={control} name="end_date"
          render={({ field: { onChange, value } }) => (
            <DatePickerInput label={f.end_date_optional} icon="🏁" value={value ?? ''} onChange={onChange} optional />
          )}
        />
        <Controller control={control} name="notes"
          render={({ field: { onChange, value } }) => (
            <Input icon="📝" label={f.notes_optional} placeholder={f.notes_placeholder} value={value ?? ''} onChangeText={onChange} multiline numberOfLines={3} />
          )}
        />
        <Button label={f.save_medication} onPress={handleSubmit(onSubmit)} loading={isSubmitting} fullWidth />
      </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  content: { padding: Spacing.lg, paddingBottom: 80 },
  headerCard: { backgroundColor: '#FFF0F6', borderRadius: 20, padding: 20, alignItems: 'center', marginBottom: Spacing.xl, gap: 4 },
  headerEmoji: { fontSize: 36, marginBottom: 4 },
  headerTitle: { fontSize: 20, fontWeight: '800', color: '#FF6B9D' },
  headerSub: { fontSize: 13, color: '#FF6B9D', opacity: 0.7 },
  freqLabel: { fontSize: 13, fontWeight: '700', color: Colors.neutral[500], marginBottom: 10 },
  freqGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 18 },
  freqChip: { paddingHorizontal: 14, paddingVertical: 10, borderRadius: 20, borderWidth: 1.5, borderColor: Colors.neutral[200], backgroundColor: Colors.card },
  freqChipActive: { borderColor: '#FF6B9D', backgroundColor: '#FFF0F6' },
  freqText: { fontSize: 13, fontWeight: '600', color: Colors.neutral[500] },
  freqTextActive: { color: '#FF6B9D' },
});
