import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform, Modal } from 'react-native';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { useTranslation } from 'react-i18next';
import { Colors } from '../../constants/colors';
import { formatDate } from '../../utils/dates';

interface DatePickerInputProps {
  label: string;
  value: string;
  onChange: (val: string) => void;
  minimumDate?: Date;
  maximumDate?: Date;
  optional?: boolean;
  icon?: string;
}

function toDate(str: string): Date {
  if (!str) return new Date();
  const d = new Date(str + 'T12:00:00');
  return isNaN(d.getTime()) ? new Date() : d;
}

function toStr(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

const FAR_FUTURE = new Date(2100, 0, 1);
const FAR_PAST   = new Date(1900, 0, 1);

export function DatePickerInput({
  label, value, onChange,
  minimumDate = FAR_PAST,
  maximumDate = FAR_FUTURE,
  optional, icon = '📅',
}: DatePickerInputProps) {
  const { t: tc, i18n } = useTranslation('common');
  const [open, setOpen] = useState(false);
  const [tempDate, setTempDate] = useState<Date>(toDate(value));
  const hasValue = !!value;

  function handleAndroid(_: DateTimePickerEvent, date?: Date) {
    setOpen(false);
    if (date) onChange(toStr(date));
  }

  function handleIOSChange(_: DateTimePickerEvent, date?: Date) {
    if (date) setTempDate(date);
  }

  function confirmIOS() {
    onChange(toStr(tempDate));
    setOpen(false);
  }

  function openPicker() {
    setTempDate(toDate(value));
    setOpen(true);
  }

  const displayValue = hasValue ? formatDate(value, i18n.language) : '';

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>

      <TouchableOpacity
        style={[styles.trigger, open && styles.triggerActive]}
        onPress={openPicker}
        activeOpacity={0.75}
      >
        <Text style={styles.triggerIcon}>{icon}</Text>
        <Text style={[styles.triggerText, !hasValue && styles.placeholder]}>
          {hasValue ? displayValue : tc('actions.add') + ' ' + label.toLowerCase() + '...'}
        </Text>
        {hasValue ? (
          <TouchableOpacity onPress={() => onChange('')} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Text style={styles.clearIcon}>✕</Text>
          </TouchableOpacity>
        ) : (
          <Text style={styles.chevron}>›</Text>
        )}
      </TouchableOpacity>

      {/* Android */}
      {open && Platform.OS === 'android' && (
        <DateTimePicker
          value={tempDate}
          mode="date"
          display="default"
          onChange={handleAndroid}
          minimumDate={minimumDate}
          maximumDate={maximumDate}
        />
      )}

      {/* iOS — spinner modunda modal */}
      {Platform.OS === 'ios' && (
        <Modal visible={open} transparent animationType="slide" statusBarTranslucent>
          <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={() => setOpen(false)} />
          <View style={styles.sheet}>
            <View style={styles.sheetHandle} />
            <View style={styles.sheetHeader}>
              <TouchableOpacity onPress={() => setOpen(false)}>
                <Text style={styles.cancelText}>{tc('actions.cancel')}</Text>
              </TouchableOpacity>
              <Text style={styles.sheetTitle}>{label}</Text>
              <TouchableOpacity onPress={confirmIOS}>
                <Text style={styles.doneText}>{tc('actions.done')}</Text>
              </TouchableOpacity>
            </View>

            <DateTimePicker
              value={tempDate}
              mode="date"
              display="spinner"
              onChange={handleIOSChange}
              minimumDate={minimumDate}
              maximumDate={maximumDate}
              textColor={Colors.neutral[900]}
              style={styles.spinner}
            />

            {optional && (
              <TouchableOpacity
                style={styles.clearBtn}
                onPress={() => { onChange(''); setOpen(false); }}
              >
                <Text style={styles.clearBtnText}>🗑  {tc('actions.delete')}</Text>
              </TouchableOpacity>
            )}
          </View>
        </Modal>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginBottom: 18 },
  label: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.neutral[500],
    marginBottom: 8,
    letterSpacing: 0.2,
  },
  trigger: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.card,
    borderWidth: 1.5,
    borderColor: Colors.cardBorder,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 14,
    gap: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  triggerActive: {
    borderColor: Colors.brand.primary,
    shadowColor: Colors.brand.primary,
    shadowOpacity: 0.15,
    shadowRadius: 8,
  },
  triggerIcon: { fontSize: 18 },
  triggerText: { flex: 1, fontSize: 15, color: Colors.neutral[900], fontWeight: '500' },
  placeholder: { color: Colors.neutral[300] },
  chevron: { fontSize: 20, color: Colors.neutral[300] },
  clearIcon: { fontSize: 13, color: Colors.neutral[400], padding: 4 },
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.35)' },
  sheet: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    backgroundColor: '#F9F9F9',
    borderTopLeftRadius: 20, borderTopRightRadius: 20,
    paddingBottom: 36,
  },
  sheetHandle: {
    width: 36, height: 4, borderRadius: 2,
    backgroundColor: Colors.neutral[300],
    alignSelf: 'center', marginTop: 10, marginBottom: 4,
  },
  sheetHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 20, paddingVertical: 14,
    borderBottomWidth: 0.5, borderBottomColor: Colors.neutral[200],
  },
  sheetTitle: { fontSize: 16, fontWeight: '700', color: Colors.neutral[900] },
  cancelText: { fontSize: 15, color: Colors.neutral[500] },
  doneText: { fontSize: 15, fontWeight: '700', color: Colors.brand.primary },
  spinner: { width: '100%', height: 200 },
  clearBtn: { alignItems: 'center', paddingVertical: 14 },
  clearBtnText: { fontSize: 14, color: Colors.semantic.danger, fontWeight: '600' },
});
