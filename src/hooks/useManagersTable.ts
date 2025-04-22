
import { useState } from "react";
import { SupervisorPerformer } from "@/pages/admin/surveys/campaigns/[id]/components/InstanceCompareTab/types/instance-comparison";
import { useDebounce } from "@/hooks/use-debounce";

export function useManagersTable(data: SupervisorPerformer[]) {
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [sortConfig, setSortConfig] = useState<{
    key: keyof SupervisorPerformer | null;
    direction: "asc" | "desc";
  }>({ key: "base_rank", direction: "asc" });

  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  // Filter data based on search query
  const filteredData = data.filter((manager) => {
    if (!debouncedSearchQuery) return true;
    const searchTerm = debouncedSearchQuery.toLowerCase();
    return (
      manager.name.toLowerCase().includes(searchTerm) ||
      manager.department?.toLowerCase().includes(searchTerm)
    );
  });

  // Sort data
  const sortedData = [...filteredData].sort((a, b) => {
    if (!sortConfig.key) return 0;
    
    const aValue = a[sortConfig.key];
    const bValue = b[sortConfig.key];
    
    if (typeof aValue === "number" && typeof bValue === "number") {
      return sortConfig.direction === "asc" ? aValue - bValue : bValue - aValue;
    }
    
    if (typeof aValue === "string" && typeof bValue === "string") {
      return sortConfig.direction === "asc" 
        ? aValue.localeCompare(bValue)
        : bValue.localeCompare(aValue);
    }
    
    return 0;
  });

  // Paginate data
  const totalPages = Math.ceil(sortedData.length / pageSize);
  const paginatedData = sortedData.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const handleSort = (key: keyof SupervisorPerformer) => {
    setSortConfig((current) => ({
      key,
      direction:
        current.key === key && current.direction === "asc" ? "desc" : "asc",
    }));
  };

  return {
    paginatedData,
    totalPages,
    currentPage,
    pageSize,
    searchQuery,
    sortConfig,
    setSearchQuery,
    setCurrentPage,
    setPageSize,
    handleSort,
  };
}
