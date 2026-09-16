import { useAppContext } from '../context/AppContext';

export { useAppContext };

/**
 * useRestaurantData hook backed by the centralized AppContext
 * Ensures full real-time reactivity across all pages and modals without duplicated state
 */
export function useRestaurantData() {
  return useAppContext();
}

