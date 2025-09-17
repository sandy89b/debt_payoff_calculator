import React, { useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { AlertCircle, ArrowLeft } from 'lucide-react';

export const OAuthError: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();

  const errorMessage = searchParams.get('message') || 'Authentication failed';

  useEffect(() => {
    toast({
      title: "Authentication Error",
      description: errorMessage,
      variant: "destructive",
    });
  }, [errorMessage, toast]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-green/5 to-brand-charcoal/5 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Back to Home Link */}
        <div className="mb-6">
          <Link 
            to="/" 
            className="inline-flex items-center text-sm text-brand-gray hover:text-brand-green transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Link>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
              <AlertCircle className="w-8 h-8 text-red-600" />
            </div>
          </div>
          
          <h1 className="text-2xl font-bold text-brand-charcoal mb-4">
            Authentication Failed
          </h1>
          
          <p className="text-brand-gray mb-6">
            {errorMessage}
          </p>
          
          <div className="space-y-3">
            <Button
              onClick={() => navigate('/auth/signin')}
              className="w-full bg-gradient-hero hover:opacity-90 text-white font-semibold"
            >
              Try Again
            </Button>
            
            <Button
              variant="outline"
              onClick={() => navigate('/')}
              className="w-full border-brand-green text-brand-green hover:bg-brand-green hover:text-white"
            >
              Go to Home
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OAuthError;
