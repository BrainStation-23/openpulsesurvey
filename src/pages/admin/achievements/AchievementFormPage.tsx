
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
    <div className="p-8 max-w-[1400px] mx-auto">
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
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="lg:col-span-2 space-y-6"
            >
              <Card className="border-2 shadow-lg bg-card/50 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    Basic Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="achievement_type"
                    render={({ field }) => (
                      <FormItem className="achievement-type-select">
                        <FormLabel className="text-base font-semibold">Achievement Type</FormLabel>
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

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <AchievementPreview form={form} />
              </motion.div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="lg:col-span-3"
            >
              <Card className="achievement-conditions border-2 shadow-lg bg-card/50 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle>Achievement Conditions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
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
          </div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mt-6 flex justify-end gap-4"
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
