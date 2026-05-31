import React, { useEffect, useState } from 'react';
import {
  View, Text, TouchableOpacity, ScrollView, StyleSheet,
  SafeAreaView, Linking, ActivityIndicator, Dimensions, Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Colors } from '../src/constants/colors';
import { Spacing } from '../src/constants/typography';
import { getOfferings, purchasePackage, restorePurchases } from '../src/services/revenue-cat';
import { useSubscriptionStore } from '../src/store/subscription';

const { width } = Dimensions.get('window');

const FEATURE_KEYS = [
  { key: 'unlimited_pets',   emoji: '🐾' },
  { key: 'pdf_report',       emoji: '📄' },
  { key: 'icloud_backup',    emoji: '☁️' },
  { key: 'unlimited_records',emoji: '📊' },
  { key: 'photo_gallery',    emoji: '🖼️' },
  { key: 'appointments',     emoji: '📅' },
] as const;

export default function PaywallScreen() {
  const router = useRouter();
  const { t } = useTranslation('paywall');
  const { setIsPremium } = useSubscriptionStore();
  const [selected, setSelected] = useState<'annual' | 'monthly'>('annual');
  const [offerings, setOfferings] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [offeringsLoading, setOfferingsLoading] = useState(true);

  useEffect(() => {
    getOfferings().then(o => {
      setOfferings(o);
      setOfferingsLoading(false);
    }).catch(() => setOfferingsLoading(false));
  }, []);

  async function handleSubscribe() {
    const pkg = selected === 'annual' ? offerings?.annual : offerings?.monthly;
    if (!pkg) {
      if (__DEV__) { setIsPremium(true); router.back(); return; }
      Alert.alert(t('purchase_error'));
      return;
    }
    setLoading(true);
    try {
      const success = await purchasePackage(pkg);
      if (success) { setIsPremium(true); router.back(); }
    } catch {
      Alert.alert(t('purchase_error'));
    } finally {
      setLoading(false);
    }
  }

  async function handleRestore() {
    setLoading(true);
    try {
      const success = await restorePurchases();
      if (success) {
        setIsPremium(true);
        Alert.alert(t('restore_success'));
        router.back();
      } else {
        Alert.alert(t('restore_not_found'));
      }
    } catch {
      Alert.alert(t('purchase_error'));
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

        {/* Close */}
        <TouchableOpacity style={styles.closeBtn} onPress={() => router.back()}>
          <Text style={styles.closeText}>✕</Text>
        </TouchableOpacity>

        {/* Hero */}
        <View style={styles.hero}>
          <View style={styles.heroBadge}>
            <Text style={styles.heroBadgeText}>⭐  {t('plans.annual.trial').toUpperCase()}</Text>
          </View>
          <Text style={styles.heroTitle}>{t('trial_title')}</Text>
          <Text style={styles.heroSub}>{t('trial_subtitle')}</Text>
        </View>

        {/* Features grid */}
        <View style={styles.featuresGrid}>
          {FEATURE_KEYS.map((f) => (
            <View key={f.key} style={styles.featureCard}>
              <Text style={styles.featureEmoji}>{f.emoji}</Text>
              <Text style={styles.featureTitle}>{t(`features.${f.key}`)}</Text>
            </View>
          ))}
        </View>

        {/* Plan selector */}
        <View style={styles.plans}>
          {/* Annual */}
          <TouchableOpacity
            style={[styles.plan, selected === 'annual' && styles.planActive]}
            onPress={() => setSelected('annual')}
            activeOpacity={0.85}
          >
            {selected === 'annual' && (
              <View style={styles.planCheck}><Text style={styles.planCheckText}>✓</Text></View>
            )}
            <View style={styles.planBestBadge}>
              <Text style={styles.planBestText}>{t('plans.annual.save_badge')}</Text>
            </View>
            <Text style={styles.planTitle}>{t('plans.annual.label')}</Text>
            <Text style={styles.planPrice}>{t('plans.annual.price')}</Text>
            <Text style={styles.planPer}>{t('plans.annual.monthly_equivalent')}</Text>
            <Text style={styles.planTrial}>{t('plans.annual.trial')}</Text>
          </TouchableOpacity>

          {/* Monthly */}
          <TouchableOpacity
            style={[styles.plan, selected === 'monthly' && styles.planActive]}
            onPress={() => setSelected('monthly')}
            activeOpacity={0.85}
          >
            {selected === 'monthly' && (
              <View style={styles.planCheck}><Text style={styles.planCheckText}>✓</Text></View>
            )}
            <View style={{ height: 22 }} />
            <Text style={styles.planTitle}>{t('plans.monthly.label')}</Text>
            <Text style={styles.planPrice}>{t('plans.monthly.price')}</Text>
            <Text style={styles.planPer}>{t('plans.monthly.period')}</Text>
            <Text style={styles.planTrial}>{t('plans.monthly.trial')}</Text>
          </TouchableOpacity>
        </View>

        {/* CTA */}
        <TouchableOpacity
          style={[styles.cta, (loading || offeringsLoading) && { opacity: 0.6 }]}
          onPress={handleSubscribe}
          disabled={loading || offeringsLoading}
          activeOpacity={0.85}
          accessibilityLabel={t('cta_trial')}
          accessibilityRole="button"
        >
          {(loading || offeringsLoading)
            ? <ActivityIndicator color="#fff" />
            : <Text style={styles.ctaText}>{t('cta_trial')} →</Text>
          }
        </TouchableOpacity>

        <TouchableOpacity style={styles.freeBtn} onPress={() => router.back()}>
          <Text style={styles.freeBtnText}>{t('free_tier_prompt')}</Text>
        </TouchableOpacity>

        {/* Legal */}
        <Text style={styles.legal}>{t('legal')}</Text>

        <View style={styles.links}>
          <TouchableOpacity onPress={handleRestore} accessibilityLabel={t('restore')} accessibilityRole="button">
            <Text style={styles.link}>{t('restore')}</Text>
          </TouchableOpacity>
          <Text style={styles.linkDot}>·</Text>
          <TouchableOpacity onPress={() => Linking.openURL(process.env.EXPO_PUBLIC_PRIVACY_URL ?? '')}>
            <Text style={styles.link}>{t('links.privacy')}</Text>
          </TouchableOpacity>
          <Text style={styles.linkDot}>·</Text>
          <TouchableOpacity onPress={() => Linking.openURL(process.env.EXPO_PUBLIC_TERMS_URL ?? '')}>
            <Text style={styles.link}>{t('links.terms')}</Text>
          </TouchableOpacity>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  content: { paddingBottom: 48 },

  closeBtn: {
    alignSelf: 'flex-end', width: 36, height: 36, margin: 16,
    backgroundColor: Colors.neutral[200], borderRadius: 18,
    alignItems: 'center', justifyContent: 'center',
  },
  closeText: { fontSize: 14, color: Colors.neutral[600], fontWeight: '700' },

  hero: { alignItems: 'center', paddingHorizontal: Spacing.lg, paddingBottom: Spacing.xl },
  heroBadge: {
    backgroundColor: Colors.brand.primary, borderRadius: 20,
    paddingHorizontal: 16, paddingVertical: 7, marginBottom: 16,
  },
  heroBadgeText: { color: '#fff', fontSize: 11, fontWeight: '800', letterSpacing: 0.5 },
  heroTitle: {
    fontSize: 28, fontWeight: '900', color: Colors.neutral[900],
    textAlign: 'center', letterSpacing: -0.5, lineHeight: 34, marginBottom: 8,
  },
  heroSub: { fontSize: 14, color: Colors.neutral[500], textAlign: 'center', lineHeight: 20 },

  featuresGrid: {
    flexDirection: 'row', flexWrap: 'wrap',
    paddingHorizontal: Spacing.lg, gap: 10, marginBottom: Spacing.xl,
  },
  featureCard: {
    width: (width - 56) / 2,
    backgroundColor: Colors.card,
    borderRadius: 16, padding: 16, gap: 8,
    borderWidth: 1, borderColor: Colors.cardBorder,
    flexDirection: 'row', alignItems: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05, shadowRadius: 4, elevation: 2,
  },
  featureEmoji: { fontSize: 22 },
  featureTitle: { flex: 1, fontSize: 12, fontWeight: '600', color: Colors.neutral[800] },

  plans: { flexDirection: 'row', paddingHorizontal: Spacing.lg, gap: 12, marginBottom: Spacing.lg },
  plan: {
    flex: 1, backgroundColor: Colors.card, borderRadius: 20, padding: 16,
    borderWidth: 2, borderColor: Colors.neutral[200], position: 'relative',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06, shadowRadius: 8, elevation: 3,
  },
  planActive: { borderColor: Colors.brand.primary, backgroundColor: Colors.brand.primaryLight },
  planCheck: {
    position: 'absolute', top: 10, right: 10,
    width: 22, height: 22, borderRadius: 11,
    backgroundColor: Colors.brand.primary,
    alignItems: 'center', justifyContent: 'center',
  },
  planCheckText: { color: '#fff', fontSize: 12, fontWeight: '700' },
  planBestBadge: {
    backgroundColor: Colors.brand.secondary, borderRadius: 8,
    paddingHorizontal: 8, paddingVertical: 3,
    alignSelf: 'flex-start', marginBottom: 8,
  },
  planBestText: { color: '#fff', fontSize: 9, fontWeight: '800', letterSpacing: 0.3 },
  planTitle: { fontSize: 12, fontWeight: '700', color: Colors.neutral[700], marginBottom: 6 },
  planPrice: { fontSize: 22, fontWeight: '900', color: Colors.neutral[900], letterSpacing: -0.5 },
  planPer: { fontSize: 10, color: Colors.neutral[500], marginTop: 2 },
  planTrial: { fontSize: 10, color: Colors.brand.primary, marginTop: 6, fontWeight: '600' },

  cta: {
    marginHorizontal: Spacing.lg, backgroundColor: Colors.brand.primary,
    borderRadius: 32, paddingVertical: 18, alignItems: 'center', marginBottom: 12,
    shadowColor: Colors.brand.primary, shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35, shadowRadius: 14, elevation: 8,
  },
  ctaText: { color: '#fff', fontSize: 17, fontWeight: '800' },

  freeBtn: { alignItems: 'center', paddingVertical: 14 },
  freeBtnText: { fontSize: 14, color: Colors.neutral[500], fontWeight: '500' },

  legal: {
    fontSize: 11, color: Colors.neutral[400], textAlign: 'center',
    lineHeight: 16, paddingHorizontal: 28, marginBottom: Spacing.md,
  },
  links: {
    flexDirection: 'row', justifyContent: 'center',
    alignItems: 'center', gap: 8, paddingBottom: 8, flexWrap: 'wrap',
  },
  link: { fontSize: 12, color: Colors.brand.primary, fontWeight: '500' },
  linkDot: { fontSize: 12, color: Colors.neutral[400] },
});
