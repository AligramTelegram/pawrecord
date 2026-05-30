import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, SafeAreaView, Linking, Switch, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { SUPPORTED_LANGUAGES, SupportedLanguage, changeLanguage } from '../../src/i18n';
import { Colors } from '../../src/constants/colors';
import { Spacing } from '../../src/constants/typography';
import { usePremium } from '../../src/hooks/usePremium';
import { useSettingsStore } from '../../src/store/settings';

const LANG_FLAG: Record<SupportedLanguage, string> = {
  en: '🇬🇧', de: '🇩🇪', fr: '🇫🇷', es: '🇪🇸', it: '🇮🇹', pt: '🇵🇹',
  ja: '🇯🇵', ko: '🇰🇷', nl: '🇳🇱', sv: '🇸🇪', tr: '🇹🇷', zh: '🇨🇳',
};

const LANG_NATIVE: Record<SupportedLanguage, string> = {
  en: 'English', de: 'Deutsch', fr: 'Français', es: 'Español',
  it: 'Italiano', pt: 'Português', ja: '日本語', ko: '한국어',
  nl: 'Nederlands', sv: 'Svenska', tr: 'Türkçe', zh: '中文',
};

const APP_STORE_URL = 'https://apps.apple.com/app/id0000000000';

export default function SettingsScreen() {
  const { t: tc, i18n } = useTranslation('common');
  const router = useRouter();
  const { isPremium } = usePremium();
  const { notificationsEnabled, weightUnit, setNotificationsEnabled, setWeightUnit, clearAllData } = useSettingsStore();
  const currentLang = i18n.language as SupportedLanguage;

  const s = tc('settings_screen', { returnObjects: true }) as Record<string, string>;

  const handleClearData = () => {
    Alert.alert(
      s.delete_data_title,
      s.delete_data_msg,
      [
        { text: tc('actions.cancel'), style: 'cancel' },
        { text: s.delete_data_confirm, style: 'destructive', onPress: async () => { await clearAllData(); router.replace('/onboarding'); } },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>{s.title}</Text>

        {!isPremium && (
          <TouchableOpacity style={styles.premiumBanner} onPress={() => router.push('/paywall')} activeOpacity={0.85}>
            <View style={styles.premiumLeft}>
              <Text style={styles.premiumIcon}>⭐</Text>
              <View>
                <Text style={styles.premiumTitle}>Premium</Text>
                <Text style={styles.premiumSub}>{tc('empty.no_records_sub')}</Text>
              </View>
            </View>
            <View style={styles.chevronWrap}><Text style={styles.chevronText}>›</Text></View>
          </TouchableOpacity>
        )}

        <Text style={styles.sectionLabel}>🔔  {s.notifications}</Text>
        <View style={styles.card}>
          <View style={styles.row}>
            <Text style={styles.rowIcon}>💉</Text>
            <View style={styles.rowBody}>
              <Text style={styles.rowLabel}>{s.vaccine_reminders}</Text>
              <Text style={styles.rowSub}>{s.reminder_sub}</Text>
            </View>
            <Switch
              value={notificationsEnabled}
              onValueChange={setNotificationsEnabled}
              trackColor={{ false: Colors.neutral[200], true: Colors.brand.primary + '80' }}
              thumbColor={notificationsEnabled ? Colors.brand.primary : Colors.neutral[400]}
            />
          </View>
        </View>

        <Text style={styles.sectionLabel}>⚖️  {s.weight_unit}</Text>
        <View style={styles.card}>
          <View style={styles.row}>
            <Text style={styles.rowIcon}>📏</Text>
            <Text style={[styles.rowLabel, { flex: 1 }]}>{s.unit}</Text>
            <View style={styles.segmented}>
              {(['kg', 'lbs'] as const).map((unit) => (
                <TouchableOpacity
                  key={unit}
                  style={[styles.segment, weightUnit === unit && styles.segmentActive]}
                  onPress={() => setWeightUnit(unit)}
                >
                  <Text style={[styles.segmentText, weightUnit === unit && styles.segmentTextActive]}>{unit}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>

        <Text style={styles.sectionLabel}>🌐  {s.language}</Text>
        <View style={styles.langGrid}>
          {SUPPORTED_LANGUAGES.map((lang) => {
            const active = currentLang === lang;
            return (
              <TouchableOpacity
                key={lang}
                style={[styles.langCell, active && styles.langCellActive]}
                onPress={() => changeLanguage(lang)}
                activeOpacity={0.75}
              >
                <Text style={styles.langFlag}>{LANG_FLAG[lang]}</Text>
                <Text style={[styles.langName, active && styles.langNameActive]} numberOfLines={1}>{LANG_NATIVE[lang]}</Text>
                {active && <View style={styles.langDot} />}
              </TouchableOpacity>
            );
          })}
        </View>

        <Text style={styles.sectionLabel}>ℹ️  {s.about}</Text>
        <View style={styles.card}>
          <TouchableOpacity style={[styles.row, styles.rowBorder]} onPress={() => Linking.openURL(APP_STORE_URL)}>
            <Text style={styles.rowIcon}>⭐</Text>
            <Text style={[styles.rowLabel, { flex: 1 }]}>{s.rate_app}</Text>
            <Text style={styles.rowChevron}>›</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.row, styles.rowBorder]} onPress={() => Linking.openURL(process.env.EXPO_PUBLIC_PRIVACY_URL ?? '')}>
            <Text style={styles.rowIcon}>🔒</Text>
            <Text style={[styles.rowLabel, { flex: 1 }]}>{s.privacy_policy}</Text>
            <Text style={styles.rowChevron}>›</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.row} onPress={() => Linking.openURL(process.env.EXPO_PUBLIC_TERMS_URL ?? '')}>
            <Text style={styles.rowIcon}>📄</Text>
            <Text style={[styles.rowLabel, { flex: 1 }]}>{s.terms}</Text>
            <Text style={styles.rowChevron}>›</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.sectionLabel}>⚠️  {s.data}</Text>
        <View style={styles.card}>
          <TouchableOpacity style={styles.row} onPress={handleClearData}>
            <Text style={styles.rowIcon}>🗑️</Text>
            <Text style={[styles.rowLabel, { flex: 1, color: Colors.semantic.danger }]}>{s.delete_data}</Text>
            <Text style={styles.rowChevron}>›</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.version}>PawRecord v1.0.0</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  content: { padding: Spacing.lg, paddingBottom: 120 },
  title: { fontSize: 26, fontWeight: '800', color: Colors.neutral[900], letterSpacing: -0.5, marginBottom: Spacing.xl },
  premiumBanner: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: Colors.brand.primary, borderRadius: 20, padding: Spacing.lg, marginBottom: Spacing.xl, shadowColor: Colors.brand.primary, shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.35, shadowRadius: 12, elevation: 8 },
  premiumLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  premiumIcon: { fontSize: 30 },
  premiumTitle: { color: '#fff', fontWeight: '700', fontSize: 15 },
  premiumSub: { color: 'rgba(255,255,255,0.75)', fontSize: 12, marginTop: 2 },
  chevronWrap: { width: 32, height: 32, borderRadius: 10, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center' },
  chevronText: { color: '#fff', fontSize: 20, fontWeight: '700' },
  sectionLabel: { fontSize: 13, fontWeight: '700', color: Colors.neutral[500], marginBottom: 10, marginTop: 4 },
  card: { backgroundColor: Colors.card, borderRadius: 16, marginBottom: Spacing.xl, overflow: 'hidden', borderWidth: 1, borderColor: Colors.cardBorder, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 3 },
  row: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: Spacing.lg, paddingVertical: 14, gap: 12 },
  rowBorder: { borderBottomWidth: 0.5, borderBottomColor: Colors.neutral[150] },
  rowIcon: { fontSize: 18 },
  rowBody: { flex: 1 },
  rowLabel: { fontSize: 15, color: Colors.neutral[800], fontWeight: '500' },
  rowSub: { fontSize: 12, color: Colors.neutral[400], marginTop: 1 },
  rowChevron: { fontSize: 20, color: Colors.neutral[300] },
  segmented: { flexDirection: 'row', backgroundColor: Colors.neutral[100], borderRadius: 10, padding: 3 },
  segment: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 8 },
  segmentActive: { backgroundColor: Colors.brand.primary, shadowColor: Colors.brand.primary, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.3, shadowRadius: 4, elevation: 3 },
  segmentText: { fontSize: 13, fontWeight: '600', color: Colors.neutral[500] },
  segmentTextActive: { color: '#fff' },
  langGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: Spacing.xl },
  langCell: { width: '30.5%', backgroundColor: Colors.card, borderRadius: 14, paddingVertical: 12, paddingHorizontal: 8, alignItems: 'center', gap: 4, borderWidth: 1.5, borderColor: Colors.cardBorder },
  langCellActive: { borderColor: Colors.brand.primary, backgroundColor: Colors.brand.primaryLight },
  langFlag: { fontSize: 22 },
  langName: { fontSize: 11, fontWeight: '500', color: Colors.neutral[600], textAlign: 'center' },
  langNameActive: { color: Colors.brand.primary, fontWeight: '700' },
  langDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: Colors.brand.primary },
  version: { textAlign: 'center', color: Colors.neutral[400], fontSize: 12, marginTop: Spacing.md },
});
