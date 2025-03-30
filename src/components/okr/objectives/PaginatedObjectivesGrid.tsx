
import React from 'react';
import { ObjectiveCard } from '@/components/okr/objectives/ObjectiveCard';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { Button } from "@/components/ui/button";
import { 
  Pagination, 
  PaginationContent, 
  PaginationItem, 
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
  const renderPaginationItems = () => {
    const items = [];
    const maxVisiblePages = 5;
    const halfVisible = Math.floor(maxVisiblePages / 2);
    
    let startPage = Math.max(1, page - halfVisible);
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
    
    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      items.push(
        <PaginationItem key={i}>
          <Button
            variant={i === page ? "outline" : "ghost"}
            onClick={() => onPageChange(i)}
            className="cursor-pointer"
          >
            {i.toString()}
          </Button>
        </PaginationItem>
      );
    }
    
    return items;
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner size={36} />
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
                value={pageSize.toString()}
                onValueChange={(value) => onPageSizeChange(Number(value))}
              >
                <SelectTrigger className="w-16 h-8">
                  <SelectValue placeholder={pageSize.toString()} />
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
                  <Button
                    variant="ghost"
                    onClick={() => onPageChange(page - 1)}
                    disabled={page === 1}
                    className="cursor-pointer"
                  >
                    <PaginationPrevious />
                  </Button>
                </PaginationItem>
                
                {renderPaginationItems()}
                
                <PaginationItem>
                  <Button
                    variant="ghost"
                    onClick={() => onPageChange(page + 1)}
                    disabled={page === totalPages}
                    className="cursor-pointer"
                  >
                    <PaginationNext />
                  </Button>
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
