import { useEffect, useState } from 'react';
import { useAuth } from '@getmocha/users-service/react';
import { useNavigate, useSearchParams } from 'react-router';
import { Loader2, CheckCircle, AlertTriangle } from 'lucide-react';

export default function AuthCallback() {
  const { exchangeCodeForSessionToken, user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [error, setError] = useState<string | null>(null);
  const [isComplete, setIsComplete] = useState(false);
  const [shouldRedirect, setShouldRedirect] = useState(false);
  const code = searchParams.get('code');

  useEffect(() => {
    const handleAuth = async () => {
      if (!code) {
        setError('No authorization code found in URL');
        setIsComplete(true);
        return;
      }

      try {
        // Use Mocha SDK for session token exchange
        await exchangeCodeForSessionToken();
        
        // Wait a moment for the auth state to update
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        setShouldRedirect(true);
        setIsComplete(true);
        
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'Unknown error';
        setError(`Authentication failed: ${errorMsg}`);
        setIsComplete(true);
      }
    };

    handleAuth();
  }, [code, exchangeCodeForSessionToken]);

  // Monitor user state changes
  useEffect(() => {
    if (user) {
      setShouldRedirect(true);
    }
  }, [user]);

  // Auto-redirect when ready
  useEffect(() => {
    if (shouldRedirect && isComplete) {
      const timer = setTimeout(() => {
        window.location.href = '/home';
      }, 2000);
      
      return () => clearTimeout(timer);
    }
  }, [shouldRedirect, isComplete]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center p-4">
      <div className="text-center text-white max-w-2xl mx-auto">
        {!isComplete && (
          <div className="animate-spin mb-4">
            <Loader2 className="w-12 h-12 mx-auto" />
          </div>
        )}
        
        {isComplete && !error && (
          <div className="mb-4">
            <CheckCircle className="w-12 h-12 mx-auto text-green-400" />
          </div>
        )}
        
        {error && (
          <div className="mb-4">
            <AlertTriangle className="w-12 h-12 mx-auto text-red-400" />
          </div>
        )}
        
        <h2 className="text-2xl font-semibold mb-2">
          {!isComplete ? 'Completing Authentication' : 
           error ? 'Authentication Failed' : 
           shouldRedirect ? 'Redirecting to App...' : 'Authentication Successful'}
        </h2>
        
        <p className="text-blue-200 mb-6">
          {!isComplete ? 'Please wait while we set up your account...' :
           error ? 'There was an issue during authentication.' :
           shouldRedirect ? 'You will be redirected to the app automatically in a moment...' :
           'Your account is ready! You can now proceed to the app.'}
        </p>
        
        
        
        {/* Action Buttons */}
        <div className="space-y-3">
          {(shouldRedirect || isComplete) && (
            <button
              onClick={() => window.location.href = '/home'}
              className="w-full px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors"
            >
              Continue to App
            </button>
          )}
          
          <button 
            onClick={() => navigate('/', { replace: true })}
            className="w-full px-6 py-3 bg-white/20 hover:bg-white/30 text-white rounded-lg font-medium transition-colors"
          >
            Return to Landing Page
          </button>
          
          {error && (
            <button
              onClick={() => window.location.reload()}
              className="w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
            >
              Try Again
            </button>
          )}
        </div>
        
        {/* Additional Info */}
        {error && (
          <div className="mt-6 text-sm text-blue-300">
            <p>If you continue to experience issues, please contact support.</p>
          </div>
        )}
      </div>
    </div>
  );
}
