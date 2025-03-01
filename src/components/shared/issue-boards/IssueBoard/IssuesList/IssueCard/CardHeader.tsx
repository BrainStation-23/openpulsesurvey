
import React from "react";
import { CardActions } from "./CardActions";
import type { Issue } from "../../../types";

interface CardHeaderProps {
  issue: Issue;
  canEdit: boolean;
  onEdit: () => void;
}

export function CardHeader({ issue, canEdit, onEdit }: CardHeaderProps) {
  return (
    <div className="flex items-start justify-between gap-2">
      <h3 className="font-medium text-sm line-clamp-2">{issue.title}</h3>
      {canEdit && <CardActions issue={issue} onEdit={onEdit} />}
    </div>
  );
}
