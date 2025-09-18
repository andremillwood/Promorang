import { useEffect, useState } from 'react';
import { 
  TrendingUp, 
  DollarSign, 
  Plus,
  Lock,
  Shield,
  Rocket,
  Target,
  Star,
  Diamond,
  Coins,
  BarChart3,
  PieChart,
  AlertCircle,
  CheckCircle,
  Calculator,
  Lightbulb,
  Heart
} from 'lucide-react';
import { UserType } from '@/shared/types';
import { 
  ActivityBreakdown, 
  TrendLine,
  KPICard 
} from '@/react-app/components/AnalyticsCharts';
import StakingModal from '@/react-app/components/StakingModal';
import FundingProjectModal from '@/react-app/components/FundingProjectModal';
import SocialShieldModal from '@/react-app/components/SocialShieldModal';

interface GrowthChannel {
  id: string;
  name: string;
  description: string;
  lockPeriod: number; // days
  baseMultiplier: number;
  riskLevel: 'low' | 'medium' | 'high';
  minDeposit: number;
  maxDeposit: number;
  totalDeposited: number;
  participantCount: number;
  expectedApr: number;
  icon: any;
  color: string;
  features: string[];
}

interface StakingPosition {
  id: number;
  channelId: string;
  amount: number;
  multiplier: number;
  lockUntil: string;
  earnedSoFar: number;
  status: 'active' | 'completed' | 'withdrawable';
}

interface FundingProject {
  id: number;
  creatorId: number;
  creatorName: string;
  creatorAvatar: string;
  title: string;
  description: string;
  category: string;
  fundingGoal: number;
  currentFunding: number;
  backerCount: number;
  daysLeft: number;
  minPledge: number;
  rewardTiers: Array<{
    amount: number;
    title: string;
    description: string;
    estimatedDelivery: string;
    backerCount: number;
  }>;
  featured: boolean;
  status: 'active' | 'funded' | 'cancelled';
}

interface SocialShieldPolicy {
  id: string;
  name: string;
  coverage: {
    platformBan: boolean;
    algorithmChange: boolean;
    contentStrike: boolean;
    monetizationLoss: boolean;
    followerLoss: boolean;
  };
  monthlyPremium: number;
  maxCoverage: number;
  deductible: number;
  platforms: string[];
  minFollowers: number;
}

