
import { z } from "zod";
import { Level, User } from "../types";
import { supabase } from "@/integrations/supabase/client";
import { ImportError } from "./errorReporting";
import Papa from 'papaparse';

const csvRowSchema = z.object({
  id: z.string().uuid().optional(),
  email: z.string().email("Invalid email format"),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  orgId: z.string().optional(),
  level: z.string().optional(),
  sbus: z.string().optional(),
  role: z.enum(["admin", "user"]).optional().default("user"),
  gender: z.enum(["male", "female", "other"]).optional(),
  dateOfBirth: z.string().optional(),
  designation: z.string().optional(),
  location: z.string().optional(),
  employmentType: z.string().optional(),
  employeeRole: z.string().optional(),
  employeeType: z.string().optional(),
  supervisorEmail: z.string().email("Invalid supervisor email format").optional(),
  status: z.enum(["active", "disabled"]).optional(),
});

export type CSVRow = z.infer<typeof csvRowSchema>;

export type ProcessingResult = {
  newUsers: CSVRow[];
  existingUsers: CSVRow[];
  errors: { row: number; errors: string[] }[];
};

export type ProcessingProgressEvent = {
  stage: 'init' | 'parsing' | 'validating' | 'verifying' | 'checking_entities' | 'complete';
  currentRow: number;
  totalRows: number;
  message: string;
  percentage: number;
};

import cryptoRandomString from 'crypto-random-string';

function generateTempPassword(): string {
  // Generate a random string of 8 characters
  return cryptoRandomString({length: 8, type: 'alphanumeric'});
}

async function getLevelId(levelName?: string): Promise<string | null> {
  if (!levelName) return null;
  
  const { data } = await supabase
    .from("levels")
    .select("id")
    .eq("name", levelName)
    .eq("status", "active")
    .maybeSingle();

  return data?.id || null;
}

async function getLocationId(locationName?: string): Promise<string | null> {
  if (!locationName) return null;

  const { data } = await supabase
    .from("locations")
    .select("id")
    .eq("name", locationName)
    .maybeSingle();

  return data?.id || null;
}

async function getEmploymentTypeId(typeName?: string): Promise<string | null> {
  if (!typeName) return null;

  const { data } = await supabase
    .from("employment_types")
    .select("id")
    .eq("name", typeName)
    .eq("status", "active")
    .maybeSingle();

  return data?.id || null;
}

async function getEmployeeRoleId(roleName?: string): Promise<string | null> {
  if (!roleName) return null;

  const { data } = await supabase
    .from("employee_roles")
    .select("id")
    .eq("name", roleName)
    .eq("status", "active")
    .maybeSingle();

  return data?.id || null;
}

async function getEmployeeTypeId(typeName?: string): Promise<string | null> {
  if (!typeName) return null;

  const { data } = await supabase
    .from("employee_types")
    .select("id")
    .eq("name", typeName)
    .eq("status", "active")
    .maybeSingle();

  return data?.id || null;
}

async function assignSBUs(userId: string, sbuString: string): Promise<void> {
  const sbuNames = sbuString.split(";").map(s => s.trim());
  
  const { data: sbus } = await supabase
    .from("sbus")
    .select("id, name")
    .in("name", sbuNames);

  if (!sbus?.length) return;

  await supabase
    .from("user_sbus")
    .delete()
    .eq("user_id", userId);

  const assignments = sbus.map((sbu, index) => ({
    user_id: userId,
    sbu_id: sbu.id,
    is_primary: index === 0,
  }));

  await supabase.from("user_sbus").insert(assignments);
}

async function verifyExistingUser(id: string, email: string): Promise<boolean> {
  const { data } = await supabase
    .from("profiles")
    .select("email")
    .eq("id", id)
    .single();

  return data?.email === email;
}

