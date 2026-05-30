import '../src/i18n';
import '../src/i18n/types';
import * as SplashScreen from 'expo-splash-screen';
import { Stack, useRouter, useSegments } from 'expo-router';
import { useEffect, useState } from 'react';
import { I18nextProvider } from 'react-i18next';
import 'react-native-reanimated';
import i18n, { restoreLanguage } from '../src/i18n';
import { initRevenueCat, checkPremium } from '../src/services/revenue-cat';
import { useSubscriptionStore } from '../src/store/subscription';
import { useSettingsStore } from '../src/store/settings';
import { useTranslation } from 'react-i18next';

void SplashScreen.preventAutoHideAsync();

export { ErrorBoundary } from 'expo-router';

export const unstable_settings = {
  initialRouteName: '(tabs)',
};

// Dil değişince tüm Stack yeniden mount olur → başlıklar da güncellenir
function AppStack() {
  const { i18n: i18nInstance, t: tc } = useTranslation('common');
  const [langKey, setLangKey] = useState(i18nInstance.language);

  useEffect(() => {
    const handler = (lang: string) => setLangKey(lang);
    i18nInstance.on('languageChanged', handler);
    return () => { i18nInstance.off('languageChanged', handler); };
  }, []);

  return (
    <Stack key={langKey}>
      <Stack.Screen name="(tabs)"                  options={{ headerShown: false }} />
      <Stack.Screen name="onboarding"              options={{ headerShown: false }} />
      <Stack.Screen name="paywall"                 options={{ presentation: 'modal', headerShown: false }} />
      <Stack.Screen name="pet/new"                 options={{ title: tc('forms.add_pet'),          presentation: 'modal' }} />
      <Stack.Screen name="pet/[id]"                options={{ title: '' }} />
      <Stack.Screen name="health/vaccine/new"      options={{ title: tc('forms.add_vaccine_title'), presentation: 'modal' }} />
      <Stack.Screen name="health/medication/new"   options={{ title: tc('forms.add_med_title'),     presentation: 'modal' }} />
      <Stack.Screen name="health/weight/new"       options={{ title: tc('forms.log_weight_title'),  presentation: 'modal' }} />
      <Stack.Screen name="health/visit/new"        options={{ title: tc('forms.add_visit_title'),   presentation: 'modal' }} />
      <Stack.Screen name="reminders/[petId]"       options={{ title: tc('reminders.title') }} />
    </Stack>
  );
}

export default function RootLayout() {
  const { setIsPremium, setLoading } = useSubscriptionStore();
  const { loadSettings, hasSeenOnboarding, loaded } = useSettingsStore();
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    async function bootstrap() {
      try {
        await Promise.all([
          restoreLanguage(),
          loadSettings(),
          initRevenueCat().then(() => checkPremium()).then(setIsPremium),
        ]);
      } catch {
        // non-fatal
      } finally {
        setLoading(false);
        void SplashScreen.hideAsync();
      }
    }
    bootstrap();
  }, []);

  useEffect(() => {
    if (!loaded) return;
    const inOnboarding = segments[0] === 'onboarding';
    if (!hasSeenOnboarding && !inOnboarding) {
      router.replace('/onboarding');
    }
  }, [loaded, hasSeenOnboarding]);

  return (
    <I18nextProvider i18n={i18n}>
      <AppStack />
    </I18nextProvider>
  );
}
