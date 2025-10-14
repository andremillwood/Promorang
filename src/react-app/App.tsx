import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router";
import { AuthProvider, useAuth } from '@getmocha/users-service/react';
import HomePage from "./pages/Home";
import AuthCallbackPage from "./pages/AuthCallback";
import HomeFeedPage from "./pages/HomeFeed";
import EarnPage from "./pages/Earn";
import CreatePage from "./pages/Create";
import InvestPage from "./pages/Invest";
import WalletPage from "./pages/Wallet";
import GrowthHubPage from "./pages/GrowthHub";
import ProfilePage from "./pages/Profile";
import ContentDetailPage from "./pages/ContentDetail";
import TaskDetailPage from "./pages/TaskDetail";
import LeaderboardPage from "./pages/Leaderboard";
import AdvertiserDashboard from "./pages/AdvertiserDashboard";
import AdvertiserOnboarding from "./pages/AdvertiserOnboarding";
import ErrorPage from "./pages/ErrorPage";
import Layout from "./components/Layout";
import ErrorBoundary from "./components/ErrorBoundary";



// Protected route wrapper that requires authentication
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, isPending } = useAuth();
  
  // Show loading while auth state is being determined
  if (isPending) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }
  
  if (!user) {
    return <Navigate to="/" replace />;
  }
  
  return <Layout>{children}</Layout>;
}

// Public route wrapper for authenticated users (redirects to /home)
function PublicRoute({ children }: { children: React.ReactNode }) {
  const { user, isPending } = useAuth();
  
  // Show loading while auth state is being determined
  if (isPending) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }
  
  if (user) {
    return <Navigate to="/home" replace />;
  }
  
  return <>{children}</>;
}

export default function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <Router>
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<PublicRoute><HomePage /></PublicRoute>} />
            <Route path="/auth/callback" element={<AuthCallbackPage />} />
            <Route path="/error" element={<ErrorPage />} />
            
            {/* Protected routes */}
            <Route path="/home" element={<ProtectedRoute><HomeFeedPage /></ProtectedRoute>} />
            <Route path="/earn" element={<ProtectedRoute><EarnPage /></ProtectedRoute>} />
            <Route path="/create" element={<ProtectedRoute><CreatePage /></ProtectedRoute>} />
            <Route path="/invest/*" element={<ProtectedRoute><InvestPage /></ProtectedRoute>} />
            <Route path="/wallet" element={<ProtectedRoute><WalletPage /></ProtectedRoute>} />
            <Route path="/growth-hub" element={<ProtectedRoute><GrowthHubPage /></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
            <Route path="/users/:username" element={<ProtectedRoute><ProfilePage isPublicProfile={true} /></ProtectedRoute>} />
            <Route path="/users/id/:id" element={<ProtectedRoute><ProfilePage isPublicProfile={true} useUserId={true} /></ProtectedRoute>} />
            <Route path="/content/:id" element={<ProtectedRoute><ContentDetailPage /></ProtectedRoute>} />
            <Route path="/tasks/:id" element={<ProtectedRoute><TaskDetailPage /></ProtectedRoute>} />
            <Route path="/drops/:id" element={<ProtectedRoute><TaskDetailPage /></ProtectedRoute>} />
            <Route path="/leaderboard" element={<ProtectedRoute><LeaderboardPage /></ProtectedRoute>} />
            <Route path="/advertiser" element={<ProtectedRoute><AdvertiserDashboard /></ProtectedRoute>} />
            <Route path="/advertiser/onboarding" element={<ProtectedRoute><AdvertiserOnboarding /></ProtectedRoute>} />
            
            {/* Redirect old routes */}
            <Route path="/dashboard" element={<Navigate to="/invest" replace />} />
            <Route path="/marketplace" element={<Navigate to="/earn" replace />} />
            <Route path="/main" element={<Navigate to="/home" replace />} />
            
            {/* Catch-all route for 404 */}
            <Route path="*" element={<Navigate to="/home" replace />} />
          </Routes>
        </Router>
      </AuthProvider>
    </ErrorBoundary>
  );
}
