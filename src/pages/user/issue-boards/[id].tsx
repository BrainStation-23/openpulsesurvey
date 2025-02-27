
import React from "react";
import { useParams } from "react-router-dom";
import { IssueBoard } from "@/components/shared/issue-boards/IssueBoard";

export default function UserIssueBoardView() {
  const { id } = useParams();

  if (!id) {
    return null;
  }

  return (
    <div className="container mx-auto">
      <IssueBoard boardId={id} />
    </div>
  );
}
