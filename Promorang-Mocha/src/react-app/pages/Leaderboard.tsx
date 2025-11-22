import { useEffect, useState } from 'react';
import { 
  Trophy, 
  Crown, 
  Star, 
  Zap, 
  Key, 
  Diamond,
  Medal,
  TrendingUp
} from 'lucide-react';

type LeaderboardEntry = {
  id: number;
  display_name: string;
  username: string;
  avatar_url: string;
  points_earned: number;
  gems_earned: number;
  keys_used: number;
  gold_collected: number;
  composite_score: number;
};

export default function Leaderboard() {
  const [period, setPeriod] = useState<'daily' | 'weekly' | 'monthly'>('daily');
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLeaderboard();
  }, [period]);

  const fetchLeaderboard = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/leaderboard/${period}`);
      const data = await response.json();
      setLeaderboard(data);
    } catch (error) {
      console.error('Failed to fetch leaderboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="w-6 h-6 text-yellow-500" />;
      case 2:
        return <Medal className="w-6 h-6 text-gray-400" />;
      case 3:
        return <Medal className="w-6 h-6 text-amber-600" />;
      default:
        return <div className="w-6 h-6 flex items-center justify-center text-gray-600 font-bold text-sm">#{rank}</div>;
    }
  };

  const getRankStyle = (rank: number) => {
    switch (rank) {
      case 1:
        return 'bg-gradient-to-r from-yellow-50 to-amber-50 border-yellow-200';
      case 2:
        return 'bg-gradient-to-r from-gray-50 to-slate-50 border-gray-200';
      case 3:
        return 'bg-gradient-to-r from-amber-50 to-orange-50 border-amber-200';
      default:
        return 'bg-white border-gray-200';
    }
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center space-x-3">
            <Trophy className="w-8 h-8 text-yellow-500" />
            <span>Leaderboard</span>
          </h1>
          <p className="text-gray-600 mt-2">Top performers in the Promorang economy</p>
        </div>
      </div>

      {/* Period Selector */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex space-x-4">
          {[
            { key: 'daily', label: 'Today', icon: Zap },
            { key: 'weekly', label: 'This Week', icon: TrendingUp },
            { key: 'monthly', label: 'This Month', icon: Star }
          ].map((periodOption) => {
            const Icon = periodOption.icon;
            return (
              <button
                key={periodOption.key}
                onClick={() => setPeriod(periodOption.key as any)}
                className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
                  period === periodOption.key
                    ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{periodOption.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Scoring Legend */}
      <div className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-purple-900 mb-4">Composite Score Formula</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
            <span className="text-sm text-purple-700">Points × 0.25</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
            <span className="text-sm text-purple-700">Gems × 0.40</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
            <span className="text-sm text-purple-700">Keys × 0.15</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
            <span className="text-sm text-purple-700">Gold × 0.20</span>
          </div>
        </div>
      </div>

      {/* Leaderboard */}
      <div className="space-y-3">
        {leaderboard.length > 0 ? (
          leaderboard.map((entry, index) => {
            const rank = index + 1;
            return (
              <div
                key={entry.id}
                className={`border rounded-xl p-6 transition-all duration-200 hover:shadow-md ${getRankStyle(rank)}`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    {getRankIcon(rank)}
                    
                    <div className="flex items-center space-x-3">
                      <img
                        src={entry.avatar_url || '/default-avatar.png'}
                        alt={entry.display_name}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                      <div>
                        <h3 className="font-semibold text-gray-900">
                          {entry.display_name || 'Anonymous User'}
                        </h3>
                        <p className="text-sm text-gray-600">
                          @{entry.username || 'user'}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-6">
                    {/* Points */}
                    <div className="flex items-center space-x-2">
                      <Star className="w-4 h-4 text-blue-600" />
                      <div className="text-center">
                        <p className="font-semibold text-gray-900">{entry.points_earned.toLocaleString()}</p>
                        <p className="text-xs text-gray-600">Points</p>
                      </div>
                    </div>

                    {/* Gems */}
                    <div className="flex items-center space-x-2">
                      <Diamond className="w-4 h-4 text-purple-600" />
                      <div className="text-center">
                        <p className="font-semibold text-gray-900">{entry.gems_earned.toLocaleString()}</p>
                        <p className="text-xs text-gray-600">Gems</p>
                      </div>
                    </div>

                    {/* Keys */}
                    <div className="flex items-center space-x-2">
                      <Key className="w-4 h-4 text-orange-600" />
                      <div className="text-center">
                        <p className="font-semibold text-gray-900">{entry.keys_used}</p>
                        <p className="text-xs text-gray-600">Keys</p>
                      </div>
                    </div>

                    {/* Gold */}
                    <div className="flex items-center space-x-2">
                      <Medal className="w-4 h-4 text-yellow-600" />
                      <div className="text-center">
                        <p className="font-semibold text-gray-900">{entry.gold_collected}</p>
                        <p className="text-xs text-gray-600">Gold</p>
                      </div>
                    </div>

                    {/* Composite Score */}
                    <div className="text-center ml-6 pl-6 border-l border-gray-300">
                      <p className="text-xl font-bold text-gray-900">{entry.composite_score.toFixed(1)}</p>
                      <p className="text-xs text-gray-600">Score</p>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="text-center py-12">
            <Trophy className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Rankings Yet</h3>
            <p className="text-gray-600 mb-4">
              Be the first to earn points and climb the leaderboard!
            </p>
            <div className="space-y-2 text-sm text-gray-600">
              <p>• Complete drops to earn gems</p>
              <p>• Engage with content to earn points</p>
              <p>• Collect gold for prestige</p>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Stats */}
      {leaderboard.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Competition Stats</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-600">
                {leaderboard.reduce((sum, entry) => sum + entry.points_earned, 0).toLocaleString()}
              </p>
              <p className="text-sm text-gray-600">Total Points</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-purple-600">
                {leaderboard.reduce((sum, entry) => sum + entry.gems_earned, 0).toLocaleString()}
              </p>
              <p className="text-sm text-gray-600">Total Gems</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-orange-600">
                {leaderboard.reduce((sum, entry) => sum + entry.keys_used, 0)}
              </p>
              <p className="text-sm text-gray-600">Keys Used</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-yellow-600">
                {leaderboard.reduce((sum, entry) => sum + entry.gold_collected, 0)}
              </p>
              <p className="text-sm text-gray-600">Gold Earned</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
