import { useEffect, useState } from 'react';
import { useAuth } from '@getmocha/users-service/react';
import { 
  TrendingUp, 
  DollarSign, 
  Award,
  Plus,
  Eye,
  Clock,
  Diamond,
  Activity,
  Target,
  Zap,
  Users
} from 'lucide-react';
import { UserType, TaskType, WalletType, TransactionType } from '@/shared/types';
import { 
  EarningsChart, 
  PerformanceMetrics, 
  ActivityBreakdown, 
  MultiMetricChart,
  KPICard 
} from '@/react-app/components/AnalyticsCharts';

export default function Dashboard() {
  const { user: authUser } = useAuth();
  const [user, setUser] = useState<UserType | null>(null);
  const [wallets, setWallets] = useState<WalletType[]>([]);
  const [recentTasks, setRecentTasks] = useState<TaskType[]>([]);
  const [recentTransactions, setRecentTransactions] = useState<TransactionType[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Fetch user data
        const userResponse = await fetch('/api/app/users/me', {
          credentials: 'include'
        });
        const userData = await userResponse.json();
        setUser(userData);

        // Fetch wallets
        const walletsResponse = await fetch('/api/users/wallets', {
          credentials: 'include'
        });
        const walletsData = await walletsResponse.json();
        setWallets(walletsData);

        // Fetch recent tasks
        const tasksResponse = await fetch('/api/tasks?limit=5');
        const tasksData = await tasksResponse.json();
        setRecentTasks(tasksData.slice(0, 5));

        // Fetch recent transactions
        const transactionsResponse = await fetch('/api/users/transactions?limit=5', {
          credentials: 'include'
        });
        const transactionsData = await transactionsResponse.json();
        setRecentTransactions(transactionsData.slice(0, 5));

      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    if (authUser) {
      fetchDashboardData();
    }
  }, [authUser]);

  const usdWallet = wallets.find(w => w.currency_type === 'USD');

  // Generate analytics data for dashboard
  const generateDashboardData = () => {
    const last30Days = Array.from({ length: 30 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (29 - i));
      return {
        date: date.toISOString().split('T')[0],
        earnings: Math.floor(Math.random() * 100) + 20,
        tasks: Math.floor(Math.random() * 10) + 2,
        activity: Math.floor(Math.random() * 50) + 10,
        xp: Math.floor(Math.random() * 200) + 50
      };
    });
    return last30Days;
  };

  const dashboardData = generateDashboardData();
  
  const activityBreakdown = [
    { name: 'Task Completions', value: 40, color: '#f97316' },
    { name: 'Social Actions', value: 30, color: '#8b5cf6' },
    { name: 'Content Creation', value: 20, color: '#10b981' },
    { name: 'Investments', value: 10, color: '#3b82f6' }
  ];

  const performanceMetrics = [
    { metric: 'Task Success Rate', value: 87.5 },
    { metric: 'Daily Activity', value: 23.2 },
    { metric: 'Earning Efficiency', value: 156.8 },
    { metric: 'Engagement Score', value: 92.1 },
    { metric: 'Growth Rate', value: 12.4 }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-orange-500 to-red-500 rounded-2xl p-8 text-white">
        <h1 className="text-3xl font-bold mb-2">
          Welcome back, {user?.display_name || authUser?.google_user_data?.given_name}!
        </h1>
        <p className="text-orange-100">
          Ready to earn more today? Check out the latest opportunities below.
        </p>
      </div>

      {/* Enhanced KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <KPICard
          title="Total Earnings"
          value={`$${(usdWallet?.balance || 0).toFixed(2)}`}
          change={12.5}
          changeType="increase"
          icon={<DollarSign className="w-5 h-5" />}
          trend={dashboardData.slice(-7).map(d => ({ date: d.date, value: d.earnings }))}
        />
        
        <KPICard
          title="PromoGems"
          value={(user?.gems_balance || 0).toFixed(0)}
          change={8.3}
          changeType="increase"
          icon={<Diamond className="w-5 h-5" />}
          trend={dashboardData.slice(-7).map(d => ({ date: d.date, value: d.earnings * 0.8 }))}
        />
        
        <KPICard
          title="XP Points"
          value={(user?.xp_points || 0).toLocaleString()}
          change={15.7}
          changeType="increase"
          icon={<TrendingUp className="w-5 h-5" />}
          trend={dashboardData.slice(-7).map(d => ({ date: d.date, value: d.xp }))}
        />
        
        <KPICard
          title="Current Level"
          value={user?.level || 1}
          change={0}
          changeType="increase"
          icon={<Award className="w-5 h-5" />}
          trend={[]}
        />
      </div>

      {/* Analytics Dashboard */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Activity Overview */}
        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Activity Overview</h3>
          <MultiMetricChart
            data={dashboardData}
            height={300}
            metrics={[
              { key: 'earnings', name: 'Daily Earnings', color: '#f97316' },
              { key: 'tasks', name: 'Tasks Completed', color: '#10b981' },
              { key: 'activity', name: 'Activity Score', color: '#8b5cf6' }
            ]}
          />
        </div>

        {/* Activity Breakdown */}
        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Activity Distribution</h3>
          <ActivityBreakdown
            data={activityBreakdown}
            height={300}
          />
        </div>

        {/* Performance Metrics */}
        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Performance Metrics</h3>
          <PerformanceMetrics
            data={performanceMetrics}
            height={300}
          />
        </div>

        {/* Earnings Trend */}
        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Earnings Trend</h3>
          <EarningsChart 
            data={dashboardData.map(d => ({ 
              date: d.date, 
              earnings: d.earnings,
              gems: d.earnings * 0.8,
              points: d.activity
            }))}
            height={300}
          />
        </div>
      </div>

      {/* Real-time Activity Stats */}
      <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Today's Activity</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <Activity className="w-6 h-6 text-blue-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-blue-900">23</p>
            <p className="text-sm text-blue-600">Actions</p>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <Target className="w-6 h-6 text-green-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-green-900">4</p>
            <p className="text-sm text-green-600">Tasks Done</p>
          </div>
          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <Diamond className="w-6 h-6 text-purple-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-purple-900">127</p>
            <p className="text-sm text-purple-600">Gems Earned</p>
          </div>
          <div className="text-center p-4 bg-orange-50 rounded-lg">
            <Zap className="w-6 h-6 text-orange-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-orange-900">3</p>
            <p className="text-sm text-orange-600">Streak Days</p>
          </div>
          <div className="text-center p-4 bg-yellow-50 rounded-lg">
            <Eye className="w-6 h-6 text-yellow-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-yellow-900">156</p>
            <p className="text-sm text-yellow-600">Content Views</p>
          </div>
          <div className="text-center p-4 bg-indigo-50 rounded-lg">
            <Users className="w-6 h-6 text-indigo-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-indigo-900">12</p>
            <p className="text-sm text-indigo-600">Interactions</p>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="flex items-center space-x-3 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg hover:from-blue-100 hover:to-indigo-100 transition-colors">
            <Plus className="w-5 h-5 text-blue-600" />
            <span className="font-medium text-blue-700">Create Task</span>
          </button>
          
          <button className="flex items-center space-x-3 p-4 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg hover:from-green-100 hover:to-emerald-100 transition-colors">
            <Eye className="w-5 h-5 text-green-600" />
            <span className="font-medium text-green-700">Browse Tasks</span>
          </button>
          
          <button className="flex items-center space-x-3 p-4 bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-lg hover:from-purple-100 hover:to-pink-100 transition-colors">
            <TrendingUp className="w-5 h-5 text-purple-600" />
            <span className="font-medium text-purple-700">Invest in Content</span>
          </button>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Tasks */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Latest Tasks</h2>
            <button className="text-orange-600 hover:text-orange-700 text-sm font-medium">
              View All
            </button>
          </div>
          <div className="space-y-3">
            {recentTasks.length > 0 ? (
              recentTasks.map((task) => (
                <div key={task.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{task.title}</p>
                    <p className="text-xs text-gray-500">{task.category}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-green-600">${task.reward_amount}</p>
                    <p className="text-xs text-gray-500 capitalize">{task.difficulty}</p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-center py-4">No tasks available yet</p>
            )}
          </div>
        </div>

        {/* Recent Transactions */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Recent Transactions</h2>
            <button className="text-orange-600 hover:text-orange-700 text-sm font-medium">
              View All
            </button>
          </div>
          <div className="space-y-3">
            {recentTransactions.length > 0 ? (
              recentTransactions.map((transaction) => (
                <div key={transaction.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <Clock className="w-4 h-4 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{transaction.description || transaction.transaction_type}</p>
                      <p className="text-xs text-gray-500">{new Date(transaction.created_at).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`text-sm font-semibold ${transaction.amount >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {transaction.amount >= 0 ? '+' : ''}${Math.abs(transaction.amount).toFixed(2)}
                    </p>
                    <p className="text-xs text-gray-500 capitalize">{transaction.status}</p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-center py-4">No transactions yet</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
