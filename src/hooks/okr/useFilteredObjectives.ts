
import { useState, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Objective, ObjectiveStatus } from '@/types/okr';
import { ObjectiveVisibilityCategory } from '@/hooks/okr/useObjectivesByVisibility';
import { ObjectiveWithOwner } from '@/types/okr-extended';
import { useToast } from '@/hooks/use-toast';

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
  }, [filters, sort]);

  const { 
    data: objectives, 
    isLoading,
    isError,
    error, 
    refetch
  } = useQuery({
    queryKey: ['objectives', 'filtered', filters, sort, page, pageSize, isAdmin],
    queryFn: async () => {
      try {
        // First, count total matching objectives for pagination
        let countQuery = supabase
          .from('objectives')
          .select('id', { count: 'exact', head: true });

        // Apply filters to count query
        countQuery = applyFiltersToQuery(countQuery, filters, isAdmin);

        const { count, error: countError } = await countQuery;
        
        if (countError) {
          console.error('Error counting objectives:', countError);
          throw countError;
        }
        
        // Update total count for pagination
        if (count !== null) {
          setTotalCount(count);
        }

        // Now build the main query with pagination
        let query = supabase
          .from('objectives')
          .select(`
            *,
            owners:profiles!objectives_owner_id_fkey(id, first_name, last_name, email, profile_image_url),
            key_results:key_results(id)
          `);
        
        // Apply filters
        query = applyFiltersToQuery(query, filters, isAdmin);
        
        // Apply sorting
        query = query.order(sort.column, { ascending: sort.direction === 'asc' });
        
        // Apply pagination
        const from = (page - 1) * pageSize;
        const to = from + pageSize - 1;
        query = query.range(from, to);
        
        const { data, error } = await query;
        
        if (error) {
          console.error('Error fetching objectives:', error);
          throw error;
        }
        
        return data.map(obj => {
          const ownerData = obj.owners && Array.isArray(obj.owners) && obj.owners.length > 0 
            ? obj.owners[0]
            : null;

          return {
            ...obj,
            id: obj.id,
            title: obj.title,
            description: obj.description,
            cycleId: obj.cycle_id,
            ownerId: obj.owner_id,
            status: obj.status,
            progress: obj.progress,
            visibility: obj.visibility,
            parentObjectiveId: obj.parent_objective_id,
            sbuId: obj.sbu_id,
            approvalStatus: obj.approval_status,
            createdAt: new Date(obj.created_at),
            updatedAt: new Date(obj.updated_at),
            owner: ownerData ? {
              id: ownerData.id,
              fullName: `${ownerData.first_name || ''} ${ownerData.last_name || ''}`.trim(),
              email: ownerData.email,
              avatarUrl: ownerData.profile_image_url
            } : undefined,
            keyResultsCount: obj.key_results ? obj.key_results.length : 0
          };
        }) as ObjectiveWithOwner[];
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
    enabled: true
  });

  // Helper function to apply filters to a query
  function applyFiltersToQuery(query: any, filters: ObjectivesFilter, isAdmin: boolean) {
    // Apply text search if provided
    if (filters.search) {
      query = query.ilike('title', `%${filters.search}%`);
    }
    
    // Filter by status if any selected
    if (filters.status && filters.status.length > 0) {
      query = query.in('status', filters.status);
    }
    
    // Filter by visibility
    if (filters.visibility !== 'all') {
      query = query.eq('visibility', filters.visibility);
      
      // For department visibility, filter by SBU if provided
      if (filters.visibility === 'department' && filters.sbuId) {
        query = query.eq('sbu_id', filters.sbuId);
      }
    }
    
    // Filter by cycle if selected
    if (filters.cycleId) {
      query = query.eq('cycle_id', filters.cycleId);
    }
    
    return query;
  }

  const handleFilterChange = (newFilters: ObjectivesFilter) => {
    setFilters(newFilters);
  };

  const handleSortChange = (column: SortColumn) => {
    if (sort.column === column) {
      // Toggle direction if clicking the same column
      setSort({
        column,
        direction: sort.direction === 'asc' ? 'desc' : 'asc',
      });
    } else {
      // Default to descending for new column
      setSort({
        column,
        direction: 'desc',
      });
    }
  };

  const invalidateQuery = () => {
    queryClient.invalidateQueries({ queryKey: ['objectives', 'filtered'] });
  };

  return {
    objectives,
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
    handleSortChange,
    refetch,
    invalidateQuery
  };
};

