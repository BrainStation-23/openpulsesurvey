
import { useState } from "react";
import { Edit, MoreVertical, Trash } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { Scenario } from "../types";
import { ScenarioDialog } from "./ScenarioDialog";

interface ScenariosTableProps {
  scenarios: Scenario[];
  onUpdate: () => void;
}

export function ScenariosTable({ scenarios, onUpdate }: ScenariosTableProps) {
  const [editingScenario, setEditingScenario] = useState<Scenario | null>(null);
  const { toast } = useToast();

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from("email_scenarios")
        .delete()
        .eq("id", id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Scenario deleted successfully",
      });

      onUpdate();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message,
      });
    }
  };

  const handleUpdate = async (data: Partial<Scenario>) => {
    if (!editingScenario) return;

    try {
      const { error } = await supabase
        .from("email_scenarios")
        .update(data)
        .eq("id", editingScenario.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Scenario updated successfully",
      });

      setEditingScenario(null);
      onUpdate();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message,
      });
    }
  };

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Story</TableHead>
            <TableHead>Difficulty</TableHead>
            <TableHead>Tags</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="w-[100px]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {scenarios.map((scenario) => (
            <TableRow key={scenario.id}>
              <TableCell className="font-medium">{scenario.name}</TableCell>
              <TableCell className="max-w-md truncate">
                {scenario.story}
              </TableCell>
              <TableCell>{scenario.difficulty_level}</TableCell>
              <TableCell>
                <div className="flex gap-1 flex-wrap">
                  {scenario.tags?.map((tag) => (
                    <Badge key={tag} variant="outline">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </TableCell>
              <TableCell>
                <Badge
                  variant={
                    scenario.status === "active"
                      ? "default"
                      : scenario.status === "draft"
                      ? "secondary"
                      : "destructive"
                  }
                >
                  {scenario.status}
                </Badge>
              </TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem
                      onClick={() => setEditingScenario(scenario)}
                    >
                      <Edit className="mr-2 h-4 w-4" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="text-destructive"
                      onClick={() => handleDelete(scenario.id)}
                    >
                      <Trash className="mr-2 h-4 w-4" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <ScenarioDialog
        scenario={editingScenario || undefined}
        open={!!editingScenario}
        onOpenChange={(open) => !open && setEditingScenario(null)}
        onSubmit={handleUpdate}
      />
    </>
  );
}
