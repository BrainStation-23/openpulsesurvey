
import React from "react";
import { ServiceCheck, DbFunctionCheck } from "@/pages/admin/system/health";
import { StatusBadge } from "./StatusBadge";
import { DatabaseFunctionDetails } from "./DatabaseFunctionDetails";

interface HealthStatusListProps {
  items: ServiceCheck[];
}

export function HealthStatusList({ items }: HealthStatusListProps) {
  // Check if we have any DbFunctionCheck items to show extra details
  const hasFunctionDetails = items.some(item => 'functionName' in item);

  return (
    <div className="grid gap-4">
      <div className="grid grid-cols-4 items-center gap-4 border-b pb-4">
        <div className="font-medium">Service</div>
        <div className="font-medium">Status</div>
        <div className="font-medium">Last Checked</div>
        <div className="font-medium">Response Time</div>
      </div>
      
      {items.map((item, index) => (
        <div key={index} className="space-y-2">
          <div className="grid grid-cols-4 items-center gap-4 border-b pb-4">
            <div>{item.name}</div>
            <div><StatusBadge status={item.status} /></div>
            <div className="text-sm">{item.lastChecked}</div>
            <div className="text-sm">{item.responseTime ? `${item.responseTime}ms` : 'N/A'}</div>
          </div>
          
          {/* If it's a database function, show the details component */}
          {hasFunctionDetails && 'functionName' in item && (
            <DatabaseFunctionDetails functionData={item as DbFunctionCheck} />
          )}
        </div>
      ))}
    </div>
  );
}
