import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router";
import { AuthProvider, useAuth } from '@getmocha/users-service/react';
import HomePage from "@/react-app/pages/Home";
import AuthCallbackPage from "@/react-app/pages/AuthCallback";
import HomeFeedPage from "@/react-app/pages/HomeFeed";
import EarnPage from "@/react-app/pages/Earn";
import CreatePage from "@/react-app/pages/Create";
import InvestPage from "@/react-app/pages/Invest";
import WalletPage from "@/react-app/pages/Wallet";
import GrowthHubPage from "@/react-app/pages/GrowthHub";
import ProfilePage from "@/react-app/pages/Profile";
import ContentDetailPage from "@/react-app/pages/ContentDetail";
import TaskDetailPage from "@/react-app/pages/TaskDetail";
import LeaderboardPage from "@/react-app/pages/Leaderboard";
import AdvertiserDashboard from "@/react-app/pages/AdvertiserDashboard";
import AdvertiserOnboarding from "@/react-app/pages/AdvertiserOnboarding";
import ErrorPage from "@/react-app/pages/ErrorPage";
import Layout from "@/react-app/components/Layout";
import ErrorBoundary from "@/react-app/components/ErrorBoundary";



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
