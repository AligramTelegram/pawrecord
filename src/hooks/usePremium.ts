import { useSubscriptionStore } from '../store/subscription';

export function usePremium() {
  const { isPremium, isLoading } = useSubscriptionStore();
  return { isPremium, isLoading };
}
