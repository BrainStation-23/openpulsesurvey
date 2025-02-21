
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export function DemographicBreakdown() {
  const { data: locationData, isLoading: isLocationLoading } = useQuery({
    queryKey: ["demographic-location-analysis"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("demographic_location_analysis")
        .select("*");

      if (error) throw error;
      return data;
    },
  });

  const { data: genderData, isLoading: isGenderLoading } = useQuery({
    queryKey: ["demographic-gender-analysis"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("demographic_gender_analysis")
        .select("*");

      if (error) throw error;
      return data;
    },
  });

  const { data: employmentData, isLoading: isEmploymentLoading } = useQuery({
    queryKey: ["demographic-employment-analysis"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("demographic_employment_analysis")
        .select("*");

      if (error) throw error;
      return data;
    },
  });

  const { data: employeeTypeData, isLoading: isEmployeeTypeLoading } = useQuery({
    queryKey: ["demographic-employee-type-analysis"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("demographic_employee_type_analysis")
        .select("*");

      if (error) throw error;
      return data;
    },
  });

  const { data: employeeRoleData, isLoading: isEmployeeRoleLoading } = useQuery({
    queryKey: ["demographic-employee-role-analysis"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("demographic_employee_role_analysis")
        .select("*");

      if (error) throw error;
      return data;
    },
  });

  const { data: levelData, isLoading: isLevelLoading } = useQuery({
    queryKey: ["demographic-level-analysis"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("demographic_level_analysis")
        .select("*");

      if (error) throw error;
      return data;
    },
  });

  const isLoading = isLocationLoading || isGenderLoading || isEmploymentLoading || 
                    isEmployeeTypeLoading || isEmployeeRoleLoading || isLevelLoading;

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Demographic Analysis</CardTitle>
        </CardHeader>
        <CardContent>Loading...</CardContent>
      </Card>
    );
  }

  return (
    <Card className="col-span-2">
      <CardHeader>
        <CardTitle>Demographic Analysis</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="location" className="space-y-4">
          <TabsList>
            <TabsTrigger value="location">Location</TabsTrigger>
            <TabsTrigger value="gender">Gender</TabsTrigger>
            <TabsTrigger value="employment">Employment Type</TabsTrigger>
            <TabsTrigger value="employee-type">Employee Type</TabsTrigger>
            <TabsTrigger value="employee-role">Employee Role</TabsTrigger>
            <TabsTrigger value="level">Level</TabsTrigger>
          </TabsList>

          <TabsContent value="location" className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={locationData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="location" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="response_count" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </TabsContent>

          <TabsContent value="gender" className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={genderData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="gender" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="response_count" fill="#82ca9d" />
              </BarChart>
            </ResponsiveContainer>
          </TabsContent>

          <TabsContent value="employment" className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={employmentData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="employment_type" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="response_count" fill="#ffc658" />
              </BarChart>
            </ResponsiveContainer>
          </TabsContent>

          <TabsContent value="employee-type" className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={employeeTypeData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="employee_type" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="response_count" fill="#ff7f50" />
              </BarChart>
            </ResponsiveContainer>
          </TabsContent>

          <TabsContent value="employee-role" className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={employeeRoleData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="employee_role" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="response_count" fill="#6c5ce7" />
              </BarChart>
            </ResponsiveContainer>
          </TabsContent>

          <TabsContent value="level" className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={levelData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="level" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="response_count" fill="#00cec9" />
              </BarChart>
            </ResponsiveContainer>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