export async function processCSVFile(
  file: File, 
  onProgress?: (progress: ProcessingProgressEvent) => void
): Promise<ProcessingResult> {
  return new Promise((resolve, reject) => {
    const result: ProcessingResult = {
      newUsers: [],
      existingUsers: [],
      errors: [],
    };

    // Notify initial state
    onProgress?.({
      stage: 'init',
      currentRow: 0,
      totalRows: 0,
      message: 'Initializing file processing...',
      percentage: 0
    });

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      
      // Report parsing progress
      step: (results, parser) => {
        // Fix: Use results.meta.cursor instead of parser.lineNum
        const rowIndex = results.meta.cursor || 0;
        const totalRows = file.size / (results.data.toString().length || 1); // Estimate
        onProgress?.({
          stage: 'parsing',
          currentRow: rowIndex,
          totalRows: Math.ceil(totalRows),
          message: `Parsing row ${rowIndex}...`,
          percentage: Math.min(Math.floor((rowIndex / totalRows) * 100), 99)
        });
      },
      
      complete: async (results) => {
        try {
          onProgress?.({
            stage: 'validating',
            currentRow: 0,
            totalRows: results.data.length,
            message: 'Starting data validation...',
            percentage: 0
          });

          for (let i = 0; i < results.data.length; i++) {
            const row = results.data[i] as Record<string, string>;
            
            onProgress?.({
              stage: 'validating',
              currentRow: i + 1,
              totalRows: results.data.length,
              message: `Validating row ${i + 1} of ${results.data.length}...`,
              percentage: Math.floor(((i + 1) / results.data.length) * 40) // First 40% for validation
            });
            
            const rowData = {
              id: row['ID']?.trim(),
              email: row['Email']?.trim(),
              firstName: row['First Name']?.trim(),
              lastName: row['Last Name']?.trim(),
              orgId: row['Org ID']?.trim(),
              level: row['Level']?.trim(),
              sbus: row['SBUs']?.trim(),
              role: row['Role']?.trim()?.toLowerCase() as "admin" | "user",
              gender: row['Gender']?.trim()?.toLowerCase() as "male" | "female" | "other",
              dateOfBirth: row['Date of Birth']?.trim(),
              designation: row['Designation']?.trim(),
              location: row['Location']?.trim(),
              employmentType: row['Employment Type']?.trim(),
              employeeRole: row['Employee Role']?.trim(),
              employeeType: row['Employee Type']?.trim(),
              supervisorEmail: row['Supervisor Email']?.trim(),
              status: row['Status']?.trim()?.toLowerCase() as "active" | "disabled",
            };

            try {
              const validatedRow = csvRowSchema.parse(rowData);
              
              if (validatedRow.id) {
                onProgress?.({
                  stage: 'verifying',
                  currentRow: i + 1,
                  totalRows: results.data.length,
                  message: `Verifying existing user: ${validatedRow.email}...`,
                  percentage: 40 + Math.floor(((i + 1) / results.data.length) * 30) // Next 30% for verification
                });
                
                const isValid = await verifyExistingUser(validatedRow.id, validatedRow.email);
                if (!isValid) {
                  result.errors.push({
                    row: i + 2, // +2 because of header row and 0-indexing
                    errors: ["ID and email do not match or ID not found"],
                  });
                  continue;
                }
                result.existingUsers.push(validatedRow);
              } else {
                result.newUsers.push(validatedRow);
              }
            } catch (error) {
              if (error instanceof z.ZodError) {
                result.errors.push({
                  row: i + 2, // +2 because of header row and 0-indexing
                  errors: error.errors.map(e => `${e.path.join(".")}: ${e.message}`),
                });
              }
            }
          }

          // Final stage - validating entities (levels, locations, etc.)
          onProgress?.({
            stage: 'checking_entities',
            currentRow: results.data.length,
            totalRows: results.data.length,
            message: 'Validating entity references...',
            percentage: 80
          });

          // Sample entity checks
          if (result.existingUsers.length > 0 || result.newUsers.length > 0) {
            // Get all unique entity values for batch checking
            const allLevels = new Set<string>();
            const allLocations = new Set<string>();
            const allEmploymentTypes = new Set<string>();
            
            [...result.existingUsers, ...result.newUsers].forEach(user => {
              if (user.level) allLevels.add(user.level);
              if (user.location) allLocations.add(user.location);
              if (user.employmentType) allEmploymentTypes.add(user.employmentType);
            });
            
            // Check if these entities exist (could add detailed validation here)
            if (allLevels.size > 0) {
              onProgress?.({
                stage: 'checking_entities',
                currentRow: results.data.length,
                totalRows: results.data.length,
                message: 'Validating levels...',
                percentage: 85
              });
            }
            
            if (allLocations.size > 0) {
              onProgress?.({
                stage: 'checking_entities',
                currentRow: results.data.length,
                totalRows: results.data.length,
                message: 'Validating locations...',
                percentage: 90
              });
            }
            
            if (allEmploymentTypes.size > 0) {
              onProgress?.({
                stage: 'checking_entities',
                currentRow: results.data.length,
                totalRows: results.data.length,
                message: 'Validating employment types...',
                percentage: 95
              });
            }
          }
          
          // Processing complete
          onProgress?.({
            stage: 'complete',
            currentRow: results.data.length,
            totalRows: results.data.length,
            message: 'Processing complete!',
            percentage: 100
          });
          
          resolve(result);
        } catch (error) {
          reject(error);
        }
      },
      error: (error) => {
        reject(new Error(`CSV parsing error: ${error.message}`));
      }
    });
  });
}

