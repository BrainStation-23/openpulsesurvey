
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
import { ConfigFormProps } from "./types";

const configFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  color_code: z.string().optional(),
});

export function ConfigForm({ 
  onSubmit, 
  initialValues,
  submitLabel = "Create" 
}: ConfigFormProps) {
  const form = useForm<z.infer<typeof configFormSchema>>({
    resolver: zodResolver(configFormSchema),
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
                <div className="flex gap-2 items-center">
                  <Input 
                    type="color" 
                    {...field} 
                    className="w-12 h-12 p-1 cursor-pointer"
                  />
                  <Input 
                    type="text" 
                    {...field} 
                    className="flex-1"
                    placeholder="#CBD5E1"
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
