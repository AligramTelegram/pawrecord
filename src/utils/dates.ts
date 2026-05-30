import { format, differenceInDays } from 'date-fns';
import { Locale } from 'date-fns';
import { enUS, de, fr, es, it, pt, ja, ko, nl, sv, tr, zhCN } from 'date-fns/locale';

const DATE_LOCALES: Record<string, Locale> = {
  en: enUS, de, fr, es, it, pt, ja, ko, nl, sv, tr, zh: zhCN,
};

// Her dil için tarih formatı — kısa ve uzun
const DATE_FORMATS: Record<string, { short: string; long: string; monthDay: string }> = {
  en: { short: 'MM/dd/yyyy',  long: 'MMMM d, yyyy',    monthDay: 'MMM d'    },
  de: { short: 'dd.MM.yyyy',  long: 'd. MMMM yyyy',    monthDay: 'd. MMM'   },
  fr: { short: 'dd/MM/yyyy',  long: 'd MMMM yyyy',     monthDay: 'd MMM'    },
  es: { short: 'dd/MM/yyyy',  long: "d 'de' MMMM 'de' yyyy", monthDay: 'd MMM' },
  it: { short: 'dd/MM/yyyy',  long: 'd MMMM yyyy',     monthDay: 'd MMM'    },
  pt: { short: 'dd/MM/yyyy',  long: "d 'de' MMMM 'de' yyyy", monthDay: 'd MMM' },
  ja: { short: 'yyyy/MM/dd',  long: 'yyyy年M月d日',    monthDay: 'M月d日'   },
  ko: { short: 'yyyy.MM.dd',  long: 'yyyy년 M월 d일',  monthDay: 'M월 d일'  },
  nl: { short: 'dd-MM-yyyy',  long: 'd MMMM yyyy',     monthDay: 'd MMM'    },
  sv: { short: 'yyyy-MM-dd',  long: 'd MMMM yyyy',     monthDay: 'd MMM'    },
  tr: { short: 'dd.MM.yyyy',  long: 'd MMMM yyyy',     monthDay: 'd MMM'    },
  zh: { short: 'yyyy/MM/dd',  long: 'yyyy年M月d日',    monthDay: 'M月d日'   },
};

export function formatDate(
  date: Date | string | null | undefined,
  lang = 'en',
  fmt?: string,
): string {
  if (!date) return '—';
  const d = typeof date === 'string' ? new Date(date + (date.length === 10 ? 'T12:00:00' : '')) : date;
  if (isNaN(d.getTime())) return '—';
  const resolvedFmt = fmt ?? DATE_FORMATS[lang]?.long ?? DATE_FORMATS.en.long;
  return format(d, resolvedFmt, { locale: DATE_LOCALES[lang] ?? enUS });
}

export function formatDateShort(date: Date | string | null | undefined, lang = 'en'): string {
  return formatDate(date, lang, DATE_FORMATS[lang]?.short ?? DATE_FORMATS.en.short);
}

export function formatMonthDay(date: Date | string | null | undefined, lang = 'en'): string {
  return formatDate(date, lang, DATE_FORMATS[lang]?.monthDay ?? DATE_FORMATS.en.monthDay);
}

export function getVaccineStatus(nextDue?: string): 'up_to_date' | 'due_soon' | 'overdue' {
  if (!nextDue) return 'up_to_date';
  const days = differenceInDays(new Date(nextDue), new Date());
  if (days < 0) return 'overdue';
  if (days <= 30) return 'due_soon';
  return 'up_to_date';
}

export function getPetAge(dateOfBirth?: string): { years: number; months: number } {
  if (!dateOfBirth) return { years: 0, months: 0 };
  const birth = new Date(dateOfBirth);
  const now = new Date();
  let years = now.getFullYear() - birth.getFullYear();
  let months = now.getMonth() - birth.getMonth();
  if (months < 0) { years--; months += 12; }
  return { years, months };
}
