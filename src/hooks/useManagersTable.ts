
import { useState } from "react";
import { useDebounce } from "@/hooks/use-debounce";

// This type is more flexible and will work with different table data structures
export function useManagersTable<T extends Record<string, any>>(data: T[]) {
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [sortConfig, setSortConfig] = useState<{
    key: keyof T | null;
    direction: "asc" | "desc";
  }>({ key: null, direction: "asc" });

  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  // Filter data based on search query
  const filteredData = data.filter((item) => {
    if (!debouncedSearchQuery) return true;
    
    const searchTerm = debouncedSearchQuery.toLowerCase();
    
    // Search across all string properties
    return Object.entries(item).some(([key, value]) => {
      // Only search through string values
      return typeof value === 'string' && value.toLowerCase().includes(searchTerm);
    });
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

  const handleSort = (key: keyof T) => {
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
