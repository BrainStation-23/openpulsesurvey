
# Supabase Project Migration Guide

This guide explains how to change the Supabase project that this application connects to. Follow these steps carefully to ensure a smooth transition.

## Prerequisites

- Access to both the current and new Supabase projects
- Supabase CLI installed (for migrations and edge functions)
- Administrative access to the application codebase

## Step 1: Update Project Configuration

1. Update the project configuration in `supabase/config.toml`:

```toml
project_id = "your_new_project_id"

[functions.export_all_users]
verify_jwt = true
# Add any other function-specific configurations
```

2. Update the current branch reference:

```
echo "main" > supabase/.branches/_current_branch
```

## Step 2: Update Client Connection

1. Modify the Supabase client configuration in `src/integrations/supabase/client.ts`:

```typescript
const SUPABASE_URL = "https://your_new_project_id.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "your_new_anon_key";
```

## Step 3: Migrate Database Schema

### Option 1: Using Supabase CLI for Migration

```bash
# Login to Supabase CLI
supabase login

# Link to the new project
supabase link --project-ref your_new_project_id

# Generate database types for TypeScript
supabase gen types typescript --linked > src/integrations/supabase/types.ts

# Optionally, generate a migration from the current schema
supabase db dump -f schema_dump.sql
```

### Option 2: Manual Schema Migration

1. Export your current database schema:
   - Go to the SQL Editor in the Supabase dashboard
   - Run: `SELECT * FROM pg_dump_all();`
   - Save the output as `schema_dump.sql`

2. Apply the schema to the new project:
   - Go to the SQL Editor in the new Supabase dashboard
   - Run the saved SQL dump file
   - Resolve any conflicts manually

## Step 4: Migrate Edge Functions

1. Deploy all edge functions to the new project:

```bash
cd supabase/functions
for dir in */; do
    # Skip shared directories
    if [ "$dir" != "_shared/" ]; then
        func_name="${dir%/}"
        echo "Deploying function: $func_name"
        supabase functions deploy $func_name --project-ref your_new_project_id
    fi
done
```

2. Verify function deployment status:

```bash
supabase functions list --project-ref your_new_project_id
```

## Step 5: Configure Function Secrets

1. Set up all the required secrets in the new project:

```bash
# List all current secrets first for reference
supabase secrets list --project-ref your_old_project_id

# Set each secret in the new project
supabase secrets set SECRET_NAME=SECRET_VALUE --project-ref your_new_project_id
```

Important secrets that need to be transferred:
- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `RESEND_API_KEY`
- `CONTACT_FORM_RECIPIENT_EMAIL`
- `GEMINI_MODEL_NAME`
- `GEMINI_API_KEY`

## Step 6: Set Up Storage Buckets

Create all necessary storage buckets in the new project with appropriate RLS policies:

1. Go to Storage in the Supabase dashboard
2. Create buckets matching those in the original project
3. Configure access policies for each bucket

## Step 7: Update Authentication Settings

1. Configure authentication providers in the new project
2. Set up email templates
3. Configure any additional auth settings (password policy, etc.)

## Step 8: Test the Application

1. Make sure to test all critical paths in the application:
   - Authentication (sign up, sign in, reset password)
   - Data access and storage
   - Edge function execution
   - File uploads and downloads
   - Any integrated third-party services

## Step 9: Update Environment Variables

If you're using environment variables in deployment environments:

1. Update environment variables in your production/staging environments
2. Update CI/CD pipelines if applicable

## Troubleshooting Common Issues

### Client-Side Connection Issues

- Check if the Supabase URL and anon key are correctly updated
- Verify network connections to the new Supabase instance
- Check browser console for CORS errors

### Database Migration Issues

- Schema conflicts: Resolve incompatible schema changes manually
- Missing tables or columns: Compare schemas and add missing elements
- Data type mismatches: Convert data types as needed

### Function Deployment Failures

- Check function logs: `supabase functions logs function_name --project-ref your_new_project_id`
- Verify dependencies are correctly installed
- Check for environment variables/secrets that might be missing

### Authentication Problems

- Verify auth settings match between the projects
- Check email templates and sender configuration
- Confirm redirect URLs are updated

## Final Checklist

- [ ] Updated config.toml with new project ID
- [ ] Updated Supabase client connection details
- [ ] Migrated database schema
- [ ] Deployed all edge functions
- [ ] Configured all required secrets
- [ ] Set up storage buckets and policies
- [ ] Configured authentication settings
- [ ] Updated environment variables
- [ ] Tested all critical application features
- [ ] Updated documentation references to Supabase project

For additional help, refer to the [Supabase documentation](https://supabase.com/docs).
