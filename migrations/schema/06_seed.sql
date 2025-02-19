
-- Insert initial admin user (will need to be parameterized)
INSERT INTO auth.users (id, email)
VALUES ('00000000-0000-0000-0000-000000000000', 'admin@example.com');

-- Set up admin role
INSERT INTO user_roles (user_id, role)
VALUES ('00000000-0000-0000-0000-000000000000', 'admin');

-- Insert basic configuration data
INSERT INTO levels (name) VALUES
    ('Entry Level'),
    ('Mid Level'),
    ('Senior Level');

INSERT INTO locations (name) VALUES
    ('Headquarters'),
    ('Remote');

INSERT INTO employment_types (name) VALUES
    ('Full Time'),
    ('Part Time'),
    ('Contract');

-- ... Add more seed data as needed
