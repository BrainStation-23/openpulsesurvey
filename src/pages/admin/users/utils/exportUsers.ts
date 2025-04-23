import { User } from "../types";
import { supabase } from "@/integrations/supabase/client";
import Papa from "papaparse";

type ProgressCallback = (processed: number, total: number) => void;

export const exportUsers = async (users: User[], onProgress?: ProgressCallback) => {
  const total = users.length;
  const headers = [
    "Email",
    "Status",
    "First Name",
    "Last Name",
    "Org ID",
    "Level",
    "Role",
    "Gender",
    "Date of Birth",
    "Designation",
    "Location",
    "Employment Type",
    "Employee Role",
    "Employee Type",
    "SBUs",
    "Supervisor Email",
    "ID"
  ];

  const processUsers = async () => {
    const rows = [];
    for (let i = 0; i < users.length; i++) {
      const user = users[i];
      // Combine primary and additional SBUs into semicolon-separated list
      const allSbus = user.user_sbus
        ?.sort((a, b) => (b.is_primary ? 1 : 0) - (a.is_primary ? 1 : 0))
        ?.map(sbu => sbu.sbu.name)
        ?.join(";") || "";

      const row = [
        user.email,
        user.status || "active",
        user.first_name || "",
        user.last_name || "",
        user.org_id || "",
        user.level || "",
        user.user_roles?.role || "user",
        user.gender || "",
        user.date_of_birth || "",
        user.designation || "",
        user.location || "",
        user.employment_type || "",
        user.employee_role || "",
        user.employee_type || "",
        allSbus,
        user.primary_supervisor?.email || "",
        user.id
      ];
      rows.push(row);

      if (onProgress) {
        onProgress(i + 1, total);
      }
    }
    return rows;
  };

  const rows = await processUsers();

  // Use PapaParse to generate CSV
  const csvContent = Papa.unparse({
    fields: headers,
    data: rows
  }, {
    quotes: true, // Always quote strings
    quoteChar: '"',
    escapeChar: '"',
    delimiter: ",",
    header: true,
    newline: "\n"
  });

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.setAttribute("download", `users_export_${new Date().toISOString()}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
