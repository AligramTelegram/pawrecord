import React, { useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, SafeAreaView, TouchableOpacity, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslation } from 'react-i18next';
import { Input } from '../../src/components/ui/Input';
import { DatePickerInput } from '../../src/components/ui/DatePickerInput';
import { Colors } from '../../src/constants/colors';
import { Spacing } from '../../src/constants/typography';
import { usePetsStore } from '../../src/store/pets';
import { SPECIES, SPECIES_EMOJI } from '../../src/constants/species';
import { usePremium } from '../../src/hooks/usePremium';

const SPECIES_COLORS: Record<string, { bg: string; color: string }> = {
  dog: { bg: '#FEF9E7', color: '#F39C12' }, cat: { bg: '#EEF0FF', color: '#5B6EF5' },
  rabbit: { bg: '#FFF0F6', color: '#FF6B9D' }, bird: { bg: '#E0FBF6', color: '#00C9A7' },
  other: { bg: Colors.neutral[100], color: Colors.neutral[500] },
};

const schema = z.object({
  name: z.string().min(1),
  species: z.string().min(1),
  breed: z.string().optional(),
  date_of_birth: z.string().optional(),
  gender: z.enum(['male', 'female', 'unknown']),
  color: z.string().optional(),
  microchip_id: z.string().optional(),
});
type FormData = z.infer<typeof schema>;

