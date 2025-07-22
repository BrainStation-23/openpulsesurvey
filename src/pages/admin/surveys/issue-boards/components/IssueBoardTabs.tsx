
import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { CheckCircle2 } from "lucide-react";
import { IssueBoardForm } from "./IssueBoardForm";
import { BoardPermissionsForm } from "./BoardPermissionsForm";
import type { IssueBoard, IssueBoardPermission } from "../types";

interface IssueBoardTabsProps {
  mode: "create" | "edit";
  board?: IssueBoard;
  initialPermissions?: IssueBoardPermission[];
  onSubmit: (values: Partial<IssueBoard>, permissions: Partial<IssueBoardPermission>[]) => void;
}

export function IssueBoardTabs({
  mode,
  board,
  initialPermissions = [],
  onSubmit,
}: IssueBoardTabsProps) {
  const [activeTab, setActiveTab] = React.useState("basic");
  const [formState, setFormState] = React.useState<{
    board: Partial<IssueBoard>;
    permissions: Partial<IssueBoardPermission>[];
  }>({
    board: board || {
      name: "",
      description: "",
      status: "active"
    },
    permissions: initialPermissions,
  });

  const [formErrors, setFormErrors] = React.useState<{
    board: boolean;
    permissions: boolean;
  }>({
    board: false,
    permissions: false,
  });

  const handleBoardUpdate = (values: Partial<IssueBoard>) => {
    setFormState(prev => ({ ...prev, board: values }));
    setFormErrors(prev => ({ ...prev, board: !values.name }));
  };

  const handlePermissionsUpdate = (permissions: Partial<IssueBoardPermission>[]) => {
    setFormState(prev => ({ ...prev, permissions }));
    setFormErrors(prev => ({ ...prev, permissions: false }));
  };

  const handleFinalSubmit = () => {
    const hasValidBoard = formState.board.name && formState.board.name.trim() !== "";
    
    if (!hasValidBoard) {
      setFormErrors(prev => ({ ...prev, board: true }));
      setActiveTab("basic");
      return;
    }

    onSubmit(formState.board, formState.permissions);
  };

  const isBasicInfoComplete = formState.board.name && formState.board.name.trim() !== "";
  const canSubmit = isBasicInfoComplete;

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="basic" className="flex items-center gap-2">
            {isBasicInfoComplete && <CheckCircle2 className="h-4 w-4 text-green-600" />}
            Basic Information
          </TabsTrigger>
          <TabsTrigger value="permissions" className="flex items-center gap-2">
            {formState.permissions.length > 0 && <CheckCircle2 className="h-4 w-4 text-green-600" />}
            Permissions
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="basic" className="space-y-4">
          <IssueBoardForm
            values={formState.board}
            onChange={handleBoardUpdate}
            hasError={formErrors.board}
          />
        </TabsContent>
        
        <TabsContent value="permissions" className="space-y-4">
          <BoardPermissionsForm
            board={formState.board as IssueBoard}
            onSubmit={handlePermissionsUpdate}
            initialPermissions={formState.permissions as IssueBoardPermission[]}
          />
        </TabsContent>
      </Tabs>

      {/* Fixed Submit Button */}
      <div className="border-t pt-6">
        <div className="flex justify-between items-center">
          <div className="text-sm text-muted-foreground">
            {!isBasicInfoComplete && "Complete basic information to continue"}
            {isBasicInfoComplete && formState.permissions.length === 0 && "Optionally configure permissions"}
            {isBasicInfoComplete && formState.permissions.length > 0 && "Ready to create board"}
          </div>
          
          <Button 
            onClick={handleFinalSubmit}
            disabled={!canSubmit}
            size="lg"
          >
            {mode === "create" ? "Create Board" : "Update Board"}
          </Button>
        </div>
      </div>
    </div>
  );
}
