import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, SafeAreaView, Alert, View, Text, KeyboardAvoidingView, Platform, TouchableOpacity } from 'react-native';
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
import { createVaccine } from '../../../src/db/vaccines';
import { getAllPets, Pet } from '../../../src/db/pets';
import { scheduleVaccineReminder } from '../../../src/services/notifications';
import { useSettingsStore } from '../../../src/store/settings';

const schema = z.object({
  pet_id: z.string().min(1),
  name: z.string().min(1),
  date_given: z.string().min(1),
  next_due: z.string().optional(),
  vet_name: z.string().optional(),
  batch_number: z.string().optional(),
  notes: z.string().optional(),
});
type FormData = z.infer<typeof schema>;

export default function NewVaccineScreen() {
  const { t: tc } = useTranslation('common');
  const router = useRouter();
  const { petId } = useLocalSearchParams<{ petId?: string }>();
  const [pets, setPets] = useState<Pet[]>([]);
  const f = tc('forms', { returnObjects: true }) as Record<string, string>;
  const { notificationsEnabled } = useSettingsStore();

  useEffect(() => {
    getAllPets().then(p => {
      setPets(p);
      if (!petId && p.length === 1) {
        setValue('pet_id', p[0].id);
      }
    });
  }, []);

  const { control, handleSubmit, setValue, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { pet_id: petId ?? '', date_given: new Date().toISOString().split('T')[0] },
  });

  async function onSubmit(data: FormData) {
    try {
      const vaccine = await createVaccine({ ...data, reminder_enabled: notificationsEnabled ? 1 : 0 });
      // Bildirim planla — next_due varsa ve notifications açıksa
      if (notificationsEnabled && data.next_due) {
        const petName = pets.find(p => p.id === data.pet_id)?.name ?? '';
        await scheduleVaccineReminder(petName, data.name, new Date(data.next_due + 'T12:00:00'), vaccine.id);
      }
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
          <Text style={styles.headerEmoji}>💉</Text>
          <Text style={styles.headerTitle}>{f.add_vaccine_title}</Text>
          <Text style={styles.headerSub}>{f.add_vaccine_sub}</Text>
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
                        borderColor: value === p.id ? Colors.brand.primary : Colors.cardBorder,
                        backgroundColor: value === p.id ? Colors.brand.primaryLight : Colors.card }}>
                      <Text style={{ color: value === p.id ? Colors.brand.primary : Colors.neutral[600], fontWeight: '600' }}>{p.name}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}
          />
        )}
        <Controller control={control} name="name"
          render={({ field: { onChange, value } }) => (
            <Input icon="💉" label={f.vaccine_name} placeholder={f.vaccine_placeholder} value={value} onChangeText={onChange} error={errors.name?.message} />
          )}
        />
        <Controller control={control} name="date_given"
          render={({ field: { onChange, value } }) => (
            <DatePickerInput label={f.date_given} value={value} onChange={onChange} />
          )}
        />
        <Controller control={control} name="next_due"
          render={({ field: { onChange, value } }) => (
            <DatePickerInput label={f.next_due_optional} icon="🔔" value={value ?? ''} onChange={onChange} optional />
          )}
        />
        <Controller control={control} name="vet_name"
          render={({ field: { onChange, value } }) => (
            <Input icon="👨‍⚕️" label={f.vet_optional} placeholder={f.vet_placeholder} value={value ?? ''} onChangeText={onChange} />
          )}
        />
        <Controller control={control} name="batch_number"
          render={({ field: { onChange, value } }) => (
            <Input icon="🔢" label={f.batch_optional} placeholder={f.batch_placeholder} value={value ?? ''} onChangeText={onChange} />
          )}
        />
        <Controller control={control} name="notes"
          render={({ field: { onChange, value } }) => (
            <Input icon="📝" label={f.notes_optional} placeholder={f.notes_placeholder} value={value ?? ''} onChangeText={onChange} multiline numberOfLines={3} />
          )}
        />
        <Button label={f.save_vaccine} onPress={handleSubmit(onSubmit)} loading={isSubmitting} fullWidth />
      </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  content: { padding: Spacing.lg, paddingBottom: 80 },
  headerCard: { backgroundColor: '#EEF0FF', borderRadius: 20, padding: 20, alignItems: 'center', marginBottom: Spacing.xl, gap: 4 },
  headerEmoji: { fontSize: 36, marginBottom: 4 },
  headerTitle: { fontSize: 20, fontWeight: '800', color: Colors.brand.primary },
  headerSub: { fontSize: 13, color: Colors.brand.primaryDark, opacity: 0.7 },
});
