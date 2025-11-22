import { useEffect, useState } from 'react';
import { useAuth } from '@getmocha/users-service/react';
import { 
  Heart, 
  MessageCircle, 
  Share2, 
  TrendingUp,
  Eye,
  DollarSign,
  Clock,
  Star,
  Zap,
  Crown,
  Bookmark,
  Gift,
  Coins,
  Diamond,
  Target,
  Flame,
  ArrowRight,
  Plus,
  Activity,
  X
} from 'lucide-react';
import UserLink from '@/react-app/components/UserLink';
import Tooltip from '@/react-app/components/Tooltip';
import { ContentPieceType, DropType, WalletType, UserType } from '@/shared/types';
import BuySharesModal from '@/react-app/components/BuySharesModal';
import ShareContentModal from '@/react-app/components/ShareContentModal';
import ExternalMoveModal from '@/react-app/components/ExternalMoveModal';
import PlaceForecastModal from '@/react-app/components/PlaceForecastModal';
import ContentFundingModal from '@/react-app/components/ContentFundingModal';
import EditContentModal from '@/react-app/components/EditContentModal';
import ConfirmationModal from '@/react-app/components/ConfirmationModal';
import ShareModal from '@/react-app/components/ShareModal';
import SavedContentModal from '@/react-app/components/SavedContentModal';
import CommentSystem from '@/react-app/components/CommentSystem';

