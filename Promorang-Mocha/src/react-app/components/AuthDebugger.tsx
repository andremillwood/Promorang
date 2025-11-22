import { useState } from 'react';
import { useAuth } from '@getmocha/users-service/react';
import { AlertTriangle, CheckCircle, RefreshCw, LogIn } from 'lucide-react';

export default function AuthDebugger() {
  const { user, redirectToLogin } = useAuth();
  const [debugInfo, setDebugInfo] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const runAuthTest = async () => {
    setLoading(true);
    try {
      console.log('=== COMPREHENSIVE AUTH DEBUG ===');
      
      // Test 1: Check cookies
      const cookies = document.cookie;
      console.log('1. Cookies:', cookies);
      const hasSessionToken = cookies.includes('mocha_session_token');
      
      // Test 2: Test Mocha auth endpoint
      const mochaAuthResponse = await fetch('/api/users/me', { credentials: 'include' });
      const mochaAuthText = await mochaAuthResponse.text();
      let mochaAuthData = null;
      try {
        mochaAuthData = JSON.parse(mochaAuthText);
      } catch (e) {
        console.log('Mocha auth response not JSON:', mochaAuthText);
      }
      console.log('2. Mocha auth response:', { 
        status: mochaAuthResponse.status, 
        data: mochaAuthData,
        rawText: mochaAuthText 
      });
      
      // Test 3: Test app user endpoint
      const appUserResponse = await fetch('/api/app/users/me', { credentials: 'include' });
      const appUserText = await appUserResponse.text();
      let appUserData = null;
      try {
        appUserData = JSON.parse(appUserText);
      } catch (e) {
        console.log('App user response not JSON:', appUserText);
      }
      console.log('3. App user response:', { 
        status: appUserResponse.status, 
        data: appUserData,
        rawText: appUserText 
      });
      
      // Test 4: Check React Auth Provider state
      console.log('4. React Auth Provider state:', {
        user: user,
        hasUser: !!user,
        userId: user?.id,
        userEmail: user?.email
      });
      
      // Compile debug info
      const debugResult = {
        timestamp: new Date().toISOString(),
        cookies: {
          present: !!cookies,
          count: cookies.split(';').length,
          hasSessionToken,
          raw: cookies
        },
        mochaAuth: {
          status: mochaAuthResponse.status,
          statusText: mochaAuthResponse.statusText,
          data: mochaAuthData,
          headers: Object.fromEntries(mochaAuthResponse.headers.entries())
        },
        appUser: {
          status: appUserResponse.status,
          statusText: appUserResponse.statusText,
          data: appUserData,
          headers: Object.fromEntries(appUserResponse.headers.entries())
        },
        reactAuth: {
          hasUser: !!user,
          user: user
        }
      };
      
      setDebugInfo(debugResult);
      console.log('=== DEBUG COMPLETE ===', debugResult);
      
    } catch (error) {
      console.error('Auth debug failed:', error);
      setDebugInfo({ error: error instanceof Error ? error.message : 'Unknown error' });
    } finally {
      setLoading(false);
    }
  };

  const clearAllData = () => {
    // Clear all browser storage
    localStorage.clear();
    sessionStorage.clear();
    
    // Clear all cookies
    document.cookie.split(";").forEach((c) => {
      const eqPos = c.indexOf("=");
      const name = eqPos > -1 ? c.substr(0, eqPos) : c;
      document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/";
      document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;domain=" + window.location.hostname;
    });
    
    alert('All data cleared. Please refresh the page.');
  };

  const forceLogin = async () => {
    try {
      await redirectToLogin();
    } catch (error) {
      console.error('Force login failed:', error);
      alert('Login redirect failed. Check console for details.');
    }
  };

  return (
    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mt-6">
      <div className="flex items-center space-x-2 mb-4">
        <AlertTriangle className="w-5 h-5 text-yellow-600" />
        <h3 className="text-lg font-semibold text-yellow-800">Authentication Debugger</h3>
      </div>
      
      <div className="space-y-4">
        <div className="flex space-x-3">
          <button
            onClick={runAuthTest}
            disabled={loading}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
            <span>{loading ? 'Testing...' : 'Run Full Auth Test'}</span>
          </button>
          
          <button
            onClick={clearAllData}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            Clear All Data
          </button>
          
          <button
            onClick={forceLogin}
            className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            <LogIn className="w-4 h-4" />
            <span>Force Login</span>
          </button>
        </div>
        
        {debugInfo && (
          <div className="bg-white rounded-lg p-4 border">
            <h4 className="font-semibold text-gray-900 mb-2">Debug Results:</h4>
            <pre className="text-xs text-gray-700 overflow-auto max-h-96 bg-gray-50 p-3 rounded">
              {JSON.stringify(debugInfo, null, 2)}
            </pre>
          </div>
        )}
        
        <div className="text-sm text-yellow-700">
          <p><strong>Instructions:</strong></p>
          <ol className="list-decimal list-inside space-y-1 mt-2">
            <li>Click "Run Full Auth Test" to diagnose authentication issues</li>
            <li>If authentication is broken, try "Clear All Data" then "Force Login"</li>
            <li>Check the debug results to see exactly what's failing</li>
            <li>All debug info is also logged to the browser console</li>
          </ol>
        </div>
      </div>
    </div>
  );
}
