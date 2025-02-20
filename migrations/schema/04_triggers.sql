
-- Trigger for updating timestamps
CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Add similar update triggers for all tables with updated_at column
CREATE TRIGGER update_levels_updated_at
    BEFORE UPDATE ON levels
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ... keep existing code for other timestamp update triggers

-- Trigger for handling new users
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION handle_new_user();

-- Trigger for user deletion cascade
CREATE TRIGGER before_delete_user
    BEFORE DELETE ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION delete_user_cascade();

-- Trigger for campaign dates validation
CREATE TRIGGER validate_campaign_dates_trigger
    BEFORE INSERT OR UPDATE ON survey_campaigns
    FOR EACH ROW
    EXECUTE FUNCTION validate_campaign_dates();

-- Trigger for generating public access token
CREATE TRIGGER ensure_public_access_token
    BEFORE INSERT ON survey_assignments
    FOR EACH ROW
    EXECUTE FUNCTION generate_public_access_token();

-- Trigger for instance completion rate updates
CREATE TRIGGER update_instance_completion_rate_on_response
    AFTER INSERT OR UPDATE ON survey_responses
    FOR EACH ROW
    EXECUTE FUNCTION update_instance_completion_rate();
