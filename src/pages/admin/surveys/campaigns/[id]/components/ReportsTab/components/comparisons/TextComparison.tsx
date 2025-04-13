
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ComparisonDimension } from "../../types/comparison";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";

interface TextComparisonProps {
  data: any[];
  dimension: ComparisonDimension;
  layout?: "vertical" | "grid";
}

export function TextComparison({ 
  data, 
  dimension,
  layout = "vertical"
}: TextComparisonProps) {
  if (!data || data.length === 0) {
    return <div className="text-center py-8 text-muted-foreground">No text comparison data available</div>;
  }

  // Sort by number of responses
  const sortedData = [...data].sort((a, b) => b.text_response_count - a.text_response_count);

  const renderTable = () => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>{getDimensionLabel(dimension)}</TableHead>
          <TableHead className="text-right">Responses</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {sortedData.map((group) => (
          <TableRow key={group.dimension}>
            <TableCell>{group.dimension}</TableCell>
            <TableCell className="text-right">{group.text_response_count}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );

  const renderSamples = () => (
    <div className="space-y-6">
      {sortedData.map((group) => (
        <div key={group.dimension} className="space-y-2">
          <h4 className="font-medium text-sm">{group.dimension} ({group.text_response_count} responses)</h4>
          {group.text_samples && group.text_samples.length > 0 ? (
            <ul className="space-y-1 text-sm text-muted-foreground">
              {group.text_samples.slice(0, 3).map((sample: string, index: number) => (
                <li key={index} className="border-l-2 border-muted pl-3 py-1">
                  {sample}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-muted-foreground italic">No text responses available</p>
          )}
        </div>
      ))}
    </div>
  );

  if (layout === "grid") {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>{renderTable()}</div>
        <div>{renderSamples()}</div>
      </div>
    );
  }

  return (
    <Tabs defaultValue="table" className="w-full">
      <TabsList>
        <TabsTrigger value="table">Response Count</TabsTrigger>
        <TabsTrigger value="samples">Sample Responses</TabsTrigger>
      </TabsList>
      
      <TabsContent value="table" className="pt-4">
        {renderTable()}
      </TabsContent>
      
      <TabsContent value="samples" className="pt-4">
        {renderSamples()}
      </TabsContent>
    </Tabs>
  );
}

function getDimensionLabel(dimension: ComparisonDimension): string {
  const labels: Record<ComparisonDimension, string> = {
    none: "None",
    sbu: "Department",
    gender: "Gender",
    location: "Location",
    employment_type: "Employment Type",
    level: "Level",
    employee_type: "Employee Type",
    employee_role: "Employee Role"
  };
  
  return labels[dimension] || dimension;
}
