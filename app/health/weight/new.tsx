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
import { createWeight } from '../../../src/db/weights';
import { getAllPets, Pet } from '../../../src/db/pets';

const schema = z.object({
  pet_id: z.string().min(1),
  weight_kg: z.string().min(1),
  date: z.string().min(1),
  notes: z.string().optional(),
});
type FormData = z.infer<typeof schema>;

export default function NewWeightScreen() {
  const { t: tc } = useTranslation('common');
  const router = useRouter();
  const { petId } = useLocalSearchParams<{ petId?: string }>();
  const f = tc('forms', { returnObjects: true }) as Record<string, string>;
  const [pets, setPets] = useState<Pet[]>([]);
  useEffect(() => {
    getAllPets().then(p => {
      setPets(p);
      if (!petId && p.length === 1) setValue('pet_id', p[0].id);
    });
  }, []);

  const { control, handleSubmit, setValue, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { pet_id: petId ?? '', date: new Date().toISOString().split('T')[0] },
  });

  async function onSubmit(data: FormData) {
    try {
      await createWeight({ pet_id: data.pet_id, weight_kg: parseFloat(data.weight_kg), date: data.date, notes: data.notes });
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
          <Text style={styles.headerEmoji}>⚖️</Text>
          <Text style={styles.headerTitle}>{f.log_weight_title}</Text>
          <Text style={styles.headerSub}>{f.log_weight_sub}</Text>
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
                        borderColor: value === p.id ? '#00C9A7' : Colors.cardBorder,
                        backgroundColor: value === p.id ? '#E0FBF6' : Colors.card }}>
                      <Text style={{ color: value === p.id ? '#00C9A7' : Colors.neutral[600], fontWeight: '600' }}>{p.name}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}
          />
        )}
        <Controller control={control} name="weight_kg"
          render={({ field: { onChange, value } }) => (
            <Input icon="⚖️" label={f.weight_kg} placeholder={f.weight_placeholder} value={value} onChangeText={onChange} keyboardType="decimal-pad" error={errors.weight_kg?.message} />
          )}
        />
        <Controller control={control} name="date"
          render={({ field: { onChange, value } }) => (
            <DatePickerInput label={f.start_date} value={value} onChange={onChange} />
          )}
        />
        <Controller control={control} name="notes"
          render={({ field: { onChange, value } }) => (
            <Input icon="📝" label={f.notes_optional} placeholder={f.notes_placeholder} value={value ?? ''} onChangeText={onChange} multiline numberOfLines={3} />
          )}
        />
        <Button label={f.save_weight} onPress={handleSubmit(onSubmit)} loading={isSubmitting} fullWidth />
      </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  content: { padding: Spacing.lg, paddingBottom: 80 },
  headerCard: { backgroundColor: '#E0FBF6', borderRadius: 20, padding: 20, alignItems: 'center', marginBottom: Spacing.xl, gap: 4 },
  headerEmoji: { fontSize: 36, marginBottom: 4 },
  headerTitle: { fontSize: 20, fontWeight: '800', color: '#00C9A7' },
  headerSub: { fontSize: 13, color: '#00C9A7', opacity: 0.7 },
});
