import { Tabs } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Colors } from '../../src/constants/colors';
import FloatingTabBar from '../../src/components/FloatingTabBar';

export default function TabLayout() {
  const { t } = useTranslation('common');

  return (
    <Tabs
      tabBar={(props) => <FloatingTabBar {...props} />}
      screenOptions={{
        headerStyle: { backgroundColor: Colors.bg },
        headerTintColor: Colors.neutral[900],
        headerShadowVisible: false,
        tabBarStyle: { display: 'none' },
      }}
    >
      <Tabs.Screen name="index"    options={{ title: t('nav.pets')     }} />
      <Tabs.Screen name="health"   options={{ title: t('nav.health')   }} />
      <Tabs.Screen name="calendar" options={{ title: t('nav.calendar') }} />
      <Tabs.Screen name="settings" options={{ title: t('nav.settings') }} />
      <Tabs.Screen name="two"      options={{ href: null               }} />
    </Tabs>
  );
}
