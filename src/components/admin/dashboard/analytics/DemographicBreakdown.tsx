import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export function DemographicBreakdown() {
  const { data: demographicData, isLoading } = useQuery({
    queryKey: ["demographic-analysis"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("demographic_analysis")
        .select("*");

      if (error) throw error;
      return data;
    },
  });

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

  const locationData = demographicData
    ?.filter((d) => d.location)
    .map((d) => ({
      name: d.location,
      responses: d.response_count,
    }));

  const genderData = demographicData
    ?.filter((d) => d.gender)
    .map((d) => ({
      name: d.gender,
      responses: d.response_count,
    }));

  const employmentTypeData = demographicData
    ?.filter((d) => d.employment_type)
    .map((d) => ({
      name: d.employment_type,
      responses: d.response_count,
    }));

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
          </TabsList>

          <TabsContent value="location" className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={locationData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="responses" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </TabsContent>

          <TabsContent value="gender" className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={genderData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="responses" fill="#82ca9d" />
              </BarChart>
            </ResponsiveContainer>
          </TabsContent>

          <TabsContent value="employment" className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={employmentTypeData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="responses" fill="#ffc658" />
              </BarChart>
            </ResponsiveContainer>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}