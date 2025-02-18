
import { UseFormReturn } from "react-hook-form";
import { Input } from "@/components/ui/input";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AchievementType, AchievementTypeConfig } from "../types";

type ConditionFormProps = {
  form: UseFormReturn<any>;
  achievementType: AchievementType;
  typeConfig: AchievementTypeConfig;
};

export function ConditionForm({ form, achievementType, typeConfig }: ConditionFormProps) {
  const updateConditionValue = (values: Record<string, any>) => {
    form.setValue("condition_value", JSON.stringify(values));
  };

  return (
    <div className="space-y-4">
      {Object.entries(typeConfig.conditionFields).map(([fieldName, fieldConfig]) => (
        <FormField
          key={fieldName}
          control={form.control}
          name={fieldName}
          render={({ field }) => (
            <FormItem>
              <FormLabel>{fieldConfig.label}</FormLabel>
              <FormControl>
                {fieldConfig.type === 'select' ? (
                  <Select
                    onValueChange={(value) => {
                      field.onChange(value);
                      const values = { ...JSON.parse(form.getValues("condition_value") || "{}") };
                      values[fieldName] = value;
                      updateConditionValue(values);
                    }}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder={`Select ${fieldConfig.label.toLowerCase()}`} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {fieldConfig.options?.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <Input
                    type={fieldConfig.type}
                    {...field}
                    onChange={(e) => {
                      field.onChange(e);
                      const values = { ...JSON.parse(form.getValues("condition_value") || "{}") };
                      values[fieldName] = fieldConfig.type === 'number' 
                        ? parseInt(e.target.value)
                        : e.target.value;
                      updateConditionValue(values);
                    }}
                  />
                )}
              </FormControl>
              <FormDescription>
                {fieldConfig.description}
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
      ))}
    </div>
  );
}
