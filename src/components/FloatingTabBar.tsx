import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { Colors } from '../constants/colors';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';

const TAB_ICONS: Record<string, string> = {
  index: '🐾', health: '💊', calendar: '📅', settings: '⚙️',
};

const TAB_KEYS: Record<string, string> = {
  index: 'nav.pets', health: 'nav.health', calendar: 'nav.calendar', settings: 'nav.settings',
};

export default function FloatingTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const { t } = useTranslation('common');

  const visible = state.routes.filter(r => TAB_ICONS[r.name] !== undefined);

  return (
    <View style={[styles.outer, { paddingBottom: insets.bottom || 16 }]}>
      <View style={styles.bar}>
        {visible.map((route) => {
          const focused = state.routes[state.index].name === route.name;

          return (
            <TouchableOpacity
              key={route.key}
              onPress={() => navigation.navigate(route.name)}
              activeOpacity={0.75}
              style={[styles.item, focused && styles.itemActive]}
            >
              <Text style={[styles.icon, focused && styles.iconActive]}>
                {TAB_ICONS[route.name]}
              </Text>
              {focused && (
                <Text style={styles.label} numberOfLines={1}>
                  {t(TAB_KEYS[route.name] as any)}
                </Text>
              )}
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  outer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 40,
    paddingVertical: 8,
    paddingHorizontal: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 20,
    elevation: 14,
    gap: 6,
  },
  item: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 30,
    paddingVertical: 10,
    paddingHorizontal: 16,
    minWidth: 52,
  },
  itemActive: {
    backgroundColor: Colors.brand.primary,
    flexDirection: 'row',
    gap: 6,
    paddingHorizontal: 20,
  },
  icon: {
    fontSize: 22,
    opacity: 0.4,
  },
  iconActive: {
    opacity: 1,
    fontSize: 20,
  },
  label: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 13,
  },
});
