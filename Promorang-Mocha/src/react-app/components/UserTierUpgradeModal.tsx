import { useState, useEffect } from 'react';
import { X, Star, Crown, Zap, Coins, Gem, ArrowRight, CheckCircle } from 'lucide-react';
import { UserType } from '@/shared/types';

interface UserTierUpgradeModalProps {
  user: UserType | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function UserTierUpgradeModal({ user, isOpen, onClose, onSuccess }: UserTierUpgradeModalProps) {
  const [upgradeCosts, setUpgradeCosts] = useState<any>(null);
  const [selectedTier, setSelectedTier] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<'points' | 'gems'>('points');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      fetchUpgradeCosts();
    }
  }, [isOpen]);

  const fetchUpgradeCosts = async () => {
    try {
      const response = await fetch('/api/users/upgrade-costs', { credentials: 'include' });
      if (response.ok) {
        const data = await response.json();
        setUpgradeCosts(data);
      }
    } catch (error) {
      console.error('Failed to fetch upgrade costs:', error);
    }
  };

  if (!isOpen || !user || !upgradeCosts) return null;

  const currentTier = user.user_tier;
  const availableUpgrades = upgradeCosts[currentTier] || {};

  const getTierInfo = (tier: string) => {
    switch (tier) {
      case 'super':
        return {
          name: 'Super User',
          icon: Crown,
          color: 'text-yellow-600',
          bgColor: 'bg-yellow-50',
          borderColor: 'border-yellow-200',
          benefits: [
            '2.0x point multiplier for all actions',
            '1 proof drop required for Master Key',
            '1,000 monthly Instagram points',
            'Priority support',
            'Exclusive events access',
            'Advanced analytics'
          ]
        };
      case 'premium':
        return {
          name: 'Premium User',
          icon: Star,
          color: 'text-purple-600',
          bgColor: 'bg-purple-50',
          borderColor: 'border-purple-200',
          benefits: [
            '1.5x point multiplier for all actions',
            '2 proof drops required for Master Key',
            '750 monthly Instagram points',
            'Priority support',
            'Advanced analytics'
          ]
        };
      default:
        return {
          name: 'Free User',
          icon: Zap,
          color: 'text-gray-600',
          bgColor: 'bg-gray-50',
          borderColor: 'border-gray-200',
          benefits: [
            '1.0x point multiplier',
            '5 proof drops required for Master Key',
            '500 monthly Instagram points',
            'Standard support'
          ]
        };
    }
  };

  const handleUpgrade = async () => {
    if (!selectedTier) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/users/upgrade-tier', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          target_tier: selectedTier,
          payment_method: paymentMethod
        })
      });

      if (response.ok) {
        onSuccess();
        onClose();
        setSelectedTier('');
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Upgrade failed');
      }
    } catch (error) {
      console.error('Upgrade failed:', error);
      setError('Network error occurred');
    } finally {
      setLoading(false);
    }
  };

  const canAfford = (tier: string, method: 'points' | 'gems') => {
    const cost = availableUpgrades[tier]?.[method];
    if (!cost) return false;
    
    const balance = method === 'points' ? user.points_balance : user.gems_balance;
    return balance >= cost;
  };

  const currentTierInfo = getTierInfo(currentTier);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-2">
            <Star className="w-6 h-6 text-orange-600" />
            <h2 className="text-xl font-bold text-gray-900">Upgrade Your Tier</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Current Tier */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">Current Tier</h3>
          <div className={`border-2 ${currentTierInfo.borderColor} ${currentTierInfo.bgColor} rounded-lg p-4`}>
            <div className="flex items-center space-x-3">
              <currentTierInfo.icon className={`w-8 h-8 ${currentTierInfo.color}`} />
              <div>
                <h4 className={`text-lg font-semibold ${currentTierInfo.color}`}>
                  {currentTierInfo.name}
                </h4>
                <p className="text-sm text-gray-600">Your current membership level</p>
              </div>
            </div>
          </div>
        </div>

        {/* Available Upgrades */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">Available Upgrades</h3>
          
          {Object.keys(availableUpgrades).map((tier) => {
            const tierInfo = getTierInfo(tier);
            const cost = availableUpgrades[tier];
            
            return (
              <div
                key={tier}
                className={`border-2 rounded-lg p-6 cursor-pointer transition-all duration-200 ${
                  selectedTier === tier
                    ? `${tierInfo.borderColor} ${tierInfo.bgColor}`
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => setSelectedTier(tier)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-3">
                      <tierInfo.icon className={`w-8 h-8 ${tierInfo.color}`} />
                      <div>
                        <h4 className={`text-lg font-semibold ${selectedTier === tier ? tierInfo.color : 'text-gray-900'}`}>
                          {tierInfo.name}
                        </h4>
                        <div className="flex items-center space-x-4 text-sm">
                          <div className="flex items-center space-x-1">
                            <Coins className="w-4 h-4 text-blue-600" />
                            <span>{cost.points.toLocaleString()} points</span>
                          </div>
                          <span className="text-gray-400">or</span>
                          <div className="flex items-center space-x-1">
                            <Gem className="w-4 h-4 text-purple-600" />
                            <span>{cost.gems} gems</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      {tierInfo.benefits.map((benefit, index) => (
                        <div key={index} className="flex items-center space-x-2">
                          <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
                          <span className="text-sm text-gray-700">{benefit}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  {selectedTier === tier && (
                    <div className="ml-4">
                      <ArrowRight className={`w-6 h-6 ${tierInfo.color}`} />
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Payment Method Selection */}
        {selectedTier && (
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <h4 className="font-medium text-gray-900 mb-3">Choose Payment Method</h4>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setPaymentMethod('points')}
                disabled={!canAfford(selectedTier, 'points')}
                className={`p-4 rounded-lg border-2 transition-colors ${
                  paymentMethod === 'points'
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                } ${!canAfford(selectedTier, 'points') ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <div className="flex items-center justify-center space-x-2 mb-2">
                  <Coins className="w-5 h-5 text-blue-600" />
                  <span className="font-medium">Points</span>
                </div>
                <p className="text-lg font-bold text-blue-600">
                  {availableUpgrades[selectedTier]?.points.toLocaleString()}
                </p>
                <p className="text-xs text-gray-600">
                  Balance: {user.points_balance.toLocaleString()}
                </p>
                {!canAfford(selectedTier, 'points') && (
                  <p className="text-xs text-red-600 mt-1">Insufficient balance</p>
                )}
              </button>

              <button
                onClick={() => setPaymentMethod('gems')}
                disabled={!canAfford(selectedTier, 'gems')}
                className={`p-4 rounded-lg border-2 transition-colors ${
                  paymentMethod === 'gems'
                    ? 'border-purple-500 bg-purple-50'
                    : 'border-gray-200 hover:border-gray-300'
                } ${!canAfford(selectedTier, 'gems') ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <div className="flex items-center justify-center space-x-2 mb-2">
                  <Gem className="w-5 h-5 text-purple-600" />
                  <span className="font-medium">Gems</span>
                </div>
                <p className="text-lg font-bold text-purple-600">
                  {availableUpgrades[selectedTier]?.gems}
                </p>
                <p className="text-xs text-gray-600">
                  Balance: {user.gems_balance}
                </p>
                {!canAfford(selectedTier, 'gems') && (
                  <p className="text-xs text-red-600 mt-1">Insufficient balance</p>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-3">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex space-x-3 mt-6">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleUpgrade}
            disabled={!selectedTier || !canAfford(selectedTier, paymentMethod) || loading}
            className="flex-1 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 disabled:opacity-50 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg font-medium transition-all duration-200"
          >
            {loading ? 'Upgrading...' : `Upgrade to ${selectedTier ? getTierInfo(selectedTier).name : ''}`}
          </button>
        </div>
      </div>
    </div>
  );
}
