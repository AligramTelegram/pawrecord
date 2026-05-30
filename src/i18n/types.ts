import type common from './locales/en/common.json';
import type pets from './locales/en/pets.json';
import type health from './locales/en/health.json';
import type paywall from './locales/en/paywall.json';

declare module 'i18next' {
  interface CustomTypeOptions {
    defaultNS: 'common';
    resources: {
      common: typeof common;
      pets: typeof pets;
      health: typeof health;
      paywall: typeof paywall;
    };
  }
}
