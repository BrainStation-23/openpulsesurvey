
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
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Separator } from "@/components/ui/separator";

export default function AchievementFormPage() {
  const navigate = useNavigate();
  const { form, isEditMode, isLoadingAchievement, onSubmit } = useAchievementForm();

  if (isEditMode && isLoadingAchievement) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  const selectedType = form.watch("achievement_type");
  const typeConfig = ACHIEVEMENT_TYPE_CONFIG[selectedType];

  return (
    <div className="p-8 max-w-[800px] mx-auto">
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6 flex justify-between items-center"
      >
        <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent page-title">
          {isEditMode ? "Edit Achievement" : "Create Achievement"}
        </h1>
        <TourButton 
          tourId="achievement_create" 
          title="Achievement Creation Guide"
          className="bg-primary/10 hover:bg-primary/20 text-primary" 
        />
      </motion.div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="achievement-type-select">
              <CardHeader>
                <CardTitle>Achievement Type</CardTitle>
              </CardHeader>
              <CardContent>
                <FormField
                  control={form.control}
                  name="achievement_type"
                  render={({ field }) => (
                    <FormItem>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className="h-12">
                            <SelectValue placeholder="Select achievement type" className="text-left" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {Object.entries(ACHIEVEMENT_TYPE_CONFIG).map(([type, config]) => (
                            <SelectItem key={type} value={type} className="w-full py-3 focus:bg-primary/10">
                              <div className="flex flex-col w-full text-left">
                                <span className="font-medium">{config.label}</span>
                                <span className="text-xs text-muted-foreground">
                                  {config.description}
                                </span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormDescription className="text-sm">
                        {typeConfig?.description}
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>Achievement Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-base font-semibold">Name</FormLabel>
                      <FormControl>
                        <Input {...field} className="h-12" />
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
                      <FormLabel className="text-base font-semibold">Description</FormLabel>
                      <FormControl>
                        <Textarea {...field} className="min-h-[100px] resize-none" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <div className="icon-picker">
                    <FormField
                      control={form.control}
                      name="icon"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-base font-semibold">Icon</FormLabel>
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
                    name="points"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-base font-semibold">Points</FormLabel>
                        <FormControl>
                          <Input type="number" {...field} className="h-12" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-base font-semibold">Status</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className="h-12">
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="active" className="py-3">Active</SelectItem>
                          <SelectItem value="inactive" className="py-3">Inactive</SelectItem>
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
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="sticky top-4"
          >
            <AchievementPreview form={form} />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card className="achievement-conditions">
              <CardHeader>
                <CardTitle>Achievement Conditions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="border rounded-lg p-6 bg-muted/30 backdrop-blur-sm">
                  <ConditionForm 
                    form={form} 
                    achievementType={selectedType}
                    typeConfig={typeConfig}
                  />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <Separator className="my-8" />

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="flex justify-end gap-4 sticky bottom-4 bg-background/80 backdrop-blur-sm p-4 rounded-lg shadow-lg"
          >
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => navigate('/admin/achievements')}
              className="h-12 px-6"
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              size="lg"
              className="h-12 px-8 bg-primary hover:bg-primary/90"
            >
              {isEditMode ? "Update Achievement" : "Create Achievement"}
            </Button>
          </motion.div>
        </form>
      </Form>
    </div>
  );
}
