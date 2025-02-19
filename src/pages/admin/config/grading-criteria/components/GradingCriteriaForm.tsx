
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import type { GradingCriteriaFormData } from "../types";

const formSchema = z.object({
  name: z.string().min(1, "Name is required"),
  max_points: z.number().min(1, "Max points must be greater than 0"),
});

interface GradingCriteriaFormProps {
  onSubmit: (data: GradingCriteriaFormData) => void;
  initialValues?: Partial<GradingCriteriaFormData>;
  submitLabel?: string;
}

export function GradingCriteriaForm({ 
  onSubmit, 
  initialValues,
  submitLabel = "Create" 
}: GradingCriteriaFormProps) {
  const form = useForm<GradingCriteriaFormData>({
    resolver: zodResolver(formSchema),
    defaultValues: initialValues || {
      name: "",
      max_points: 1,
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input {...field} placeholder="Enter criteria name" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="max_points"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Max Points</FormLabel>
              <FormControl>
                <Input 
                  {...field} 
                  type="number" 
                  min={1}
                  onChange={e => field.onChange(Number(e.target.value))}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full">
          {submitLabel}
        </Button>
      </form>
    </Form>
  );
}
