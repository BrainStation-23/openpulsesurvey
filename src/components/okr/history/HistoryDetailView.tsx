
import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { JsonDataView } from "./JsonDataView";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

interface HistoryDetailViewProps {
  isOpen: boolean;
  onClose: () => void;
  historyEntry: any;
}

export function HistoryDetailView({ isOpen, onClose, historyEntry }: HistoryDetailViewProps) {
  if (!historyEntry) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-auto">
        <DialogHeader>
          <DialogTitle>History Details</DialogTitle>
          <DialogDescription>
            View the changes that occurred at{" "}
            {historyEntry.changed_at && format(new Date(historyEntry.changed_at), "MMM d, yyyy HH:mm:ss")}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-sm font-medium mb-1">Entity Type</div>
              <Badge variant="outline">{historyEntry.entity_type}</Badge>
            </div>
            <div>
              <div className="text-sm font-medium mb-1">Change Type</div>
              <Badge variant="outline">{historyEntry.change_type}</Badge>
            </div>
          </div>

          <Tabs defaultValue="changes" className="w-full">
            <TabsList className="grid grid-cols-2">
              <TabsTrigger value="changes">Changes</TabsTrigger>
              <TabsTrigger value="raw">Raw Data</TabsTrigger>
            </TabsList>
            
            <TabsContent value="changes" className="space-y-4">
              {historyEntry.previous_data && (
                <JsonDataView 
                  data={historyEntry.previous_data} 
                  title="Previous Data" 
                  className="border-amber-200"
                />
              )}
              
              {historyEntry.new_data && (
                <JsonDataView 
                  data={historyEntry.new_data} 
                  title="New Data" 
                  className="border-green-200"
                />
              )}

              {!historyEntry.previous_data && !historyEntry.new_data && (
                <div className="text-center py-8 text-muted-foreground">
                  No detailed change data available for this entry
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="raw">
              <div className="space-y-4">
                <JsonDataView data={historyEntry} title="All History Data" initialExpanded={true} />
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
}
