
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Response, FilterOptions, RPCResponseItem } from "../types";
import { useToast } from "@/components/ui/use-toast";

interface UseResponsesDataProps {
  campaignId: string;
  instanceId?: string;
}

export function useResponsesData({ campaignId, instanceId }: UseResponsesDataProps) {
  const { toast } = useToast();
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [filters, setFilters] = useState<FilterOptions>({
    search: "",
    sortBy: "date",
    sortDirection: "desc",
  });

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [filters, pageSize, instanceId]);

  const {
    data: responsesData,
    isLoading,
    isFetching,
    error,
  } = useQuery({
    queryKey: [
      "paginated-responses",
      campaignId,
      instanceId,
      currentPage,
      pageSize,
      filters.search,
      filters.sortBy,
      filters.sortDirection
    ],
    queryFn: async () => {
      if (!instanceId) return { data: [], totalCount: 0 };

      try {
        const { data, error } = await supabase.rpc('get_paginated_campaign_responses', {
          p_campaign_id: campaignId,
          p_instance_id: instanceId,
          p_search_term: filters.search || null,
          p_page: currentPage,
          p_page_size: pageSize,
          p_sort_by: filters.sortBy,
          p_sort_direction: filters.sortDirection
        });

        if (error) throw error;
        
        // The data returned from RPC is an array of RPCResponseItem
        const responseItems = data as RPCResponseItem[];
        
        // Extract total count from the first row if available
        const totalCount = responseItems.length > 0 ? responseItems[0].total_count : 0;
        
        return { 
          data: responseItems,
          totalCount
        };
      } catch (error) {
        console.error("Error fetching responses:", error);
        toast({
          title: "Error fetching responses",
          description: "There was a problem loading the survey responses.",
          variant: "destructive",
        });
        return { data: [], totalCount: 0 };
      }
    },
    enabled: !!instanceId,
  });

  const totalPages = Math.ceil((responsesData?.totalCount || 0) / pageSize);
  
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handlePageSizeChange = (size: string) => {
    setPageSize(parseInt(size));
  };

  return {
    responses: responsesData?.data || [],
    totalCount: responsesData?.totalCount || 0,
    isLoading,
    isFetching,
    error,
    currentPage,
    pageSize,
    totalPages,
    filters,
    setFilters,
    handlePageChange,
    handlePageSizeChange
  };
}
