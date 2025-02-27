
import React from "react";
import { IssueBoard } from "@/components/shared/issue-boards/IssueBoard";
import { useParams } from "react-router-dom";

export default function AdminIssueBoardView() {
  const { id } = useParams();

  if (!id) {
    return null;
  }

  return (
    <div className="container mx-auto p-6">
      <IssueBoard boardId={id} />
    </div>
  );
}