export default function GrowthHub() {
  const [userData, setUserData] = useState<UserType | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'channels' | 'funding' | 'shield' | 'economy'>('overview');
  const [stakingPositions, setStakingPositions] = useState<StakingPosition[]>([]);
  const [fundingProjects, setFundingProjects] = useState<FundingProject[]>([]);
  const [selectedChannel, setSelectedChannel] = useState<GrowthChannel | null>(null);
  
  const [showStakingModal, setShowStakingModal] = useState(false);
  const [showFundingModal, setShowFundingModal] = useState(false);
  const [showShieldModal, setShowShieldModal] = useState(false);

  useEffect(() => {
    fetchGrowthHubData();
  }, []);

  const fetchGrowthHubData = async () => {
    try {
      const userResponse = await fetch('/api/app/users/me', { credentials: 'include' });
      if (userResponse.ok) {
        const user = await userResponse.json();
        setUserData(user);
      }

      // Mock data for now - these would be real API calls
      setStakingPositions([
        {
          id: 1,
          channelId: 'stable',
          amount: 500,
          multiplier: 1.2,
          lockUntil: '2025-12-15',
          earnedSoFar: 45.5,
          status: 'active'
        },
        {
          id: 2,
          channelId: 'growth',
          amount: 200,
          multiplier: 1.8,
          lockUntil: '2025-11-30',
          earnedSoFar: 28.3,
          status: 'active'
        }
      ]);

      setFundingProjects([
        {
          id: 1,
          creatorId: 1,
          creatorName: 'Alex Rivera',
          creatorAvatar: '/api/placeholder/32/32',
          title: 'Revolutionary Content Creation Studio',
          description: 'Building a state-of-the-art content creation studio with AI-powered editing tools and virtual reality capabilities.',
          category: 'Technology',
          fundingGoal: 50000,
          currentFunding: 32750,
          backerCount: 127,
          daysLeft: 18,
          minPledge: 25,
          rewardTiers: [
            { amount: 25, title: 'Early Access', description: 'Get early access to studio tools', estimatedDelivery: 'March 2025', backerCount: 45 },
            { amount: 100, title: 'Pro Tools', description: 'Professional editing suite license', estimatedDelivery: 'February 2025', backerCount: 32 },
            { amount: 500, title: 'Studio Visit', description: 'Exclusive studio tour and workshop', estimatedDelivery: 'April 2025', backerCount: 8 }
          ],
          featured: true,
          status: 'active'
        },
        {
          id: 2,
          creatorId: 2,
          creatorName: 'Maria Santos',
          creatorAvatar: '/api/placeholder/32/32',
          title: 'Sustainable Fashion Documentary',
          description: 'A documentary exploring sustainable fashion practices and their impact on the environment.',
          category: 'Film',
          fundingGoal: 25000,
          currentFunding: 18200,
          backerCount: 89,
          daysLeft: 25,
          minPledge: 15,
          rewardTiers: [
            { amount: 15, title: 'Digital Copy', description: 'Digital download of the documentary', estimatedDelivery: 'May 2025', backerCount: 35 },
            { amount: 50, title: 'Behind the Scenes', description: 'Documentary + behind the scenes content', estimatedDelivery: 'May 2025', backerCount: 24 },
            { amount: 200, title: 'Producer Credit', description: 'Executive producer credit in the film', estimatedDelivery: 'May 2025', backerCount: 5 }
          ],
          featured: false,
          status: 'active'
        }
      ]);
    } catch (error) {
      console.error('Failed to fetch growth hub data:', error);
    } finally {
      setLoading(false);
    }
  };

  const growthChannels: GrowthChannel[] = [
    {
      id: 'stable',
      name: 'Stable Growth',
      description: 'Low-risk staking with steady returns. Perfect for conservative investors.',
      lockPeriod: 30,
      baseMultiplier: 1.2,
      riskLevel: 'low',
      minDeposit: 100,
      maxDeposit: 10000,
      totalDeposited: 125000,
      participantCount: 234,
      expectedApr: 12.5,
      icon: Shield,
      color: 'green',
      features: ['Principal protection', 'Daily rewards', 'Auto-compound', 'Early withdrawal (penalty)']
    },
    {
      id: 'growth',
      name: 'Growth Accelerator',
      description: 'Medium-risk channel focused on platform growth metrics and user acquisition.',
      lockPeriod: 90,
      baseMultiplier: 1.8,
      riskLevel: 'medium',
      minDeposit: 250,
      maxDeposit: 25000,
      totalDeposited: 89000,
      participantCount: 156,
      expectedApr: 28.7,
      icon: TrendingUp,
      color: 'blue',
      features: ['Growth bonuses', 'Platform rewards', 'Referral multipliers', 'Quarterly bonuses']
    },
    {
      id: 'venture',
      name: 'Venture Pool',
      description: 'High-risk, high-reward pool investing in emerging creators and technologies.',
      lockPeriod: 180,
      baseMultiplier: 3.2,
      riskLevel: 'high',
      minDeposit: 500,
      maxDeposit: 50000,
      totalDeposited: 67000,
      participantCount: 89,
      expectedApr: 45.8,
      icon: Rocket,
      color: 'purple',
      features: ['Creator equity', 'Tech innovation rewards', 'Exclusive opportunities', 'Governance rights']
    },
    {
      id: 'creator',
      name: 'Creator Fund',
      description: 'Support emerging creators while earning from their success.',
      lockPeriod: 60,
      baseMultiplier: 2.1,
      riskLevel: 'medium',
      minDeposit: 200,
      maxDeposit: 15000,
      totalDeposited: 45000,
      participantCount: 78,
      expectedApr: 32.1,
      icon: Star,
      color: 'orange',
      features: ['Creator revenue share', 'Content access', 'Meet & greet events', 'Portfolio tracking']
    }
  ];

  const socialShieldPolicies: SocialShieldPolicy[] = [
    {
      id: 'basic',
      name: 'Basic Shield',
      coverage: {
        platformBan: false,
        algorithmChange: true,
        contentStrike: true,
        monetizationLoss: false,
        followerLoss: false
      },
      monthlyPremium: 29,
      maxCoverage: 1000,
      deductible: 50,
      platforms: ['Instagram', 'TikTok'],
      minFollowers: 1000
    },
    {
      id: 'pro',
      name: 'Pro Shield',
      coverage: {
        platformBan: true,
        algorithmChange: true,
        contentStrike: true,
        monetizationLoss: true,
        followerLoss: false
      },
      monthlyPremium: 79,
      maxCoverage: 5000,
      deductible: 100,
      platforms: ['Instagram', 'TikTok', 'YouTube', 'Twitter'],
      minFollowers: 5000
    },
    {
      id: 'enterprise',
      name: 'Enterprise Shield',
      coverage: {
        platformBan: true,
        algorithmChange: true,
        contentStrike: true,
        monetizationLoss: true,
        followerLoss: true
      },
      monthlyPremium: 199,
      maxCoverage: 25000,
      deductible: 250,
      platforms: ['Instagram', 'TikTok', 'YouTube', 'Twitter', 'LinkedIn', 'Twitch'],
      minFollowers: 25000
    }
  ];

  // Generate economic data
  const generateEconomicData = () => {
    const last30Days = Array.from({ length: 30 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (29 - i));
      return {
        date: date.toISOString().split('T')[0],
        totalStaked: Math.floor(Math.random() * 50000) + 300000,
        activeProjects: Math.floor(Math.random() * 10) + 25,
        fundingVolume: Math.floor(Math.random() * 25000) + 75000,
        premiumsCollected: Math.floor(Math.random() * 5000) + 15000,
        rewardsDistributed: Math.floor(Math.random() * 20000) + 50000
      };
    });
    return last30Days;
  };

  const economicData = generateEconomicData();

  const totalEconomicValue = growthChannels.reduce((sum, channel) => sum + channel.totalDeposited, 0);
  const totalStakers = growthChannels.reduce((sum, channel) => sum + channel.participantCount, 0);
  const avgAPR = growthChannels.reduce((sum, channel) => sum + channel.expectedApr, 0) / growthChannels.length;

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'low': return 'text-green-600 bg-green-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'high': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getChannelColor = (color: string) => {
    const colors = {
      green: 'from-green-500 to-emerald-600',
      blue: 'from-blue-500 to-cyan-600', 
      purple: 'from-purple-500 to-pink-600',
      orange: 'from-orange-500 to-red-600'
    };
    return colors[color as keyof typeof colors] || colors.blue;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-600 rounded-2xl p-8 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Growth Hub</h1>
            <p className="text-purple-100 text-lg">
              Amplify your earnings through staking, funding, and protection
            </p>
          </div>
          <div className="text-right">
            <div className="text-sm text-purple-200">Your Portfolio Value</div>
            <div className="text-3xl font-bold">
              {stakingPositions.reduce((sum, pos) => sum + pos.amount + pos.earnedSoFar, 0).toFixed(0)} Gems
            </div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8">
          {[
            { id: 'overview', label: 'Overview', icon: BarChart3 },
            { id: 'channels', label: 'Growth Channels', icon: TrendingUp },
            { id: 'funding', label: 'Creator Funding', icon: Rocket },
            { id: 'shield', label: 'Social Shield', icon: Shield },
            { id: 'economy', label: 'Platform Economy', icon: PieChart },
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? 'border-purple-500 text-purple-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="space-y-8">
          {/* KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <KPICard
              title="Active Stakes"
              value={stakingPositions.filter(p => p.status === 'active').length.toString()}
              change={12.5}
              changeType="increase"
              icon={<Lock className="w-5 h-5" />}
              trend={[]}
            />
            
            <KPICard
              title="Total Earnings"
              value={`${stakingPositions.reduce((sum, pos) => sum + pos.earnedSoFar, 0).toFixed(1)} Gems`}
              change={8.3}
              changeType="increase"
              icon={<Diamond className="w-5 h-5" />}
              trend={[]}
            />
            
            <KPICard
              title="Projects Backed"
              value="3"
              change={50}
              changeType="increase"
              icon={<Heart className="w-5 h-5" />}
              trend={[]}
            />
            
            <KPICard
              title="Shield Coverage"
              value="$5,000"
              change={0}
              changeType="increase"
              icon={<Shield className="w-5 h-5" />}
              trend={[]}
            />
          </div>

          {/* Active Positions */}
          <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Your Active Positions</h3>
            {stakingPositions.length > 0 ? (
              <div className="space-y-4">
                {stakingPositions.map((position) => {
                  const channel = growthChannels.find(c => c.id === position.channelId);
                  const Icon = channel?.icon || Lock;
                  const daysLeft = Math.ceil((new Date(position.lockUntil).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
                  
                  return (
                    <div key={position.id} className="bg-gradient-to-r from-gray-50 to-slate-50 rounded-lg p-4 border border-gray-200">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className={`w-12 h-12 bg-gradient-to-r ${getChannelColor(channel?.color || 'blue')} rounded-xl flex items-center justify-center text-white`}>
                            <Icon className="w-6 h-6" />
                          </div>
                          <div>
                            <h4 className="font-semibold text-gray-900">{channel?.name}</h4>
                            <p className="text-sm text-gray-600">{position.amount} Gems staked</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-bold text-green-600">+{position.earnedSoFar} Gems</div>
                          <div className="text-sm text-gray-500">{daysLeft} days left</div>
                        </div>
                      </div>
                      <div className="mt-4">
                        <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
                          <span>Progress</span>
                          <span>{((position.earnedSoFar / (position.amount * (position.multiplier - 1))) * 100).toFixed(1)}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-gradient-to-r from-green-400 to-blue-500 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${Math.min(100, (position.earnedSoFar / (position.amount * (position.multiplier - 1))) * 100)}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-12">
                <Lock className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No Active Positions</h3>
                <p className="text-gray-600 mb-6">Start growing your gems through our staking channels</p>
                <button
                  onClick={() => setActiveTab('channels')}
                  className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white px-6 py-3 rounded-xl font-medium transition-all duration-200"
                >
                  Explore Growth Channels
                </button>
              </div>
            )}
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Platform Growth</h3>
                  <p className="text-sm text-gray-600">Last 30 days</p>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Staked</span>
                  <span className="font-semibold">{totalEconomicValue.toLocaleString()} Gems</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Active Stakers</span>
                  <span className="font-semibold">{totalStakers.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Avg APR</span>
                  <span className="font-semibold text-green-600">{avgAPR.toFixed(1)}%</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                  <Rocket className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Creator Funding</h3>
                  <p className="text-sm text-gray-600">Active projects</p>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Live Projects</span>
                  <span className="font-semibold">{fundingProjects.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Funding</span>
                  <span className="font-semibold">${fundingProjects.reduce((sum, p) => sum + p.currentFunding, 0).toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Success Rate</span>
                  <span className="font-semibold text-green-600">87%</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                  <Shield className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Social Shield</h3>
                  <p className="text-sm text-gray-600">Protection status</p>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Coverage Level</span>
                  <span className="font-semibold">Pro Shield</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Max Coverage</span>
                  <span className="font-semibold">$5,000</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Status</span>
                  <span className="font-semibold text-green-600">Active</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'channels' && (
        <div className="space-y-8">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Growth Channels</h2>
              <p className="text-gray-600">Lock your gems for higher multipliers and platform rewards</p>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-500">Your Available Balance</div>
              <div className="text-xl font-bold text-blue-600">{userData?.gems_balance || 0} Gems</div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {growthChannels.map((channel) => {
              const Icon = channel.icon;
              return (
                <div key={channel.id} className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden hover:shadow-md transition-all duration-200">
                  <div className={`bg-gradient-to-r ${getChannelColor(channel.color)} p-6 text-white`}>
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                          <Icon className="w-6 h-6" />
                        </div>
                        <div>
                          <h3 className="text-xl font-bold">{channel.name}</h3>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRiskColor(channel.riskLevel)} text-gray-800`}>
                            {channel.riskLevel.toUpperCase()} RISK
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold">{channel.expectedApr.toFixed(1)}%</div>
                        <div className="text-sm opacity-75">Expected APR</div>
                      </div>
                    </div>
                    <p className="text-white/90">{channel.description}</p>
                  </div>

                  <div className="p-6">
                    <div className="grid grid-cols-2 gap-4 mb-6">
                      <div>
                        <div className="text-sm text-gray-500">Lock Period</div>
                        <div className="font-semibold">{channel.lockPeriod} days</div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-500">Multiplier</div>
                        <div className="font-semibold">{channel.baseMultiplier}x</div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-500">Min Deposit</div>
                        <div className="font-semibold">{channel.minDeposit} Gems</div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-500">Participants</div>
                        <div className="font-semibold">{channel.participantCount}</div>
                      </div>
                    </div>

                    <div className="mb-6">
                      <div className="text-sm text-gray-500 mb-2">Features</div>
                      <div className="space-y-1">
                        {channel.features.map((feature, index) => (
                          <div key={index} className="flex items-center space-x-2">
                            <CheckCircle className="w-4 h-4 text-green-600" />
                            <span className="text-sm text-gray-700">{feature}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="bg-gray-50 rounded-lg p-4">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">Total Deposited</span>
                          <span className="font-semibold">{channel.totalDeposited.toLocaleString()} Gems</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                          <div 
                            className={`bg-gradient-to-r ${getChannelColor(channel.color)} h-2 rounded-full transition-all duration-300`}
                            style={{ width: `${Math.min(100, (channel.totalDeposited / channel.maxDeposit) * 100)}%` }}
                          ></div>
                        </div>
                      </div>

                      <button
                        onClick={() => {
                          setSelectedChannel(channel);
                          setShowStakingModal(true);
                        }}
                        className={`w-full bg-gradient-to-r ${getChannelColor(channel.color)} hover:opacity-90 text-white py-3 px-4 rounded-lg font-medium transition-all duration-200 flex items-center justify-center space-x-2`}
                      >
                        <Lock className="w-4 h-4" />
                        <span>Stake in {channel.name}</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Calculator */}
          <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
            <div className="flex items-center space-x-3 mb-6">
              <Calculator className="w-6 h-6 text-blue-600" />
              <h3 className="text-xl font-semibold text-gray-900">Staking Calculator</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Amount (Gems)</label>
                <input 
                  type="number" 
                  placeholder="1000"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Channel</label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                  {growthChannels.map(channel => (
                    <option key={channel.id} value={channel.id}>{channel.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Estimated Rewards</label>
                <div className="px-3 py-2 bg-green-50 border border-green-200 rounded-lg text-green-800 font-medium">
                  +250 Gems
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Total Return</label>
                <div className="px-3 py-2 bg-blue-50 border border-blue-200 rounded-lg text-blue-800 font-medium">
                  1,250 Gems
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'funding' && (
        <div className="space-y-8">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Creator Funding</h2>
              <p className="text-gray-600">Support innovative projects and earn from their success</p>
            </div>
            <button
              onClick={() => setShowFundingModal(true)}
              className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white px-6 py-3 rounded-xl font-medium transition-all duration-200 flex items-center space-x-2"
            >
              <Plus className="w-4 h-4" />
              <span>Create Project</span>
            </button>
          </div>

          {/* Featured Projects */}
          <div className="space-y-6">
            {fundingProjects.filter(p => p.featured).map((project) => (
              <div key={project.id} className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 border-b border-gray-200">
                  <div className="flex items-center space-x-2 mb-2">
                    <Star className="w-5 h-5 text-yellow-500" />
                    <span className="text-sm font-medium text-yellow-700">Featured Project</span>
                  </div>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-gray-900 mb-2">{project.title}</h3>
                      <p className="text-gray-600 mb-4">{project.description}</p>
                      <div className="flex items-center space-x-6">
                        <div className="flex items-center space-x-2">
                          <img 
                            src={project.creatorAvatar}
                            alt={project.creatorName}
                            className="w-8 h-8 rounded-full"
                          />
                          <span className="font-medium text-gray-900">{project.creatorName}</span>
                        </div>
                        <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                          {project.category}
                        </span>
                      </div>
                    </div>
                    <div className="text-right ml-6">
                      <div className="text-2xl font-bold text-gray-900">
                        ${project.currentFunding.toLocaleString()}
                      </div>
                      <div className="text-sm text-gray-500">
                        of ${project.fundingGoal.toLocaleString()} goal
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-6">
                      <div className="text-center">
                        <div className="text-lg font-bold text-gray-900">{project.backerCount}</div>
                        <div className="text-sm text-gray-500">Backers</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-bold text-gray-900">{project.daysLeft}</div>
                        <div className="text-sm text-gray-500">Days Left</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-bold text-green-600">
                          {((project.currentFunding / project.fundingGoal) * 100).toFixed(0)}%
                        </div>
                        <div className="text-sm text-gray-500">Funded</div>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        // Open funding modal for backing project
                      }}
                      className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white px-6 py-3 rounded-lg font-medium transition-all duration-200"
                    >
                      Back This Project
                    </button>
                  </div>

                  <div className="w-full bg-gray-200 rounded-full h-3 mb-4">
                    <div 
                      className="bg-gradient-to-r from-blue-500 to-purple-500 h-3 rounded-full transition-all duration-300"
                      style={{ width: `${Math.min(100, (project.currentFunding / project.fundingGoal) * 100)}%` }}
                    ></div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {project.rewardTiers.slice(0, 3).map((tier, index) => (
                      <div key={index} className="border border-gray-200 rounded-lg p-4">
                        <div className="text-lg font-bold text-gray-900 mb-2">${tier.amount}</div>
                        <h4 className="font-semibold text-gray-900 mb-2">{tier.title}</h4>
                        <p className="text-sm text-gray-600 mb-3">{tier.description}</p>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-500">{tier.backerCount} backers</span>
                          <span className="text-blue-600">{tier.estimatedDelivery}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Regular Projects */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {fundingProjects.filter(p => !p.featured).map((project) => (
              <div key={project.id} className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden hover:shadow-md transition-all duration-200">
                <div className="p-6">
                  <div className="flex items-center space-x-3 mb-4">
                    <img 
                      src={project.creatorAvatar}
                      alt={project.creatorName}
                      className="w-10 h-10 rounded-full"
                    />
                    <div>
                      <h4 className="font-semibold text-gray-900">{project.creatorName}</h4>
                      <span className="text-sm text-gray-500">{project.category}</span>
                    </div>
                  </div>
                  
                  <h3 className="text-lg font-bold text-gray-900 mb-2">{project.title}</h3>
                  <p className="text-gray-600 mb-4 line-clamp-2">{project.description}</p>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Funding Progress</span>
                      <span className="font-medium">
                        ${project.currentFunding.toLocaleString()} / ${project.fundingGoal.toLocaleString()}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${Math.min(100, (project.currentFunding / project.fundingGoal) * 100)}%` }}
                      ></div>
                    </div>
                    <div className="flex justify-between text-sm text-gray-500">
                      <span>{project.backerCount} backers</span>
                      <span>{project.daysLeft} days left</span>
                    </div>
                  </div>

                  <button className="w-full mt-4 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white py-2 px-4 rounded-lg font-medium transition-all duration-200">
                    View Project
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'shield' && (
        <div className="space-y-8">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Social Shield</h2>
            <p className="text-gray-600">Protect your social media earnings with comprehensive insurance coverage</p>
          </div>

          <div className="bg-gradient-to-r from-orange-50 to-red-50 border border-orange-200 rounded-xl p-6">
            <div className="flex items-start space-x-4">
              <AlertCircle className="w-6 h-6 text-orange-600 mt-1" />
              <div>
                <h3 className="font-semibold text-orange-900 mb-2">Why You Need Social Shield</h3>
                <ul className="text-orange-800 space-y-1 text-sm">
                  <li>• Platform algorithm changes can reduce your reach by up to 80%</li>
                  <li>• Account bans can eliminate months of income overnight</li>
                  <li>• Content strikes can impact monetization for weeks</li>
                  <li>• Follower loss from platform issues affects future earnings</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {socialShieldPolicies.map((policy) => (
              <div key={policy.id} className={`bg-white rounded-xl border-2 shadow-sm overflow-hidden ${
                policy.id === 'pro' ? 'border-blue-500 ring-2 ring-blue-100' : 'border-gray-200'
              }`}>
                {policy.id === 'pro' && (
                  <div className="bg-blue-500 text-white text-center py-2 text-sm font-medium">
                    Most Popular
                  </div>
                )}
                
                <div className="p-6">
                  <div className="text-center mb-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">{policy.name}</h3>
                    <div className="text-3xl font-bold text-gray-900">
                      ${policy.monthlyPremium}
                      <span className="text-sm font-normal text-gray-500">/month</span>
                    </div>
                    <div className="text-sm text-gray-600">
                      Up to ${policy.maxCoverage.toLocaleString()} coverage
                    </div>
                  </div>

                  <div className="space-y-4 mb-6">
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">Coverage Includes:</h4>
                      <ul className="space-y-2">
                        {Object.entries(policy.coverage).map(([key, covered]) => (
                          <li key={key} className="flex items-center space-x-2">
                            {covered ? (
                              <CheckCircle className="w-4 h-4 text-green-600" />
                            ) : (
                              <CheckCircle className="w-4 h-4 text-gray-400" />
                            )}
                            <span className={`text-sm ${covered ? 'text-gray-700' : 'text-gray-400'}`}>
                              {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">Platforms:</h4>
                      <div className="flex flex-wrap gap-2">
                        {policy.platforms.map((platform) => (
                          <span key={platform} className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
                            {platform}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="text-sm text-gray-600">
                      <div>Deductible: ${policy.deductible}</div>
                      <div>Min followers: {policy.minFollowers.toLocaleString()}</div>
                    </div>
                  </div>

                  <button
                    onClick={() => setShowShieldModal(true)}
                    className={`w-full py-3 px-4 rounded-lg font-medium transition-all duration-200 ${
                      policy.id === 'pro' 
                        ? 'bg-blue-500 hover:bg-blue-600 text-white'
                        : 'bg-gray-100 hover:bg-gray-200 text-gray-900'
                    }`}
                  >
                    Get {policy.name}
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Claims</h3>
            <div className="text-center py-8 text-gray-500">
              <Shield className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p>No claims yet - you're well protected!</p>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'economy' && (
        <div className="space-y-8">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Platform Economy</h2>
            <p className="text-gray-600">How your participation drives the entire Promorang ecosystem</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <KPICard
              title="Total Value Locked"
              value={`${totalEconomicValue.toLocaleString()} Gems`}
              change={23.4}
              changeType="increase"
              icon={<Lock className="w-5 h-5" />}
              trend={economicData.slice(-7).map(d => ({ date: d.date, value: d.totalStaked }))}
            />
            
            <KPICard
              title="Active Projects"
              value={fundingProjects.length.toString()}
              change={15.2}
              changeType="increase"
              icon={<Rocket className="w-5 h-5" />}
              trend={economicData.slice(-7).map(d => ({ date: d.date, value: d.activeProjects }))}
            />
            
            <KPICard
              title="Funding Volume"
              value={`$${fundingProjects.reduce((sum, p) => sum + p.currentFunding, 0).toLocaleString()}`}
              change={31.7}
              changeType="increase"
              icon={<DollarSign className="w-5 h-5" />}
              trend={economicData.slice(-7).map(d => ({ date: d.date, value: d.fundingVolume }))}
            />
            
            <KPICard
              title="Shield Premiums"
              value="$47,000"
              change={8.9}
              changeType="increase"
              icon={<Shield className="w-5 h-5" />}
              trend={economicData.slice(-7).map(d => ({ date: d.date, value: d.premiumsCollected }))}
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Economic Flow</h3>
              <TrendLine
                data={economicData.map(d => ({ 
                  date: d.date, 
                  value: d.rewardsDistributed,
                  secondary: d.fundingVolume
                }))}
                height={300}
                primaryKey="value"
                secondaryKey="secondary"
                primaryColor="#10b981"
                secondaryColor="#3b82f6"
              />
              <div className="flex justify-center space-x-6 mt-4 text-sm">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="text-gray-600">Rewards Distributed</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  <span className="text-gray-600">Funding Volume</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Value Distribution</h3>
              <ActivityBreakdown
                data={[
                  { name: 'Staking Rewards', value: 45, color: '#10b981' },
                  { name: 'Creator Funding', value: 30, color: '#3b82f6' },
                  { name: 'Shield Reserves', value: 15, color: '#8b5cf6' },
                  { name: 'Platform Development', value: 10, color: '#f59e0b' }
                ]}
                height={300}
              />
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">How Growth Hub Stimulates the Economy</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <TrendingUp className="w-4 h-4 text-green-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Staking Creates Liquidity</h4>
                    <p className="text-gray-600 text-sm">When you stake gems, they're used to fund platform operations, creator rewards, and new feature development.</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <Rocket className="w-4 h-4 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Funding Drives Innovation</h4>
                    <p className="text-gray-600 text-sm">Creator funding projects introduce new content types and engagement methods, expanding earning opportunities.</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <Shield className="w-4 h-4 text-purple-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Shield Stabilizes Earnings</h4>
                    <p className="text-gray-600 text-sm">Social Shield premiums create a safety net that encourages more users to participate confidently.</p>
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <Coins className="w-4 h-4 text-orange-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Network Effects</h4>
                    <p className="text-gray-600 text-sm">More participants mean better rates, higher liquidity, and stronger protection for everyone.</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <Target className="w-4 h-4 text-red-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Value Alignment</h4>
                    <p className="text-gray-600 text-sm">Your success directly correlates with platform growth, creating aligned incentives for long-term value creation.</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <Lightbulb className="w-4 h-4 text-yellow-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Continuous Innovation</h4>
                    <p className="text-gray-600 text-sm">Funds from Growth Hub activities are reinvested into new earning opportunities and platform improvements.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modals */}
      <StakingModal
        isOpen={showStakingModal}
        onClose={() => setShowStakingModal(false)}
        channel={selectedChannel}
        user={userData}
        onSuccess={fetchGrowthHubData}
      />
      
      <FundingProjectModal
        isOpen={showFundingModal}
        onClose={() => setShowFundingModal(false)}
        user={userData}
        onSuccess={fetchGrowthHubData}
      />
      
      <SocialShieldModal
        isOpen={showShieldModal}
        onClose={() => setShowShieldModal(false)}
        user={userData}
        onSuccess={fetchGrowthHubData}
      />
    </div>
  );
}
