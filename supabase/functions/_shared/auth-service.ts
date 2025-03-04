
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';
import { UserCreateData, BatchUserResult } from './db-types.ts';
import { crypto } from "https://deno.land/std@0.177.0/crypto/mod.ts";

const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

export class AuthService {
  static generatePassword(): string {
    return Array.from(crypto.getRandomValues(new Uint8Array(9)))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('')
      .slice(0, 12);
  }

  static async createUser(userData: UserCreateData): Promise<BatchUserResult> {
    try {
      const { data: user, error: createError } = await supabase.auth.admin.createUser({
        email: userData.email,
        password: userData.password || this.generatePassword(),
        email_confirm: true,
      });

      if (createError) throw createError;

      return {
        success: true,
        user: {
          id: user.user.id,
          email: user.user.email!,
        },
      };
    } catch (error) {
      console.error('Error creating user:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  static async deleteUser(userId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase.auth.admin.deleteUser(userId);
      if (error) throw error;
      return { success: true };
    } catch (error) {
      console.error('Error deleting user:', error);
      return { success: false, error: error.message };
    }
  }
}