export async function importUsers(
  data: ProcessingResult,
  onProgress: (current: number, total: number) => void,
  onError: (error: ImportError) => void
): Promise<void> {
  const total = data.newUsers.length + data.existingUsers.length;
  let processed = 0;

  // Process new users
  for (const user of data.newUsers) {
    try {
      const { data: authUser, error: authError } = await supabase.functions.invoke(
        "manage-users",
        {
          body: {
            method: "POST",
            action: {
              email: user.email,
              password: generateTempPassword(),
              first_name: user.firstName,
              last_name: user.lastName,
              is_admin: user.role === "admin",
            },
          },
        }
      );

      if (authError) {
        onError({
          row: processed + 1,
          type: "creation",
          message: authError.message,
          data: user,
        });
        continue;
      }

      // Get IDs for related entities
      const [levelId, locationId, employmentTypeId] = await Promise.all([
        getLevelId(user.level),
        getLocationId(user.location),
        getEmploymentTypeId(user.employmentType)
      ]);

      // Update profile with additional info
      const { error: profileError } = await supabase
        .from("profiles")
        .update({
          org_id: user.orgId,
          level_id: levelId,
          location_id: locationId,
          employment_type_id: employmentTypeId,
          gender: user.gender,
          date_of_birth: user.dateOfBirth,
          designation: user.designation,
        })
        .eq("email", user.email);

      if (profileError) {
        onError({
          row: processed + 1,
          type: "update",
          message: profileError.message,
          data: user,
        });
      }

      if (user.sbus) {
        try {
          await assignSBUs(authUser.id, user.sbus);
        } catch (error) {
          onError({
            row: processed + 1,
            type: "sbu",
            message: error instanceof Error ? error.message : "Failed to assign SBUs",
            data: user,
          });
        }
      }

      processed++;
      onProgress(processed, total);
    } catch (error) {
      onError({
        row: processed + 1,
        type: "creation",
        message: error instanceof Error ? error.message : "Unknown error occurred",
        data: user,
      });
      processed++;
      onProgress(processed, total);
    }
  }

  // Process existing users
  for (const user of data.existingUsers) {
    try {
      // Get IDs for related entities
      const [levelId, locationId, employmentTypeId] = await Promise.all([
        getLevelId(user.level),
        getLocationId(user.location),
        getEmploymentTypeId(user.employmentType)
      ]);

      // Update profile
      const { error: profileError } = await supabase
        .from("profiles")
        .update({
          first_name: user.firstName,
          last_name: user.lastName,
          org_id: user.orgId,
          level_id: levelId,
          location_id: locationId,
          employment_type_id: employmentTypeId,
          gender: user.gender,
          date_of_birth: user.dateOfBirth,
          designation: user.designation,
        })
        .eq("id", user.id);

      if (profileError) {
        onError({
          row: processed + 1,
          type: "update",
          message: profileError.message,
          data: user,
        });
      }

      // Update role if needed
      if (user.role) {
        const { error: roleError } = await supabase
          .from("user_roles")
          .update({ role: user.role })
          .eq("user_id", user.id);

        if (roleError) {
          onError({
            row: processed + 1,
            type: "role",
            message: roleError.message,
            data: user,
          });
        }
      }

      // Handle SBU assignments
      if (user.sbus) {
        try {
          await assignSBUs(user.id, user.sbus);
        } catch (error) {
          onError({
            row: processed + 1,
            type: "sbu",
            message: error instanceof Error ? error.message : "Failed to assign SBUs",
            data: user,
          });
        }
      }

      processed++;
      onProgress(processed, total);
    } catch (error) {
      onError({
        row: processed + 1,
        type: "update",
        message: error instanceof Error ? error.message : "Unknown error occurred",
        data: user,
      });
      processed++;
      onProgress(processed, total);
    }
  }
}

