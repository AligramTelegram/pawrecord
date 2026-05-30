// Dile göre varsayılan para birimi ve sembol
const LANG_CURRENCY: Record<string, { code: string; symbol: string; position: 'before' | 'after' }> = {
  en: { code: 'USD', symbol: '$',  position: 'before' },
  de: { code: 'EUR', symbol: '€',  position: 'after'  },
  fr: { code: 'EUR', symbol: '€',  position: 'after'  },
  es: { code: 'EUR', symbol: '€',  position: 'after'  },
  it: { code: 'EUR', symbol: '€',  position: 'after'  },
  pt: { code: 'EUR', symbol: '€',  position: 'after'  },
  ja: { code: 'JPY', symbol: '¥',  position: 'before' },
  ko: { code: 'KRW', symbol: '₩',  position: 'before' },
  nl: { code: 'EUR', symbol: '€',  position: 'before' },
  sv: { code: 'SEK', symbol: 'kr', position: 'after'  },
  tr: { code: 'TRY', symbol: '₺',  position: 'before' },
  zh: { code: 'CNY', symbol: '¥',  position: 'before' },
};

export function getCurrencyForLang(lang: string) {
  return LANG_CURRENCY[lang] ?? LANG_CURRENCY.en;
}

export function formatCurrency(amount: number | null | undefined, lang = 'en'): string {
  if (amount == null) return '—';
  const { symbol, position, code } = getCurrencyForLang(lang);

  // JPY ve KRW için ondalık yok
  const noDecimal = ['JPY', 'KRW'].includes(code);
  const formatted = noDecimal
    ? Math.round(amount).toLocaleString()
    : amount.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');

  return position === 'before' ? `${symbol}${formatted}` : `${formatted} ${symbol}`;
}

export function getCurrencyCode(lang: string): string {
  return LANG_CURRENCY[lang]?.code ?? 'USD';
}
