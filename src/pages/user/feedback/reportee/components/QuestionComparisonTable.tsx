
import React from 'react';
import { DataTable } from '@/components/ui/data-table';
import { Badge } from '@/components/ui/badge';
import { TrendingDown, TrendingUp, Minus } from 'lucide-react';
import { TeamFeedbackQuestion } from '@/hooks/useReporteeFeedback';

interface QuestionComparisonTableProps {
  questions: TeamFeedbackQuestion[];
}

export function QuestionComparisonTable({ questions }: QuestionComparisonTableProps) {
  const columns = [
    {
      accessorKey: 'question_title',
      header: 'Question',
      cell: ({ row }) => (
        <div className="font-medium">{row.original.question_title}</div>
      ),
    },
    {
      accessorKey: 'question_type',
      header: 'Type',
      cell: ({ row }) => {
        const type = row.original.question_type;
        return (
          <Badge
            variant="outline"
            className={
              type === 'rating'
                ? 'bg-blue-50 text-blue-700 hover:bg-blue-100'
                : type === 'boolean'
                ? 'bg-purple-50 text-purple-700 hover:bg-purple-100'
                : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
            }
          >
            {type}
          </Badge>
        );
      },
    },
    {
      accessorKey: 'avg_value',
      header: 'Score',
      cell: ({ row }) => {
        const question = row.original;
        if (question.question_type === 'rating' && question.avg_value !== null) {
          return <div className="font-medium">{question.avg_value.toFixed(1)}</div>;
        }
        if (question.question_type === 'boolean' && question.distribution) {
          const trueCount = question.distribution.true_count || 0;
          const falseCount = question.distribution.false_count || 0;
          const total = trueCount + falseCount;
          const percentage = total > 0 ? Math.round((trueCount / total) * 100) : 0;
          return <div className="font-medium">{percentage}%</div>;
        }
        return <div className="text-muted-foreground">N/A</div>;
      },
    },
    {
      accessorKey: 'response_count',
      header: 'Responses',
      cell: ({ row }) => (
        <div className="font-mono">{row.original.response_count}</div>
      ),
    },
    {
      id: 'trend',
      header: 'Trend',
      cell: ({ row }) => {
        const question = row.original;
        // This is a placeholder - in a real implementation you would compare with previous period
        const trendValue = question.question_name.charCodeAt(0) % 3 - 1; // Just for demo purposes
        
        return (
          <div className="flex items-center">
            {trendValue > 0 ? (
              <TrendingUp className="mr-1 h-4 w-4 text-green-500" />
            ) : trendValue < 0 ? (
              <TrendingDown className="mr-1 h-4 w-4 text-red-500" />
            ) : (
              <Minus className="mr-1 h-4 w-4 text-gray-400" />
            )}
          </div>
        );
      },
    }
  ];

  return <DataTable columns={columns} data={questions} />;
}
