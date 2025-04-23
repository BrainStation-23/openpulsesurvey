
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { IconPicker } from "./components/IconPicker";
import { ConditionForm } from "./components/ConditionForm";
import { ACHIEVEMENT_TYPE_CONFIG } from "./types";
import { TourButton } from "@/components/onboarding/TourButton";
import { useAchievementForm } from "./hooks/useAchievementForm";
import { AchievementPreview } from "./components/AchievementPreview";

export default function AchievementFormPage() {
  const { form, isEditMode, isLoadingAchievement, onSubmit } = useAchievementForm();

  if (isEditMode && isLoadingAchievement) {
    return <div>Loading...</div>;
  }

  const selectedType = form.watch("achievement_type");
  const typeConfig = ACHIEVEMENT_TYPE_CONFIG[selectedType];

  return (
    <div className="p-8">
      <div className="mb-6 flex justify-between items-center">
        <h1 className="text-2xl font-bold">
          {isEditMode ? "Edit Achievement" : "Create Achievement"}
        </h1>
        <TourButton 
          tourId="achievement_create" 
          title="Achievement Creation Guide" 
        />
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Basic Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="achievement_type"
                    render={({ field }) => (
                      <FormItem className="achievement-type-select">
                        <FormLabel>Achievement Type</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select achievement type" className="text-left" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {Object.entries(ACHIEVEMENT_TYPE_CONFIG).map(([type, config]) => (
                              <SelectItem key={type} value={type} className="w-full">
                                <div className="flex flex-col w-full text-left">
                                  <span>{config.label}</span>
                                  <span className="text-xs text-muted-foreground">
                                    {config.description}
                                  </span>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          {typeConfig?.description}
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="icon-picker">
                    <FormField
                      control={form.control}
                      name="icon"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Icon</FormLabel>
                          <FormControl>
                            <IconPicker 
                              value={field.value} 
                              onChange={field.onChange}
                              color={form.watch("icon_color")}
                              onColorChange={(color) => form.setValue("icon_color", color)}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

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
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Textarea {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="points"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Points</FormLabel>
                        <FormControl>
                          <Input type="number" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="status"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Status</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select status" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="active">Active</SelectItem>
                            <SelectItem value="inactive">Inactive</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          Inactive achievements won't be awarded to users
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              <AchievementPreview form={form} />
            </div>

            <div className="lg:col-span-3">
              <Card className="achievement-conditions">
                <CardHeader>
                  <CardTitle>Achievement Conditions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="border rounded-lg p-4 bg-muted/50">
                    <ConditionForm 
                      form={form} 
                      achievementType={selectedType}
                      typeConfig={typeConfig}
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          <div className="mt-6 flex justify-end gap-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => navigate('/admin/achievements')}
            >
              Cancel
            </Button>
            <Button type="submit" size="lg">
              {isEditMode ? "Update Achievement" : "Create Achievement"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
