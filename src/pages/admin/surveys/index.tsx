import { useQuery } from "@tanstack/react-query";
import { Plus, Check, Filter } from "lucide-react";
import { Link } from "react-router-dom";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Survey, SurveyStatus } from "./types";
import { SearchBar } from "./components/SearchBar";
import { TagFilter } from "./components/TagFilter";
import { SurveyTable } from "./components/SurveyTable";
import { Badge } from "@/components/ui/badge";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";

const STATUS_OPTIONS: { value: SurveyStatus; label: string }[] = [
  { value: "draft", label: "Draft" },
  { value: "published", label: "Published" },
  { value: "archived", label: "Archived" },
];

export default function SurveysPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [selectedStatuses, setSelectedStatuses] = useState<SurveyStatus[]>(["draft", "published"]);
  const { toast } = useToast();

  const { data: surveys, isLoading, refetch } = useQuery({
    queryKey: ['surveys'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('surveys')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as Survey[];
    },
  });

  const handleDelete = async (surveyId: string) => {
    const { error } = await supabase
      .from('surveys')
      .delete()
      .eq('id', surveyId);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to delete survey",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: "Survey deleted successfully",
      });
      refetch();
    }
  };

  const handleStatusChange = async (surveyId: string, status: SurveyStatus) => {
    const { error } = await supabase
      .from('surveys')
      .update({ status })
      .eq('id', surveyId);

    if (error) {
      toast({
        title: "Error",
        description: `Failed to ${status === 'published' ? 'publish' : status} survey`,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: `Survey ${status === 'published' ? 'published' : status} successfully`,
      });
      refetch();
    }
  };

  const handleStatusToggle = (status: SurveyStatus) => {
    setSelectedStatuses(prev =>
      prev.includes(status)
        ? prev.filter(s => s !== status)
        : [...prev, status]
    );
  };

  const handleTagToggle = (tag: string) => {
    setSelectedTags(prev =>
      prev.includes(tag)
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  const filteredSurveys = surveys?.filter(survey => {
    const matchesSearch = survey.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      survey.description?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesTags = selectedTags.length === 0 ||
      selectedTags.every(tag => survey.tags?.includes(tag));

    const matchesStatus = selectedStatuses.length === 0 ||
      selectedStatuses.includes(survey.status);

    return matchesSearch && matchesTags && matchesStatus;
  });

  const allTags = Array.from(new Set(surveys?.flatMap(survey => survey.tags || []) || []));

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Surveys</h1>
        <div className="flex gap-2">
          <Button asChild variant="outline">
            <Link to="/admin/surveys/campaigns/create">
              <Plus className="mr-2 h-4 w-4" />
              Create Campaign
            </Link>
          </Button>
          <Button asChild>
            <Link to="/admin/surveys/create">
              <Plus className="mr-2 h-4 w-4" />
              Create Survey
            </Link>
          </Button>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap gap-4">
          <SearchBar value={searchQuery} onChange={setSearchQuery} />
          <div className="flex gap-2">
            <TagFilter
              tags={allTags}
              selectedTags={selectedTags}
              onTagToggle={handleTagToggle}
            />
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="flex gap-2">
                  <Filter className="h-4 w-4" />
                  Status
                  {selectedStatuses.length > 0 && (
                    <Badge variant="secondary" className="ml-1 rounded-sm px-1 font-normal">
                      {selectedStatuses.length}
                    </Badge>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[200px] p-3" align="start">
                <div className="space-y-2">
                  {STATUS_OPTIONS.map((status) => (
                    <div key={status.value} className="flex items-center space-x-2">
                      <Checkbox
                        id={status.value}
                        checked={selectedStatuses.includes(status.value)}
                        onCheckedChange={() => handleStatusToggle(status.value)}
                      />
                      <label
                        htmlFor={status.value}
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        {status.label}
                      </label>
                    </div>
                  ))}
                </div>
              </PopoverContent>
            </Popover>
          </div>
        </div>

        {isLoading ? (
          <div>Loading...</div>
        ) : filteredSurveys?.length === 0 ? (
          <div className="text-center py-12">
            <h3 className="text-lg font-semibold">No surveys found</h3>
            <p className="text-muted-foreground">Try adjusting your search or filters.</p>
          </div>
        ) : (
          <SurveyTable
            surveys={filteredSurveys || []}
            onDelete={handleDelete}
            onStatusChange={handleStatusChange}
          />
        )}
      </div>
    </div>
  );
}
