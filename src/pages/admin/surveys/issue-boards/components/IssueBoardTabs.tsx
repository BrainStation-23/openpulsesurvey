
import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  const [formState, setFormState] = React.useState<{
    board: Partial<IssueBoard>;
    permissions: Partial<IssueBoardPermission>[];
  }>({
    board: board || {},
    permissions: initialPermissions,
  });

  const handleBoardUpdate = (values: Partial<IssueBoard>) => {
    setFormState(prev => ({ ...prev, board: values }));
    onSubmit(values, formState.permissions);
  };

  const handlePermissionsUpdate = (permissions: Partial<IssueBoardPermission>[]) => {
    setFormState(prev => ({ ...prev, permissions }));
    onSubmit(formState.board, permissions);
  };

  return (
    <Tabs defaultValue="basic" className="w-full">
      <TabsList>
        <TabsTrigger value="basic">Basic Information</TabsTrigger>
        <TabsTrigger value="permissions">Permissions</TabsTrigger>
      </TabsList>
      <TabsContent value="basic">
        <IssueBoardForm
          onSubmit={handleBoardUpdate}
          initialValues={board}
          submitLabel={mode === "create" ? "Create Board" : "Update Board"}
        />
      </TabsContent>
      <TabsContent value="permissions">
        <BoardPermissionsForm
          board={board as IssueBoard}
          onSubmit={handlePermissionsUpdate}
          initialPermissions={initialPermissions}
        />
      </TabsContent>
    </Tabs>
  );
}
