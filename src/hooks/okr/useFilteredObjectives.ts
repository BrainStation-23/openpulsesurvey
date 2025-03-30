
import { useState, useEffect, useCallback } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { ObjectiveStatus } from '@/types/okr';
import { ObjectiveVisibilityCategory } from '@/hooks/okr/useObjectivesByVisibility';
import { ObjectiveWithOwner } from '@/types/okr-extended';
import { useToast } from '@/hooks/use-toast';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { useDebounce } from '@/hooks/useDebounce';

export type ObjectivesFilter = {
  search: string;
  status: ObjectiveStatus[];
  visibility: ObjectiveVisibilityCategory;
  cycleId?: string;
  sbuId?: string;
};

export type SortColumn = 'title' | 'owner' | 'status' | 'progress' | 'created_at';
export type SortDirection = 'asc' | 'desc';
export type ObjectiveSort = {
  column: SortColumn;
  direction: SortDirection;
};

export const DEFAULT_PAGE_SIZE = 10;

// Define the shape of the response data from the search_objectives function
interface SearchObjectivesResponse {
  objectives: any[];
  total_count: number;
}

export const useFilteredObjectives = (isAdmin: boolean = false) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user } = useCurrentUser();
  const [searchText, setSearchText] = useState<string>('');
  const debouncedSearchText = useDebounce<string>(searchText, 300);
  
  const [filters, setFilters] = useState<ObjectivesFilter>({
    search: '',
    status: [],
    visibility: 'all',
    cycleId: undefined,
    sbuId: undefined,
  });
  
  const [sort, setSort] = useState<ObjectiveSort>({
    column: 'created_at',
    direction: 'desc',
  });
  
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const [totalCount, setTotalCount] = useState(0);

  // Clear pagination when filters change
  useEffect(() => {
    setPage(1);
  }, [filters, debouncedSearchText, sort]);

  const { 
    data, 
    isLoading,
    isError,
    error, 
    refetch
  } = useQuery({
    queryKey: ['objectives', 'filtered', filters, debouncedSearchText, sort, page, pageSize, isAdmin, user?.id],
    queryFn: async () => {
      try {
        if (!user?.id) {
          throw new Error('User not authenticated');
        }

        // Send status filters properly formatted
        // Using simple string array to avoid type mismatches with database enums
        const statusFilters = filters.status.length > 0 ? filters.status : null;
        
        // Convert visibility to array if it's not 'all'
        const visibilityFilters = filters.visibility !== 'all' ? 
          [filters.visibility] : null;

        // Call our custom SQL function
        const { data, error } = await supabase.rpc('search_objectives', {
          p_search_text: debouncedSearchText,
          p_status_filters: statusFilters,
          p_visibility_filters: visibilityFilters,
          p_cycle_id: filters.cycleId,
          p_sbu_id: filters.sbuId,
          p_is_admin: isAdmin,
          p_user_id: user.id,
          p_page_number: page,
          p_page_size: pageSize
        });

        if (error) {
          console.error('Error fetching objectives:', error);
          throw error;
        }
        
        // With the new return type, we need to handle it differently
        // data is now an array of jsonb objects, we need the first one
        if (!data || !Array.isArray(data) || data.length === 0) {
          setTotalCount(0);
          return [];
        }
        
        // The first item contains our result object with objectives array and total_count
        // Explicitly cast the result to our interface type
        const result = data[0] as unknown as SearchObjectivesResponse;
        
        // Extract objectives and total count
        const objectives = result.objectives || [];
        setTotalCount(result.total_count || 0);
        
        // Make sure objectives is an array before mapping
        if (Array.isArray(objectives)) {
          interface EnhancedObjectiveWithOwner extends ObjectiveWithOwner {
            childCount?: number;
          }

          return objectives.map((obj: any): EnhancedObjectiveWithOwner => ({
            id: obj.id,
            title: obj.title,
            description: obj.description,
            status: obj.status,
            progress: obj.progress,
            visibility: obj.visibility,
            ownerId: obj.ownerId,
            cycleId: obj.cycleId,
            parentObjectiveId: obj.parentObjectiveId,
            sbuId: obj.sbuId,
            createdAt: new Date(obj.createdAt),
            updatedAt: new Date(obj.updatedAt || Date.now()),
            approvalStatus: obj.approvalStatus || 'pending',
            owner: obj.ownerName ? {
              id: obj.ownerId,
              fullName: obj.ownerName,
              email: '',  // Email not returned for privacy reasons
            } : undefined,
            keyResultsCount: obj.keyResultsCount || 0,
            childCount: obj.childCount || 0
          }));
        } else {
          console.error('Expected objectives to be an array but got:', objectives);
          return [];
        }
      } catch (error) {
        console.error('Error in useFilteredObjectives:', error);
        toast({
          variant: 'destructive',
          title: 'Error fetching objectives',
          description: (error as Error).message,
        });
        return [];
      }
    },
    enabled: !!user?.id
  });

  const handleFilterChange = useCallback((newFilters: ObjectivesFilter) => {
    setFilters(newFilters);
  }, []);

  const handleSearchChange = useCallback((search: string) => {
    setSearchText(search);
  }, []);

  const handleSortChange = useCallback((column: SortColumn) => {
    setSort(prev => ({
      column,
      direction: prev.column === column && prev.direction === 'asc' ? 'desc' : 'asc',
    }));
  }, []);

  const invalidateQuery = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ['objectives', 'filtered'] });
  }, [queryClient]);

  return {
    objectives: data || [],
    filters,
    sort,
    isLoading,
    isError,
    error,
    page,
    pageSize,
    totalCount,
    totalPages: Math.ceil(totalCount / pageSize),
    setPage,
    setPageSize,
    handleFilterChange,
    handleSearchChange,
    handleSortChange,
    refetch,
    invalidateQuery
  };
};
