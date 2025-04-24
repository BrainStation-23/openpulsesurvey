
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ArrowDown, ArrowUp, Minus } from "lucide-react";

interface AdvancedInsightsTableProps {
  insightType: string;
  data: any;
}

export function AdvancedInsightsTable({ insightType, data }: AdvancedInsightsTableProps) {
  if (!data) return null;
  
  const renderSentimentInsights = () => (
    <Card>
      <CardHeader>
        <CardTitle>Sentiment Analysis Insights</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Period</TableHead>
              <TableHead>Sentiment Score</TableHead>
              <TableHead>Response Count</TableHead>
              <TableHead className="text-right">Trend</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.sentimentData.map((item: any, index: number) => {
              const prevItem = index > 0 ? data.sentimentData[index - 1] : null;
              const trend = prevItem ? item.sentiment - prevItem.sentiment : 0;
              
              return (
                <TableRow key={item.name}>
                  <TableCell className="font-medium">{item.name}</TableCell>
                  <TableCell>{item.sentiment.toFixed(1)}</TableCell>
                  <TableCell>{item.count}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end">
                      {trend > 0 ? (
                        <div className="flex items-center text-green-500">
                          <ArrowUp className="h-4 w-4 mr-1" />
                          <span>{trend.toFixed(1)}</span>
                        </div>
                      ) : trend < 0 ? (
                        <div className="flex items-center text-red-500">
                          <ArrowDown className="h-4 w-4 mr-1" />
                          <span>{Math.abs(trend).toFixed(1)}</span>
                        </div>
                      ) : (
                        <div className="flex items-center text-muted-foreground">
                          <Minus className="h-4 w-4 mr-1" />
                          <span>0.0</span>
                        </div>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
  
  const renderKeywordInsights = () => (
    <Card>
      <CardHeader>
        <CardTitle>Top Keywords</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Keyword</TableHead>
              <TableHead className="text-right">Frequency</TableHead>
              <TableHead className="text-right">Relative Importance</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.keywordData.slice(0, 10).map((item: any) => {
              const maxValue = Math.max(...data.keywordData.map((w: any) => w.value));
              const relativeImportance = (item.value / maxValue) * 100;
              
              return (
                <TableRow key={item.text}>
                  <TableCell className="font-medium">{item.text}</TableCell>
                  <TableCell className="text-right">{item.value}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end">
                      <div className="w-24 h-2 bg-muted rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-primary" 
                          style={{ width: `${relativeImportance}%` }}
                        />
                      </div>
                      <span className="ml-2 text-xs">{relativeImportance.toFixed(0)}%</span>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
  
  const renderTimesInsights = () => (
    <Card>
      <CardHeader>
        <CardTitle>Response Time Insights</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Insight</TableHead>
              <TableHead className="text-right">Value</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {/* Calculate some insights from the data */}
            <TableRow>
              <TableCell className="font-medium">Average Completion Time</TableCell>
              <TableCell className="text-right">
                {data.responseTimeData.length > 0 
                  ? (data.responseTimeData.reduce((sum: number, item: any) => sum + item.minutesTaken, 0) / 
                     data.responseTimeData.length).toFixed(1) 
                  : 0} minutes
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-medium">Fastest Response</TableCell>
              <TableCell className="text-right">
                {data.responseTimeData.length > 0 
                  ? Math.min(...data.responseTimeData.map((item: any) => item.minutesTaken)).toFixed(1) 
                  : 0} minutes
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-medium">Slowest Response</TableCell>
              <TableCell className="text-right">
                {data.responseTimeData.length > 0 
                  ? Math.max(...data.responseTimeData.map((item: any) => item.minutesTaken)).toFixed(1) 
                  : 0} minutes
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-medium">Total Responses Analyzed</TableCell>
              <TableCell className="text-right">{data.responseTimeData.length}</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
  
  const renderPatternInsights = () => (
    <Card>
      <CardHeader>
        <CardTitle>Participation Pattern Insights</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Time Period</TableHead>
              <TableHead className="text-right">Responses</TableHead>
              <TableHead className="text-right">% of Total</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {/* Group by time blocks */}
            {['Morning (6-12)', 'Afternoon (12-18)', 'Evening (18-24)', 'Night (0-6)'].map((period, index) => {
              let startHour, endHour;
              switch (index) {
                case 0: startHour = 6; endHour = 12; break;
                case 1: startHour = 12; endHour = 18; break;
                case 2: startHour = 18; endHour = 24; break;
                case 3: startHour = 0; endHour = 6; break;
              }
              
              const hourCounts = data.participationTimes
                .filter((item: any) => item.hour >= startHour && item.hour < endHour)
                .reduce((sum: number, item: any) => sum + item.count, 0);
              
              const totalResponses = data.participationTimes.reduce(
                (sum: number, item: any) => sum + item.count, 0
              );
              
              const percentage = totalResponses > 0 ? (hourCounts / totalResponses) * 100 : 0;
              
              return (
                <TableRow key={period}>
                  <TableCell className="font-medium">{period}</TableCell>
                  <TableCell className="text-right">{hourCounts}</TableCell>
                  <TableCell className="text-right">{percentage.toFixed(1)}%</TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
  
  // Render the appropriate insights based on the selected tab
  switch (insightType) {
    case "sentiment":
      return renderSentimentInsights();
    case "keywords":
      return renderKeywordInsights();
    case "times":
      return renderTimesInsights();
    case "patterns":
      return renderPatternInsights();
    default:
      return null;
  }
}
