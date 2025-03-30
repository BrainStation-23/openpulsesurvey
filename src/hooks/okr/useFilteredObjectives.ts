
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
    data: objectives, 
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

        // Convert status filters to string array for the SQL function
        const statusFilters = filters.status.length > 0 
          ? filters.status.map(status => status.toString()) 
          : null;
        
        // Convert visibility to array if it's not 'all'
        const visibilityFilters = filters.visibility !== 'all' 
          ? [filters.visibility] 
          : null;

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
        
        // Handle the response format safely
        if (!data || !Array.isArray(data) || data.length === 0) {
          setTotalCount(0);
          return [];
        }
        
        // The response from search_objectives is an array with a single object
        // containing 'objectives' array and 'total_count'
        const result = data[0];
        
        if (!result || typeof result !== 'object') {
          setTotalCount(0);
          return [];
        }
        
        // Extract objectives array and total count
        const objectivesData = result.objectives || [];
        const count = result.total_count || 0;
        
        setTotalCount(count);
        
        // Make sure objectives is an array before mapping
        if (!Array.isArray(objectivesData)) {
          console.error('Expected objectives to be an array but got:', objectivesData);
          return [];
        }

        // Map the data to the expected format
        return objectivesData.map((obj): ObjectiveWithOwner => ({
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
    objectives: objectives || [],
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
