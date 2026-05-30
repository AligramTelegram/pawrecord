import { Link, Stack } from 'expo-router';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '../src/constants/colors';

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ title: 'Not Found' }} />
      <View style={styles.container}>
        <Text style={styles.title}>Page not found</Text>
        <Link href="/" style={styles.link}>
          <Text style={styles.linkText}>Go home</Text>
        </Link>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.neutral[50] },
  title: { fontSize: 20, fontWeight: '600', color: Colors.neutral[900] },
  link: { marginTop: 20 },
  linkText: { color: Colors.brand.primary, fontSize: 15 },
});
