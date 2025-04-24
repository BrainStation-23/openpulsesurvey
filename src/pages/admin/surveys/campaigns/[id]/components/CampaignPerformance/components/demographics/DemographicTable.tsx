
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DemographicBreakdownItem } from "../../types";

interface DemographicTableProps {
  title: string;
  data: DemographicBreakdownItem[] | any[];
  nameKey?: string;
}

export function DemographicTable({ title, data, nameKey = "name" }: DemographicTableProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b">
              <th className="text-left py-2">{title}</th>
              <th className="text-right py-2">Count</th>
              <th className="text-right py-2">Percentage</th>
            </tr>
          </thead>
          <tbody>
            {data.map((item, index) => (
              <tr key={index} className="border-b">
                <td className="py-2">{item[nameKey]}</td>
                <td className="text-right py-2">{item.count}</td>
                <td className="text-right py-2">{item.percentage.toFixed(1)}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </CardContent>
    </Card>
  );
}
