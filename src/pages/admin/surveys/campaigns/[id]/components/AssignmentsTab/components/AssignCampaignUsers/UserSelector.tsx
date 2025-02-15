import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Check } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";

interface UserSelectorProps {
  selectedUsers: string[];
  onChange: (users: string[]) => void;
  campaignId: string;
}

export function UserSelector({ selectedUsers, onChange, campaignId }: UserSelectorProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSBU, setSelectedSBU] = useState<string>("all");

  // Fetch already assigned users
  const { data: assignedUsers } = useQuery({
    queryKey: ["assigned-users", campaignId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("survey_assignments")
        .select("user_id")
        .eq("campaign_id", campaignId);
      
      if (error) throw error;
      return data.map(assignment => assignment.user_id);
    },
  });

  // Fetch SBUs
  const { data: sbus } = useQuery({
    queryKey: ["sbus"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("sbus")
        .select("id, name")
        .order("name");
      
      if (error) throw error;
      return data;
    },
  });

  // Fetch users with their SBU associations
  const { data: users } = useQuery({
    queryKey: ["users", selectedSBU],
    queryFn: async () => {
      let query = supabase
        .from("profiles")
        .select(`
          id,
          email,
          first_name,
          last_name,
          user_sbus!inner (
            sbu:sbus (
              id,
              name
            )
          )
        `)
        .order("first_name");

      if (selectedSBU !== "all") {
        query = query.eq("user_sbus.sbu_id", selectedSBU);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });

  const filteredUsers = users?.filter((user) => {
    const searchStr = `${user.first_name || ''} ${user.last_name || ''} ${user.email}`.toLowerCase();
    return searchStr.includes(searchQuery.toLowerCase());
  }) || [];

  const handleSelectAll = () => {
    // Only select users that aren't already assigned
    const availableUsers = filteredUsers
      .filter(user => !assignedUsers?.includes(user.id))
      .map(user => user.id);
    onChange(availableUsers);
  };

  const handleDeselectAll = () => {
    onChange([]);
  };

  const toggleUser = (userId: string) => {
    // Don't allow toggling if user is already assigned
    if (assignedUsers?.includes(userId)) return;

    const newSelection = selectedUsers.includes(userId)
      ? selectedUsers.filter(id => id !== userId)
      : [...selectedUsers, userId];
    onChange(newSelection);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <div className="flex-1">
          <Label>Search Users</Label>
          <Input
            placeholder="Search by name or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex-1">
          <Label>Filter by SBU</Label>
          <Select
            value={selectedSBU}
            onValueChange={setSelectedSBU}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select SBU" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All SBUs</SelectItem>
              {sbus?.map((sbu) => (
                <SelectItem key={sbu.id} value={sbu.id}>
                  {sbu.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex justify-end gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={handleSelectAll}
        >
          Select Available Users
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={handleDeselectAll}
        >
          Deselect All
        </Button>
      </div>

      <ScrollArea className="h-[300px] rounded-md border p-2">
        <div className="space-y-1">
          {filteredUsers.map((user) => {
            const isSelected = selectedUsers.includes(user.id);
            const isAssigned = assignedUsers?.includes(user.id);
            const displayName = `${user.first_name || ''} ${user.last_name || ''} ${!user.first_name && !user.last_name ? user.email : ''}`.trim();
            
            return (
              <button
                key={user.id}
                onClick={() => toggleUser(user.id)}
                className={cn(
                  "w-full flex items-center justify-between px-2 py-1.5 rounded-sm text-sm",
                  "hover:bg-accent hover:text-accent-foreground",
                  isSelected && "bg-accent",
                  isAssigned && "opacity-50 cursor-not-allowed hover:bg-transparent"
                )}
                type="button"
                disabled={isAssigned}
              >
                <div className="flex items-center gap-2">
                  <span className="text-left">{displayName}</span>
                  {isAssigned && (
                    <span className="text-xs text-muted-foreground">(Already assigned)</span>
                  )}
                </div>
                {isSelected && <Check className="h-4 w-4" />}
              </button>
            );
          })}
        </div>
      </ScrollArea>
      <div className="text-sm text-muted-foreground">
        {selectedUsers.length} users selected
      </div>
    </div>
  );
}
