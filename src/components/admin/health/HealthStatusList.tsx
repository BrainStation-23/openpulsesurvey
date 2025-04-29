
import React from "react";
import { ServiceCheck } from "@/pages/admin/system/health";
import { StatusBadge } from "./StatusBadge";

interface HealthStatusListProps {
  items: ServiceCheck[];
}

export function HealthStatusList({ items }: HealthStatusListProps) {
  return (
    <div className="grid gap-4">
      <div className="grid grid-cols-4 items-center gap-4 border-b pb-4">
        <div className="font-medium">Service</div>
        <div className="font-medium">Status</div>
        <div className="font-medium">Last Checked</div>
        <div className="font-medium">Response Time</div>
      </div>
      
      {items.map((item, index) => (
        <div key={index} className="grid grid-cols-4 items-center gap-4 border-b pb-4">
          <div>{item.name}</div>
          <div><StatusBadge status={item.status} /></div>
          <div className="text-sm">{item.lastChecked}</div>
          <div className="text-sm">{item.responseTime ? `${item.responseTime}ms` : 'N/A'}</div>
        </div>
      ))}
    </div>
  );
}
