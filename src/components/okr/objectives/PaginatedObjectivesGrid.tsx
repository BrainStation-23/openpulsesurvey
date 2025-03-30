import React from 'react';
import { ObjectiveCard } from '@/components/okr/objectives/ObjectiveCard';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { 
  Pagination, 
  PaginationContent, 
  PaginationEllipsis, 
  PaginationItem, 
  PaginationLink, 
  PaginationNext, 
  PaginationPrevious 
} from '@/components/ui/pagination';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { ObjectiveWithOwner } from '@/types/okr-extended';

interface PaginatedObjectivesGridProps {
  objectives: ObjectiveWithOwner[];
  isLoading: boolean;
  isAdmin?: boolean;
  page: number;
  pageSize: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
  objectiveChildCounts?: Record<string, number>;
}

export const PaginatedObjectivesGrid: React.FC<PaginatedObjectivesGridProps> = ({
  objectives,
  isLoading,
  isAdmin = false,
  page,
  pageSize,
  totalPages,
  onPageChange,
  onPageSizeChange,
  objectiveChildCounts = {}
}) => {
  const getPageNumbers = () => {
    const pages: (number | 'ellipsis')[] = [];
    
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      pages.push(1);
      
      if (page <= 3) {
        pages.push(2, 3, 4, 5, 'ellipsis');
      } else if (page >= totalPages - 2) {
        pages.push('ellipsis', totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1);
      } else {
        pages.push('ellipsis', page - 1, page, page + 1, 'ellipsis');
      }
      
      pages.push(totalPages);
    }
    
    return pages;
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {objectives && objectives.length > 0 ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {objectives.map((objective) => (
              <ObjectiveCard 
                key={objective.id} 
                objective={objective} 
                isAdmin={isAdmin}
                childCount={objectiveChildCounts[objective.id] || 0}
              />
            ))}
          </div>
          
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-4">
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Rows per page</span>
              <Select
                value={String(pageSize)}
                onValueChange={(value) => onPageSizeChange(Number(value))}
              >
                <SelectTrigger className="w-16 h-8">
                  <SelectValue placeholder={String(pageSize)} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="5">5</SelectItem>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="15">15</SelectItem>
                  <SelectItem value="20">20</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious 
                    aria-disabled={page === 1}
                    className={page === 1 ? 'pointer-events-none opacity-50' : ''}
                    onClick={() => page > 1 && onPageChange(page - 1)}
                  />
                </PaginationItem>
                
                {getPageNumbers().map((pageNum, idx) => 
                  pageNum === 'ellipsis' ? (
                    <PaginationItem key={`ellipsis-${idx}`}>
                      <PaginationEllipsis />
                    </PaginationItem>
                  ) : (
                    <PaginationItem key={pageNum}>
                      <PaginationLink
                        isActive={page === pageNum}
                        onClick={() => onPageChange(pageNum as number)}
                      >
                        {pageNum}
                      </PaginationLink>
                    </PaginationItem>
                  )
                )}
                
                <PaginationItem>
                  <PaginationNext 
                    aria-disabled={page === totalPages}
                    className={page === totalPages ? 'pointer-events-none opacity-50' : ''}
                    onClick={() => page < totalPages && onPageChange(page + 1)}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        </>
      ) : (
        <div className="text-center py-12">
          <p className="text-muted-foreground">
            No objectives found matching your filters.
          </p>
        </div>
      )}
    </div>
  );
};
