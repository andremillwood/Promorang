import { ReactNode, useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router';
import { useAuth } from '@getmocha/users-service/react';
import { 
  Home, 
  DollarSign, 
  Plus, 
  TrendingUp, 
  User, 
  LogOut,
  Coins,
  Key,
  Star,
  Trophy,
  Megaphone,
  Search,
  Menu,
  X,
  Wallet,
  ChevronDown,
  Settings,
  Crown,
  Bell,
  Rocket
} from 'lucide-react';
import UserLink from '@/react-app/components/UserLink';
import Tooltip from '@/react-app/components/Tooltip';
import NotificationCenter from '@/react-app/components/NotificationCenter';
import { UserType } from '@/shared/types';
import CurrencyConversionModal from '@/react-app/components/CurrencyConversionModal';
import MasterKeyModal from '@/react-app/components/MasterKeyModal';
import InstagramVerificationModal from '@/react-app/components/InstagramVerificationModal';
import UserTierUpgradeModal from '@/react-app/components/UserTierUpgradeModal';
import SearchModal from '@/react-app/components/SearchModal';
import GoldShopModal from '@/react-app/components/GoldShopModal';
import AchievementsModal from '@/react-app/components/AchievementsModal';
import { useNotifications } from '@/react-app/hooks/useNotifications';

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [userData, setUserData] = useState<UserType | null>(null);
  const [showCurrencyModal, setShowCurrencyModal] = useState(false);
  const [showMasterKeyModal, setShowMasterKeyModal] = useState(false);
  const [showInstagramModal, setShowInstagramModal] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showWalletMenu, setShowWalletMenu] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showGoldShopModal, setShowGoldShopModal] = useState(false);
  const [showAchievementsModal, setShowAchievementsModal] = useState(false);
  const { unreadCount } = useNotifications();

  useEffect(() => {
    if (user) {
      fetchUserData();
    }
  }, [user]);

  // Add keyboard shortcut for search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setShowSearchModal(true);
      }
      if (e.key === 'Escape') {
        setShowUserMenu(false);
        setShowWalletMenu(false);
        setShowMobileMenu(false);
        setShowNotifications(false);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Element;
      if (!target.closest('.user-menu') && !target.closest('.wallet-menu')) {
        setShowUserMenu(false);
        setShowWalletMenu(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  const fetchUserData = async () => {
    try {
      const response = await fetch('/api/app/users/me', { credentials: 'include' });
      if (response.ok) {
        const data = await response.json();
        // Handle both direct user data and null responses
        if (data && typeof data === 'object') {
          setUserData(data);
        }
      }
    } catch (error) {
      console.error('Failed to fetch user data:', error);
    }
  };

  const getNavigation = () => {
    const baseNav = [
      { name: 'Home', href: '/home', icon: Home },
      { name: 'Earn', href: '/earn', icon: DollarSign },
      { name: 'Create', href: '/create', icon: Plus },
      { name: 'Invest', href: '/invest', icon: TrendingUp },
      { name: 'Growth Hub', href: '/growth-hub', icon: Rocket },
    ];
    
    // Add advertiser dashboard for advertisers
    if (userData && (userData as any).user_type === 'advertiser') {
      baseNav.push({ name: 'Dashboard', href: '/advertiser', icon: Settings });
    }
    
    return baseNav;
  };

  const navigation = getNavigation();

  const isActive = (path: string) => location.pathname === path || location.pathname.startsWith(path + '/');

  const getTotalBalance = () => {
    if (!userData) return 0;
    return (userData.points_balance || 0) + (userData.keys_balance || 0) + (userData.gems_balance || 0) + (userData.gold_collected || 0);
  };

  const handleWalletAction = (action: string) => {
    setShowWalletMenu(false);
    switch (action) {
      case 'instagram':
        setShowInstagramModal(true);
        break;
      case 'masterkey':
        setShowMasterKeyModal(true);
        break;
      case 'convert':
        setShowCurrencyModal(true);
        break;
      case 'leaderboard':
        window.location.href = '/leaderboard';
        break;
      case 'wallet':
        window.location.href = '/wallet';
        break;
      case 'goldshop':
        setShowGoldShopModal(true);
        break;
      case 'achievements':
        setShowAchievementsModal(true);
        break;
    }
  };

  const handleLogout = async () => {
    try {
      // Call the Mocha auth logout first to clear authentication state
      await logout();
      
      // Clear any local storage or session storage
      localStorage.clear();
      sessionStorage.clear();
      
      // Call our backend logout endpoint to clear server-side session
      try {
        await fetch('/api/logout', { 
          method: 'POST',
          credentials: 'include' 
        });
      } catch (backendError) {
        console.error('Backend logout failed:', backendError);
        // Continue with redirect even if backend logout fails
      }
      
      // Use React Router navigate to go to the marketing page
      navigate('/', { replace: true });
      
    } catch (error) {
      console.error('Logout failed:', error);
      
      // Fallback: Force clear everything and redirect anyway
      try {
        localStorage.clear();
        sessionStorage.clear();
      } catch (storageError) {
        console.error('Failed to clear storage:', storageError);
      }
      
      // Still redirect to marketing page even if logout fails
      navigate('/', { replace: true });
    }
  };

  const handleUserAction = (action: string) => {
    setShowUserMenu(false);
    switch (action) {
      case 'profile':
        window.location.href = '/profile';
        break;
      case 'upgrade':
        setShowUpgradeModal(true);
        break;
      case 'advertiser':
        if (!userData || (userData as any).user_type !== 'advertiser') {
          navigate('/advertiser/onboarding');
        } else {
          navigate('/advertiser');
        }
        break;
      case 'logout':
        handleLogout();
        break;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Main Header */}
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Left Side - Logo & Search */}
            <div className="flex items-center space-x-4">
              <Link to="/home" className="flex items-center space-x-3 group">
                <img 
                  src="https://mocha-cdn.com/0198f6f0-5737-78cb-955a-4b0907aa1065/Promorang_logo_FULL-02.png"
                  alt="Promorang"
                  className="h-10 w-10 transition-transform group-hover:scale-105"
                />
              </Link>
              
              
            </div>

            {/* Right Side - Actions & User Menu */}
            <div className="flex items-center space-x-2">
              {/* Desktop Search Button */}
              <Tooltip content="Search (⌘K)" position="bottom" compact={true}>
                <button
                  onClick={() => setShowSearchModal(true)}
                  className="hidden md:flex items-center space-x-2 px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                >
                  <Search className="w-4 h-4 text-gray-600" />
                  <span className="text-sm text-gray-600">Search...</span>
                  <kbd className="hidden lg:inline-flex items-center px-2 py-1 text-xs font-medium text-gray-500 bg-white border border-gray-300 rounded">
                    ⌘K
                  </kbd>
                </button>
              </Tooltip>

              {/* Desktop Notifications */}
              <Tooltip content="Notifications" position="bottom" compact={true}>
                <button
                  onClick={() => setShowNotifications(true)}
                  className="hidden md:flex relative p-2 text-gray-400 hover:text-gray-600 transition-colors rounded-lg hover:bg-gray-100"
                >
                  <Bell className="w-5 h-5" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </button>
              </Tooltip>

              {/* Desktop Wallet Menu */}
              {(user || userData) && (
                <div className="relative wallet-menu hidden md:block">
                  <Tooltip content="Your wallet balance" position="bottom" compact={true}>
                    <button
                      onClick={() => setShowWalletMenu(!showWalletMenu)}
                      className="flex items-center space-x-2 px-3 py-2 bg-gradient-to-r from-blue-50 to-purple-50 hover:from-blue-100 hover:to-purple-100 rounded-lg transition-all duration-200 border border-blue-200/50 shadow-sm hover:shadow-md"
                    >
                      <Wallet className="w-4 h-4 text-blue-600" />
                      <span className="hidden sm:inline text-sm font-semibold text-blue-900 min-w-0">
                        {getTotalBalance().toLocaleString()}
                      </span>
                      <ChevronDown className={`w-4 h-4 text-blue-600 transition-transform ${showWalletMenu ? 'rotate-180' : ''}`} />
                    </button>
                  </Tooltip>

                  {/* Wallet Dropdown */}
                  {showWalletMenu && (
                    <div className="absolute right-0 mt-2 w-72 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                      <div className="px-4 py-2 border-b border-gray-100">
                        <h3 className="text-sm font-medium text-gray-900">Your Balances</h3>
                      </div>
                      
                      <div className="py-2">
                        <Tooltip content="Earn points from engagement" position="left">
                          <button
                            onClick={() => handleWalletAction('instagram')}
                            className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center justify-between"
                          >
                            <div className="flex items-center space-x-3">
                              <Coins className="w-4 h-4 text-blue-600" />
                              <span className="text-sm text-gray-700">Points</span>
                            </div>
                            <span className="text-sm font-medium text-blue-900">{userData?.points_balance || 0}</span>
                          </button>
                        </Tooltip>
                        
                        <Tooltip content="Unlock premium features" position="left">
                          <button
                            onClick={() => handleWalletAction('masterkey')}
                            className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center justify-between"
                          >
                            <div className="flex items-center space-x-3">
                              <Key className="w-4 h-4 text-orange-600" />
                              <span className="text-sm text-gray-700">Keys</span>
                            </div>
                            <span className="text-sm font-medium text-orange-900">{userData?.keys_balance || 0}</span>
                          </button>
                        </Tooltip>
                        
                        <Tooltip content="Premium currency from drops" position="left">
                          <button
                            onClick={() => handleWalletAction('convert')}
                            className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center justify-between"
                          >
                            <div className="flex items-center space-x-3">
                              <Star className="w-4 h-4 text-purple-600" />
                              <span className="text-sm text-gray-700">Gems</span>
                            </div>
                            <span className="text-sm font-medium text-purple-900">{userData?.gems_balance || 0}</span>
                          </button>
                        </Tooltip>
                        
                        {(userData?.gold_collected || 0) > 0 && (
                          <Tooltip content="Achievement rewards" position="left">
                            <button
                              onClick={() => handleWalletAction('goldshop')}
                              className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center justify-between"
                            >
                              <div className="flex items-center space-x-3">
                                <Trophy className="w-4 h-4 text-yellow-600" />
                                <span className="text-sm text-gray-700">Gold</span>
                              </div>
                              <span className="text-sm font-medium text-yellow-900">{userData?.gold_collected || 0}</span>
                            </button>
                          </Tooltip>
                        )}
                      </div>
                      
                      <div className="border-t border-gray-100 pt-2">
                        <Tooltip content="Full wallet management" position="left" compact={true}>
                          <button
                            onClick={() => handleWalletAction('wallet')}
                            className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center space-x-3"
                          >
                            <Wallet className="w-4 h-4 text-blue-600" />
                            <span className="text-sm text-gray-700">View Full Wallet</span>
                          </button>
                        </Tooltip>
                        <Tooltip content="View rankings" position="left" compact={true}>
                          <button
                            onClick={() => handleWalletAction('leaderboard')}
                            className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center space-x-3"
                          >
                            <Trophy className="w-4 h-4 text-purple-600" />
                            <span className="text-sm text-gray-700">View Rankings</span>
                          </button>
                        </Tooltip>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Desktop User Menu */}
              <div className="relative user-menu hidden md:block">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center space-x-2 px-3 py-2 rounded-lg hover:bg-gray-100 transition-all duration-200 group"
                >
                  <UserLink 
                    username={userData?.username || user?.email?.split('@')[0]}
                    displayName={userData?.display_name || user?.google_user_data?.name || user?.google_user_data?.given_name}
                    avatarUrl={userData?.avatar_url || user?.google_user_data?.picture}
                    className="flex items-center space-x-2"
                    size="sm"
                  />
                  <div className="hidden lg:block text-left ml-2">
                    <div className="text-sm font-medium text-gray-900 truncate max-w-32">
                      {user?.google_user_data?.given_name || user?.google_user_data?.name || user?.email?.split('@')[0] || 'User'}
                    </div>
                    <div className="flex items-center space-x-1">
                      {(userData?.user_tier || 'free') === 'super' && <Crown className="w-3 h-3 text-yellow-600" />}
                      {(userData?.user_tier || 'free') === 'premium' && <Star className="w-3 h-3 text-purple-600" />}
                      {(userData?.user_tier || 'free') === 'free' && <Star className="w-3 h-3 text-gray-600" />}
                      <span className={`text-xs font-medium ${
                        (userData?.user_tier || 'free') === 'super' ? 'text-yellow-700' :
                        (userData?.user_tier || 'free') === 'premium' ? 'text-purple-700' : 'text-gray-700'
                      }`}>
                        {(userData?.user_tier || 'free').charAt(0).toUpperCase() + (userData?.user_tier || 'free').slice(1)}
                      </span>
                    </div>
                  </div>
                  <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform group-hover:text-gray-600 ${showUserMenu ? 'rotate-180' : ''}`} />
                </button>

                {/* User Dropdown */}
                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                    <div className="px-4 py-2 border-b border-gray-100">
                      <div className="text-sm font-medium text-gray-900">
                        {userData?.display_name || user?.google_user_data?.name || user?.google_user_data?.given_name || user?.email?.split('@')[0] || 'User'}
                      </div>
                      <div className="text-xs text-gray-500">{user?.email}</div>
                    </div>
                    
                    <div className="py-2">
                      <button
                        onClick={() => handleUserAction('profile')}
                        className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center space-x-3"
                      >
                        <User className="w-4 h-4 text-gray-600" />
                        <span className="text-sm text-gray-700">Profile</span>
                      </button>
                      
                      {userData && (
                        <Tooltip content="Upgrade to Premium or Super tier for better rewards" position="left">
                          <button
                            onClick={() => handleUserAction('upgrade')}
                            className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center space-x-3"
                          >
                            <Crown className="w-4 h-4 text-purple-600" />
                            <span className="text-sm text-gray-700">Upgrade Tier</span>
                          </button>
                        </Tooltip>
                      )}
                      
                      <Tooltip content="Create and manage marketing drops for your business" position="left">
                        <button
                          onClick={() => handleUserAction('advertiser')}
                          className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center space-x-3"
                        >
                          <Megaphone className="w-4 h-4 text-orange-600" />
                          <span className="text-sm text-gray-700">
                            {(!userData || (userData as any).user_type !== 'advertiser') ? 'Become Advertiser' : 'Advertiser Dashboard'}
                          </span>
                        </button>
                      </Tooltip>
                    </div>
                    
                    <div className="border-t border-gray-100 pt-2">
                      <button
                        onClick={() => handleUserAction('logout')}
                        className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center space-x-3 text-red-600"
                      >
                        <LogOut className="w-4 h-4" />
                        <span className="text-sm">Sign Out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>

              
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      {showMobileMenu && (
        <div className="lg:hidden fixed inset-0 z-50 bg-black bg-opacity-50" onClick={() => setShowMobileMenu(false)}>
          <div className="fixed inset-y-0 right-0 w-80 bg-white shadow-xl overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            {/* Header with User Info */}
            <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-orange-50 to-red-50">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-lg font-semibold text-gray-900">Menu</h2>
                <button
                  onClick={() => setShowMobileMenu(false)}
                  className="p-2 text-gray-400 hover:text-gray-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              {/* User Profile Section */}
              <div className="flex items-center space-x-3">
                <UserLink 
                  username={userData?.username || user?.email?.split('@')[0]}
                  displayName={userData?.display_name || user?.google_user_data?.name || user?.google_user_data?.given_name || 'User'}
                  avatarUrl={userData?.avatar_url || user?.google_user_data?.picture}
                  className="flex items-center space-x-3"
                  size="md"
                />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-gray-900 truncate">
                    {userData?.display_name || user?.google_user_data?.name || user?.google_user_data?.given_name || user?.email?.split('@')[0] || 'User'}
                  </div>
                  <div className="flex items-center space-x-1">
                    {(userData?.user_tier || 'free') === 'super' && <Crown className="w-3 h-3 text-yellow-600" />}
                    {(userData?.user_tier || 'free') === 'premium' && <Star className="w-3 h-3 text-purple-600" />}
                    {(userData?.user_tier || 'free') === 'free' && <Star className="w-3 h-3 text-gray-600" />}
                    <span className={`text-xs font-medium ${
                      (userData?.user_tier || 'free') === 'super' ? 'text-yellow-700' :
                      (userData?.user_tier || 'free') === 'premium' ? 'text-purple-700' : 'text-gray-700'
                    }`}>
                      {(userData?.user_tier || 'free').charAt(0).toUpperCase() + (userData?.user_tier || 'free').slice(1)} Tier
                    </span>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Quick Actions */}
            <div className="p-4 space-y-2">
              <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-3">Quick Actions</h3>
              
              {/* Search */}
              <button
                onClick={() => {
                  setShowSearchModal(true);
                  setShowMobileMenu(false);
                }}
                className="w-full flex items-center space-x-3 px-3 py-3 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
              >
                <Search className="w-5 h-5 text-gray-600" />
                <span className="font-medium">Search</span>
              </button>

              {/* Notifications */}
              <button
                onClick={() => {
                  setShowNotifications(true);
                  setShowMobileMenu(false);
                }}
                className="w-full flex items-center justify-between px-3 py-3 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <Bell className="w-5 h-5 text-gray-600" />
                  <span className="font-medium">Notifications</span>
                </div>
                {unreadCount > 0 && (
                  <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>
            </div>

            {/* Wallet Section */}
            {(user || userData) && (
              <div className="px-4 pb-4">
                <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-3">Wallet</h3>
                <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-3 mb-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">Total Balance</span>
                    <span className="text-lg font-bold text-blue-900">{getTotalBalance().toLocaleString()}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="flex items-center space-x-1">
                      <Coins className="w-3 h-3 text-blue-600" />
                      <span>{(userData?.points_balance || 0).toLocaleString()} pts</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Key className="w-3 h-3 text-orange-600" />
                      <span>{userData?.keys_balance || 0} keys</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Star className="w-3 h-3 text-purple-600" />
                      <span>{userData?.gems_balance || 0} gems</span>
                    </div>
                    {(userData?.gold_collected || 0) > 0 && (
                      <div className="flex items-center space-x-1">
                        <Trophy className="w-3 h-3 text-yellow-600" />
                        <span>{userData?.gold_collected || 0} gold</span>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="space-y-1">
                  <button
                    onClick={() => {
                      handleWalletAction('wallet');
                      setShowMobileMenu(false);
                    }}
                    className="w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
                  >
                    <Wallet className="w-4 h-4 text-blue-600" />
                    <span className="text-sm">Full Wallet</span>
                  </button>
                  
                  <button
                    onClick={() => {
                      handleWalletAction('convert');
                      setShowMobileMenu(false);
                    }}
                    className="w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
                  >
                    <Star className="w-4 h-4 text-purple-600" />
                    <span className="text-sm">Convert Currency</span>
                  </button>
                  
                  <button
                    onClick={() => {
                      handleWalletAction('masterkey');
                      setShowMobileMenu(false);
                    }}
                    className="w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
                  >
                    <Key className="w-4 h-4 text-orange-600" />
                    <span className="text-sm">Master Key</span>
                  </button>
                </div>
              </div>
            )}

            {/* Account Management */}
            <div className="px-4 pb-4">
              <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-3">Account</h3>
              <div className="space-y-1">
                <button
                  onClick={() => {
                    handleUserAction('profile');
                    setShowMobileMenu(false);
                  }}
                  className="w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
                >
                  <User className="w-4 h-4 text-gray-600" />
                  <span className="text-sm">Profile</span>
                </button>
                
                {(user || userData) && (
                  <button
                    onClick={() => {
                      handleUserAction('upgrade');
                      setShowMobileMenu(false);
                    }}
                    className="w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
                  >
                    <Crown className="w-4 h-4 text-purple-600" />
                    <span className="text-sm">Upgrade Tier</span>
                  </button>
                )}
                
                <button
                  onClick={() => {
                    handleWalletAction('achievements');
                    setShowMobileMenu(false);
                  }}
                  className="w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
                >
                  <Trophy className="w-4 h-4 text-yellow-600" />
                  <span className="text-sm">Achievements</span>
                </button>
                
                <button
                  onClick={() => {
                    handleWalletAction('leaderboard');
                    setShowMobileMenu(false);
                  }}
                  className="w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
                >
                  <Trophy className="w-4 h-4 text-purple-600" />
                  <span className="text-sm">Leaderboard</span>
                </button>
                
                <button
                  onClick={() => {
                    handleWalletAction('instagram');
                    setShowMobileMenu(false);
                  }}
                  className="w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
                >
                  <Star className="w-4 h-4 text-pink-600" />
                  <span className="text-sm">Instagram Rewards</span>
                </button>
              </div>
            </div>

            {/* Business Tools */}
            <div className="px-4 pb-4">
              <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-3">Business</h3>
              <button
                onClick={() => {
                  handleUserAction('advertiser');
                  setShowMobileMenu(false);
                }}
                className="w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
              >
                <Megaphone className="w-4 h-4 text-orange-600" />
                <span className="text-sm">
                  {(!userData || (userData as any).user_type !== 'advertiser') ? 'Become Advertiser' : 'Advertiser Dashboard'}
                </span>
              </button>
            </div>

            {/* Sign Out */}
            <div className="px-4 pb-6 border-t border-gray-200 pt-4">
              <button
                onClick={() => {
                  handleUserAction('logout');
                  setShowMobileMenu(false);
                }}
                className="w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-red-600 hover:bg-red-50 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span className="text-sm font-medium">Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Desktop Navigation */}
      <nav className="hidden lg:block bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            {navigation.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`flex items-center space-x-2 px-3 py-4 text-sm font-medium border-b-2 transition-colors ${
                    isActive(item.href)
                      ? 'border-orange-500 text-orange-600'
                      : 'border-transparent text-gray-700 hover:text-gray-900 hover:border-gray-300'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </nav>

      {/* Mobile Bottom Navigation */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-30">
        <div className="flex">
          {/* Core Navigation - Main sections */}
          <Link
            to="/home"
            className={`flex-1 flex flex-col items-center justify-center py-3 px-1 transition-colors ${
              isActive('/home') ? 'text-orange-600' : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            <Home className="w-5 h-5" />
            <span className="text-xs mt-1 font-medium leading-tight">Home</span>
          </Link>
          
          <Link
            to="/earn"
            className={`flex-1 flex flex-col items-center justify-center py-3 px-1 transition-colors ${
              isActive('/earn') ? 'text-orange-600' : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            <DollarSign className="w-5 h-5" />
            <span className="text-xs mt-1 font-medium leading-tight">Earn</span>
          </Link>
          
          <Link
            to="/create"
            className={`flex-1 flex flex-col items-center justify-center py-3 px-1 transition-colors ${
              isActive('/create') ? 'text-orange-600' : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            <Plus className="w-5 h-5" />
            <span className="text-xs mt-1 font-medium leading-tight">Create</span>
          </Link>
          
          <Link
            to="/invest"
            className={`flex-1 flex flex-col items-center justify-center py-3 px-1 transition-colors ${
              isActive('/invest') ? 'text-orange-600' : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            <TrendingUp className="w-5 h-5" />
            <span className="text-xs mt-1 font-medium leading-tight">Invest</span>
          </Link>
          
          {/* Menu Button */}
          <button
            onClick={() => setShowMobileMenu(!showMobileMenu)}
            className={`flex-1 flex flex-col items-center justify-center py-3 px-1 transition-colors ${
              showMobileMenu ? 'text-orange-600' : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            <Menu className="w-5 h-5" />
            <span className="text-xs mt-1 font-medium leading-tight">More</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-20 lg:pb-8">
        {children}
      </main>

      {/* Modals */}
      <CurrencyConversionModal
        user={userData}
        isOpen={showCurrencyModal}
        onClose={() => setShowCurrencyModal(false)}
        onSuccess={fetchUserData}
      />
      
      <MasterKeyModal
        user={userData}
        isOpen={showMasterKeyModal}
        onClose={() => setShowMasterKeyModal(false)}
        onSuccess={fetchUserData}
      />
      
      <InstagramVerificationModal
        user={userData}
        isOpen={showInstagramModal}
        onClose={() => setShowInstagramModal(false)}
        onSuccess={fetchUserData}
      />
      
      <UserTierUpgradeModal
        user={userData}
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        onSuccess={fetchUserData}
      />
      
      <SearchModal
        isOpen={showSearchModal}
        onClose={() => setShowSearchModal(false)}
      />
      
      <NotificationCenter
        isOpen={showNotifications}
        onClose={() => setShowNotifications(false)}
      />
      
      <GoldShopModal
        user={userData}
        isOpen={showGoldShopModal}
        onClose={() => setShowGoldShopModal(false)}
        onPurchase={fetchUserData}
      />
      
      <AchievementsModal
        user={userData}
        isOpen={showAchievementsModal}
        onClose={() => setShowAchievementsModal(false)}
      />
    </div>
  );
}
