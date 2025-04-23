
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import * as icons from "lucide-react";
import { LucideIcon } from "lucide-react";
import { UseFormReturn } from "react-hook-form";
import { FormValues } from "../schemas/achievementForm";

interface AchievementPreviewProps {
  form: UseFormReturn<FormValues>;
}

export function AchievementPreview({ form }: AchievementPreviewProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Preview</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-4 p-4 border rounded-lg">
          {form.watch("icon") && (() => {
            const PreviewIcon = icons[form.watch("icon") as keyof typeof icons] as LucideIcon;
            return PreviewIcon ? (
              <PreviewIcon 
                className="w-12 h-12" 
                style={{ color: form.watch("icon_color") || "#8B5CF6" }} 
              />
            ) : null;
          })()}
          <div>
            <h3 className="font-semibold">{form.watch("name") || "Achievement Name"}</h3>
            <p className="text-sm text-muted-foreground">
              {form.watch("description") || "Achievement description will appear here"}
            </p>
            <div className="text-sm font-medium mt-1" style={{ color: form.watch("icon_color") || "#8B5CF6" }}>
              {form.watch("points")} points
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
