
import React from "react";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, AlertTriangle, Clock } from "lucide-react";
import { ServiceStatus } from "@/pages/admin/system/health";

interface StatusBadgeProps {
  status: ServiceStatus;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  switch (status) {
    case "operational":
      return <Badge className="bg-green-500 hover:bg-green-600"><CheckCircle className="h-3 w-3 mr-1" /> Operational</Badge>;
    case "degraded":
      return <Badge className="bg-yellow-500 hover:bg-yellow-600"><AlertTriangle className="h-3 w-3 mr-1" /> Degraded</Badge>;
    case "failed":
      return <Badge className="bg-red-500 hover:bg-red-600"><AlertTriangle className="h-3 w-3 mr-1" /> Failed</Badge>;
    case "pending":
      return <Badge className="bg-gray-500 hover:bg-gray-600"><Clock className="h-3 w-3 mr-1" /> Pending</Badge>;
    default:
      return <Badge className="bg-gray-500 hover:bg-gray-600"><Clock className="h-3 w-3 mr-1" /> Unknown</Badge>;
  }
}
