
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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useToast } from "@/hooks/use-toast";
import { Check, Loader2, Info, Eye, Users, Building } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";

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
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: "Settings saved",
        description: "OKR default settings have been updated successfully",
      });
      
      // In real implementation, you would save to the database:
      // const { error } = await supabase.from('okr_default_settings').update(data).eq('id', '1');
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error saving settings",
        description: "There was a problem saving your settings. Please try again.",
      });
    } finally {
      setIsSaving(false);
    }
  };
  
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <div className="space-y-6">
          <Card className="p-6">
            <h3 className="text-lg font-medium flex items-center gap-2 mb-4">
              <Eye className="h-5 w-5" />
              Visibility Settings
            </h3>
            <p className="text-sm text-muted-foreground mb-6">
              Control the default visibility for new objectives created in the system.
            </p>
            
            <FormField
              control={form.control}
              name="defaultVisibility"
              render={({ field }) => (
                <FormItem className="space-y-1">
                  <FormLabel>Default Objective Visibility</FormLabel>
                  <FormDescription className="mt-0">
                    When users create new objectives, they will default to this visibility level.
                  </FormDescription>
                  
                  <RadioGroup 
                    onValueChange={field.onChange} 
                    defaultValue={field.value}
                    className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-4"
                  >
                    <FormItem>
                      <FormLabel className="flex items-start space-x-3 space-y-0 p-4 border rounded-md cursor-pointer [&:has([data-state=checked])]:border-primary [&:has([data-state=checked])]:bg-primary/5">
                        <FormControl>
                          <RadioGroupItem value="private" />
                        </FormControl>
                        <div className="space-y-1.5 leading-none">
                          <span className="font-medium flex items-center gap-2">
                            Private
                            <Badge variant="outline" className="ml-2">Restricted</Badge>
                          </span>
                          <FormDescription className="text-sm">
                            Only the creator and assigned users can view
                          </FormDescription>
                        </div>
                      </FormLabel>
                    </FormItem>
                    
                    <FormItem>
                      <FormLabel className="flex items-start space-x-3 space-y-0 p-4 border rounded-md cursor-pointer [&:has([data-state=checked])]:border-primary [&:has([data-state=checked])]:bg-primary/5">
                        <FormControl>
                          <RadioGroupItem value="team" />
                        </FormControl>
                        <div className="space-y-1.5 leading-none">
                          <span className="font-medium flex items-center gap-2">
                            Team
                            <Badge className="ml-2 bg-blue-100 text-blue-800 border-blue-200">Recommended</Badge>
                          </span>
                          <FormDescription className="text-sm">
                            Visible to all team members
                          </FormDescription>
                        </div>
                      </FormLabel>
                    </FormItem>
                    
                    <FormItem>
                      <FormLabel className="flex items-start space-x-3 space-y-0 p-4 border rounded-md cursor-pointer [&:has([data-state=checked])]:border-primary [&:has([data-state=checked])]:bg-primary/5">
                        <FormControl>
                          <RadioGroupItem value="department" />
                        </FormControl>
                        <div className="space-y-1.5 leading-none">
                          <span className="font-medium">Department</span>
                          <FormDescription className="text-sm">
                            Visible to entire department
                          </FormDescription>
                        </div>
                      </FormLabel>
                    </FormItem>
                    
                    <FormItem>
                      <FormLabel className="flex items-start space-x-3 space-y-0 p-4 border rounded-md cursor-pointer [&:has([data-state=checked])]:border-primary [&:has([data-state=checked])]:bg-primary/5">
                        <FormControl>
                          <RadioGroupItem value="organization" />
                        </FormControl>
                        <div className="space-y-1.5 leading-none">
                          <span className="font-medium">Organization</span>
                          <FormDescription className="text-sm">
                            Visible to entire organization
                          </FormDescription>
                        </div>
                      </FormLabel>
                    </FormItem>
                  </RadioGroup>
                  <FormMessage />
                </FormItem>
              )}
            />
          </Card>
          
          <Card className="p-6">
            <h3 className="text-lg font-medium flex items-center gap-2 mb-4">
              <Users className="h-5 w-5" />
              Workflow Settings
            </h3>
            <p className="text-sm text-muted-foreground mb-6">
              Configure how objectives are approved and managed.
            </p>
            
            <FormField
              control={form.control}
              name="requireApproval"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="font-medium">Require Approval for Objectives</FormLabel>
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
            
            <Separator className="my-6" />
            
            <FormField
              control={form.control}
              name="autoProgressCalculation"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="font-medium">Automatic Progress Calculation</FormLabel>
                    <FormDescription>
                      Automatically calculate objective progress based on key results.
                      <div className="mt-1 p-2 bg-blue-50 border border-blue-100 rounded text-sm text-blue-700">
                        <Info className="h-4 w-4 inline-block mr-1" /> When disabled, users must manually update objective progress.
                      </div>
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
          </Card>
          
          <Card className="p-6">
            <h3 className="text-lg font-medium flex items-center gap-2 mb-4">
              <Building className="h-5 w-5" />
              Key Results Configuration
            </h3>
            <p className="text-sm text-muted-foreground mb-6">
              Set default values for key result properties.
            </p>
            
            <FormField
              control={form.control}
              name="defaultWeight"
              render={({ field }) => (
                <FormItem className="max-w-xs">
                  <FormLabel>Default Key Result Weight</FormLabel>
                  <FormControl>
                    <div className="flex items-center">
                      <Input
                        type="number"
                        step="0.1"
                        min="0.1"
                        max="10"
                        className="w-24"
                        {...field}
                        onChange={(e) => field.onChange(parseFloat(e.target.value) || 1)}
                      />
                      <div className="ml-4">
                        <div className={`h-2 w-16 rounded ${field.value <= 1 ? 'bg-gray-200' : field.value <= 3 ? 'bg-blue-300' : field.value <= 6 ? 'bg-blue-500' : 'bg-blue-700'}`}></div>
                        <span className="text-xs text-muted-foreground mt-1 block">Weight indicator</span>
                      </div>
                    </div>
                  </FormControl>
                  <FormDescription>
                    Default weight for new key results (1 is standard, higher values give more importance)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </Card>
        </div>
        
        <Button type="submit" size="lg" disabled={isSaving} className="mr-2">
          {isSaving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...
            </>
          ) : (
            <>
              <Check className="mr-2 h-4 w-4" /> Save Settings
            </>
          )}
        </Button>
        
        <Button type="button" variant="outline" size="lg" onClick={() => form.reset()} disabled={isSaving}>
          Reset to Defaults
        </Button>
      </form>
    </Form>
  );
}
