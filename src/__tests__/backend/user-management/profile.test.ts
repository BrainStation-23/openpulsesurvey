
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { adminSupabase, anonSupabase, cleanupTestData } from '../setup';

describe('Profile Management', () => {
  const testUser = {
    email: 'test@example.com',
    password: 'TestPassword123!',
    first_name: 'Test',
    last_name: 'User'
  };

  let userId: string;

  beforeEach(async () => {
    await cleanupTestData();
    
    // Create a test user and get their ID
    const { data: { user } } = await anonSupabase.auth.signUp({
      email: testUser.email,
      password: testUser.password,
      options: {
        data: {
          first_name: testUser.first_name,
          last_name: testUser.last_name
        }
      }
    });
    
    userId = user!.id;
  });

  afterEach(async () => {
    await cleanupTestData();
  });

  it('should create profile automatically on user registration', async () => {
    const { data: profile, error } = await adminSupabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    expect(error).toBeNull();
    expect(profile).not.toBeNull();
    expect(profile?.email).toBe(testUser.email);
    expect(profile?.first_name).toBe(testUser.first_name);
    expect(profile?.last_name).toBe(testUser.last_name);
  });

  it('should update profile information', async () => {
    const updates = {
      first_name: 'Updated',
      last_name: 'Name'
    };

    const { error } = await adminSupabase
      .from('profiles')
      .update(updates)
      .eq('id', userId);

    expect(error).toBeNull();

    // Verify updates
    const { data: profile } = await adminSupabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    expect(profile?.first_name).toBe(updates.first_name);
    expect(profile?.last_name).toBe(updates.last_name);
  });

  it('should handle profile status changes', async () => {
    const { error } = await adminSupabase
      .from('profiles')
      .update({ status: 'disabled' }) // Changed from 'inactive' to 'disabled'
      .eq('id', userId);

    expect(error).toBeNull();

    // Verify status change
    const { data: profile } = await adminSupabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    expect(profile?.status).toBe('disabled');
  });

  it('should cascade delete profile when user is deleted', async () => {
    // Delete user
    await adminSupabase.auth.admin.deleteUser(userId);

    // Verify profile is deleted
    const { data: profile, error } = await adminSupabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    expect(profile).toBeNull();
  });
});
