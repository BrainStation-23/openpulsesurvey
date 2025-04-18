-- First, let's ensure the triggers don't already exist (clean slate)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP TRIGGER IF EXISTS before_delete_user ON auth.users;

-- Create trigger for new user creation
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create trigger for user deletion
CREATE TRIGGER before_delete_user
  BEFORE DELETE ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.delete_user_cascade();

-- Now let's create the profile and role for your existing user
-- First, get existing auth users without profiles
WITH missing_profiles AS (
  SELECT au.id, au.email
  FROM auth.users au
  LEFT JOIN public.profiles p ON p.id = au.id
  WHERE p.id IS NULL
)
INSERT INTO public.profiles (id, email)
SELECT id, email
FROM missing_profiles;

-- Add default user role for any users missing it
WITH missing_roles AS (
  SELECT au.id
  FROM auth.users au
  LEFT JOIN public.user_roles ur ON ur.user_id = au.id
  WHERE ur.user_id IS NULL
)
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'user'
FROM missing_roles;
