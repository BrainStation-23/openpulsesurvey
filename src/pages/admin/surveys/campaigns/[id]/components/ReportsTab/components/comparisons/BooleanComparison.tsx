
import { useState } from "react";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { supabase } from "@/integrations/supabase/client";
import { BooleanCharts } from "../../charts/BooleanCharts";

interface BooleanComparisonProps {
  responses: any[];
  questionName: string;
  dimension: string;
}

// Add a defined interface for the group data
interface GroupData {
  yes: number;
  no: number;
}

export function BooleanComparison({ responses, questionName, dimension }: BooleanComparisonProps) {
  const [viewMode, setViewMode] = useState<'chart' | 'table'>('chart');

  const groupedData = responses.reduce((acc, response) => {
    const questionData = response.answers[questionName];
    if (!questionData || typeof questionData.answer !== "boolean") return acc;

    const answer = questionData.answer;
    let dimensionValue = "Unknown";

    switch (dimension) {
      case "sbu":
        dimensionValue = response.respondent.sbu?.name || "Unknown";
        break;
      case "gender":
        dimensionValue = response.respondent.gender || "Unknown";
        break;
      case "location":
        dimensionValue = response.respondent.location?.name || "Unknown";
        break;
      case "employment_type":
        dimensionValue = response.respondent.employment_type?.name || "Unknown";
        break;
      case "level":
        dimensionValue = response.respondent.level?.name || "Unknown";
        break;
      case "employee_type":
        dimensionValue = response.respondent.employee_type?.name || "Unknown";
        break;
      case "employee_role":
        dimensionValue = response.respondent.employee_role?.name || "Unknown";
        break;
    }

    if (!acc[dimensionValue]) {
      acc[dimensionValue] = { yes: 0, no: 0 };
    }

    if (answer === true) {
      acc[dimensionValue].yes += 1;
    } else {
      acc[dimensionValue].no += 1;
    }

    return acc;
  }, {} as Record<string, GroupData>);

  return (
    <Card>
      <CardHeader>
        <CardTitle>{dimension ? `By ${dimension}` : "Comparison"}</CardTitle>
        <div className="flex justify-end mt-2">
          <button
            className={`mr-2 px-3 py-1 rounded ${viewMode === "chart" ? "bg-blue-100" : "bg-gray-100"}`}
            onClick={() => setViewMode("chart")}
          >
            Chart View
          </button>
          <button
            className={`px-3 py-1 rounded ${viewMode === "table" ? "bg-blue-100" : "bg-gray-100"}`}
            onClick={() => setViewMode("table")}
          >
            Table View
          </button>
        </div>
      </CardHeader>
      <CardContent>
        {viewMode === "chart" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(groupedData).map(([group, data]) => (
              <Card key={group}>
                <CardHeader>
                  <CardTitle>{group}</CardTitle>
                </CardHeader>
                <CardContent>
                  <BooleanCharts data={data} />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Group</TableHead>
                <TableHead>Yes</TableHead>
                <TableHead>No</TableHead>
                <TableHead>Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {Object.entries(groupedData).map(([group, data]) => (
                <TableRow key={group}>
                  <TableCell>{group}</TableCell>
                  <TableCell>{data.yes}</TableCell>
                  <TableCell>{data.no}</TableCell>
                  <TableCell>{data.yes + data.no}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  )
}
