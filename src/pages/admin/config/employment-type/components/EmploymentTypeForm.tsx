
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
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

const employmentTypeFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  color_code: z.string().min(1, "Color is required"),
});

type EmploymentTypeFormValues = z.infer<typeof employmentTypeFormSchema>;

interface EmploymentTypeFormProps {
  onSubmit: (values: EmploymentTypeFormValues) => void;
  initialValues?: EmploymentTypeFormValues;
  submitLabel?: string;
}

export function EmploymentTypeForm({ 
  onSubmit, 
  initialValues,
  submitLabel = "Create Employment Type" 
}: EmploymentTypeFormProps) {
  const form = useForm<EmploymentTypeFormValues>({
    resolver: zodResolver(employmentTypeFormSchema),
    defaultValues: initialValues || {
      name: "",
      color_code: "#CBD5E1",
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
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="color_code"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Color</FormLabel>
              <FormControl>
                <div className="flex items-center gap-2">
                  <div 
                    className="w-6 h-6 rounded border" 
                    style={{ backgroundColor: field.value }}
                  />
                  <Input
                    type="color"
                    {...field}
                    className="w-20 h-10"
                  />
                </div>
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
