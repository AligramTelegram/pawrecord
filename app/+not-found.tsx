import { Link, Stack } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Colors } from '../src/constants/colors';

export default function NotFoundScreen() {
  const { t } = useTranslation('common');
  return (
    <>
      <Stack.Screen options={{ title: '404' }} />
      <View style={styles.container}>
        <Text style={styles.emoji}>🐾</Text>
        <Text style={styles.title}>{t('errors.generic')}</Text>
        <Link href="/" style={styles.link}>
          <Text style={styles.linkText}>{t('nav.pets')}</Text>
        </Link>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    backgroundColor: Colors.bg,
  },
  emoji: { fontSize: 56, marginBottom: 16 },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.neutral[800],
    textAlign: 'center',
  },
  link: {
    marginTop: 20,
    paddingVertical: 12,
    paddingHorizontal: 24,
    backgroundColor: Colors.brand.primary,
    borderRadius: 24,
  },
  linkText: {
    fontSize: 15,
    color: '#fff',
    fontWeight: '700',
  },
});
