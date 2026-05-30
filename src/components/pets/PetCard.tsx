import React from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { Pet } from '../../db/pets';
import { Colors } from '../../constants/colors';
import { Radius, Spacing } from '../../constants/typography';
import { SPECIES_EMOJI } from '../../constants/species';
import { getPetAge } from '../../utils/dates';
import { useTranslation } from 'react-i18next';
import i18n from '../../i18n';

const AVATAR_COLORS = [
  ['#5B6EF5', '#9B59F5'],
  ['#FF6B9D', '#FF8E53'],
  ['#00C9A7', '#3498DB'],
  ['#F39C12', '#E74C3C'],
];

interface PetCardProps {
  pet: Pet;
  onPress: () => void;
}

export function PetCard({ pet, onPress }: PetCardProps) {
  const { } = useTranslation('pets');
  const age = getPetAge(pet.date_of_birth);
  const emoji = SPECIES_EMOJI[pet.species as keyof typeof SPECIES_EMOJI] ?? '🐾';
  const colorIdx = pet.name.charCodeAt(0) % AVATAR_COLORS.length;
  const [c1, c2] = AVATAR_COLORS[colorIdx];

  const ageStr = age.years > 0
    ? `${age.years}y ${age.months > 0 ? `${age.months}m` : ''}`.trim()
    : age.months > 0 ? `${age.months}m` : '';

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.85}>
      <View style={[styles.avatarWrap, { backgroundColor: c1 + '20' }]}>
        {pet.photo_uri ? (
          <Image source={{ uri: pet.photo_uri }} style={styles.avatar} />
        ) : (
          <View style={[styles.avatarFallback, { backgroundColor: c1 + '30' }]}>
            <Text style={styles.avatarEmoji}>{emoji}</Text>
          </View>
        )}
      </View>

      <View style={styles.info}>
        <Text style={styles.name}>{pet.name}</Text>
        <View style={styles.metaRow}>
          <View style={[styles.speciesBadge, { backgroundColor: c1 + '15' }]}>
            <Text style={[styles.speciesText, { color: c1 }]}>
              {i18n.t(`pets:species.${pet.species}` as any)}
            </Text>
          </View>
          {ageStr ? <Text style={styles.age}>· {ageStr}</Text> : null}
        </View>
        {pet.breed ? <Text style={styles.breed} numberOfLines={1}>{pet.breed}</Text> : null}
      </View>

      <View style={[styles.chevronWrap, { backgroundColor: c1 + '15' }]}>
        <Text style={[styles.chevron, { color: c1 }]}>›</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.card,
    borderRadius: 20,
    padding: Spacing.md,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    shadowColor: '#5B6EF5',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  avatarWrap: {
    borderRadius: 16,
    padding: 3,
    marginRight: 14,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 14,
  },
  avatarFallback: {
    width: 56,
    height: 56,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarEmoji: { fontSize: 28 },
  info: { flex: 1, gap: 4 },
  name: {
    fontSize: 17,
    fontWeight: '700',
    color: Colors.neutral[900],
    letterSpacing: -0.2,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  speciesBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  speciesText: {
    fontSize: 11,
    fontWeight: '600',
  },
  age: {
    fontSize: 12,
    color: Colors.neutral[400],
    fontWeight: '500',
  },
  breed: {
    fontSize: 12,
    color: Colors.neutral[400],
  },
  chevronWrap: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chevron: { fontSize: 20, fontWeight: '700' },
});
