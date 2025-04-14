
import { useState } from "react";
import { Response } from "./types";
import { ResponsesList } from "./ResponsesList";
import { ResponsesFilters } from "./ResponsesFilters";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { exportResponses } from "./utils/export";
import { useToast } from "@/components/ui/use-toast";
import { useResponsesData } from "./hooks/useResponsesData";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { PageSizeSelector } from "../AssignmentsTab/components/AssignmentInstanceList/components/PageSizeSelector";
import { ResponseDetails } from "./ResponseDetails";
import { RPCResponseItem } from "./types";

interface ResponsesTabProps {
  campaignId: string;
  instanceId?: string;
}

export function ResponsesTab({ campaignId, instanceId }: ResponsesTabProps) {
  const { toast } = useToast();
  const [isExporting, setIsExporting] = useState(false);
  const [selectedResponse, setSelectedResponse] = useState<RPCResponseItem | null>(null);

  const {
    responses,
    totalCount,
    isLoading,
    isFetching,
    currentPage,
    pageSize,
    totalPages,
    filters,
    setFilters,
    handlePageChange,
    handlePageSizeChange
  } = useResponsesData({ campaignId, instanceId });

  const handleExport = async () => {
    if (responses.length && instanceId) {
      try {
        setIsExporting(true);
        await exportResponses(responses, campaignId, instanceId);
        toast({
          title: "Export successful",
          description: "Your survey responses have been exported to CSV.",
        });
      } catch (error) {
        console.error('Export error:', error);
        toast({
          title: "Export failed",
          description: "There was an error exporting the survey responses.",
          variant: "destructive",
        });
      } finally {
        setIsExporting(false);
      }
    }
  };

  const handleResponseView = (response: RPCResponseItem) => {
    setSelectedResponse(response);
  };

  const handleCloseResponseDetails = () => {
    setSelectedResponse(null);
  };

  if (isLoading && !isFetching) {
    return (
      <div className="space-y-4">
        <div className="h-12 w-full animate-pulse bg-muted rounded" />
        <div className="h-32 w-full animate-pulse bg-muted rounded" />
      </div>
    );
  }

  if (!instanceId) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        Please select a period to view responses.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <ResponsesFilters filters={filters} onFiltersChange={setFilters} />
        <div className="flex items-center gap-2">
          <PageSizeSelector
            pageSize={pageSize}
            onPageSizeChange={handlePageSizeChange}
          />
          <Button 
            variant="outline" 
            onClick={handleExport} 
            disabled={!responses.length || isExporting || !instanceId}
          >
            <Download className="h-4 w-4 mr-2" />
            {isExporting ? "Exporting..." : "Export"}
          </Button>
        </div>
      </div>

      <ResponsesList 
        responses={responses} 
        isLoading={isLoading || isFetching} 
        onViewResponse={handleResponseView}
      />
      
      {totalPages > 1 && (
        <div className="flex justify-between items-center mt-4">
          <div className="text-sm text-muted-foreground">
            Showing {responses.length} of {totalCount} responses
          </div>
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious 
                  onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                  className={currentPage === 1 ? "pointer-events-none opacity-50" : ""}
                />
              </PaginationItem>
              
              {[...Array(Math.min(5, totalPages))].map((_, i) => {
                let pageNum = i + 1;
                if (totalPages > 5) {
                  if (currentPage > 3) {
                    pageNum = i + currentPage - 2;
                  }
                  if (currentPage > totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  }
                }
                
                if (pageNum <= totalPages) {
                  return (
                    <PaginationItem key={pageNum}>
                      <PaginationLink
                        isActive={pageNum === currentPage}
                        onClick={() => handlePageChange(pageNum)}
                      >
                        {pageNum}
                      </PaginationLink>
                    </PaginationItem>
                  );
                }
                return null;
              })}

              <PaginationItem>
                <PaginationNext 
                  onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                  className={currentPage === totalPages ? "pointer-events-none opacity-50" : ""}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}

      <ResponseDetails 
        response={selectedResponse} 
        onClose={handleCloseResponseDetails} 
      />
    </div>
  );
}
