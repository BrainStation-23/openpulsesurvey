
// Edge function to fetch all users & return CSV
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import Papa from "npm:papaparse";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Use the Service Role Key for server-side queries
    const { SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY } = Deno.env.toObject();
    const supabase = createClient(
      SUPABASE_URL,
      SUPABASE_SERVICE_ROLE_KEY
    );

    // Fetch all users using the RLS-bypassing service role
    const { data, error } = await supabase.rpc("search_users", {
      search_text: "",
      page_number: 1,
      page_size: 100_000,
      sbu_filter: null,
      level_filter: null,
      location_filter: null,
      employment_type_filter: null,
      employee_role_filter: null,
      employee_type_filter: null,
    });

    if (error) {
      console.error("Error fetching users:", error);
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Extract, flatten, and prepare user data for CSV
    const rawUsers = data.map((u) => u.profile);
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

    const csvRows = rawUsers.map((user) => {
      const allSbus = (user.user_sbus || [])
        .sort((a, b) => (b.is_primary ? 1 : 0) - (a.is_primary ? 1 : 0))
        .map((sbu) => sbu.sbu?.name)
        .join(";") || "";
      return [
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
        user.id,
      ];
    });

    const csv = Papa.unparse({
      fields: headers,
      data: csvRows,
    }, {
      quotes: true,
      quoteChar: '"',
      escapeChar: '"',
      delimiter: ",",
      header: true,
      newline: "\n"
    });

    return new Response(csv, {
      headers: {
        ...corsHeaders,
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="users_export_${new Date().toISOString()}.csv"`,
      }
    });
  } catch (err) {
    console.error("Unhandled error:", err);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
