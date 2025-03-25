
import React from 'react';

interface KeyResultDescriptionProps {
  description?: string;
}

export const KeyResultDescription: React.FC<KeyResultDescriptionProps> = ({ description }) => {
  if (!description) return null;
  
  return (
    <p className="text-muted-foreground mb-4">{description}</p>
  );
};
