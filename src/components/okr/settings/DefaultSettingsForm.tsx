
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Check, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";

type DefaultOkrSettings = {
  defaultVisibility: string;
  requireApproval: boolean;
  defaultWeight: number;
  autoProgressCalculation: boolean;
};

export function DefaultSettingsForm() {
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();
  
  // Mock default values - in real implementation would be fetched from backend
  const defaultValues: DefaultOkrSettings = {
    defaultVisibility: "team",
    requireApproval: true,
    defaultWeight: 1,
    autoProgressCalculation: true
  };
  
  const form = useForm<DefaultOkrSettings>({
    defaultValues,
  });
  
  const onSubmit = async (data: DefaultOkrSettings) => {
    setIsSaving(true);
    
    // Simulate API call
    setTimeout(() => {
      toast({
        title: "Settings saved",
        description: "OKR default settings have been updated",
      });
      setIsSaving(false);
    }, 1000);
    
    // In real implementation, you would save to the database:
    // const { error } = await supabase.from('okr_default_settings').update(data).eq('id', '1');
  };
  
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <Card className="p-6">
          <div className="space-y-6">
            <FormField
              control={form.control}
              name="defaultVisibility"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Default Objective Visibility</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select default visibility" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="team">Team</SelectItem>
                      <SelectItem value="department">Department</SelectItem>
                      <SelectItem value="organization">Organization</SelectItem>
                      <SelectItem value="private">Private</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    This will be the default visibility for new objectives.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="requireApproval"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between">
                  <div className="space-y-0.5">
                    <FormLabel>Require Approval for Objectives</FormLabel>
                    <FormDescription>
                      When enabled, all new objectives require approval before becoming active.
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="defaultWeight"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Default Key Result Weight</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.1"
                      min="0.1"
                      max="10"
                      {...field}
                      onChange={(e) => field.onChange(parseFloat(e.target.value))}
                    />
                  </FormControl>
                  <FormDescription>
                    Default weight for new key results (1 is standard).
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="autoProgressCalculation"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between">
                  <div className="space-y-0.5">
                    <FormLabel>Automatic Progress Calculation</FormLabel>
                    <FormDescription>
                      Automatically calculate objective progress based on key results.
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </Card>
        
        <Button type="submit" disabled={isSaving}>
          {isSaving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...
            </>
          ) : (
            <>
              <Check className="mr-2 h-4 w-4" /> Save Default Settings
            </>
          )}
        </Button>
      </form>
    </Form>
  );
}
