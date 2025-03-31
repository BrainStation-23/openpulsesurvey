
import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle, CheckCircle, Info, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { HistoryDetailView } from "@/components/okr/history/HistoryDetailView";

interface OkrHistoryEntry {
  id: string;
  entity_id: string;
  entity_type: string;
  change_type: string;
  changed_at: string;
  changed_by: string;
  previous_data?: any;
  new_data?: any;
  user_name?: string;
}

export default function OkrHistory() {
  const [filter, setFilter] = useState({
    entityType: "all",
    changeType: "all",
    searchTerm: "",
  });

  const [selectedEntry, setSelectedEntry] = useState<OkrHistoryEntry | null>(null);

  const { data: historyData, isLoading } = useQuery({
    queryKey: ["okr-history"],
    queryFn: async () => {
      // Fetch history with user information
      const { data, error } = await supabase
        .from("okr_history")
        .select(`
          *,
          profiles(first_name, last_name, email)
        `)
        .order("changed_at", { ascending: false })
        .limit(100);

      if (error) {
        console.error("Error fetching OKR history:", error);
        throw error;
      }

      // Format data to include user name
      return data.map((entry: any) => ({
        ...entry,
        user_name: entry.profiles
          ? `${entry.profiles.first_name || ""} ${entry.profiles.last_name || ""}`.trim() || entry.profiles.email
          : "System",
      }));
    },
  });

  // Filter the history data based on the selected filters
  const filteredHistory = historyData
    ? historyData.filter((entry: OkrHistoryEntry) => {
        const matchesEntityType = filter.entityType === "all" || entry.entity_type.includes(filter.entityType);
        const matchesChangeType = filter.changeType === "all" || entry.change_type.includes(filter.changeType);
        const matchesSearch =
          !filter.searchTerm ||
          entry.entity_type.toLowerCase().includes(filter.searchTerm.toLowerCase()) ||
          entry.change_type.toLowerCase().includes(filter.searchTerm.toLowerCase()) ||
          (entry.user_name && entry.user_name.toLowerCase().includes(filter.searchTerm.toLowerCase()));

        return matchesEntityType && matchesChangeType && matchesSearch;
      })
    : [];

  // Extract unique entity types and change types for filters
  const entityTypes = historyData
    ? [...new Set(historyData.map((entry: OkrHistoryEntry) => entry.entity_type))]
    : [];
  const changeTypes = historyData
    ? [...new Set(historyData.map((entry: OkrHistoryEntry) => entry.change_type))]
    : [];

  // Function to render a badge for the entity type with appropriate color
  const renderEntityTypeBadge = (type: string) => {
    let variant: "default" | "secondary" | "destructive" | "outline" = "default";
    
    if (type.includes("objective")) variant = "default";
    else if (type.includes("key_result")) variant = "secondary";
    else if (type.includes("alignment")) variant = "outline";
    
    return <Badge variant={variant}>{type}</Badge>;
  };

  // Function to render a badge for the change type with appropriate color
  const renderChangeTypeBadge = (type: string) => {
    let variant: "default" | "secondary" | "destructive" | "outline" = "default";
    let icon = null;
    
    if (type.includes("create") || type.includes("add")) {
      variant = "default";
      icon = <CheckCircle className="h-4 w-4 mr-1" />;
    } else if (type.includes("update") || type.includes("edit")) {
      variant = "secondary";
      icon = <Info className="h-4 w-4 mr-1" />;
    } else if (type.includes("delete") || type.includes("remove")) {
      variant = "destructive";
      icon = <AlertCircle className="h-4 w-4 mr-1" />;
    }
    
    return (
      <Badge variant={variant} className="flex items-center">
        {icon}
        {type}
      </Badge>
    );
  };

  // Handle view details click
  const handleViewDetails = (entry: OkrHistoryEntry) => {
    setSelectedEntry(entry);
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">OKR History</h1>
        <p className="text-muted-foreground">
          Track changes to objectives, key results, and alignments across your organization.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>History Log</CardTitle>
          <CardDescription>
            View the history of changes made to OKRs within the system.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="flex flex-wrap gap-4 mb-6">
            <div className="w-full md:w-auto">
              <Input
                placeholder="Search by entity, change, or user"
                value={filter.searchTerm}
                onChange={(e) => setFilter({ ...filter, searchTerm: e.target.value })}
                className="w-full md:w-80"
              />
            </div>
            <div className="w-full md:w-auto">
              <Select
                value={filter.entityType}
                onValueChange={(value) => setFilter({ ...filter, entityType: value })}
              >
                <SelectTrigger className="w-full md:w-40">
                  <SelectValue placeholder="Entity Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Entity Types</SelectLabel>
                    <SelectItem value="all">All Types</SelectItem>
                    {entityTypes.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
            <div className="w-full md:w-auto">
              <Select
                value={filter.changeType}
                onValueChange={(value) => setFilter({ ...filter, changeType: value })}
              >
                <SelectTrigger className="w-full md:w-40">
                  <SelectValue placeholder="Change Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Change Types</SelectLabel>
                    <SelectItem value="all">All Changes</SelectItem>
                    {changeTypes.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* History Table */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date & Time</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>Entity Type</TableHead>
                  <TableHead>Change Type</TableHead>
                  <TableHead>Details</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  Array(5)
                    .fill(0)
                    .map((_, index) => (
                      <TableRow key={index}>
                        <TableCell>
                          <Skeleton className="h-4 w-24" />
                        </TableCell>
                        <TableCell>
                          <Skeleton className="h-4 w-32" />
                        </TableCell>
                        <TableCell>
                          <Skeleton className="h-6 w-28" />
                        </TableCell>
                        <TableCell>
                          <Skeleton className="h-6 w-28" />
                        </TableCell>
                        <TableCell>
                          <Skeleton className="h-4 w-40" />
                        </TableCell>
                        <TableCell>
                          <Skeleton className="h-8 w-8 rounded-full ml-auto" />
                        </TableCell>
                      </TableRow>
                    ))
                ) : filteredHistory.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center">
                      No history records found.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredHistory.map((entry: OkrHistoryEntry) => (
                    <TableRow key={entry.id}>
                      <TableCell className="font-mono text-xs">
                        {format(new Date(entry.changed_at), "MMM d, yyyy HH:mm:ss")}
                      </TableCell>
                      <TableCell>{entry.user_name || "Unknown"}</TableCell>
                      <TableCell>{renderEntityTypeBadge(entry.entity_type)}</TableCell>
                      <TableCell>{renderChangeTypeBadge(entry.change_type)}</TableCell>
                      <TableCell className="max-w-xs truncate">
                        {entry.new_data?.description || 
                         entry.previous_data?.description || 
                         `Changed ${entry.entity_type}`}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleViewDetails(entry)}
                          title="View Details"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* History Detail Dialog */}
      <HistoryDetailView 
        isOpen={!!selectedEntry} 
        onClose={() => setSelectedEntry(null)} 
        historyEntry={selectedEntry} 
      />
    </div>
  );
}
