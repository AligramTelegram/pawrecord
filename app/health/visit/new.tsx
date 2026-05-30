import React from 'react';
import { ScrollView, StyleSheet, SafeAreaView, Alert, View, Text, KeyboardAvoidingView, Platform } from 'react-native';
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
import { createVisit } from '../../../src/db/visits';
import { getCurrencyForLang } from '../../../src/utils/currency';

const schema = z.object({
  pet_id: z.string().min(1),
  date: z.string().min(1),
  reason: z.string().min(1),
  vet_name: z.string().optional(),
  clinic: z.string().optional(),
  diagnosis: z.string().optional(),
  treatment: z.string().optional(),
  cost: z.string().optional(),
  notes: z.string().optional(),
});
type FormData = z.infer<typeof schema>;

export default function NewVisitScreen() {
  const { t: tc, i18n } = useTranslation('common');
  const router = useRouter();
  const { petId } = useLocalSearchParams<{ petId?: string }>();
  const f = tc('forms', { returnObjects: true }) as Record<string, string>;
  const currency = getCurrencyForLang(i18n.language);

  const { control, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { pet_id: petId ?? '', date: new Date().toISOString().split('T')[0] },
  });

  async function onSubmit(data: FormData) {
    try {
      await createVisit({ pet_id: data.pet_id, date: data.date, reason: data.reason, vet_name: data.vet_name, clinic: data.clinic, diagnosis: data.diagnosis, treatment: data.treatment, cost: data.cost ? parseFloat(data.cost) : undefined, currency: currency.code, notes: data.notes });
      router.back();
    } catch {
      Alert.alert('Error', f.error_save);
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        <View style={styles.headerCard}>
          <Text style={styles.headerEmoji}>🏥</Text>
          <Text style={styles.headerTitle}>{f.add_visit_title}</Text>
          <Text style={styles.headerSub}>{f.add_visit_sub}</Text>
        </View>
        <Controller control={control} name="date"
          render={({ field: { onChange, value } }) => (
            <DatePickerInput label={f.visit_date} value={value} onChange={onChange} />
          )}
        />
        <Controller control={control} name="reason"
          render={({ field: { onChange, value } }) => (
            <Input icon="🩺" label={f.visit_reason} placeholder={f.visit_reason_placeholder} value={value} onChangeText={onChange} error={errors.reason?.message} />
          )}
        />
        <Controller control={control} name="vet_name"
          render={({ field: { onChange, value } }) => (
            <Input icon="👨‍⚕️" label={f.vet_optional} placeholder={f.vet_placeholder} value={value ?? ''} onChangeText={onChange} />
          )}
        />
        <Controller control={control} name="clinic"
          render={({ field: { onChange, value } }) => (
            <Input icon="🏥" label={f.clinic_optional} placeholder={f.clinic_optional} value={value ?? ''} onChangeText={onChange} />
          )}
        />
        <Controller control={control} name="diagnosis"
          render={({ field: { onChange, value } }) => (
            <Input icon="📋" label={f.diagnosis_optional} placeholder={f.diagnosis_placeholder} value={value ?? ''} onChangeText={onChange} multiline numberOfLines={2} />
          )}
        />
        <Controller control={control} name="treatment"
          render={({ field: { onChange, value } }) => (
            <Input icon="💊" label={f.treatment_optional} placeholder={f.treatment_placeholder} value={value ?? ''} onChangeText={onChange} multiline numberOfLines={2} />
          )}
        />
        <Controller control={control} name="cost"
          render={({ field: { onChange, value } }) => (
            <Input icon={currency.symbol} label={`${f.cost_optional} · ${currency.code}`} placeholder="0.00" value={value ?? ''} onChangeText={onChange} keyboardType="decimal-pad" />
          )}
        />
        <Controller control={control} name="notes"
          render={({ field: { onChange, value } }) => (
            <Input icon="📝" label={f.notes_optional} placeholder={f.notes_placeholder} value={value ?? ''} onChangeText={onChange} multiline numberOfLines={3} />
          )}
        />
        <Button label={f.save_visit} onPress={handleSubmit(onSubmit)} loading={isSubmitting} fullWidth />
      </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  content: { padding: Spacing.lg, paddingBottom: 80 },
  headerCard: { backgroundColor: '#FEF9E7', borderRadius: 20, padding: 20, alignItems: 'center', marginBottom: Spacing.xl, gap: 4 },
  headerEmoji: { fontSize: 36, marginBottom: 4 },
  headerTitle: { fontSize: 20, fontWeight: '800', color: '#F39C12' },
  headerSub: { fontSize: 13, color: '#F39C12', opacity: 0.7 },
});
