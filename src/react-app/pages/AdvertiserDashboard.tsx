import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router';
import { useAuth } from '@getmocha/users-service/react';
import { 
  BarChart3, 
  Users, 
  Diamond, 
  TrendingUp, 
  Calendar,
  Plus,
  Target,
  DollarSign,
  Eye,
  MousePointer,
  Megaphone,
  ExternalLink,
  Activity,
  Sparkles,
  Building2,
  Settings,
  Edit
} from 'lucide-react';
import { DropType, AdvertiserAnalyticsType } from '@/shared/types';
import { 
  PerformanceMetrics, 
  ActivityBreakdown, 
  TrendLine,
  MultiMetricChart,
  KPICard 
} from '@/react-app/components/AnalyticsCharts';
import SponsorshipModal from '@/react-app/components/SponsorshipModal';
import BrandProfileModal from '@/react-app/components/BrandProfileModal';

export default function AdvertiserDashboard() {
  const { user } = useAuth();
  const location = useLocation();
  const [userData, setUserData] = useState(null);
  const [dashboardData, setDashboardData] = useState<{
    drops: DropType[];
    analytics: AdvertiserAnalyticsType[];
    user_tier: string;
    monthly_inventory?: any;
    weekly_inventory?: any;
  } | null>(null);
  const [suggestedContent, setSuggestedContent] = useState([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(true);
  const [selectedContentForSponsorship, setSelectedContentForSponsorship] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showBrandModal, setShowBrandModal] = useState(false);
  const [savingBrand, setSavingBrand] = useState(false);

  useEffect(() => {
    if (user) {
      fetchUserData();
    }
  }, [user]);

  useEffect(() => {
    if (userData) {
      fetchDashboardData();
      fetchSuggestedContent();
    }
  }, [userData]);

  // Refetch user data when component becomes visible (user returns from onboarding)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && user) {
        fetchUserData();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [user]);

  // Also refetch when the location changes (user navigates back)
  useEffect(() => {
    if (user) {
      fetchUserData();
    }
  }, [location?.pathname, user]);

  // Listen for storage events to detect user type changes from other tabs/windows
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'advertiser_conversion' && e.newValue === 'true') {
        localStorage.removeItem('advertiser_conversion');
        fetchUserData();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Check for URL hash indicating fresh conversion
  useEffect(() => {
    if (window.location.hash === '#converted' && user) {
      window.history.replaceState({}, '', window.location.pathname);
      setTimeout(() => {
        fetchUserData();
      }, 500);
    }
  }, [user]);

  const fetchUserData = async () => {
    try {
      // Use the app user endpoint for database user data
      const response = await fetch('/api/app/users/me', { credentials: 'include' });
      if (response.ok) {
        const data = await response.json();
        setUserData(data);
      } else {
        console.error('Failed to fetch user data:', response.status);
      }
    } catch (error) {
      console.error('Failed to fetch user data:', error);
      setError('Failed to load user data');
      setLoading(false);
    }
  };

  const fetchDashboardData = async () => {
    try {
      const response = await fetch('/api/advertisers/dashboard', { credentials: 'include' });
      if (response.ok) {
        const data = await response.json();
        setDashboardData(data);
      } else {
        // If API call fails, create default data structure
        setDashboardData({
          drops: [],
          analytics: [],
          user_tier: (userData as any)?.user_tier || 'free'
        });
      }
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
      // Create default data structure on error
      setDashboardData({
        drops: [],
        analytics: [],
        user_tier: (userData as any)?.user_tier || 'free'
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchSuggestedContent = async () => {
    try {
      const response = await fetch('/api/advertisers/suggested-content', { credentials: 'include' });
      if (response.ok) {
        const data = await response.json();
        setSuggestedContent(data);
      } else {
        setSuggestedContent([]);
      }
    } catch (error) {
      console.error('Failed to fetch suggested content:', error);
      setSuggestedContent([]);
    } finally {
      setLoadingSuggestions(false);
    }
  };

  const getTierBenefits = (tier: string) => {
    switch (tier) {
      case 'super':
        return {
          name: 'Super Advertiser',
          color: 'text-yellow-600 bg-yellow-50',
          inventory: 'Weekly: 500 moves, 25 proof drops, 15 paid drops',
          features: ['Premium analytics', 'Priority support', 'Custom targeting', 'Advanced reporting', 'Create proof & paid drops']
        };
      case 'premium':
        return {
          name: 'Premium Advertiser', 
          color: 'text-purple-600 bg-purple-50',
          inventory: 'Weekly: 200 moves, 15 proof drops, 8 paid drops',
          features: ['Advanced analytics', 'Priority support', 'Custom targeting', 'Create proof & paid drops']
        };
      default:
        return {
          name: 'Free Advertiser',
          color: 'text-gray-600 bg-gray-50',
          inventory: 'Monthly Sample: 50 moves, 5 proof drops',
          features: ['Basic analytics', 'Standard support', 'Create proof drops only', 'Sponsor content with gems']
        };
    }
  };

  const calculateTotals = () => {
    if (!dashboardData?.drops) return { totalDrops: 0, totalParticipants: 0, totalGems: 0 };
    
    return dashboardData.drops.reduce((acc, drop: any) => ({
      totalDrops: acc.totalDrops + 1,
      totalParticipants: acc.totalParticipants + (drop.total_applications || 0),
      totalGems: acc.totalGems + (drop.gems_paid || 0)
    }), { totalDrops: 0, totalParticipants: 0, totalGems: 0 });
  };

  // Generate mock analytics data for demonstration
  const generateAnalyticsData = () => {
    const last30Days = Array.from({ length: 30 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (29 - i));
      return {
        date: date.toISOString().split('T')[0],
        applications: Math.floor(Math.random() * 50) + 10,
        conversions: Math.floor(Math.random() * 20) + 5,
        impressions: Math.floor(Math.random() * 1000) + 200,
        clicks: Math.floor(Math.random() * 100) + 20,
        spent: Math.floor(Math.random() * 500) + 100,
        participants: Math.floor(Math.random() * 30) + 5
      };
    });
    return last30Days;
  };

  const analyticsData = generateAnalyticsData();
  
  const campaignPerformance = [
    { metric: 'Click-through Rate', value: 4.2 },
    { metric: 'Conversion Rate', value: 12.8 },
    { metric: 'Engagement Rate', value: 8.5 },
    { metric: 'Application Rate', value: 15.3 },
    { metric: 'Completion Rate', value: 78.9 }
  ];

  const dropTypeBreakdown = [
    { name: 'Content Creation', value: 45, color: '#f97316' },
    { name: 'Social Sharing', value: 30, color: '#8b5cf6' },
    { name: 'Reviews', value: 15, color: '#10b981' },
    { name: 'Surveys', value: 10, color: '#3b82f6' }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  // If user is not an advertiser, show onboarding prompt instead of error
  if (userData && (userData as any).user_type !== 'advertiser') {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-8 text-center">
          <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Megaphone className="w-8 h-8 text-blue-600" />
          </div>
          <h2 className="text-2xl font-bold text-blue-900 mb-4">Become an Advertiser</h2>
          <p className="text-blue-700 mb-6 max-w-md mx-auto">
            Your account is not yet set up for advertising. Click below to become an advertiser and start creating marketing campaigns.
          </p>
          <Link
            to="/advertiser/onboarding"
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-4 rounded-xl font-medium transition-all duration-200 shadow-lg hover:shadow-xl"
          >
            Become an Advertiser
          </Link>
          <p className="text-sm text-gray-500 mt-4">
            Free to get started • No setup fees • Create your first campaign
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
          <h2 className="text-xl font-semibold text-red-900 mb-2">Error Loading Dashboard</h2>
          <p className="text-red-700 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-xl font-medium transition-colors"
          >
            Refresh Page
          </button>
        </div>
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div className="text-center py-12">
        <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-gray-900 mb-2">Loading Dashboard...</h3>
        <p className="text-gray-600">Please wait while we load your advertiser dashboard.</p>
      </div>
    );
  }

  const tierInfo = getTierBenefits(dashboardData.user_tier);
  const totals = calculateTotals();

  const handleSponsorContent = (content: any) => {
    setSelectedContentForSponsorship(content);
  };

  const getPackageDetails = (packageId: string) => {
    const packages = {
      'quick-boost': { name: 'Quick Boost', gems: 25, hours: 1, multiplier: 1.5 },
      'popular-boost': { name: 'Popular Boost', gems: 50, hours: 6, multiplier: 2.0 },
      'daily-featured': { name: 'Daily Featured', gems: 100, hours: 24, multiplier: 3.0 },
      'premium-spotlight': { name: 'Premium Spotlight', gems: 200, hours: 72, multiplier: 4.0 },
      'viral-campaign': { name: 'Viral Campaign', gems: 500, hours: 168, multiplier: 6.0 }
    };
    return packages[packageId as keyof typeof packages] || packages['quick-boost'];
  };

  const handleSaveBrandProfile = async (brandData: any) => {
    setSavingBrand(true);
    try {
      const response = await fetch('/api/users/brand-profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(brandData)
      });

      if (response.ok) {
        setShowBrandModal(false);
        fetchUserData(); // Refresh user data to get updated brand info
      } else {
        const errorData = await response.json();
        alert(errorData.error || 'Failed to save brand profile');
      }
    } catch (error) {
      console.error('Error saving brand profile:', error);
      alert('Failed to save brand profile');
    } finally {
      setSavingBrand(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div>
            {/* Brand representation or personal info */}
            {(userData as any)?.brand_name ? (
              <div className="flex items-center space-x-3 mb-2">
                <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center overflow-hidden border border-gray-200">
                  {(userData as any)?.brand_logo_url ? (
                    <img 
                      src={(userData as any).brand_logo_url} 
                      alt="Brand logo" 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Building2 className="w-6 h-6 text-gray-400" />
                  )}
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <h1 className="text-3xl font-bold text-gray-900">{(userData as any).brand_name}</h1>
                    <button
                      onClick={() => setShowBrandModal(true)}
                      className="text-gray-400 hover:text-gray-600 transition-colors"
                      title="Edit brand profile"
                    >
                      <Edit className="w-5 h-5" />
                    </button>
                  </div>
                  <p className="text-gray-600">
                    {(userData as any)?.brand_description || 'Manage your campaigns and track performance'}
                  </p>
                </div>
              </div>
            ) : (
              <div>
                <div className="flex items-center space-x-2">
                  <h1 className="text-3xl font-bold text-gray-900">Advertiser Dashboard</h1>
                  <button
                    onClick={() => setShowBrandModal(true)}
                    className="bg-blue-100 hover:bg-blue-200 text-blue-600 px-3 py-1 rounded-lg text-sm font-medium transition-colors flex items-center space-x-1"
                  >
                    <Building2 className="w-4 h-4" />
                    <span>Set up brand</span>
                  </button>
                </div>
                <p className="text-gray-600 mt-2">Manage your campaigns and track performance</p>
              </div>
            )}
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <div className={`px-4 py-2 rounded-lg ${tierInfo.color}`}>
            <span className="font-medium">{tierInfo.name}</span>
          </div>
          <button
            onClick={() => setShowBrandModal(true)}
            className="text-gray-400 hover:text-gray-600 transition-colors p-2 rounded-lg hover:bg-gray-100"
            title="Brand settings"
          >
            <Settings className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Inventory Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Monthly Sample Inventory */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Monthly Sample Inventory</h3>
            <span className="text-sm text-gray-500">Resets monthly</span>
          </div>
          {dashboardData?.monthly_inventory ? (
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Moves</span>
                <span className="font-medium">
                  {dashboardData.monthly_inventory.moves_used}/{dashboardData.monthly_inventory.moves_allocated}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-500 h-2 rounded-full" 
                  style={{width: `${(dashboardData.monthly_inventory.moves_used / dashboardData.monthly_inventory.moves_allocated) * 100}%`}}
                />
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Proof Drops</span>
                <span className="font-medium">
                  {dashboardData.monthly_inventory.proof_drops_used}/{dashboardData.monthly_inventory.proof_drops_allocated}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-green-500 h-2 rounded-full" 
                  style={{width: `${(dashboardData.monthly_inventory.proof_drops_used / dashboardData.monthly_inventory.proof_drops_allocated) * 100}%`}}
                />
              </div>
            </div>
          ) : (
            <p className="text-sm text-gray-500">No monthly inventory allocated yet</p>
          )}
        </div>

        {/* Weekly Inventory */}
        {dashboardData?.user_tier !== 'free' && (
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Weekly Inventory</h3>
              <span className="text-sm text-gray-500">Resets weekly</span>
            </div>
            {dashboardData?.weekly_inventory ? (
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Moves</span>
                  <span className="font-medium">
                    {dashboardData.weekly_inventory.moves_used}/{dashboardData.weekly_inventory.moves_allocated}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-500 h-2 rounded-full" 
                    style={{width: `${(dashboardData.weekly_inventory.moves_used / dashboardData.weekly_inventory.moves_allocated) * 100}%`}}
                  />
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Proof Drops</span>
                  <span className="font-medium">
                    {dashboardData.weekly_inventory.proof_drops_used}/{dashboardData.weekly_inventory.proof_drops_allocated}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-green-500 h-2 rounded-full" 
                    style={{width: `${(dashboardData.weekly_inventory.proof_drops_used / dashboardData.weekly_inventory.proof_drops_allocated) * 100}%`}}
                  />
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Paid Drops</span>
                  <span className="font-medium">
                    {dashboardData.weekly_inventory.paid_drops_used}/{dashboardData.weekly_inventory.paid_drops_allocated}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-purple-500 h-2 rounded-full" 
                    style={{width: `${(dashboardData.weekly_inventory.paid_drops_used / dashboardData.weekly_inventory.paid_drops_allocated) * 100}%`}}
                  />
                </div>
              </div>
            ) : (
              <p className="text-sm text-gray-500">No weekly inventory allocated yet</p>
            )}
          </div>
        )}
      </div>

      {/* Tier Benefits Card */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Your Plan Benefits</h3>
          <button className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white px-4 py-2 rounded-lg font-medium transition-all duration-200">
            Upgrade Plan
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium text-gray-900 mb-2">Inventory Allocation</h4>
            <p className="text-lg font-bold text-orange-600">{tierInfo.inventory}</p>
            <p className="text-sm text-gray-600">
              {dashboardData?.user_tier === 'free' ? 'Sample inventory' : 'Weekly inventory'} + sponsor any content with gems
            </p>
          </div>
          <div>
            <h4 className="font-medium text-gray-900 mb-2">Features</h4>
            <ul className="space-y-1">
              {tierInfo.features.map((feature, index) => (
                <li key={index} className="text-sm text-gray-600 flex items-center">
                  <div className="w-1.5 h-1.5 bg-green-500 rounded-full mr-2"></div>
                  {feature}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* KPI Cards with Trends */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <KPICard
          title="Total Drops"
          value={totals.totalDrops}
          change={12}
          changeType="increase"
          icon={<BarChart3 className="w-5 h-5" />}
          trend={analyticsData.slice(-7).map(d => ({ date: d.date, value: Math.floor(Math.random() * 20) + 5 }))}
        />
        
        <KPICard
          title="Total Participants"
          value={totals.totalParticipants.toLocaleString()}
          change={8}
          changeType="increase"
          icon={<Users className="w-5 h-5" />}
          trend={analyticsData.slice(-7).map(d => ({ date: d.date, value: d.participants }))}
        />
        
        <KPICard
          title="Gems Distributed"
          value={totals.totalGems.toFixed(1)}
          change={15}
          changeType="increase"
          icon={<Diamond className="w-5 h-5" />}
          trend={analyticsData.slice(-7).map(d => ({ date: d.date, value: d.spent }))}
        />
        
        <KPICard
          title="Avg. Engagement"
          value={`${dashboardData.analytics.length > 0 
            ? (dashboardData.analytics.reduce((sum, a) => sum + a.engagement_rate, 0) / dashboardData.analytics.length).toFixed(1)
            : '8.5'}%`}
          change={3}
          changeType="increase"
          icon={<TrendingUp className="w-5 h-5" />}
          trend={analyticsData.slice(-7).map(d => ({ date: d.date, value: Math.floor(Math.random() * 20) + 5 }))}
        />
      </div>

      {/* Suggested Content for Sponsorship */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Suggested Content to Sponsor</h3>
                <p className="text-sm text-gray-600">High-performing content perfect for your brand</p>
              </div>
            </div>
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <Activity className="w-4 h-4" />
              <span>Updated real-time</span>
            </div>
          </div>
        </div>
        
        <div className="p-6">
          {loadingSuggestions ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin w-6 h-6 border-2 border-purple-500 border-t-transparent rounded-full"></div>
              <span className="ml-3 text-gray-600">Finding great content...</span>
            </div>
          ) : suggestedContent.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {suggestedContent.slice(0, 6).map((content: any) => {
                const packageDetails = getPackageDetails(content.suggested_package);
                return (
                  <div key={content.id} className="border border-gray-200 rounded-lg p-4 hover:border-purple-300 transition-colors">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            content.platform === 'instagram' ? 'bg-pink-100 text-pink-600' :
                            content.platform === 'tiktok' ? 'bg-gray-100 text-gray-600' :
                            content.platform === 'youtube' ? 'bg-red-100 text-red-600' :
                            content.platform === 'twitter' ? 'bg-blue-100 text-blue-600' :
                            'bg-gray-100 text-gray-600'
                          }`}>
                            {content.platform.charAt(0).toUpperCase() + content.platform.slice(1)}
                          </span>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            content.competition_level === 'High' ? 'bg-red-100 text-red-600' :
                            content.competition_level === 'Medium' ? 'bg-yellow-100 text-yellow-600' :
                            'bg-green-100 text-green-600'
                          }`}>
                            {content.competition_level} Competition
                          </span>
                        </div>
                        <h4 className="font-medium text-gray-900 mb-1 line-clamp-2">{content.title}</h4>
                        <p className="text-sm text-gray-600 mb-2">by @{content.creator_name}</p>
                      </div>
                      <div className="flex items-center space-x-1 ml-3">
                        <a 
                          href={content.platform_url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-gray-400 hover:text-gray-600 transition-colors"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2 mb-3 text-xs">
                      <div className="bg-blue-50 rounded-lg p-2 text-center">
                        <div className="font-semibold text-blue-600">{content.total_engagement}</div>
                        <div className="text-blue-500">Total Actions</div>
                      </div>
                      <div className="bg-green-50 rounded-lg p-2 text-center">
                        <div className="font-semibold text-green-600">{content.engagement_rate}%</div>
                        <div className="text-green-500">Engagement</div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between mb-3">
                      <div className="text-xs text-gray-500">
                        <div className="flex items-center space-x-1">
                          <Target className="w-3 h-3" />
                          <span>ROI Potential: {content.roi_potential}%</span>
                        </div>
                        <div className="flex items-center space-x-1 mt-1">
                          <Eye className="w-3 h-3" />
                          <span>~{content.estimated_views.toLocaleString()} views</span>
                        </div>
                      </div>
                      
                      {content.current_sponsor_count > 0 && (
                        <div className="text-xs bg-orange-100 text-orange-600 px-2 py-1 rounded-full">
                          {content.current_sponsor_count} other sponsor{content.current_sponsor_count > 1 ? 's' : ''}
                        </div>
                      )}
                    </div>

                    <div className="bg-gray-50 rounded-lg p-3 mb-3">
                      <div className="text-xs text-gray-600 mb-1">Suggested Package:</div>
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium text-gray-900">{packageDetails.name}</div>
                          <div className="text-xs text-gray-500">{packageDetails.hours}h • {packageDetails.multiplier}x boost</div>
                        </div>
                        <div className="text-right">
                          <div className="flex items-center space-x-1">
                            <Diamond className="w-3 h-3 text-purple-500" />
                            <span className="font-semibold text-purple-600">{packageDetails.gems}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => handleSponsorContent(content)}
                      className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white py-2 px-4 rounded-lg font-medium transition-all duration-200 text-sm"
                    >
                      Sponsor This Content
                    </button>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8">
              <Sparkles className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h4 className="text-lg font-semibold text-gray-900 mb-2">No suggestions available</h4>
              <p className="text-gray-600">We'll find great content for you to sponsor soon!</p>
            </div>
          )}
        </div>
      </div>

      {/* Advanced Analytics Dashboard */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Campaign Performance Trends */}
        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Campaign Performance</h3>
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <Calendar className="w-4 h-4" />
              <span>Last 30 days</span>
            </div>
          </div>
          <MultiMetricChart
            data={analyticsData}
            height={300}
            metrics={[
              { key: 'applications', name: 'Applications', color: '#f97316' },
              { key: 'conversions', name: 'Conversions', color: '#10b981' },
              { key: 'clicks', name: 'Clicks', color: '#3b82f6' }
            ]}
          />
        </div>

        {/* Drop Type Distribution */}
        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Drop Type Distribution</h3>
          <ActivityBreakdown
            data={dropTypeBreakdown}
            height={300}
          />
        </div>

        {/* Performance Metrics */}
        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Key Performance Indicators</h3>
          <PerformanceMetrics
            data={campaignPerformance}
            height={300}
          />
        </div>

        {/* Spending & ROI Trends */}
        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
          <h3 className="text-lg font-semibant text-gray-900 mb-6">Spending & Engagement Trends</h3>
          <TrendLine
            data={analyticsData.map(d => ({ 
              date: d.date, 
              value: d.spent, 
              secondary: d.impressions / 10 
            }))}
            height={300}
            primaryKey="value"
            secondaryKey="secondary"
            primaryColor="#f97316"
            secondaryColor="#8b5cf6"
          />
          <div className="flex justify-center space-x-6 mt-4 text-sm">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
              <span className="text-gray-600">Gems Spent</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-violet-500 rounded-full"></div>
              <span className="text-gray-600">Impressions (÷10)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Real-time Metrics */}
      <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Real-time Campaign Metrics</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <Eye className="w-6 h-6 text-blue-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-blue-900">24.3K</p>
            <p className="text-sm text-blue-600">Impressions</p>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <MousePointer className="w-6 h-6 text-green-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-green-900">1.2K</p>
            <p className="text-sm text-green-600">Clicks</p>
          </div>
          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <Target className="w-6 h-6 text-purple-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-purple-900">156</p>
            <p className="text-sm text-purple-600">Applications</p>
          </div>
          <div className="text-center p-4 bg-orange-50 rounded-lg">
            <Users className="w-6 h-6 text-orange-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-orange-900">89</p>
            <p className="text-sm text-orange-600">Conversions</p>
          </div>
          <div className="text-center p-4 bg-yellow-50 rounded-lg">
            <DollarSign className="w-6 h-6 text-yellow-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-yellow-900">$0.78</p>
            <p className="text-sm text-yellow-600">Cost/Convert</p>
          </div>
          <div className="text-center p-4 bg-red-50 rounded-lg">
            <TrendingUp className="w-6 h-6 text-red-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-red-900">4.2%</p>
            <p className="text-sm text-red-600">CTR</p>
          </div>
        </div>
      </div>

      {/* Recent Drops */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">Recent Drops</h3>
            {userData && (userData as any).user_type === 'advertiser' && (
              <div className="flex space-x-2">
                <button
                  onClick={() => window.location.href = '/earn?create=proof'}
                  className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white px-4 py-2 rounded-lg font-medium flex items-center space-x-2 transition-all duration-200"
                >
                  <Plus className="w-4 h-4" />
                  <span>Create Proof Drop</span>
                </button>
                {dashboardData?.user_tier !== 'free' && (
                  <button
                    onClick={() => window.location.href = '/earn?create=paid'}
                    className="bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white px-4 py-2 rounded-lg font-medium flex items-center space-x-2 transition-all duration-200"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Create Paid Drop</span>
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
        <div className="p-6">
          {dashboardData.drops.length > 0 ? (
            <div className="space-y-4">
              {dashboardData.drops.slice(0, 5).map((drop: any) => (
                <div key={drop.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">{drop.title}</h4>
                    <p className="text-sm text-gray-600 mt-1">{drop.description}</p>
                    <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                      <span className="flex items-center space-x-1">
                        <Users className="w-4 h-4" />
                        <span>{drop.total_applications || 0} applicants</span>
                      </span>
                      <span className="flex items-center space-x-1">
                        <Diamond className="w-4 h-4" />
                        <span>{drop.gem_reward_base} gems</span>
                      </span>
                      <span className="flex items-center space-x-1">
                        <Calendar className="w-4 h-4" />
                        <span>{new Date(drop.created_at).toLocaleDateString()}</span>
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      drop.status === 'active' 
                        ? 'text-green-600 bg-green-100' 
                        : 'text-gray-600 bg-gray-100'
                    }`}>
                      {drop.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h4 className="text-lg font-semibold text-gray-900 mb-2">No drops yet</h4>
              <p className="text-gray-600 mb-4">Create your first drop to start engaging with creators.</p>
              {userData && (userData as any).user_type === 'advertiser' && (
                <button
                  onClick={() => window.location.href = '/earn?create=proof'}
                  className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white px-6 py-2 rounded-lg font-medium"
                >
                  Create Your First Drop
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Analytics Table */}
      {dashboardData.analytics.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Performance Analytics</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Period</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Drops</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Participants</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Gems Spent</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Impressions</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Engagement</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {dashboardData.analytics.slice(0, 10).map((analytics) => (
                  <tr key={analytics.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(analytics.period_start).toLocaleDateString()} - {new Date(analytics.period_end).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{analytics.drops_created}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{analytics.total_participants}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{analytics.gems_spent.toFixed(1)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{analytics.impressions.toLocaleString()}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{analytics.engagement_rate.toFixed(1)}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Sponsorship Modal */}
      {selectedContentForSponsorship && (
        <SponsorshipModal
          isOpen={true}
          onClose={() => setSelectedContentForSponsorship(null)}
          onSponsor={async (gemAmount: number, boostMultiplier: number, durationHours: number) => {
            try {
              const response = await fetch('/api/content/sponsor', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({
                  contentId: selectedContentForSponsorship.id,
                  gemAmount,
                  boostMultiplier,
                  durationHours
                })
              });
              
              if (response.ok) {
                setSelectedContentForSponsorship(null);
                fetchSuggestedContent();
              } else {
                console.error('Failed to sponsor content');
              }
            } catch (error) {
              console.error('Error sponsoring content:', error);
            }
          }}
          contentTitle={selectedContentForSponsorship.title}
          userGems={(userData as any)?.gems_balance || 0}
        />
      )}

      {/* Brand Profile Modal */}
      <BrandProfileModal
        isOpen={showBrandModal}
        onClose={() => setShowBrandModal(false)}
        onSave={handleSaveBrandProfile}
        currentBrandData={userData as any}
        loading={savingBrand}
      />
    </div>
  );
}
