import { useEffect, useState } from 'react';
import { 
  Wallet as WalletIcon, 
  DollarSign, 
  ArrowUpRight, 
  ArrowDownLeft,
  Clock,
  Filter,
  Coins,
  Key,
  Trophy,
  Diamond,
  TrendingUp,
  Activity,
  Target
} from 'lucide-react';
import { WalletType, TransactionType, UserType } from '@/shared/types';
import CurrencyConversionModal from '@/react-app/components/CurrencyConversionModal';
import MasterKeyModal from '@/react-app/components/MasterKeyModal';
import GoldShopModal from '@/react-app/components/GoldShopModal';
import WithdrawalModal from '@/react-app/components/WithdrawalModal';
import PaymentPreferencesModal from '@/react-app/components/PaymentPreferencesModal';
import GemStoreModal from '@/react-app/components/GemStoreModal';
import AchievementsModal from '@/react-app/components/AchievementsModal';
import AuthDebugger from '@/react-app/components/AuthDebugger';
import { 
  EarningsChart, 
  PerformanceMetrics, 
  ActivityBreakdown, 
  TrendLine,
  KPICard 
} from '@/react-app/components/AnalyticsCharts';

// Wallet Analytics Component
function WalletAnalyticsOverview({ userData }: { userData: UserType | null; transactions: TransactionType[] }) {
  // Generate mock earnings data for the last 30 days
  const generateEarningsData = () => {
    const last30Days = Array.from({ length: 30 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (29 - i));
      return {
        date: date.toISOString().split('T')[0],
        earnings: Math.floor(Math.random() * 50) + 10,
        gems: Math.floor(Math.random() * 20) + 5,
        points: Math.floor(Math.random() * 100) + 20
      };
    });
    return last30Days;
  };

  const earningsData = generateEarningsData();
  
  const currencyBreakdown = [
    { name: 'Points', value: userData?.points_balance || 0, color: '#3b82f6' },
    { name: 'Keys', value: (userData?.keys_balance || 0) * 10, color: '#f97316' },
    { name: 'Gems', value: (userData?.gems_balance || 0) * 5, color: '#8b5cf6' },
    { name: 'Gold', value: (userData?.gold_collected || 0) * 2, color: '#eab308' }
  ];

  const earningsSources = [
    { metric: 'Social Actions', value: 45 },
    { metric: 'Drop Completions', value: 30 },
    { metric: 'Content Investments', value: 15 },
    { metric: 'Referral Bonuses', value: 8 },
    { metric: 'Achievements', value: 2 }
  ];

  return (
    <div className="space-y-6">
      {/* Enhanced KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          title="This Month"
          value="$127.50"
          change={23}
          changeType="increase"
          icon={<TrendingUp className="w-5 h-5" />}
          trend={earningsData.slice(-7).map(d => ({ date: d.date, value: d.earnings }))}
        />
        
        <KPICard
          title="All Time"
          value="$1,456.80"
          change={8}
          changeType="increase"
          icon={<Activity className="w-5 h-5" />}
          trend={earningsData.slice(-7).map(d => ({ date: d.date, value: d.earnings * 5 }))}
        />
        
        <KPICard
          title="Pending"
          value="$89.25"
          change={12}
          changeType="increase"
          icon={<Clock className="w-5 h-5" />}
          trend={earningsData.slice(-7).map(d => ({ date: d.date, value: d.earnings * 0.5 }))}
        />
        
        <KPICard
          title="Available"
          value="$234.75"
          change={5}
          changeType="increase"
          icon={<WalletIcon className="w-5 h-5" />}
          trend={earningsData.slice(-7).map(d => ({ date: d.date, value: d.earnings * 2 }))}
        />
      </div>

      {/* Analytics Dashboard */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Earnings Trend */}
        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Earnings Trend (30 Days)</h3>
          <EarningsChart 
            data={earningsData}
            height={300}
          />
        </div>

        {/* Currency Distribution */}
        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Currency Distribution</h3>
          <ActivityBreakdown
            data={currencyBreakdown.filter(item => item.value > 0)}
            height={300}
          />
        </div>

        {/* Earning Sources */}
        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Earning Sources</h3>
          <PerformanceMetrics
            data={earningsSources}
            height={300}
          />
        </div>

        {/* Currency Trends */}
        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Currency Growth</h3>
          <TrendLine
            data={earningsData.map(d => ({ 
              date: d.date, 
              value: d.points, 
              secondary: d.gems * 5 
            }))}
            height={300}
            primaryKey="value"
            secondaryKey="secondary"
            primaryColor="#3b82f6"
            secondaryColor="#8b5cf6"
          />
          <div className="flex justify-center space-x-6 mt-4 text-sm">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              <span className="text-gray-600">Points</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-violet-500 rounded-full"></div>
              <span className="text-gray-600">Gems (×5)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Insights */}
      <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Wallet Insights</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <Coins className="w-6 h-6 text-blue-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-blue-900">{userData?.points_balance || 0}</p>
            <p className="text-sm text-blue-600">Active Points</p>
          </div>
          <div className="text-center p-4 bg-orange-50 rounded-lg">
            <Key className="w-6 h-6 text-orange-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-orange-900">{userData?.keys_balance || 0}</p>
            <p className="text-sm text-orange-600">Keys Available</p>
          </div>
          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <Diamond className="w-6 h-6 text-purple-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-purple-900">{userData?.gems_balance || 0}</p>
            <p className="text-sm text-purple-600">Gems Earned</p>
          </div>
          <div className="text-center p-4 bg-yellow-50 rounded-lg">
            <Trophy className="w-6 h-6 text-yellow-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-yellow-900">{userData?.gold_collected || 0}</p>
            <p className="text-sm text-yellow-600">Gold Collection</p>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <Target className="w-6 h-6 text-green-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-green-900">Level {userData?.level || 1}</p>
            <p className="text-sm text-green-600">Current Level</p>
          </div>
          <div className="text-center p-4 bg-red-50 rounded-lg">
            <Activity className="w-6 h-6 text-red-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-red-900">{userData?.points_streak_days || 0}</p>
            <p className="text-sm text-red-600">Day Streak</p>
          </div>
        </div>
      </div>

      {/* Earning Sources Breakdown */}
      <div className="space-y-3">
        <h3 className="text-lg font-semibold text-gray-900">Currency Breakdown</h3>
        <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
          <div className="flex items-center space-x-2">
            <Coins className="w-5 h-5 text-blue-600" />
            <span className="font-medium text-blue-900">Points</span>
          </div>
          <div className="text-right">
            <p className="font-semibold text-blue-900">{userData?.points_balance?.toLocaleString() || '0'}</p>
            <p className="text-sm text-blue-600">From social actions</p>
          </div>
        </div>
        <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
          <div className="flex items-center space-x-2">
            <Key className="w-5 h-5 text-orange-600" />
            <span className="font-medium text-orange-900">Keys</span>
          </div>
          <div className="text-right">
            <p className="font-semibold text-orange-900">{userData?.keys_balance || '0'}</p>
            <p className="text-sm text-orange-600">For drop applications</p>
          </div>
        </div>
        <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
          <div className="flex items-center space-x-2">
            <Diamond className="w-5 h-5 text-purple-600" />
            <span className="font-medium text-purple-900">Gems</span>
          </div>
          <div className="text-right">
            <p className="font-semibold text-purple-900">{userData?.gems_balance || '0'}</p>
            <p className="text-sm text-purple-600">From completed drops</p>
          </div>
        </div>
        <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
          <div className="flex items-center space-x-2">
            <Trophy className="w-5 h-5 text-yellow-600" />
            <span className="font-medium text-yellow-900">Gold</span>
          </div>
          <div className="text-right">
            <p className="font-semibold text-yellow-900">{userData?.gold_collected || '0'}</p>
            <p className="text-sm text-yellow-600">Prestige collection</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Wallet() {
  const [wallets, setWallets] = useState<WalletType[]>([]);
  const [transactions, setTransactions] = useState<TransactionType[]>([]);
  const [userData, setUserData] = useState<UserType | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'transactions'>('overview');
  const [showCurrencyModal, setShowCurrencyModal] = useState(false);
  const [showMasterKeyModal, setShowMasterKeyModal] = useState(false);
  const [showGoldShopModal, setShowGoldShopModal] = useState(false);
  const [showWithdrawalModal, setShowWithdrawalModal] = useState(false);
  const [showPaymentPreferencesModal, setShowPaymentPreferencesModal] = useState(false);
  const [showGemStoreModal, setShowGemStoreModal] = useState(false);
  const [showAchievementsModal, setShowAchievementsModal] = useState(false);

  // Debug logging
  console.log('Wallet component rendered, modal states:', {
    showGemStoreModal,
    showCurrencyModal,
    showWithdrawalModal
  });

  useEffect(() => {
    fetchWalletData();
  }, []);

  const fetchWalletData = async () => {
    try {
      console.log('=== fetchWalletData Debug ===');
      console.log('Starting wallet data fetch...');
      
      // Check authentication with comprehensive logging
      console.log('Checking authentication with Mocha service...');
      console.log('Current cookies:', document.cookie);
      
      const authResponse = await fetch('/api/users/me', { credentials: 'include' });
      console.log('Auth response:', {
        status: authResponse.status,
        statusText: authResponse.statusText,
        headers: Object.fromEntries(authResponse.headers.entries())
      });
      
      let authData = null;
      try {
        const responseText = await authResponse.text();
        console.log('Raw auth response:', responseText);
        
        if (responseText) {
          authData = JSON.parse(responseText);
        }
        
        console.log('Auth data parsed:', {
          isNull: authData === null,
          hasId: !!(authData?.id),
          hasEmail: !!(authData?.email),
          type: typeof authData,
          data: authData
        });
      } catch (parseError) {
        console.error('Failed to parse auth response:', parseError);
      }
      
      if (!authData || authData === null) {
        console.log('User not authenticated - showing error and manual auth options');
        // Don't redirect immediately, show user state for debugging
        setUserData(null);
        setWallets([]);
        setTransactions([]);
        
        // Set a temporary notification instead of redirecting
        alert('Authentication failed. Please try the "Force Re-Login" button or refresh the page.');
        return;
      }
      
      console.log('User is authenticated, fetching user data...');
      
      // Fetch user data from database with error handling
      const userResponse = await fetch('/api/app/users/me', { credentials: 'include' });
      console.log('User data response status:', userResponse.status);
      
      let userData = null;
      try {
        userData = await userResponse.json();
        console.log('User data parsed:', {
          isNull: userData === null,
          hasError: !!(userData?.error),
          hasId: !!(userData?.id),
          hasEmail: !!(userData?.email),
          gems_balance: userData?.gems_balance,
          type: typeof userData
        });
      } catch (parseError) {
        console.error('Failed to parse user response:', parseError);
      }
      
      // Handle error responses
      if (userData?.error) {
        console.error('User data API error:', userData.error);
        if (userData.error.includes('configuration')) {
          alert('Server configuration error. Please contact support.');
          return;
        }
      }
      
      // If still no user data, create temporary user for display
      if (!userData || userData === null || userData?.error) {
        console.log('No valid database user found, creating temporary user...');
        const tempUser: UserType = {
          id: Date.now(),
          mocha_user_id: authData.id || 'temp',
          email: authData.email || '',
          display_name: authData.google_user_data?.name || authData.email?.split('@')[0] || 'User',
          username: authData.email?.split('@')[0] || 'user',
          avatar_url: authData.google_user_data?.picture || undefined,
          bio: 'Welcome to Promorang!',
          banner_url: undefined,
          website_url: undefined,
          social_links: undefined,
          user_type: 'regular',
          xp_points: 100,
          level: 1,
          referral_code: 'TEMP' + Date.now().toString().slice(-4),
          referred_by: undefined,
          follower_count: 0,
          following_count: 0,
          total_earnings_usd: 0,
          promogem_balance: 0,
          points_balance: 25,
          keys_balance: 1,
          gems_balance: 0,
          gold_collected: 0,
          user_tier: 'free',
          points_streak_days: 0,
          last_activity_date: new Date().toISOString().split('T')[0],
          master_key_activated_at: undefined,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        console.log('Using temporary user data:', tempUser);
        setUserData(tempUser);
      } else {
        console.log('Setting valid user data:', {
          id: userData.id,
          email: userData.email,
          gems_balance: userData.gems_balance
        });
        setUserData(userData);
      }
      
      // Fetch wallets and transactions with error handling
      try {
        const [walletsResponse, transactionsResponse] = await Promise.all([
          fetch('/api/users/wallets', { credentials: 'include' }),
          fetch('/api/users/transactions', { credentials: 'include' })
        ]);

        const walletsData = walletsResponse.ok ? await walletsResponse.json() : [];
        const transactionsData = transactionsResponse.ok ? await transactionsResponse.json() : [];
        
        setWallets(walletsData || []);
        setTransactions(transactionsData || []);
        
        console.log('Fetched additional data:', {
          wallets: (walletsData || []).length,
          transactions: (transactionsData || []).length
        });
      } catch (additionalDataError) {
        console.error('Error fetching wallets/transactions:', additionalDataError);
        setWallets([]);
        setTransactions([]);
      }
      
    } catch (error) {
      console.error('Failed to fetch wallet data:', error);
      if (error instanceof Error) {
        console.error('Error details:', error.message);
        console.error('Error stack:', error.stack);
      }
      // Don't redirect on general errors, just show empty state
      setUserData(null);
      setWallets([]);
      setTransactions([]);
    } finally {
      setLoading(false);
      console.log('fetchWalletData completed, loading set to false');
    }
  };

  const usdWallet = wallets.find(w => w.currency_type === 'USD');

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'task_payment':
      case 'referral_bonus':
      case 'staking_reward':
        return <ArrowDownLeft className="w-4 h-4 text-green-600" />;
      case 'withdrawal':
        return <ArrowUpRight className="w-4 h-4 text-red-600" />;
      default:
        return <Clock className="w-4 h-4 text-gray-600" />;
    }
  };

  const getTransactionColor = (amount: number) => {
    return amount >= 0 ? 'text-green-600' : 'text-red-600';
  };

  // Button handlers with comprehensive logging
  const handleBuyMoreGems = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('Buy More Gems button clicked!');
    console.log('Current showGemStoreModal state:', showGemStoreModal);
    console.log('Current userData:', userData);
    setShowGemStoreModal(true);
    console.log('Setting showGemStoreModal to true');
    
    // Force re-render to ensure state change is detected
    setTimeout(() => {
      console.log('showGemStoreModal after timeout:', showGemStoreModal);
    }, 100);
  };

  const handleConvertCurrency = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('Convert Currency button clicked!');
    console.log('Current showCurrencyModal state:', showCurrencyModal);
    setShowCurrencyModal(true);
    console.log('Setting showCurrencyModal to true');
  };

  const handleWithdrawGems = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('Withdraw Gems button clicked!');
    console.log('Current showWithdrawalModal state:', showWithdrawalModal);
    setShowWithdrawalModal(true);
    console.log('Setting showWithdrawalModal to true');
  };

  const handleCloseGemStore = () => {
    console.log('Closing Gem Store Modal');
    setShowGemStoreModal(false);
  };

  const handleCloseCurrencyModal = () => {
    console.log('Closing Currency Modal');
    setShowCurrencyModal(false);
  };

  const handleCloseWithdrawalModal = () => {
    console.log('Closing Withdrawal Modal');
    setShowWithdrawalModal(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Wallet</h1>
        <p className="text-gray-600 mt-2">Manage your earnings and transactions</p>
      </div>

      {/* Currency Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Points Card */}
        <div className="bg-gradient-to-br from-blue-500 to-cyan-600 rounded-2xl p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <Coins className="w-6 h-6" />
              <span className="text-lg font-medium">Points</span>
            </div>
            <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
              <span className="text-xs font-bold">PTS</span>
            </div>
          </div>
          <div className="mb-4">
            <p className="text-3xl font-bold">{userData?.points_balance?.toLocaleString() || '0'}</p>
            <p className="text-blue-100 text-sm">Earn from social actions</p>
          </div>
          <button 
            onClick={handleConvertCurrency}
            className="w-full bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-lg py-2 px-4 text-sm font-medium transition-colors"
          >
            Convert to Keys
          </button>
        </div>

        {/* Keys Card */}
        <div className="bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <Key className="w-6 h-6" />
              <span className="text-lg font-medium">Keys</span>
            </div>
            <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
              <span className="text-xs font-bold">KEY</span>
            </div>
          </div>
          <div className="mb-4">
            <p className="text-3xl font-bold">{userData?.keys_balance || '0'}</p>
            <p className="text-orange-100 text-sm">Apply for paid drops</p>
          </div>
          <button 
            onClick={() => setShowMasterKeyModal(true)}
            className="w-full bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-lg py-2 px-4 text-sm font-medium transition-colors"
          >
            Master Key Status
          </button>
        </div>

        {/* Gems Card */}
        <div className="bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <Diamond className="w-6 h-6" />
              <span className="text-lg font-medium">Gems</span>
            </div>
            <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
              <span className="text-xs font-bold">GEM</span>
            </div>
          </div>
          <div className="mb-4">
            <p className="text-3xl font-bold">{userData?.gems_balance || '0'}</p>
            <p className="text-purple-100 text-sm">Earn from completed drops</p>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <button 
              onClick={handleBuyMoreGems}
              className="bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-lg py-2 px-2 text-xs font-medium transition-colors"
            >
              Buy More
            </button>
            <button 
              onClick={handleConvertCurrency}
              className="bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-lg py-2 px-2 text-xs font-medium transition-colors"
            >
              Convert
            </button>
            <button 
              onClick={handleWithdrawGems}
              disabled={(userData?.gems_balance || 0) < 200}
              className="bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-lg py-2 px-2 text-xs font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Withdraw
            </button>
          </div>
        </div>

        {/* Gold Card */}
        <div className="bg-gradient-to-br from-yellow-500 to-amber-600 rounded-2xl p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <Trophy className="w-6 h-6" />
              <span className="text-lg font-medium">Gold</span>
            </div>
            <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
              <span className="text-xs font-bold">AU</span>
            </div>
          </div>
          <div className="mb-4">
            <p className="text-3xl font-bold">{userData?.gold_collected || '0'}</p>
            <p className="text-yellow-100 text-sm">Prestige currency</p>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <button 
              onClick={() => setShowGoldShopModal(true)}
              className="bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-lg py-2 px-2 text-xs font-medium transition-colors"
            >
              Gold Shop
            </button>
            <button 
              onClick={() => setShowAchievementsModal(true)}
              className="bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-lg py-2 px-2 text-xs font-medium transition-colors"
            >
              Achievements
            </button>
          </div>
        </div>
      </div>

      {/* Legacy USD Wallet (if exists) */}
      {usdWallet && usdWallet.balance > 0 && (
        <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <DollarSign className="w-6 h-6" />
              <span className="text-lg font-medium">USD Balance</span>
            </div>
            <WalletIcon className="w-6 h-6 opacity-75" />
          </div>
          <div className="mb-4">
            <p className="text-4xl font-bold">${(usdWallet?.balance || 0).toFixed(2)}</p>
            <p className="text-green-100 text-sm">Available for withdrawal</p>
          </div>
          <div className="flex space-x-3">
            <button className="flex-1 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-lg py-2 px-4 text-sm font-medium transition-colors">
              Withdraw
            </button>
            <button 
              onClick={() => setShowPaymentPreferencesModal(true)}
              className="flex-1 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-lg py-2 px-4 text-sm font-medium transition-colors"
            >
              Payment Methods
            </button>
          </div>
        </div>
      )}

      {/* Staking Rewards Card */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Staking Rewards</h2>
          <span className="bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700 px-3 py-1 rounded-full text-sm font-medium">
            12.5% APY
          </span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-900">0</p>
            <p className="text-sm text-gray-600">Staked PromoGems</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-purple-600">0.00</p>
            <p className="text-sm text-gray-600">Pending Rewards</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-green-600">$0.00</p>
            <p className="text-sm text-gray-600">Total Earned</p>
          </div>
        </div>
        <div className="mt-6 pt-6 border-t border-gray-200">
          <button className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white py-3 rounded-lg font-medium transition-all duration-200">
            Start Staking PromoGems
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            <button
              onClick={() => setActiveTab('overview')}
              className={`py-4 border-b-2 font-medium text-sm ${
                activeTab === 'overview'
                  ? 'border-orange-500 text-orange-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab('transactions')}
              className={`py-4 border-b-2 font-medium text-sm ${
                activeTab === 'transactions'
                  ? 'border-orange-500 text-orange-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Transactions
            </button>
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Enhanced Analytics Overview */}
              <WalletAnalyticsOverview userData={userData} transactions={transactions} />
            </div>
          )}

          {activeTab === 'transactions' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Transaction History</h3>
                <button className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                  <Filter className="w-4 h-4" />
                  <span>Filter</span>
                </button>
              </div>

              <div className="space-y-3">
                {transactions.length > 0 ? (
                  transactions.map((transaction) => (
                    <div key={transaction.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm">
                          {getTransactionIcon(transaction.transaction_type)}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">
                            {transaction.description || transaction.transaction_type.replace('_', ' ')}
                          </p>
                          <p className="text-sm text-gray-500">
                            {new Date(transaction.created_at).toLocaleDateString()} • {transaction.currency_type}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`font-semibold ${getTransactionColor(transaction.amount)}`}>
                          {transaction.amount >= 0 ? '+' : ''}${Math.abs(transaction.amount).toFixed(2)}
                        </p>
                        <p className="text-sm text-gray-500 capitalize">{transaction.status}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-12">
                    <WalletIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No transactions yet</h3>
                    <p className="text-gray-600">Your transaction history will appear here once you start earning.</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Enhanced Debug section for comprehensive troubleshooting */}
      <div className="bg-gray-100 rounded-lg p-4 space-y-2">
        <h4 className="font-medium text-gray-900">Debug Info:</h4>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <h5 className="font-semibold text-gray-800">Modal States:</h5>
            <p className="text-gray-600">showGemStoreModal: {showGemStoreModal.toString()}</p>
            <p className="text-gray-600">showCurrencyModal: {showCurrencyModal.toString()}</p>
            <p className="text-gray-600">showWithdrawalModal: {showWithdrawalModal.toString()}</p>
          </div>
          <div>
            <h5 className="font-semibold text-gray-800">User Data:</h5>
            <p className="text-gray-600">userData: {userData ? 'loaded' : 'null'}</p>
            <p className="text-gray-600">email: {userData?.email || 'none'}</p>
            <p className="text-gray-600">gems: {userData?.gems_balance || 0}</p>
            <p className="text-gray-600">points: {userData?.points_balance || 0}</p>
            <p className="text-gray-600">keys: {userData?.keys_balance || 0}</p>
          </div>
        </div>
        <div>
          <h5 className="font-semibold text-gray-800">System State:</h5>
          <p className="text-gray-600">loading: {loading.toString()}</p>
          <p className="text-gray-600">cookies: {document.cookie ? `${document.cookie.split(';').length} cookies` : 'none'}</p>
          <p className="text-gray-600">session_token: {document.cookie.includes('mocha_session_token') ? 'present' : 'missing'}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button 
            onClick={handleBuyMoreGems}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg text-sm"
          >
            Test Buy More Button
          </button>
          <button 
            onClick={() => {
              console.log('Manual refresh clicked');
              setLoading(true);
              fetchWalletData();
            }}
            className="px-4 py-2 bg-green-500 text-white rounded-lg text-sm"
          >
            Refresh User Data
          </button>
          <button 
            onClick={() => {
              console.log('Force close all modals');
              setShowGemStoreModal(false);
              setShowCurrencyModal(false);
              setShowWithdrawalModal(false);
            }}
            className="px-4 py-2 bg-red-500 text-white rounded-lg text-sm"
          >
            Close All Modals
          </button>
          <button 
            onClick={() => {
              console.log('Clearing session and redirecting to login...');
              // Clear local storage and cookies
              localStorage.clear();
              sessionStorage.clear();
              document.cookie = document.cookie.split(";").map(c => c.split("=")[0] + "=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/").join("");
              // Redirect to home for re-authentication
              window.location.href = '/';
            }}
            className="px-4 py-2 bg-orange-500 text-white rounded-lg text-sm"
          >
            Force Re-Login
          </button>
          <button 
            onClick={async () => {
              console.log('Testing auth endpoints...');
              try {
                const authTest = await fetch('/api/users/me', { credentials: 'include' });
                const authData = await authTest.json();
                console.log('Auth test result:', authData);
                
                const userTest = await fetch('/api/app/users/me', { credentials: 'include' });
                const userData = await userTest.json();
                console.log('User test result:', userData);
                
                alert(`Auth: ${authData ? 'OK' : 'FAIL'}, User: ${userData ? 'OK' : 'FAIL'}`);
              } catch (e) {
                console.error('Test failed:', e);
                alert('Test failed - check console');
              }
            }}
            className="px-4 py-2 bg-purple-500 text-white rounded-lg text-sm"
          >
            Test Auth
          </button>
        </div>
      </div>

      {/* Auth Debugger - shown when user data is null */}
      {!userData && <AuthDebugger />}

      {/* Modals */}
      <CurrencyConversionModal
        user={userData}
        isOpen={showCurrencyModal}
        onClose={handleCloseCurrencyModal}
        onSuccess={fetchWalletData}
      />
      
      <MasterKeyModal
        user={userData}
        isOpen={showMasterKeyModal}
        onClose={() => setShowMasterKeyModal(false)}
        onSuccess={fetchWalletData}
      />
      
      <GoldShopModal
        user={userData}
        isOpen={showGoldShopModal}
        onClose={() => setShowGoldShopModal(false)}
        onPurchase={fetchWalletData}
      />
      
      <WithdrawalModal
        user={userData}
        isOpen={showWithdrawalModal}
        onClose={handleCloseWithdrawalModal}
        onSuccess={fetchWalletData}
      />
      
      <PaymentPreferencesModal
        user={userData}
        isOpen={showPaymentPreferencesModal}
        onClose={() => setShowPaymentPreferencesModal(false)}
        onSuccess={fetchWalletData}
      />
      
      <GemStoreModal
        user={userData}
        isOpen={showGemStoreModal}
        onClose={handleCloseGemStore}
        onSuccess={fetchWalletData}
      />
      
      <AchievementsModal
        user={userData}
        isOpen={showAchievementsModal}
        onClose={() => setShowAchievementsModal(false)}
      />
    </div>
  );
}