export default function HomeFeed() {
  const { user } = useAuth();
  const [contentFeed, setContentFeed] = useState<ContentPieceType[]>([]);
  const [dropFeed, setDropFeed] = useState<DropType[]>([]);
  const [wallets, setWallets] = useState<WalletType[]>([]);
  const [userData, setUserData] = useState<UserType | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'for-you' | 'social' | 'drops'>('for-you');
  const [sponsoredContent, setSponsoredContent] = useState<any[]>([]);
  const [buyModalOpen, setBuyModalOpen] = useState(false);
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [externalMoveModalOpen, setExternalMoveModalOpen] = useState(false);
  const [forecastModalOpen, setForecastModalOpen] = useState(false);
  const [fundingModalOpen, setFundingModalOpen] = useState(false);
  const [selectedContent, setSelectedContent] = useState<ContentPieceType | null>(null);
  const [selectedForecast, setSelectedForecast] = useState<any | null>(null);
  const [shareContentData, setShareContentData] = useState<{ id: number; title: string } | null>(null);
  const [externalMoveContentData, setExternalMoveContentData] = useState<{ id: number; title: string; platform: string; url: string } | null>(null);
  const [fundingContentData, setFundingContentData] = useState<ContentPieceType | null>(null);
  const [editContentModalOpen, setEditContentModalOpen] = useState(false);
  const [editContentData, setEditContentData] = useState<ContentPieceType | null>(null);
  const [deleteConfirmModalOpen, setDeleteConfirmModalOpen] = useState(false);
  const [contentToDelete, setContentToDelete] = useState<ContentPieceType | null>(null);
  const [contentShareModalOpen, setContentShareModalOpen] = useState(false);
  const [shareModalContent, setShareModalContent] = useState<{ id: number; title: string } | null>(null);
  const [savedContentModalOpen, setSavedContentModalOpen] = useState(false);
  const [commentModalOpen, setCommentModalOpen] = useState(false);
  const [commentModalContent, setCommentModalContent] = useState<ContentPieceType | null>(null);

  useEffect(() => {
    fetchFeeds();
    fetchUserData();
  }, []);

  // Add a refresh function to re-fetch data when needed
  const refreshFeeds = () => {
    fetchFeeds();
    fetchUserData();
  };

  const fetchFeeds = async () => {
    try {
      const [contentResponse, dropsResponse, walletsResponse, sponsoredResponse] = await Promise.all([
        fetch('/api/content'),
        fetch('/api/drops?limit=10'),
        fetch('/api/users/wallets', { credentials: 'include' }),
        fetch('/api/content/sponsored', { credentials: 'include' })
      ]);

      if (contentResponse.ok) {
        const contentData = await contentResponse.json();
        // Make sure we have an array
        if (Array.isArray(contentData)) {
          setContentFeed(contentData);
        } else {
          console.error('Content data is not an array:', contentData);
          setContentFeed([]);
        }
      } else {
        console.error('Content fetch failed:', contentResponse.status);
        setContentFeed([]);
      }

      if (dropsResponse.ok) {
        const dropsData = await dropsResponse.json();
        if (Array.isArray(dropsData)) {
          setDropFeed(dropsData.slice(0, 5));
        } else {
          setDropFeed([]);
        }
      } else {
        setDropFeed([]);
      }

      if (walletsResponse.ok) {
        const walletsData = await walletsResponse.json();
        setWallets(Array.isArray(walletsData) ? walletsData : []);
      } else {
        setWallets([]);
      }

      if (sponsoredResponse.ok) {
        const sponsoredData = await sponsoredResponse.json();
        setSponsoredContent(Array.isArray(sponsoredData) ? sponsoredData : []);
      } else {
        setSponsoredContent([]);
      }
    } catch (error) {
      console.error('Failed to fetch feeds:', error);
      setContentFeed([]);
      setDropFeed([]);
      setWallets([]);
      setSponsoredContent([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserData = async () => {
    try {
      const response = await fetch('/api/app/users/me', { credentials: 'include' });
      if (response.ok) {
        const data = await response.json();
        setUserData(data);
      }
    } catch (error) {
      console.error('Failed to fetch user data:', error);
    }
  };

  const handleSocialAction = async (action: string, contentId?: number) => {
    try {
      const response = await fetch('/api/users/social-action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          action_type: action,
          reference_id: contentId,
          reference_type: 'content'
        })
      });

      if (response.ok) {
        const data = await response.json();
        showPointsNotification(data);
        fetchUserData(); // Refresh user data
      }
    } catch (error) {
      console.error(`Failed to record ${action} action:`, error);
    }
  };

  const showPointsNotification = (data: any) => {
    const notification = document.createElement('div');
    notification.className = 'fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg z-50 animate-pulse';
    notification.innerHTML = `
      <div class="flex items-center space-x-2">
        <span>+${data.points_earned} points!</span>
        <span class="text-xs">(${data.multiplier.toFixed(1)}x multiplier)</span>
      </div>
    `;
    document.body.appendChild(notification);
    setTimeout(() => {
      if (document.body.contains(notification)) {
        document.body.removeChild(notification);
      }
    }, 3000);
  };

  const handleBuyShares = async (contentId: number, sharesCount: number) => {
    try {
      const response = await fetch('/api/content/buy-shares', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ content_id: contentId, shares_count: sharesCount })
      });

      if (response.ok) {
        await fetchFeeds(); // Refresh data after purchase
      } else {
        throw new Error('Purchase failed');
      }
    } catch (error) {
      console.error('Failed to buy shares:', error);
      throw error;
    }
  };

  const openBuyModal = (content: ContentPieceType) => {
    setSelectedContent(content);
    setBuyModalOpen(true);
  };

  const openShareModal = (content: ContentPieceType) => {
    setShareModalContent({ id: content.id, title: content.title });
    setContentShareModalOpen(true);
  };

  const openCommentModal = (content: ContentPieceType) => {
    setCommentModalContent(content);
    setCommentModalOpen(true);
  };

  const openSavedContentModal = () => {
    setSavedContentModalOpen(true);
  };

  const openExternalMoveModal = (content: ContentPieceType) => {
    setExternalMoveContentData({ 
      id: content.id, 
      title: content.title, 
      platform: content.platform,
      url: content.platform_url 
    });
    setExternalMoveModalOpen(true);
  };

  const openFundingModal = (content: ContentPieceType) => {
    setFundingContentData(content);
    setFundingModalOpen(true);
  };

  const openEditModal = (content: ContentPieceType) => {
    setEditContentData(content);
    setEditContentModalOpen(true);
  };

  const openDeleteConfirm = (content: ContentPieceType) => {
    setContentToDelete(content);
    setDeleteConfirmModalOpen(true);
  };

  const handleEditSuccess = (updatedContent: ContentPieceType) => {
    setEditContentModalOpen(false);
    setEditContentData(null);
    
    // Update content in the local state
    setContentFeed(prev => prev.map(item => 
      item.id === updatedContent.id ? updatedContent : item
    ));
  };

  const handleDeleteConfirm = async () => {
    if (!contentToDelete) return;

    try {
      const response = await fetch(`/api/content/${contentToDelete.id}`, {
        method: 'DELETE',
        credentials: 'include'
      });

      if (response.ok) {
        // Remove content from local state
        setContentFeed(prev => prev.filter(item => item.id !== contentToDelete.id));
        setDeleteConfirmModalOpen(false);
        setContentToDelete(null);
      } else {
        const errorData = await response.json();
        alert(errorData.error || 'Failed to delete content');
      }
    } catch (error) {
      console.error('Error deleting content:', error);
      alert('Failed to delete content');
    }
  };

  const handleFundingSuccess = (newRevenue: number, newSharePrice: number) => {
    setFundingModalOpen(false);
    // Update the content in the local state
    if (fundingContentData) {
      const updatedContent = { 
        ...fundingContentData, 
        current_revenue: newRevenue, 
        share_price: newSharePrice 
      };
      
      // Update content array
      setContentFeed(prev => prev.map(item => 
        item.id === fundingContentData.id ? updatedContent : item
      ));
    }
    setFundingContentData(null);
    fetchUserData(); // Refresh user data to show updated balance
  };

  const getTierIcon = (tier: string) => {
    switch (tier) {
      case 'super': return <Crown className="w-4 h-4 text-yellow-600" />;
      case 'premium': return <Star className="w-4 h-4 text-purple-600" />;
      default: return <Zap className="w-4 h-4 text-gray-600" />;
    }
  };

  const getTierMultiplier = (tier: string) => {
    switch (tier) {
      case 'super': return 2.0;
      case 'premium': return 1.5;
      default: return 1.0;
    }
  };

  const getPointsForAction = (action: string) => {
    // In-app actions now give 1/10th the points of external moves
    const basePoints = { like: 0.1, comment: 0.3, save: 0.5, share: 1 };
    const base = basePoints[action as keyof typeof basePoints] || 0;
    const multiplier = userData ? getTierMultiplier(userData.user_tier) : 1.0;
    return Math.floor(base * multiplier * 10) / 10; // Allow decimals for small amounts
  };

  const getSmartCTA = () => {
    if (!userData) return null;

    // Smart CTA logic based on user state
    if (!userData.master_key_activated_at) {
      return {
        text: "Activate Master Key",
        subtext: "Complete a Proof Drop to unlock premium features",
        action: () => window.location.href = '/earn?type=proof',
        color: "from-orange-500 to-red-500",
        icon: <Target className="w-5 h-5" />
      };
    }

    if (userData.points_streak_days === 0) {
      return {
        text: "Start Your Streak",
        subtext: "Engage with content today to begin earning streaks",
        action: () => setActiveTab('social'),
        color: "from-blue-500 to-purple-500",
        icon: <Flame className="w-5 h-5" />
      };
    }

    if (userData.gems_balance < 10) {
      return {
        text: "Get More Gems",
        subtext: "Purchase gems to access paid drops and predictions",
        action: () => window.location.href = '/invest/portfolio',
        color: "from-purple-500 to-pink-500",
        icon: <Diamond className="w-5 h-5" />
      };
    }

    return {
      text: "Explore Growth Hub",
      subtext: "Stake gems, fund projects, and secure your earnings",
      action: () => window.location.href = '/growth-hub',
      color: "from-green-500 to-emerald-500",
      icon: <TrendingUp className="w-5 h-5" />
    };
  };

  const getForYouFeed = () => {
    // Mix content and drops in a personalized order
    const mixedFeed = [];
    
    // Add sponsored content first (highest priority)
    sponsoredContent.forEach(content => {
      mixedFeed.push({ type: 'content', data: content, isSponsored: true });
    });
    
    // Add high-value opportunities
    const highValueDrops = dropFeed.filter(drop => drop.gem_reward_base >= 50);
    const trendingContent = contentFeed.filter(content => 
      content.available_shares > 0 && 
      !sponsoredContent.some(sponsored => sponsored.id === content.id)
    );
    
    // Interleave content and drops
    for (let i = 0; i < Math.max(trendingContent.length, highValueDrops.length); i++) {
      if (trendingContent[i]) mixedFeed.push({ type: 'content', data: trendingContent[i] });
      if (highValueDrops[i]) mixedFeed.push({ type: 'drop', data: highValueDrops[i] });
    }
    
    return mixedFeed.slice(0, 10); // Limit to 10 items for better UX
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin w-12 h-12 border-3 border-orange-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading your personalized feed...</p>
        </div>
      </div>
    );
  }

  const smartCTA = getSmartCTA();

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Personalized Dashboard Header */}
      <div className="bg-gradient-to-br from-orange-500 via-red-500 to-pink-500 rounded-2xl p-6 text-white relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='white' fill-opacity='0.05'%3E%3Cpath d='M20 20c0 11.046-8.954 20-20 20v-40c11.046 0 20 8.954 20 20z'/%3E%3C/g%3E%3C/svg%3E")`,
          opacity: 0.3
        }}></div>
        
        <div className="relative">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold mb-2">
                Welcome back, {user?.google_user_data?.given_name}! 👋
              </h1>
              <p className="text-orange-100 text-sm sm:text-base">
                Ready to turn your influence into income?
              </p>
            </div>
            {userData && (
              <div className="text-right">
                <div className="flex items-center space-x-2 justify-end mb-1">
                  {getTierIcon(userData.user_tier)}
                  <span className="text-sm font-semibold capitalize">
                    {userData.user_tier}
                  </span>
                </div>
                <div className="text-xs text-orange-200">
                  {getTierMultiplier(userData.user_tier)}x multiplier
                </div>
                {userData.points_streak_days > 0 && (
                  <div className="flex items-center justify-end space-x-1 mt-1">
                    <Flame className="w-3 h-3 text-orange-300" />
                    <span className="text-xs text-orange-200">
                      {userData.points_streak_days} day streak
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Quick Stats Grid */}
          {userData && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mb-6">
              {[
                { value: (userData.points_balance || 0).toLocaleString(), label: 'Points', icon: <Coins className="w-4 h-4" />, color: 'text-blue-200' },
                { value: userData.keys_balance || 0, label: 'Keys', icon: <Target className="w-4 h-4" />, color: 'text-orange-200' },
                { value: (userData.gems_balance || 0).toFixed(1), label: 'Gems', icon: <Diamond className="w-4 h-4" />, color: 'text-purple-200' },
                { value: 'View', label: 'Saved', icon: <Bookmark className="w-4 h-4" />, color: 'text-green-200', action: openSavedContentModal }
              ].map((stat, index) => (
                <div 
                  key={index} 
                  className={`bg-white/10 backdrop-blur-sm rounded-xl p-3 text-center ${(stat as any).action ? 'cursor-pointer hover:bg-white/20 transition-colors' : ''}`}
                  onClick={(stat as any).action || undefined}
                >
                  <div className="flex items-center justify-center space-x-1 mb-1">
                    <span className={stat.color}>{stat.icon}</span>
                    <span className="text-xs text-white/80">{stat.label}</span>
                  </div>
                  <p className="text-lg sm:text-xl font-bold text-white">{stat.value}</p>
                </div>
              ))}
            </div>
          )}

          {/* Smart CTA */}
          {smartCTA && (
            <button
              onClick={smartCTA.action}
              className={`w-full bg-gradient-to-r ${smartCTA.color} hover:shadow-lg text-white rounded-xl p-4 transition-all duration-200 hover:-translate-y-0.5`}
            >
              <div className="flex items-center justify-between">
                <div className="text-left">
                  <div className="flex items-center space-x-2 mb-1">
                    {smartCTA.icon}
                    <span className="font-semibold">{smartCTA.text}</span>
                  </div>
                  <p className="text-white/90 text-sm">{smartCTA.subtext}</p>
                </div>
                <ArrowRight className="w-5 h-5 opacity-75" />
              </div>
            </button>
          )}
        </div>
      </div>

      {/* Enhanced Feed Tabs */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="border-b border-gray-200">
          <nav className="flex">
            {[
              { key: 'for-you', label: 'For You', icon: <Star className="w-4 h-4" /> },
              { key: 'social', label: 'Social Feed', icon: <Activity className="w-4 h-4" /> },
              { key: 'drops', label: 'Opportunities', icon: <DollarSign className="w-4 h-4" /> }
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as any)}
                className={`flex-1 flex items-center justify-center space-x-2 py-4 px-6 font-medium text-sm transition-colors ${
                  activeTab === tab.key
                    ? 'border-b-2 border-orange-500 text-orange-600 bg-orange-50'
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {/* For You Tab - Personalized Mix */}
          {activeTab === 'for-you' && (
            <div className="space-y-6">
              {getForYouFeed().length > 0 ? (
                <>
                  <div className="flex items-center space-x-2 mb-6">
                    <Flame className="w-5 h-5 text-orange-500" />
                    <h3 className="text-lg font-semibold text-gray-900">Trending opportunities for you</h3>
                  </div>
                  {getForYouFeed().map((item, index) => (
                    <div key={index}>
                      {item.type === 'content' ? (
                        <ContentCard 
                          content={item.data as ContentPieceType}
                          onBuyShares={openBuyModal}
                          onShare={openShareModal}
                          onExternalMove={openExternalMoveModal}
                          onFunding={openFundingModal}
                          onSocialAction={handleSocialAction}
                          getPointsForAction={getPointsForAction}
                          isPersonalized={true}
                          currentUser={userData}
                          onEdit={openEditModal}
                          onDelete={openDeleteConfirm}
                          onComment={openCommentModal}
                          isSponsored={(item as any).isSponsored}
                        />
                      ) : (
                        <EnhancedDropCard drop={item.data as DropType} />
                      )}
                    </div>
                  ))}
                </>
              ) : (
                <PersonalizedEmptyState />
              )}
            </div>
          )}

          {/* Social Feed Tab */}
          {activeTab === 'social' && (
            <div className="space-y-6">
              {/* Debug info and refresh button */}
              <div className="flex items-center justify-between bg-blue-50 border border-blue-200 rounded-lg p-3">
                <div className="text-sm text-blue-700">
                  Showing {contentFeed.length} content pieces
                </div>
                <button 
                  onClick={refreshFeeds}
                  className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                >
                  Refresh Feed
                </button>
              </div>
              
              {contentFeed.length > 0 ? (
                // Show sponsored content first, then regular content
                [
                  ...sponsoredContent.map((content) => (
                    <ContentCard 
                      key={`sponsored-${content.id}`}
                      content={content} 
                      onBuyShares={openBuyModal}
                      onShare={openShareModal}
                      onExternalMove={openExternalMoveModal}
                      onFunding={openFundingModal}
                      onSocialAction={handleSocialAction}
                      getPointsForAction={getPointsForAction}
                      currentUser={userData}
                      onEdit={openEditModal}
                      onDelete={openDeleteConfirm}
                      onComment={openCommentModal}
                      isSponsored={true}
                    />
                  )),
                  ...contentFeed
                    .filter(content => !sponsoredContent.some(sponsored => sponsored.id === content.id))
                    .map((content) => (
                      <ContentCard 
                        key={content.id} 
                        content={content} 
                        onBuyShares={openBuyModal}
                        onShare={openShareModal}
                        onExternalMove={openExternalMoveModal}
                        onFunding={openFundingModal}
                        onSocialAction={handleSocialAction}
                        getPointsForAction={getPointsForAction}
                        currentUser={userData}
                        onEdit={openEditModal}
                        onDelete={openDeleteConfirm}
                        onComment={openCommentModal}
                      />
                    ))
                ]
              ) : (
                <div className="text-center py-12">
                  <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <TrendingUp className="w-12 h-12 text-gray-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">No content yet</h3>
                  <p className="text-gray-600 mb-4">Be the first to create and share content!</p>
                  <div className="space-y-3">
                    <button 
                      onClick={() => window.location.href = '/create'}
                      className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white px-6 py-3 rounded-lg font-medium transition-all duration-200 flex items-center space-x-2 mx-auto"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Create Content</span>
                    </button>
                    <button 
                      onClick={refreshFeeds}
                      className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                    >
                      Check for new content
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Opportunities/Drops Tab */}
          {activeTab === 'drops' && (
            <div className="space-y-4">
              {dropFeed.length > 0 ? (
                dropFeed.map((drop) => (
                  <EnhancedDropCard key={drop.id} drop={drop} />
                ))
              ) : (
                <div className="text-center py-12">
                  <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <DollarSign className="w-12 h-12 text-gray-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">No opportunities available</h3>
                  <p className="text-gray-600 mb-4">Check back later for new earning opportunities!</p>
                  <button 
                    onClick={() => window.location.href = '/earn'}
                    className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white px-6 py-3 rounded-lg font-medium transition-all duration-200"
                  >
                    Browse All Opportunities
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      {selectedContent && (
        <BuySharesModal
          content={selectedContent}
          wallet={wallets.find(w => w.currency_type === 'USD')}
          isOpen={buyModalOpen}
          onClose={() => {
            setBuyModalOpen(false);
            setSelectedContent(null);
          }}
          onPurchase={handleBuyShares}
        />
      )}

      {selectedForecast && (
        <PlaceForecastModal
          forecast={selectedForecast}
          isOpen={forecastModalOpen}
          onClose={() => {
            setForecastModalOpen(false);
            setSelectedForecast(null);
          }}
          onPredictionPlaced={() => {
            setForecastModalOpen(false);
            setSelectedForecast(null);
            fetchUserData(); // Refresh user data to update balance
          }}
        />
      )}

      <ShareContentModal
        user={userData}
        contentId={shareContentData?.id}
        contentTitle={shareContentData?.title}
        isOpen={shareModalOpen}
        onClose={() => {
          setShareModalOpen(false);
          setShareContentData(null);
        }}
        onSuccess={() => {
          fetchUserData();
          fetchFeeds();
        }}
      />

      <ExternalMoveModal
        user={userData}
        contentId={externalMoveContentData?.id}
        contentTitle={externalMoveContentData?.title}
        contentPlatform={externalMoveContentData?.platform}
        contentUrl={externalMoveContentData?.url}
        isOpen={externalMoveModalOpen}
        onClose={() => {
          setExternalMoveModalOpen(false);
          setExternalMoveContentData(null);
        }}
        onSuccess={() => {
          fetchUserData();
          fetchFeeds();
        }}
      />

      <ContentFundingModal
        isOpen={fundingModalOpen}
        onClose={() => {
          setFundingModalOpen(false);
          setFundingContentData(null);
        }}
        contentId={fundingContentData?.id || 0}
        contentTitle={fundingContentData?.title || ''}
        isOwner={false}
        currentRevenue={fundingContentData?.current_revenue || 0}
        sharePrice={fundingContentData?.share_price || 0}
        totalShares={fundingContentData?.total_shares || 0}
        onSuccess={handleFundingSuccess}
      />

      {editContentData && (
        <EditContentModal
          isOpen={editContentModalOpen}
          onClose={() => {
            setEditContentModalOpen(false);
            setEditContentData(null);
          }}
          onSuccess={handleEditSuccess}
          content={editContentData}
        />
      )}

      <ConfirmationModal
        isOpen={deleteConfirmModalOpen}
        onClose={() => {
          setDeleteConfirmModalOpen(false);
          setContentToDelete(null);
        }}
        onConfirm={handleDeleteConfirm}
        title="Delete Content"
        message={`Are you sure you want to delete "${contentToDelete?.title}"? This action cannot be undone and will remove all associated data.`}
        confirmText="Delete"
        cancelText="Cancel"
        type="danger"
      />

      {/* Share Modal */}
      {shareModalContent && (
        <ShareModal
          isOpen={contentShareModalOpen}
          onClose={() => {
            setContentShareModalOpen(false);
            setShareModalContent(null);
          }}
          contentId={shareModalContent.id}
          contentTitle={shareModalContent.title}
        />
      )}

      {/* Saved Content Modal */}
      <SavedContentModal
        isOpen={savedContentModalOpen}
        onClose={() => setSavedContentModalOpen(false)}
        user={userData}
      />

      {/* Comment Modal */}
      {commentModalOpen && commentModalContent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[80vh] flex flex-col">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">Comments</h2>
              <button
                onClick={() => {
                  setCommentModalOpen(false);
                  setCommentModalContent(null);
                }}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-6">
              <CommentSystem
                contentId={commentModalContent.id}
                currentUser={userData}
                isOwner={userData?.id === commentModalContent.creator_id}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Enhanced Components

interface ContentCardProps {
  content: ContentPieceType;
  onBuyShares: (content: ContentPieceType) => void;
  onShare: (content: ContentPieceType) => void;
  onExternalMove: (content: ContentPieceType) => void;
  onFunding: (content: ContentPieceType) => void;
  onSocialAction: (action: string, contentId?: number) => void;
  getPointsForAction: (action: string) => number;
  isPersonalized?: boolean;
  currentUser?: UserType | null;
  onEdit?: (content: ContentPieceType) => void;
  onDelete?: (content: ContentPieceType) => void;
  onComment?: (content: ContentPieceType) => void;
  isSponsored?: boolean;
}

function ContentCard({ content, onBuyShares, onShare, onExternalMove, onFunding, onSocialAction, getPointsForAction, isPersonalized = false, currentUser, onEdit, onDelete, onComment, isSponsored = false }: ContentCardProps) {
  const [userStatus, setUserStatus] = useState<{ has_liked: boolean; has_saved: boolean }>({ has_liked: false, has_saved: false });
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    if (currentUser) {
      fetchUserStatus();
    }
  }, [content.id, currentUser]);

  const fetchUserStatus = async () => {
    try {
      const response = await fetch(`/api/content/${content.id}/user-status`, {
        credentials: 'include'
      });
      if (response.ok) {
        const status = await response.json();
        setUserStatus(status);
      }
    } catch (error) {
      console.error('Failed to fetch user status:', error);
    }
  };

  const handleLocalAction = async (action: string) => {
    if (!currentUser || actionLoading) return;
    
    setActionLoading(true);
    try {
      if (action === 'comment') {
        onComment?.(content);
        return;
      }
      
      if (action === 'share') {
        onShare(content);
        return;
      }

      if (action === 'like' && userStatus.has_liked) {
        alert('You have already liked this content!');
        return;
      }

      if (action === 'save' && userStatus.has_saved) {
        alert('Content already saved to your collection!');
        return;
      }

      await onSocialAction(action, content.id);
      await fetchUserStatus();
    } catch (error) {
      console.error(`Error with ${action}:`, error);
    } finally {
      setActionLoading(false);
    }
  };
  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case 'instagram': return '📷';
      case 'tiktok': return '🎵';
      case 'youtube': return '📺';
      case 'twitter': return '🐦';
      case 'linkedin': return '💼';
      default: return '📱';
    }
  };

  const getRandomLikes = () => Math.floor(Math.random() * 5000) + 100;
  const getRandomComments = () => Math.floor(Math.random() * 500) + 10;
  const getRandomShares = () => Math.floor(Math.random() * 200) + 5;
  const getRandomViews = () => Math.floor(Math.random() * 50000) + 1000;

  const handleContentClick = () => {
    window.location.href = `/content/${content.id}`;
  };

  // Check if this is demo content
  const isDemo = content.title?.toLowerCase().includes('[demo]') || 
                 content.title?.toLowerCase().includes('demo') ||
                 content.description?.toLowerCase().includes('demo');

  // Check if current user owns this content
  const isOwner = currentUser && (
    currentUser.id === content.creator_id || 
    currentUser.username === content.creator_name ||
    currentUser.display_name === content.creator_name
  );

  return (
    <div className={`bg-white border rounded-2xl overflow-hidden hover:shadow-lg transition-all duration-200 hover:-translate-y-1 ${
      isDemo ? 'border-orange-300 bg-orange-50/30' : 
      isSponsored ? 'border-purple-300 bg-purple-50/20 ring-2 ring-purple-200' : 'border-gray-200'
    } ${isPersonalized && !isSponsored ? 'ring-2 ring-orange-200' : ''}`}>
      {/* Demo Banner */}
      {isDemo && (
        <div className="bg-gradient-to-r from-orange-500 to-amber-500 text-white px-4 py-2 text-center">
          <div className="flex items-center justify-center space-x-2 text-sm font-medium">
            <span>🧪</span>
            <span>DEMO CONTENT - For testing purposes only</span>
            <span>🧪</span>
          </div>
        </div>
      )}

      {/* Enhanced Sponsored Badge */}
      {isSponsored && !isDemo && (
        <div className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-4 py-2 text-center">
          <div className="flex items-center justify-center space-x-2 text-sm font-medium">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
            <span>Sponsored</span>
            {(content as any).sponsor_count > 1 && (
              <span className="bg-white/20 px-2 py-1 rounded-full text-xs">
                {(content as any).sponsor_count} sponsors
              </span>
            )}
          </div>
          {(content as any).sponsor_names && (
            <div className="text-xs text-purple-100 mt-1 flex items-center space-x-1">
              {(content as any).sponsor_logos && (content as any).sponsor_logos.split(',')[0] && (
                <img 
                  src={(content as any).sponsor_logos.split(',')[0]} 
                  alt="Sponsor" 
                  className="w-4 h-4 rounded-full border border-white/20"
                />
              )}
              <span>
                by {(content as any).sponsor_names.split(',').slice(0, 2).join(', ')}
                {(content as any).sponsor_names.split(',').length > 2 && ` +${(content as any).sponsor_names.split(',').length - 2} more`}
              </span>
            </div>
          )}
        </div>
      )}

      {/* Personalized Badge */}
      {isPersonalized && !isDemo && !isSponsored && (
        <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-2 text-center">
          <div className="flex items-center justify-center space-x-2 text-sm font-medium">
            <Star className="w-4 h-4" />
            <span>Recommended for you</span>
            <Star className="w-4 h-4" />
          </div>
        </div>
      )}

      {/* Header */}
      <div className="p-4 pb-2">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white text-xl shadow-lg overflow-hidden">
            {((content as any).display_avatar || content.creator_avatar) ? (
              <img 
                src={(content as any).display_avatar || content.creator_avatar} 
                alt="Creator" 
                className="w-full h-full object-cover"
              />
            ) : (
              getPlatformIcon(content.platform)
            )}
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <UserLink 
                username={content.creator_name}
                displayName={(content as any).display_name || content.creator_name || 'Creator'}
                avatarUrl={(content as any).display_avatar || content.creator_avatar}
                className="font-semibold text-gray-900 hover:text-orange-600 transition-colors"
                showAvatar={false}
              />
              <div className="flex items-center space-x-2">
                {isOwner && (
                  <div className="flex items-center space-x-1">
                    <Tooltip content="Edit content" compact={true}>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onEdit?.(content);
                        }}
                        className="p-1 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded transition-colors"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                    </Tooltip>
                    <Tooltip content="Delete content" compact={true}>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onDelete?.(content);
                        }}
                        className="p-1 text-red-600 hover:text-red-700 hover:bg-red-50 rounded transition-colors"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </Tooltip>
                  </div>
                )}
                {isDemo && (
                  <span className="bg-orange-100 text-orange-700 px-2 py-1 rounded-full text-xs font-medium">
                    DEMO
                  </span>
                )}
                <span className="text-sm text-gray-500 capitalize bg-gray-100 px-2 py-1 rounded-full">{content.platform}</span>
              </div>
            </div>
            <p className="text-sm text-gray-500 flex items-center space-x-1">
              <Clock className="w-3 h-3" />
              <span>2 hours ago</span>
            </p>
          </div>
        </div>
      </div>

      {/* Content Image */}
      {content.media_url && (
        <div className="relative cursor-pointer group" onClick={handleContentClick}>
          <img 
            src={content.media_url} 
            alt={content.title}
            className="w-full h-80 object-cover group-hover:scale-105 transition-transform duration-200"
          />
          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all duration-200" />
          {/* View indicator */}
          <div className="absolute top-3 right-3 bg-black/50 backdrop-blur-sm text-white px-2 py-1 rounded-full text-xs flex items-center space-x-1">
            <Eye className="w-3 h-3" />
            <span>{getRandomViews().toLocaleString()}</span>
          </div>
        </div>
      )}

      {/* Content Details */}
      <div className="p-4">
        <h4 className="font-bold text-gray-900 mb-2 cursor-pointer hover:text-purple-600 transition-colors text-lg" onClick={handleContentClick}>
          {content.title}
        </h4>
        
        {content.description && (
          <p className="text-gray-600 text-sm mb-4 line-clamp-2">{content.description}</p>
        )}

        {/* Prominent External Move Button */}
        <div className="mb-4">
          <Tooltip content="Perform external action for 10x points!" position="top">
            <button
              onClick={() => onExternalMove(content)}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-4 py-4 rounded-xl font-semibold transition-all duration-200 flex items-center justify-center space-x-3 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              <span className="text-xl">🚀</span>
              <span>Perform External Move</span>
              <span className="bg-white/20 px-3 py-1 rounded-full text-sm font-bold">10x Points!</span>
            </button>
          </Tooltip>
        </div>

        {/* Enhanced Engagement Actions */}
        <div className="bg-gray-50 rounded-xl p-3 mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-gray-600 uppercase tracking-wide">Quick Actions</span>
            <span className="text-xs text-gray-400">Reduced points</span>
          </div>
          <div className="grid grid-cols-4 gap-2">
            {[
              { action: 'like', icon: Heart, count: getRandomLikes(), color: 'hover:text-red-500' },
              { action: 'comment', icon: MessageCircle, count: getRandomComments(), color: 'hover:text-blue-500' },
              { action: 'share', icon: Share2, count: getRandomShares(), color: 'hover:text-green-500' },
              { action: 'save', icon: Bookmark, count: null, color: 'hover:text-yellow-500' }
            ].map(({ action, icon: Icon, count, color }) => (
              <Tooltip key={action} content={`+${getPointsForAction(action)} points`} compact={true}>
                <button 
                  onClick={() => handleLocalAction(action)}
                  className={`flex flex-col items-center p-2 rounded-lg ${color} transition-colors hover:bg-white`}
                >
                  <Icon className="w-4 h-4 mb-1" />
                  {count && <span className="text-xs text-gray-600">{count.toLocaleString()}</span>}
                  <span className="text-xs text-green-600 font-medium">+{getPointsForAction(action)}</span>
                </button>
              </Tooltip>
            ))}
          </div>
        </div>

        {/* Engagement Shares Available */}
        {(content as any).engagement_shares_remaining > 0 && (
          <div className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-xl p-3 mb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Coins className="w-4 h-4 text-purple-600" />
                <span className="text-sm font-medium text-purple-900">
                  {(content as any).engagement_shares_remaining} free shares available
                </span>
              </div>
              <div className="text-xs text-purple-600 font-medium">
                Limited time!
              </div>
            </div>
            <p className="text-xs text-purple-700 mt-1">
              Earn a free share by engaging with this content
            </p>
          </div>
        )}

        {/* Enhanced Investment Info */}
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-4 border border-green-200">
          <div className="grid grid-cols-3 gap-4 mb-3">
            <div className="text-center">
              <p className="text-xs text-gray-600 mb-1">Share Price</p>
              <p className="font-bold text-green-600">${content.share_price.toFixed(4)}</p>
            </div>
            <div className="text-center">
              <p className="text-xs text-gray-600 mb-1">Available</p>
              <p className="font-bold text-gray-900">{content.available_shares}</p>
            </div>
            <div className="text-center">
              <p className="text-xs text-gray-600 mb-1">Revenue</p>
              <p className="font-bold text-purple-600">${content.current_revenue.toFixed(2)}</p>
            </div>
          </div>
          
          <div className="flex space-x-2">
            <Tooltip content={isDemo ? "Demo content - no real value transfers" : "Tip creator & boost value"}>
              <button 
                onClick={() => onFunding(content)}
                className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center space-x-1 ${
                  isDemo 
                    ? 'bg-orange-100 hover:bg-orange-200 text-orange-700' 
                    : 'bg-green-100 hover:bg-green-200 text-green-700'
                }`}
              >
                <Gift className="w-4 h-4" />
                <span>{isDemo ? 'Demo Tip' : 'Tip'}</span>
              </button>
            </Tooltip>
            <Tooltip content="Predict performance & earn">
              <button 
                onClick={() => window.location.href = '/invest/social-forecasts'}
                className="flex-1 bg-blue-100 hover:bg-blue-200 text-blue-700 px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center space-x-1"
              >
                <Target className="w-4 h-4" />
                <span>Forecast</span>
              </button>
            </Tooltip>
            <Tooltip content={content.available_shares === 0 ? "Sold out" : isDemo ? "Demo content - no real shares" : "Invest in performance"}>
              <button 
                onClick={() => onBuyShares(content)}
                disabled={content.available_shares === 0}
                className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center justify-center space-x-1 ${
                  isDemo
                    ? 'bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white'
                    : 'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                <TrendingUp className="w-4 h-4" />
                <span>{content.available_shares === 0 ? 'Sold Out' : isDemo ? 'Demo' : 'Invest'}</span>
              </button>
            </Tooltip>
          </div>
        </div>
      </div>
    </div>
  );
}

function EnhancedDropCard({ drop }: { drop: DropType }) {
  const getDropTypeImage = (dropType: string) => {
    // Use the drop's content_url if available, otherwise fallback to default images
    if (drop?.content_url) {
      return drop.content_url;
    }
    
    switch (dropType) {
      case 'content_clipping': return 'https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=400&h=250&fit=crop';
      case 'reviews': return 'https://images.unsplash.com/photo-1556155092-490a1ba16284?w=400&h=250&fit=crop';
      case 'ugc_creation': return 'https://images.unsplash.com/photo-1558403194-611308249627?w=400&h=250&fit=crop';
      case 'affiliate_referral': return 'https://images.unsplash.com/photo-1516251193007-45ef944ab0c6?w=400&h=250&fit=crop';
      case 'surveys': return 'https://images.unsplash.com/photo-1432888622747-4eb9a8efeb07?w=400&h=250&fit=crop';
      case 'challenges_events': return 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400&h=250&fit=crop';
      default: return 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400&h=250&fit=crop';
    }
  };

  const handleDropClick = () => {
    console.log('Navigating to drop detail:', drop.id);
    window.location.href = `/drops/${drop.id}`;
  };

  // Check if this is demo content
  const isDemo = drop.title?.toLowerCase().includes('[demo]') || 
                 drop.title?.toLowerCase().includes('demo') ||
                 drop.description?.toLowerCase().includes('demo');

  const isHighValue = drop.gem_reward_base >= 50;

  return (
    <div className={`bg-white rounded-2xl overflow-hidden border hover:shadow-lg transition-all duration-200 hover:-translate-y-1 ${
      isDemo ? 'border-orange-300 bg-orange-50/30' : 
      isHighValue ? 'border-purple-300 bg-purple-50/30' : 'border-gray-200'
    }`}>
      {/* Demo Banner for Drop Cards */}
      {isDemo && (
        <div className="bg-gradient-to-r from-orange-500 to-amber-500 text-white px-3 py-2 text-center">
          <span className="text-sm font-medium">🧪 DEMO DROP - No real gems earned</span>
        </div>
      )}

      {/* High Value Banner */}
      {isHighValue && !isDemo && (
        <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-3 py-2 text-center">
          <div className="flex items-center justify-center space-x-2 text-sm font-medium">
            <Star className="w-4 h-4" />
            <span>HIGH VALUE OPPORTUNITY</span>
            <Star className="w-4 h-4" />
          </div>
        </div>
      )}

      <div className="relative cursor-pointer group" onClick={handleDropClick}>
        <img 
          src={getDropTypeImage(drop.drop_type)} 
          alt={drop.title}
          className="w-full h-40 object-cover group-hover:scale-105 transition-transform duration-200"
        />
        <div className="absolute inset-0 bg-black bg-opacity-20 group-hover:bg-opacity-30 transition-all duration-200" />
        
        {/* Enhanced badges */}
        <div className="absolute top-3 right-3 flex flex-col space-y-2">
          {isDemo && (
            <span className="bg-orange-500/90 backdrop-blur-sm text-white px-2 py-1 rounded-full text-xs font-medium">
              DEMO
            </span>
          )}
          <span className={`px-2 py-1 rounded-full text-xs font-medium backdrop-blur-sm ${
            drop.difficulty === 'easy' ? 'bg-green-500/90 text-white' :
            drop.difficulty === 'medium' ? 'bg-yellow-500/90 text-white' :
            'bg-red-500/90 text-white'
          }`}>
            {drop.difficulty.toUpperCase()}
          </span>
        </div>
        
        <div className="absolute top-3 left-3">
          {drop.is_proof_drop ? (
            <div className="bg-green-500/90 backdrop-blur-sm px-3 py-1 rounded-full">
              <span className="text-white text-sm font-medium">Proof Drop</span>
            </div>
          ) : drop.is_paid_drop ? (
            <div className="bg-purple-500/90 backdrop-blur-sm px-3 py-1 rounded-full">
              <span className="text-white text-sm font-medium">Paid Drop</span>
            </div>
          ) : (
            <div className="flex items-center space-x-1 bg-orange-500/90 backdrop-blur-sm px-3 py-1 rounded-full">
              <Target className="w-3 h-3 text-white" />
              <span className="text-white text-sm font-medium">{drop.key_cost} keys</span>
            </div>
          )}
        </div>
        
        <div className="absolute bottom-3 left-3">
          <div className="bg-black/50 backdrop-blur-sm rounded-xl px-3 py-2">
            <p className="text-2xl font-bold text-white drop-shadow-lg flex items-center space-x-1">
              <Diamond className="w-5 h-5" />
              <span>{drop.gem_reward_base} gems</span>
              {isDemo && <span className="text-sm opacity-80">(Demo)</span>}
            </p>
          </div>
        </div>
      </div>
      
      <div className="p-4">
        <div className="flex items-start space-x-3 mb-3">
          <div className="w-8 h-8 rounded-full overflow-hidden bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center">
            {((drop as any).display_avatar || (drop as any).creator_avatar) ? (
              <img 
                src={(drop as any).display_avatar || (drop as any).creator_avatar} 
                alt="Advertiser" 
                className="w-full h-full object-cover"
              />
            ) : (
              <Star className="w-4 h-4 text-white" />
            )}
          </div>
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-1">
              <h4 className="font-bold text-gray-900 cursor-pointer hover:text-orange-600 transition-colors" onClick={handleDropClick}>
                {drop.title}
              </h4>
              {(drop as any).brand_name && (
                <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full font-medium">
                  {(drop as any).brand_name}
                </span>
              )}
            </div>
            <p className="text-sm text-gray-600 line-clamp-2">{drop.description}</p>
            {((drop as any).display_name && (drop as any).display_name !== drop.title) && (
              <p className="text-xs text-gray-500 mt-1">
                by {(drop as any).display_name}
              </p>
            )}
          </div>
        </div>
        
        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
          <div className="flex items-center space-x-4 text-xs text-gray-500">
            <span className="bg-gray-100 px-2 py-1 rounded-full font-medium">
              {drop.drop_type.replace(/_/g, ' ').replace(/\b\w/g, (letter: string) => letter.toUpperCase())}
            </span>
            {drop.time_commitment && (
              <div className="flex items-center space-x-1">
                <Clock className="w-3 h-3" />
                <span>{drop.time_commitment}</span>
              </div>
            )}
          </div>
          <button 
            onClick={handleDropClick}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 shadow-md hover:shadow-lg ${
              isHighValue 
                ? 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white'
                : 'bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white'
            }`}
          >
            View Details
          </button>
        </div>
      </div>
    </div>
  );
}

function PersonalizedEmptyState() {
  return (
    <div className="text-center py-16">
      <div className="w-32 h-32 bg-gradient-to-br from-orange-100 to-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
        <Star className="w-16 h-16 text-orange-500" />
      </div>
      <h3 className="text-2xl font-bold text-gray-900 mb-3">Your personalized feed is loading</h3>
      <p className="text-gray-600 mb-6 max-w-md mx-auto">
        We're curating the best opportunities based on your interests and earning potential.
      </p>
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <button 
          onClick={() => window.location.href = '/earn'}
          className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white px-6 py-3 rounded-lg font-medium transition-all duration-200 flex items-center space-x-2"
        >
          <DollarSign className="w-4 h-4" />
          <span>Browse All Opportunities</span>
        </button>
        <button 
          onClick={() => window.location.href = '/create'}
          className="border border-gray-300 hover:border-gray-400 text-gray-700 hover:text-gray-900 px-6 py-3 rounded-lg font-medium transition-all duration-200 flex items-center space-x-2"
        >
          <Plus className="w-4 h-4" />
          <span>Create Content</span>
        </button>
      </div>
    </div>
  );
}
