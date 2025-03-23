
import { useQuery } from '@tanstack/react-query';
import { KeyResult } from '@/types/okr';
import { fetchKeyResult } from './utils/keyResultUtils';

/**
 * Hook to fetch a key result by ID
 */
export const useKeyResultQuery = (id?: string) => {
  return useQuery<KeyResult | null, Error>({
    queryKey: ['key-result', id],
    queryFn: () => fetchKeyResult(id || ''),
    enabled: !!id
  });
};
