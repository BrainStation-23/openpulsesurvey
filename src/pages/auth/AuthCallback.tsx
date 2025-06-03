
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { logLoginAttempt } from '@/services/loginTracking';

export default function AuthCallback() {
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Auth callback error:', error);
          toast({
            variant: "destructive",
            title: "Authentication failed",
            description: error.message,
          });
          navigate('/login');
          return;
        }

        if (data.session) {
          const user = data.session.user;
          
          // Determine the login method based on the provider
          let loginMethod: 'magic_link' | 'oauth_azure' | 'oauth_google' = 'magic_link';
          if (user.app_metadata?.provider === 'azure') {
            loginMethod = 'oauth_azure';
          } else if (user.app_metadata?.provider === 'google') {
            loginMethod = 'oauth_google';
          }

          // Log successful login
          await logLoginAttempt({
            userId: user.id,
            email: user.email || 'unknown',
            loginMethod,
            success: true,
            sessionId: data.session.access_token,
          });

          // Check user role and redirect appropriately
          const { data: roleData, error: roleError } = await supabase
            .from('user_roles')
            .select('role')
            .eq('user_id', user.id)
            .single();

          if (roleError) {
            console.error('Role check error:', roleError);
            // Default to user dashboard if role check fails
            navigate('/user/dashboard');
            return;
          }

          // Redirect based on role
          if (roleData?.role === 'admin') {
            navigate('/admin/dashboard');
          } else {
            navigate('/user/dashboard');
          }

          toast({
            title: "Login successful",
            description: "Welcome back!",
          });
        } else {
          navigate('/login');
        }
      } catch (error) {
        console.error('Auth callback error:', error);
        navigate('/login');
      }
    };

    handleAuthCallback();
  }, [navigate, toast]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
        <p className="mt-4 text-muted-foreground">Completing authentication...</p>
      </div>
    </div>
  );
}
