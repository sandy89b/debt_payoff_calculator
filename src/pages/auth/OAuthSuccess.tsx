import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export const OAuthSuccess: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { refreshAuth } = useAuth();

  useEffect(() => {
    const token = searchParams.get('token');
    
    if (token) {
      // Verify the token with the backend
      fetch('http://localhost:3001/api/auth/google/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token }),
      })
      .then(response => response.json())
      .then(result => {
        if (result.success) {
          // Store user data
          localStorage.setItem('auth_status', '1');
          localStorage.setItem('user_data', JSON.stringify(result.data.user));
          
          // Refresh authentication state
          refreshAuth();
          
          toast({
            title: "Success",
            description: "Successfully signed in with Google!",
          });
          
          // Small delay to ensure state is updated before redirect
          setTimeout(() => {
            navigate('/', { replace: true });
          }, 100);
        } else {
          throw new Error(result.message || 'Token verification failed');
        }
      })
      .catch(error => {
        console.error('OAuth verification error:', error);
        toast({
          title: "Error",
          description: "Failed to verify authentication. Please try again.",
          variant: "destructive",
        });
        navigate('/auth/signin', { replace: true });
      });
    } else {
      // No token, redirect to signin
      navigate('/auth/signin', { replace: true });
    }
  }, [searchParams, navigate, toast]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-green/5 to-brand-charcoal/5 flex items-center justify-center p-4">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-green mx-auto mb-4"></div>
        <h2 className="text-xl font-semibold text-brand-charcoal mb-2">
          Completing Sign In...
        </h2>
        <p className="text-brand-gray">
          Please wait while we complete your Google sign-in.
        </p>
      </div>
    </div>
  );
};

export default OAuthSuccess;
