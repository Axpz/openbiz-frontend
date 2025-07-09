import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Plan } from '@/lib/types';
import axios from '@/lib/api/axios';

export function usePlans() {
  const queryClient = useQueryClient();

  const { data: plans, isLoading, error } = useQuery({
    queryKey: ['plans'],
    queryFn: async () => {
      const res = await axios.get<{ plans: Plan[] }>('/api/pricing/plans/all');
      return res.data.plans;
    },
  });

  const invalidateOrders = () => {
    queryClient.invalidateQueries({ queryKey: ['orders'] });
  };

  return {
    plans,
    isLoading,
    error,
    invalidateOrders,
  };
} 