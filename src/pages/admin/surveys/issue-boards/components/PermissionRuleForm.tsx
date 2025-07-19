import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { IssueBoardPermission } from "../types";

const permissionRuleSchema = z.object({
  rule_name: z.string().min(1, "Rule name is required").max(100),
  rule_type: z.enum(["include", "exclude"]),
  priority: z.number().min(0).max(1000),
  is_active: z.boolean(),
  can_view: z.boolean(),
  can_create: z.boolean(),
  can_vote: z.boolean(),
});

type PermissionRuleFormValues = z.infer<typeof permissionRuleSchema>;

interface PermissionRuleFormProps {
  initialValues?: Partial<IssueBoardPermission>;
  onSubmit: (values: PermissionRuleFormValues) => void;
  onCancel: () => void;
  submitLabel?: string;
}

export function PermissionRuleForm({
  initialValues,
  onSubmit,
  onCancel,
  submitLabel = "Save Rule"
}: PermissionRuleFormProps) {
  const form = useForm<PermissionRuleFormValues>({
    resolver: zodResolver(permissionRuleSchema),
    defaultValues: {
      rule_name: initialValues?.rule_name || "",
      rule_type: initialValues?.rule_type || "include",
      priority: initialValues?.priority || 100,
      is_active: initialValues?.is_active ?? true,
      can_view: initialValues?.can_view || false,
      can_create: initialValues?.can_create || false,
      can_vote: initialValues?.can_vote || false,
    },
  });

  const watchedValues = form.watch();

  // Auto-enable view permission when create or vote is enabled
  React.useEffect(() => {
    if (watchedValues.can_create || watchedValues.can_vote) {
      if (!watchedValues.can_view) {
        form.setValue("can_view", true);
      }
    }
  }, [watchedValues.can_create, watchedValues.can_vote, watchedValues.can_view, form]);

  const handleSubmit = (values: PermissionRuleFormValues) => {
    onSubmit(values);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <Card className="p-4 space-y-4">
          <div className="space-y-4">
            <FormField
              control={form.control}
              name="rule_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Rule Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter a descriptive name for this rule" {...field} />
                  </FormControl>
                  <FormDescription>
                    A friendly name to help identify this permission rule
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="rule_type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Rule Type</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select rule type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="include">Include</SelectItem>
                        <SelectItem value="exclude">Exclude</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Include grants permissions, exclude removes them
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="priority"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Priority</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={0}
                        max={1000}
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormDescription>
                      Lower numbers = higher priority (0-1000)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="is_active"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                  <div className="space-y-0.5">
                    <FormLabel>Active Rule</FormLabel>
                    <FormDescription>
                      Enable or disable this permission rule
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
          </div>
        </Card>

        <Card className="p-4 space-y-4">
          <div className="space-y-0.5">
            <h3 className="text-lg font-medium">Permissions</h3>
            <p className="text-sm text-muted-foreground">
              Select which permissions this rule affects
            </p>
          </div>

          <div className="space-y-4">
            <FormField
              control={form.control}
              name="can_view"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                  <div className="space-y-0.5">
                    <FormLabel>View Permission</FormLabel>
                    <FormDescription>
                      Allow viewing the issue board and its issues
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="can_create"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                  <div className="space-y-0.5">
                    <FormLabel>Create Permission</FormLabel>
                    <FormDescription>
                      Allow creating new issues on the board
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="can_vote"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                  <div className="space-y-0.5">
                    <FormLabel>Vote Permission</FormLabel>
                    <FormDescription>
                      Allow voting on issues (upvote/downvote)
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
          </div>

          {(watchedValues.can_create || watchedValues.can_vote) && !watchedValues.can_view && (
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-800">
                <Badge variant="secondary" className="mr-2">Note</Badge>
                View permission will be automatically enabled because create/vote permissions require it.
              </p>
            </div>
          )}
        </Card>

        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit">
            {submitLabel}
          </Button>
        </div>
      </form>
    </Form>
  );
}