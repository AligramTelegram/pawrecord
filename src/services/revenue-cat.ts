import { Platform } from 'react-native';
import Constants from 'expo-constants';

// RevenueCat is not available in Expo Go; skip entirely
const isExpoGo = Constants.executionEnvironment === 'storeClient';
let Purchases: any = null;

if (!isExpoGo) {
  try {
    Purchases = require('react-native-purchases').default;
  } catch {
    // native module not linked
  }
}

const RC_API_KEY = process.env.EXPO_PUBLIC_REVENUECAT_IOS_KEY ?? '';

export async function initRevenueCat(): Promise<void> {
  if (!Purchases || !RC_API_KEY || Platform.OS !== 'ios') return;
  try {
    await Purchases.configure({ apiKey: RC_API_KEY });
  } catch (e) {
    console.warn('RevenueCat init failed:', e);
  }
}

export async function checkPremium(): Promise<boolean> {
  if (!Purchases) return false;
  try {
    const info = await Purchases.getCustomerInfo();
    return info.entitlements.active['premium'] !== undefined;
  } catch {
    return false;
  }
}

export async function getOfferings(): Promise<any | null> {
  if (!Purchases) return null;
  try {
    const offerings = await Purchases.getOfferings();
    return offerings.current;
  } catch (e) {
    console.error('RC offerings error:', e);
    return null;
  }
}

export async function purchasePackage(pkg: any): Promise<boolean> {
  if (!Purchases) return false;
  try {
    const { customerInfo } = await Purchases.purchasePackage(pkg);
    return customerInfo.entitlements.active['premium'] !== undefined;
  } catch (e: any) {
    if (!e.userCancelled) throw e;
    return false;
  }
}

export async function restorePurchases(): Promise<boolean> {
  if (!Purchases) return false;
  try {
    const info = await Purchases.restorePurchases();
    return info.entitlements.active['premium'] !== undefined;
  } catch {
    return false;
  }
}
