
import { Input } from "@/components/ui/input";
import { Search, X, Tag } from "lucide-react";
import { useState } from "react";
import { SurveyCard } from "./SurveyCard";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface SurveySelectorProps {
  value: string;
  onChange: (value: string) => void;
}

export function SurveySelector({ value, onChange }: SurveySelectorProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  const { data: surveys, isLoading } = useQuery({
    queryKey: ["surveys", searchQuery, selectedTags],
    queryFn: async () => {
      let query = supabase
        .from("surveys")
        .select("id, name, description, tags, status")
        .eq('status', 'published')
        .order("created_at", { ascending: false });

      if (searchQuery) {
        query = query.or(
          `name.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%`
        );
      }

      if (selectedTags.length > 0) {
        query = query.contains("tags", selectedTags);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });

  // Get unique tags from all surveys
  const allTags = Array.from(
    new Set(surveys?.flatMap((survey) => survey.tags || []) || [])
  );

  const handleTagToggle = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedTags([]);
  };

  const hasActiveFilters = searchQuery || selectedTags.length > 0;

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4">
        {/* Search and Clear Filters */}
        <div className="flex gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search surveys..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          {hasActiveFilters && (
            <Button
              variant="outline"
              onClick={clearFilters}
              className="gap-2"
            >
              <X className="h-4 w-4" />
              Clear Filters
            </Button>
          )}
        </div>

        {/* Tags Section */}
        {allTags.length > 0 && (
          <div className="flex items-center gap-2">
            <Tag className="h-4 w-4 text-muted-foreground" />
            <div className="flex flex-wrap gap-2">
              {allTags.map((tag) => (
                <Badge
                  key={tag}
                  variant={selectedTags.includes(tag) ? "default" : "outline"}
                  className="cursor-pointer"
                  onClick={() => handleTagToggle(tag)}
                >
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Survey Grid */}
      {isLoading ? (
        <div className="flex justify-center p-8">
          <LoadingSpinner size={24} />
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {surveys?.map((survey) => (
            <SurveyCard
              key={survey.id}
              {...survey}
              isSelected={value === survey.id}
              onSelect={onChange}
            />
          ))}
        </div>
      )}
    </div>
  );
}