export default function NewPetScreen() {
  const { t: tc, i18n } = useTranslation('common');
  const { t: tp } = useTranslation('paywall');
  const it = (key: string) => i18n.t(key as any);
  const router = useRouter();
  const { addPet, pets } = usePetsStore();
  const { isPremium } = usePremium();

  useEffect(() => {
    if (!isPremium && pets.length >= 1) {
      Alert.alert(tp('purchase_limit_title'), tp('purchase_limit_body'), [
        { text: tc('actions.cancel'), style: 'cancel', onPress: () => router.back() },
        { text: 'Premium', onPress: () => { router.back(); router.push('/paywall'); } },
      ]);
    }
  }, []);
  const f = tc('forms', { returnObjects: true }) as Record<string, string>;
  const g = tc('gender', { returnObjects: true }) as Record<string, string>;

  const GENDER_OPTIONS = [
    { value: 'male',    label: g.male,    color: '#3498DB', bg: '#EBF5FB' },
    { value: 'female',  label: g.female,  color: '#E91E8C', bg: '#FCE4F3' },
    { value: 'unknown', label: g.unknown, color: Colors.neutral[500], bg: Colors.neutral[100] },
  ] as const;

  const { control, handleSubmit, watch, setValue, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { species: 'dog', gender: 'unknown' as const },
  });

  const selectedSpecies = watch('species');
  const selectedGender = watch('gender');

  async function onSubmit(data: FormData) {
    try {
      await addPet({ name: data.name, species: data.species, breed: data.breed, date_of_birth: data.date_of_birth, gender: data.gender, color: data.color, microchip_id: data.microchip_id });
      router.back();
    } catch {
      Alert.alert(tc('errors.generic'), f.error_save);
    }
  }

  const speciesColor = SPECIES_COLORS[selectedSpecies] ?? SPECIES_COLORS.other;

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        <View style={styles.avatarSection}>
          <View style={[styles.avatarBubble, { backgroundColor: speciesColor.bg }]}>
            <Text style={styles.avatarEmoji}>{SPECIES_EMOJI[selectedSpecies as keyof typeof SPECIES_EMOJI] ?? '🐾'}</Text>
          </View>
          <Text style={[styles.avatarHint, { color: speciesColor.color }]}>{f.choose_species}</Text>
        </View>

        <Controller control={control} name="name"
          render={({ field: { onChange, value } }) => (
            <Input icon="✏️" label={f.pet_name} placeholder={f.pet_name_placeholder} value={value} onChangeText={onChange} error={errors.name?.message} />
          )}
        />

        <Text style={styles.sectionLabel}>{f.species}</Text>
        <View style={styles.speciesGrid}>
          {SPECIES.map((sp) => {
            const cfg = SPECIES_COLORS[sp] ?? SPECIES_COLORS.other;
            const active = selectedSpecies === sp;
            return (
              <TouchableOpacity key={sp} style={[styles.speciesCard, { backgroundColor: active ? cfg.bg : Colors.card }, active && { borderColor: cfg.color }]} onPress={() => setValue('species', sp)} activeOpacity={0.75}>
                <Text style={styles.speciesEmoji}>{SPECIES_EMOJI[sp]}</Text>
                <Text style={[styles.speciesLabel, active && { color: cfg.color, fontWeight: '700' }]}>
                  {it(`pets:species.${sp}`)}
                </Text>
                {active && <View style={[styles.speciesDot, { backgroundColor: cfg.color }]} />}
              </TouchableOpacity>
            );
          })}
        </View>

        <Text style={styles.sectionLabel}>{f.gender}</Text>
        <View style={styles.genderRow}>
          {GENDER_OPTIONS.map((g) => {
            const active = selectedGender === g.value;
            return (
              <TouchableOpacity key={g.value} style={[styles.genderCard, active && { backgroundColor: g.bg, borderColor: g.color }]} onPress={() => setValue('gender', g.value)} activeOpacity={0.75}>
                <Text style={[styles.genderLabel, active && { color: g.color, fontWeight: '700' }]}>{g.label}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <Controller control={control} name="breed"
          render={({ field: { onChange, value } }) => (
            <Input icon="🏷" label={f.breed_optional} placeholder={it('pets:fields.breed_placeholder')} value={value ?? ''} onChangeText={onChange} />
          )}
        />
        <Controller control={control} name="date_of_birth"
          render={({ field: { onChange, value } }) => (
            <DatePickerInput label={f.dob_optional} icon="🎂" value={value ?? ''} onChange={onChange} optional />
          )}
        />
        <Controller control={control} name="color"
          render={({ field: { onChange, value } }) => (
            <Input icon="🎨" label={f.color_optional} placeholder={f.color_placeholder} value={value ?? ''} onChangeText={onChange} />
          )}
        />
        <Controller control={control} name="microchip_id"
          render={({ field: { onChange, value } }) => (
            <Input icon="🔢" label={f.microchip_optional} placeholder="000000000000000" value={value ?? ''} onChangeText={onChange} />
          )}
        />

        <TouchableOpacity style={[styles.saveBtn, isSubmitting && { opacity: 0.6 }]} onPress={handleSubmit(onSubmit)} disabled={isSubmitting} activeOpacity={0.85}>
          <Text style={styles.saveBtnText}>{f.add_pet}</Text>
        </TouchableOpacity>
      </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  content: { padding: Spacing.lg, paddingBottom: 60 },
  avatarSection: { alignItems: 'center', marginBottom: Spacing.xl },
  avatarBubble: { width: 100, height: 100, borderRadius: 50, alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
  avatarEmoji: { fontSize: 52 },
  avatarHint: { fontSize: 12, fontWeight: '500' },
  sectionLabel: { fontSize: 13, fontWeight: '700', color: Colors.neutral[500], marginBottom: 10, letterSpacing: 0.2 },
  speciesGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 20 },
  speciesCard: { width: '18%', minWidth: 58, flex: 1, backgroundColor: Colors.card, borderRadius: 16, paddingVertical: 14, alignItems: 'center', gap: 5, borderWidth: 2, borderColor: Colors.cardBorder },
  speciesEmoji: { fontSize: 26 },
  speciesLabel: { fontSize: 10, color: Colors.neutral[500], fontWeight: '500', textAlign: 'center' },
  speciesDot: { width: 5, height: 5, borderRadius: 3 },
  genderRow: { flexDirection: 'row', gap: 10, marginBottom: 20 },
  genderCard: { flex: 1, paddingVertical: 14, borderRadius: 14, alignItems: 'center', backgroundColor: Colors.card, borderWidth: 2, borderColor: Colors.cardBorder },
  genderLabel: { fontSize: 14, color: Colors.neutral[500], fontWeight: '600' },
  saveBtn: { backgroundColor: Colors.brand.primary, borderRadius: 28, paddingVertical: 18, alignItems: 'center', marginTop: 8, shadowColor: Colors.brand.primary, shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.35, shadowRadius: 14, elevation: 8 },
  saveBtnText: { color: '#fff', fontSize: 17, fontWeight: '800' },
});
