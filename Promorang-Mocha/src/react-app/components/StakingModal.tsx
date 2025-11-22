import { useState } from 'react';
import { X, Lock, TrendingUp, Shield, Rocket, Star, AlertCircle, Calculator } from 'lucide-react';
import { UserType } from '@/shared/types';

interface GrowthChannel {
  id: string;
  name: string;
  description: string;
  lockPeriod: number;
  baseMultiplier: number;
  riskLevel: 'low' | 'medium' | 'high';
  minDeposit: number;
  maxDeposit: number;
  expectedApr: number;
  icon: any;
  color: string;
  features: string[];
}

interface StakingModalProps {
  isOpen: boolean;
  onClose: () => void;
  channel: GrowthChannel | null;
  user: UserType | null;
  onSuccess: () => void;
}

export default function StakingModal({ isOpen, onClose, channel, user, onSuccess }: StakingModalProps) {
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen || !channel) return null;

  const getChannelIcon = () => {
    switch (channel.icon) {
      case 'Shield': return Shield;
      case 'TrendingUp': return TrendingUp;
      case 'Rocket': return Rocket;
      case 'Star': return Star;
      default: return Lock;
    }
  };

  const Icon = getChannelIcon();

  const getChannelColor = () => {
    const colors = {
      green: 'from-green-500 to-emerald-600',
      blue: 'from-blue-500 to-cyan-600', 
      purple: 'from-purple-500 to-pink-600',
      orange: 'from-orange-500 to-red-600'
    };
    return colors[channel.color as keyof typeof colors] || colors.blue;
  };

  const getRiskColor = () => {
    switch (channel.riskLevel) {
      case 'low': return 'text-green-600 bg-green-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'high': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const calculateRewards = () => {
    const stakeAmount = parseFloat(amount) || 0;
    if (stakeAmount === 0) return { daily: 0, total: 0, final: 0 };

    const totalDays = channel.lockPeriod;
    const totalReturn = stakeAmount * (channel.baseMultiplier - 1);
    const dailyReward = totalReturn / totalDays;
    const finalAmount = stakeAmount + totalReturn;

    return {
      daily: dailyReward,
      total: totalReturn,
      final: finalAmount
    };
  };

  const rewards = calculateRewards();
  const canStake = amount && 
    parseFloat(amount) >= channel.minDeposit && 
    parseFloat(amount) <= channel.maxDeposit &&
    parseFloat(amount) <= (user?.gems_balance || 0);

  const handleStake = async () => {
    if (!canStake) return;

    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/users/stake', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          channel_id: channel.id,
          amount: parseFloat(amount)
        }),
      });

      if (response.ok) {
        onSuccess();
        onClose();
        setAmount('');
      } else {
        const error = await response.json();
        setError(error.error || 'Failed to stake gems');
      }
    } catch (error) {
      setError('Network error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleMaxAmount = () => {
    const maxPossible = Math.min(user?.gems_balance || 0, channel.maxDeposit);
    setAmount(maxPossible.toString());
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl max-w-md w-full max-h-screen overflow-y-auto">
        {/* Header */}
        <div className={`bg-gradient-to-r ${getChannelColor()} p-6 text-white`}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                <Icon className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl font-bold">{channel.name}</h2>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRiskColor()} text-gray-800`}>
                  {channel.riskLevel.toUpperCase()} RISK
                </span>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-white/80 hover:text-white transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
          <p className="text-white/90">{channel.description}</p>
        </div>

        <div className="p-6 space-y-6">
          {/* Channel Details */}
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <div className="text-lg font-bold text-gray-900">{channel.lockPeriod}</div>
              <div className="text-sm text-gray-600">Days Locked</div>
            </div>
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <div className="text-lg font-bold text-green-600">{channel.expectedApr}%</div>
              <div className="text-sm text-gray-600">Expected APR</div>
            </div>
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <div className="text-lg font-bold text-blue-600">{channel.baseMultiplier}x</div>
              <div className="text-sm text-gray-600">Multiplier</div>
            </div>
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <div className="text-lg font-bold text-purple-600">{user?.gems_balance || 0}</div>
              <div className="text-sm text-gray-600">Your Balance</div>
            </div>
          </div>

          {/* Features */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-3">Channel Features</h3>
            <div className="space-y-2">
              {channel.features.map((feature, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <div className={`w-2 h-2 rounded-full bg-gradient-to-r ${getChannelColor()}`}></div>
                  <span className="text-sm text-gray-700">{feature}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Staking Amount */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Stake Amount (Gems)
            </label>
            <div className="relative">
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder={`Min: ${channel.minDeposit}, Max: ${channel.maxDeposit}`}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                min={channel.minDeposit}
                max={Math.min(channel.maxDeposit, user?.gems_balance || 0)}
              />
              <button
                onClick={handleMaxAmount}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 text-sm text-purple-600 hover:text-purple-700 font-medium"
              >
                MAX
              </button>
            </div>
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>Min: {channel.minDeposit} gems</span>
              <span>Max: {Math.min(channel.maxDeposit, user?.gems_balance || 0)} gems</span>
            </div>
          </div>

          {/* Reward Calculator */}
          {amount && parseFloat(amount) > 0 && (
            <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-4 border border-green-200">
              <div className="flex items-center space-x-2 mb-3">
                <Calculator className="w-5 h-5 text-green-600" />
                <h3 className="font-semibold text-gray-900">Projected Rewards</h3>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-gray-600">Daily Reward</div>
                  <div className="font-bold text-green-600">+{rewards.daily.toFixed(2)} Gems</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600">Total Rewards</div>
                  <div className="font-bold text-green-600">+{rewards.total.toFixed(2)} Gems</div>
                </div>
                <div className="col-span-2">
                  <div className="text-sm text-gray-600">Final Amount</div>
                  <div className="text-xl font-bold text-blue-600">{rewards.final.toFixed(2)} Gems</div>
                </div>
              </div>
            </div>
          )}

          {/* Warning */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
              <div>
                <h4 className="font-semibold text-yellow-800">Important Notice</h4>
                <p className="text-sm text-yellow-700 mt-1">
                  Your gems will be locked for {channel.lockPeriod} days. Early withdrawal may result in penalties. 
                  Rewards are distributed daily and automatically compounded.
                </p>
              </div>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          {/* Actions */}
          <div className="flex space-x-3">
            <button
              onClick={onClose}
              className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleStake}
              disabled={!canStake || loading}
              className={`flex-1 px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
                canStake && !loading
                  ? `bg-gradient-to-r ${getChannelColor()} hover:opacity-90 text-white`
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              {loading ? 'Staking...' : `Stake ${amount || '0'} Gems`}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
