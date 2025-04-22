
import { useState, useMemo } from 'react';
import { useDebounce } from '@/hooks/useDebounce';

type SortDirection = 'asc' | 'desc';
type SortConfig = {
  key: string;
  direction: SortDirection;
};

export function useManagerTable<T>(data: T[], defaultPageSize: number = 10) {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(defaultPageSize);
  const [sortConfig, setSortConfig] = useState<SortConfig[]>([]);

  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  const filteredData = useMemo(() => {
    return data.filter((item: any) => {
      const searchFields = [item.supervisor_name, item.sbu_name].map(field => 
        field?.toLowerCase() ?? ''
      );
      return searchFields.some(field => 
        field.includes(debouncedSearchTerm.toLowerCase())
      );
    });
  }, [data, debouncedSearchTerm]);

  const sortedData = useMemo(() => {
    if (sortConfig.length === 0) return filteredData;

    return [...filteredData].sort((a: any, b: any) => {
      for (const sort of sortConfig) {
        const direction = sort.direction === 'asc' ? 1 : -1;
        if (a[sort.key] < b[sort.key]) return -1 * direction;
        if (a[sort.key] > b[sort.key]) return 1 * direction;
      }
      return 0;
    });
  }, [filteredData, sortConfig]);

  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return sortedData.slice(startIndex, startIndex + pageSize);
  }, [sortedData, currentPage, pageSize]);

  const totalPages = Math.ceil(sortedData.length / pageSize);

  const handleSort = (key: string) => {
    setSortConfig(currentSort => {
      const existingSort = currentSort.find(s => s.key === key);
      if (!existingSort) {
        return [...currentSort, { key, direction: 'desc' }];
      }
      if (existingSort.direction === 'desc') {
        return currentSort.map(s => 
          s.key === key ? { ...s, direction: 'asc' } : s
        );
      }
      return currentSort.filter(s => s.key !== key);
    });
  };

  return {
    paginatedData,
    totalPages,
    currentPage,
    setCurrentPage,
    pageSize,
    setPageSize,
    searchTerm,
    setSearchTerm,
    sortConfig,
    handleSort,
    totalItems: sortedData.length
  };
}
