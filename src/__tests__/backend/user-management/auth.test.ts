
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { adminSupabase, anonSupabase, cleanupTestData } from '../setup';

describe('Authentication & Authorization', () => {
  const testUser = {
    email: 'test@example.com',
    password: 'TestPassword123!',
    first_name: 'Test',
    last_name: 'User'
  };

  beforeEach(async () => {
    await cleanupTestData();
  });

  afterEach(async () => {
    await cleanupTestData();
  });

  it('should register a new user', async () => {
    const { data, error } = await anonSupabase.auth.signUp({
      email: testUser.email,
      password: testUser.password,
      options: {
        data: {
          first_name: testUser.first_name,
          last_name: testUser.last_name
        }
      }
    });

    expect(error).toBeNull();
    expect(data.user).not.toBeNull();
    expect(data.user?.email).toBe(testUser.email);

    // Verify profile was created
    const { data: profile } = await adminSupabase
      .from('profiles')
      .select('*')
      .eq('email', testUser.email)
      .single();

    expect(profile).not.toBeNull();
    expect(profile?.first_name).toBe(testUser.first_name);
    expect(profile?.last_name).toBe(testUser.last_name);
  });

  it('should not allow duplicate email registration', async () => {
    // First registration
    await anonSupabase.auth.signUp({
      email: testUser.email,
      password: testUser.password
    });

    // Attempt duplicate registration
    const { data, error } = await anonSupabase.auth.signUp({
      email: testUser.email,
      password: testUser.password
    });

    expect(error).not.toBeNull();
    expect(error?.message).toContain('User already registered');
  });

  it('should sign in with correct credentials', async () => {
    // Create user first
    await anonSupabase.auth.signUp({
      email: testUser.email,
      password: testUser.password
    });

    // Attempt sign in
    const { data, error } = await anonSupabase.auth.signInWithPassword({
      email: testUser.email,
      password: testUser.password
    });

    expect(error).toBeNull();
    expect(data.user).not.toBeNull();
    expect(data.user?.email).toBe(testUser.email);
  });

  it('should not sign in with incorrect password', async () => {
    // Create user first
    await anonSupabase.auth.signUp({
      email: testUser.email,
      password: testUser.password
    });

    // Attempt sign in with wrong password
    const { data, error } = await anonSupabase.auth.signInWithPassword({
      email: testUser.email,
      password: 'wrongpassword'
    });

    expect(error).not.toBeNull();
    expect(error?.message).toContain('Invalid login credentials');
  });

  it('should sign out successfully', async () => {
    // Sign in first
    await anonSupabase.auth.signInWithPassword({
      email: testUser.email,
      password: testUser.password
    });

    // Sign out
    const { error } = await anonSupabase.auth.signOut();

    expect(error).toBeNull();

    // Verify session is cleared
    const { data: { session } } = await anonSupabase.auth.getSession();
    expect(session).toBeNull();
  });
});
