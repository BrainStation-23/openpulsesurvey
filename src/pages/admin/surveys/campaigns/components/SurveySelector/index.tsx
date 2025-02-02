import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { useState } from "react";
import { SurveyCard } from "./SurveyCard";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { TagFilter } from "../../../components/TagFilter";

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
      const query = supabase
        .from("surveys")
        .select("id, name, description, tags, status")
        .eq("status", "published")
        .order("created_at", { ascending: false });

      if (searchQuery) {
        query.or(
          `name.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%`
        );
      }

      if (selectedTags.length > 0) {
        query.contains("tags", selectedTags);
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
      prev.includes(tag)
        ? prev.filter((t) => t !== tag)
        : [...prev, tag]
    );
  };

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search surveys..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9"
        />
      </div>

      {allTags.length > 0 && (
        <TagFilter
          tags={allTags}
          selectedTags={selectedTags}
          onTagToggle={handleTagToggle}
        />
      )}

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