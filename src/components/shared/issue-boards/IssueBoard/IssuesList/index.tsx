import React from "react";
import { useIssues } from "../../hooks/useIssues";
import { IssueCard } from "./IssueCard";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { useVoting } from "../../hooks/useVoting";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";

interface IssuesListProps {
  boardId: string;
  canVote: boolean;
  canCreate: boolean;
}

type SortOption = "latest" | "votes" | "oldest" | "most_downvoted";

export function IssuesList({ boardId, canVote, canCreate }: IssuesListProps) {
  const { data: issues, isLoading } = useIssues(boardId);
  const { mutate: vote } = useVoting();
  const [search, setSearch] = React.useState("");
  const [sortBy, setSortBy] = React.useState<SortOption>("latest");
  const [showMineOnly, setShowMineOnly] = React.useState(false);
  const [showMyVotesOnly, setShowMyVotesOnly] = React.useState(false);
  const [currentUserId, setCurrentUserId] = React.useState<string | null>(null);
  const [userVotes, setUserVotes] = React.useState<{ [issueId: string]: { upvoted: boolean; downvoted: boolean } }>({});

  React.useEffect(() => {
    const getCurrentUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setCurrentUserId(user?.id || null);
    };
    getCurrentUser();
  }, []);

  React.useEffect(() => {
    const fetchUserVotes = async () => {
      if (!currentUserId || !issues) return;

      const issueIds = issues.map(issue => issue.id);
      
      // Fetch user's upvotes
      const { data: upvotes } = await supabase
        .from('issue_votes')
        .select('issue_id')
        .eq('user_id', currentUserId)
        .in('issue_id', issueIds);

      // Fetch user's downvotes
      const { data: downvotes } = await supabase
        .from('issue_downvotes')
        .select('issue_id')
        .eq('user_id', currentUserId)
        .in('issue_id', issueIds);

      const votes: { [issueId: string]: { upvoted: boolean; downvoted: boolean } } = {};
      
      issueIds.forEach(issueId => {
        votes[issueId] = {
          upvoted: upvotes?.some(vote => vote.issue_id === issueId) || false,
          downvoted: downvotes?.some(vote => vote.issue_id === issueId) || false
        };
      });

      setUserVotes(votes);
    };

    fetchUserVotes();
  }, [currentUserId, issues]);

  const filteredAndSortedIssues = React.useMemo(() => {
    if (!issues) return [];

    let filtered = issues.filter(issue => {
      const matchesSearch = issue.title.toLowerCase().includes(search.toLowerCase()) ||
                           issue.description?.toLowerCase().includes(search.toLowerCase());
      
      const matchesMineOnly = !showMineOnly || issue.created_by === currentUserId;
      
      const matchesMyVotes = !showMyVotesOnly || 
                            (userVotes[issue.id]?.upvoted || userVotes[issue.id]?.downvoted);

      return matchesSearch && matchesMineOnly && matchesMyVotes;
    });

    switch (sortBy) {
      case "votes":
        return filtered.sort((a, b) => b.vote_count - a.vote_count);
      case "most_downvoted":
        return filtered.sort((a, b) => (b.downvote_count || 0) - (a.downvote_count || 0));
      case "oldest":
        return filtered.sort((a, b) => 
          new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
        );
      case "latest":
      default:
        return filtered.sort((a, b) => 
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
    }
  }, [issues, search, sortBy, showMineOnly, showMyVotesOnly, currentUserId, userVotes]);

  if (isLoading) {
    return (
      <div className="flex justify-center p-8">
        <LoadingSpinner />
      </div>
    );
  }

  if (!issues || issues.length === 0) {
    return (
      <div className="text-center p-8 text-muted-foreground">
        No issues have been created yet.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <Input
            placeholder="Search issues..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex gap-4">
          <Select
            value={sortBy}
            onValueChange={(value: SortOption) => setSortBy(value)}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="latest">Latest</SelectItem>
              <SelectItem value="oldest">Oldest</SelectItem>
              <SelectItem value="votes">Most Votes</SelectItem>
              <SelectItem value="most_downvoted">Most Downvoted</SelectItem>
            </SelectContent>
          </Select>
          
          {canCreate && (
            <Button
              variant={showMineOnly ? "default" : "outline"}
              onClick={() => setShowMineOnly(!showMineOnly)}
            >
              My Issues
            </Button>
          )}
          
          {canVote && (
            <Button
              variant={showMyVotesOnly ? "default" : "outline"}
              onClick={() => setShowMyVotesOnly(!showMyVotesOnly)}
            >
              My Votes
            </Button>
          )}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filteredAndSortedIssues.map((issue) => (
          <IssueCard
            key={issue.id}
            issue={issue}
            canVote={canVote}
            hasVoted={Boolean(issue.has_voted && issue.has_voted.length > 0)}
          />
        ))}
      </div>
    </div>
  );
}
