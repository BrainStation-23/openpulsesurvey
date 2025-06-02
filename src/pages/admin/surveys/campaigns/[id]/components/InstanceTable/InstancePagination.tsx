
import { ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { PaginationOptions } from "../../hooks/useInstanceManagement";

interface InstancePaginationProps {
  totalCount: number;
  pagination: PaginationOptions;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
}

export function InstancePagination({
  totalCount,
  pagination,
  onPageChange,
  onPageSizeChange
}: InstancePaginationProps) {
  const totalPages = Math.ceil(totalCount / pagination.pageSize);

  const renderPaginationItems = () => {
    const items = [];
    const maxVisiblePages = 5;
    
    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        items.push(
          <PaginationItem key={i}>
            <PaginationLink 
              isActive={pagination.page === i}
              onClick={() => onPageChange(i)}
            >
              {i}
            </PaginationLink>
          </PaginationItem>
        );
      }
    } else {
      items.push(
        <PaginationItem key={1}>
          <PaginationLink 
            isActive={pagination.page === 1}
            onClick={() => onPageChange(1)}
          >
            1
          </PaginationLink>
        </PaginationItem>
      );
      
      let startPage = Math.max(2, pagination.page - 1);
      let endPage = Math.min(totalPages - 1, pagination.page + 1);
      
      if (pagination.page <= 3) {
        endPage = Math.min(4, totalPages - 1);
      }
      
      if (pagination.page >= totalPages - 2) {
        startPage = Math.max(2, totalPages - 3);
      }
      
      if (startPage > 2) {
        items.push(
          <PaginationItem key="ellipsis-1">
            <PaginationEllipsis />
          </PaginationItem>
        );
      }
      
      for (let i = startPage; i <= endPage; i++) {
        items.push(
          <PaginationItem key={i}>
            <PaginationLink 
              isActive={pagination.page === i}
              onClick={() => onPageChange(i)}
            >
              {i}
            </PaginationLink>
          </PaginationItem>
        );
      }
      
      if (endPage < totalPages - 1) {
        items.push(
          <PaginationItem key="ellipsis-2">
            <PaginationEllipsis />
          </PaginationItem>
        );
      }
      
      items.push(
        <PaginationItem key={totalPages}>
          <PaginationLink 
            isActive={pagination.page === totalPages}
            onClick={() => onPageChange(totalPages)}
          >
            {totalPages}
          </PaginationLink>
        </PaginationItem>
      );
    }
    
    return items;
  };

  if (totalPages <= 1) return null;

  return (
    <div className="flex justify-between items-center mt-4">
      <div className="flex items-center gap-2">
        <span className="text-sm text-muted-foreground">Items per page:</span>
        <Select
          value={pagination.pageSize.toString()}
          onValueChange={(value) => onPageSizeChange(parseInt(value))}
        >
          <SelectTrigger className="w-16 h-8">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="5">5</SelectItem>
            <SelectItem value="10">10</SelectItem>
            <SelectItem value="20">20</SelectItem>
            <SelectItem value="50">50</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <Pagination>
        <PaginationContent>
          <PaginationItem>
            {pagination.page === 1 ? (
              <Button 
                variant="outline" 
                size="icon" 
                disabled 
                className="cursor-not-allowed opacity-50"
              >
                <ChevronUp className="h-4 w-4 rotate-90" />
              </Button>
            ) : (
              <PaginationPrevious 
                onClick={() => onPageChange(Math.max(1, pagination.page - 1))}
              />
            )}
          </PaginationItem>
          
          {renderPaginationItems()}
          
          <PaginationItem>
            {pagination.page === totalPages ? (
              <Button 
                variant="outline" 
                size="icon" 
                disabled 
                className="cursor-not-allowed opacity-50"
              >
                <ChevronUp className="h-4 w-4 -rotate-90" />
              </Button>
            ) : (
              <PaginationNext 
                onClick={() => onPageChange(Math.min(totalPages, pagination.page + 1))}
              />
            )}
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  );
}
