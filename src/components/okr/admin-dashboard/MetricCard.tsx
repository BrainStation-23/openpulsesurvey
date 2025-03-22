
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { LucideIcon } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: string;
  description: string;
  icon: LucideIcon;
  loading?: boolean;
  valueClassName?: string;
}

export const MetricCard = ({ 
  title, 
  value, 
  description, 
  icon: Icon, 
  loading = false,
  valueClassName = ""
}: MetricCardProps) => {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between space-x-4">
          <div>
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <h3 className={`text-2xl font-bold mt-1 ${valueClassName}`}>
              {loading ? (
                <div className="h-8 w-24 bg-muted rounded animate-pulse"></div>
              ) : (
                value
              )}
            </h3>
            <p className="text-xs text-muted-foreground mt-1">{description}</p>
          </div>
          <div className="rounded-full p-2 bg-muted">
            <Icon className="h-6 w-6 text-muted-foreground" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
