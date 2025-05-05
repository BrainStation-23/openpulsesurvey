
# Version Management Guide

This document outlines the process for managing versions and performing migrations across different instances of the Survey Pulse application.

## Architecture Overview

Each instance of Survey Pulse operates independently with:
- Its own Supabase backend
- Its own frontend deployment
- No connection to other instances

## Versioning System

System versions are tracked in the `system_versions` table in Supabase. This table contains:

- `version`: The unified system version (e.g., "1.0.0")
- `schema_version`: Database/backend version
- `frontend_version`: Frontend code version
- `edge_functions_version`: Edge functions version
- `migration_scripts`: Array of applied migration script names
- `changelog`: Technical changes summary
- `release_notes`: User-facing release notes
- Other metadata (applied_at, released_at, etc.)

## Manual Migration Process

### Prerequisites

1. Access to the target instance's Supabase dashboard
2. Latest release package from the repository

### Migration Steps

1. **Preparation**:
   - Identify the current version of the target instance using the System Info page
   - Gather all migration SQL scripts needed for the update
   - Back up the current database (recommended)

2. **Database Migration**:
   - Connect to the Supabase SQL Editor
   - Run required migration scripts sequentially
   - Verify successful execution of each script

3. **Edge Functions Update**:
   - Deploy updated edge functions as needed

4. **Frontend Deployment**:
   - Deploy the new frontend code

5. **Version Record Update**:
   - Execute the `update_system_version` function to record the new version:

```sql
SELECT update_system_version(
  '1.0.0',                         -- p_version
  '1.0.0',                         -- p_schema_version
  '1.0.0',                         -- p_frontend_version
  '1.0.0',                         -- p_edge_functions_version
  'Technical changelog here',      -- p_changelog
  'User-facing release notes here', -- p_release_notes
  ARRAY['20250505_fix_xyz.sql'],   -- p_migration_scripts
  '205be11a-12ff-4648-be68-3ab2446109c4'  -- p_created_by (admin user id)
);
```

6. **Verification**:
   - Navigate to Admin Dashboard
   - Check the System Info page to confirm version updated
   - Test critical functionality

## Creating New Releases

For maintainers creating new releases:

1. Follow semantic versioning (MAJOR.MINOR.PATCH)
2. Tag releases in the repository
3. Include all migration scripts in the release
4. Document required migration steps
5. Update version numbers in deployment package

## Rollback Procedure

In case of migration failure:

1. Restore the database backup
2. Revert to the previous frontend code deployment
3. Document the attempted migration and issues encountered
