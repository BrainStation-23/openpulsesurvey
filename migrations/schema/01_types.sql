
-- Create custom types
CREATE TYPE profile_status AS ENUM ('active', 'inactive', 'suspended');
CREATE TYPE user_role AS ENUM ('admin', 'user');
CREATE TYPE config_status AS ENUM ('active', 'inactive');
CREATE TYPE survey_status AS ENUM ('draft', 'active', 'archived');
CREATE TYPE response_status AS ENUM ('assigned', 'in_progress', 'submitted');
CREATE TYPE instance_status AS ENUM ('upcoming', 'active', 'completed');
CREATE TYPE email_provider AS ENUM ('resend');
CREATE TYPE achievement_status AS ENUM ('active', 'inactive');
CREATE TYPE prompt_status AS ENUM ('active', 'inactive');
CREATE TYPE gender_type AS ENUM ('male', 'female', 'other');
