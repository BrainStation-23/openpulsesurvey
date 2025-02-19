
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { GradingCriteria, GradingCriteriaFormData } from "../types";

interface Props {
  onSubmit: (data: GradingCriteriaFormData) => void;
  initialValues?: GradingCriteria | null;
  submitLabel?: string;
}

export function GradingCriteriaForm({ onSubmit, initialValues, submitLabel = "Submit" }: Props) {
  const [formData, setFormData] = useState<GradingCriteriaFormData>({
    name: initialValues?.name || "",
    max_points: initialValues?.max_points || 0,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Name</Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          required
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="max_points">Maximum Points</Label>
        <Input
          id="max_points"
          type="number"
          min="0"
          value={formData.max_points}
          onChange={(e) => setFormData({ ...formData, max_points: Number(e.target.value) })}
          required
        />
      </div>

      <Button type="submit" className="w-full">
        {submitLabel}
      </Button>
    </form>
  );
}
