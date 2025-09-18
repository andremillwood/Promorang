import { useState, useEffect } from 'react';
import { X, Crown, Zap, Star, Shield, Award, Check } from 'lucide-react';
import { UserType } from '@/shared/types';

interface GoldItem {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: string;
  gold_cost: number;
  effect_data: any;
  duration?: string;
  owned?: boolean;
}

interface GoldShopModalProps {
  user: UserType | null;
  isOpen: boolean;
  onClose: () => void;
  onPurchase: () => void;
}

export default function GoldShopModal({ user, isOpen, onClose, onPurchase }: GoldShopModalProps) {
  const [loading, setLoading] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string>('upgrades');
  const [userPurchases, setUserPurchases] = useState<any[]>([]);

  useEffect(() => {
    if (isOpen && user) {
      fetchUserPurchases();
    }
  }, [isOpen, user]);

  const fetchUserPurchases = async () => {
    try {
      const response = await fetch('/api/users/gold-purchases', {
        credentials: 'include'
      });
      if (response.ok) {
        const purchases = await response.json();
        setUserPurchases(purchases);
      }
    } catch (error) {
      console.error('Failed to fetch gold purchases:', error);
    }
  };

  const handlePurchase = async (item: GoldItem) => {
    if (!user || user.gold_collected < item.gold_cost) return;

    setLoading(true);
    try {
      const response = await fetch('/api/users/gold-purchase', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          item_type: item.category,
          item_name: item.name,
          gold_cost: item.gold_cost,
          effect_data: JSON.stringify(item.effect_data)
        })
      });

      if (response.ok) {
        onPurchase();
        fetchUserPurchases();
        showPurchaseNotification(item.name);
      } else {
        const error = await response.json();
        alert(error.error || 'Purchase failed');
      }
    } catch (error) {
      console.error('Purchase failed:', error);
      alert('Purchase failed');
    } finally {
      setLoading(false);
    }
  };

  const showPurchaseNotification = (itemName: string) => {
    const notification = document.createElement('div');
    notification.className = 'fixed top-4 right-4 bg-gradient-to-r from-yellow-500 to-orange-500 text-white px-6 py-4 rounded-xl shadow-lg z-50 animate-pulse';
    notification.innerHTML = `
      <div class="flex items-center space-x-3">
        <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
          <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
        </svg>
        <div>
          <div class="font-bold">Purchase Successful!</div>
          <div class="text-sm">${itemName} activated</div>
        </div>
      </div>
    `;
    document.body.appendChild(notification);
    setTimeout(() => {
      if (document.body.contains(notification)) {
        document.body.removeChild(notification);
      }
    }, 3000);
  };

  const getIconComponent = (iconName: string) => {
    const iconMap: { [key: string]: any } = {
      'crown': Crown,
      'zap': Zap,
      'star': Star,
      'shield': Shield,
      'award': Award,
    };
    const IconComponent = iconMap[iconName] || Star;
    return <IconComponent className="w-6 h-6" />;
  };

  const goldShopItems: GoldItem[] = [
    // Tier Upgrades
    {
      id: 'premium_upgrade',
      name: 'Premium Tier Upgrade',
      description: 'Upgrade to Premium tier with 1.5x points multiplier and exclusive perks',
      icon: 'crown',
      category: 'upgrades',
      gold_cost: 500,
      effect_data: { tier: 'premium' }
    },
    {
      id: 'super_upgrade',
      name: 'Super Tier Upgrade',
      description: 'Upgrade to Super tier with 2x points multiplier and maximum benefits',
      icon: 'crown',
      category: 'upgrades',
      gold_cost: 1000,
      effect_data: { tier: 'super' }
    },
    
    // Multipliers
    {
      id: 'key_multiplier_24h',
      name: '24h Key Multiplier',
      description: 'Double key earnings from all actions for 24 hours',
      icon: 'zap',
      category: 'multipliers',
      gold_cost: 200,
      duration: '24 hours',
      effect_data: { multiplier: 2, duration_hours: 24, type: 'key_earnings' }
    },
    {
      id: 'xp_boost_7d',
      name: '7-Day XP Boost',
      description: 'Triple XP gains from all activities for 7 days',
      icon: 'star',
      category: 'multipliers',
      gold_cost: 300,
      duration: '7 days',
      effect_data: { multiplier: 3, duration_hours: 168, type: 'xp_earnings' }
    },
    
    // Profile Features
    {
      id: 'golden_badge',
      name: 'Golden Badge',
      description: 'Display a prestigious golden badge on your profile',
      icon: 'award',
      category: 'profile',
      gold_cost: 150,
      effect_data: { badge_type: 'golden', permanent: true }
    },
    {
      id: 'profile_boost',
      name: 'Profile Boost',
      description: 'Enhanced visibility in leaderboards and search for 30 days',
      icon: 'shield',
      category: 'profile',
      gold_cost: 250,
      duration: '30 days',
      effect_data: { boost_type: 'visibility', duration_hours: 720 }
    }
  ];

  const categories = [
    { id: 'upgrades', name: 'Tier Upgrades', icon: Crown },
    { id: 'multipliers', name: 'Boosts', icon: Zap },
    { id: 'profile', name: 'Profile', icon: Award }
  ];

  const filteredItems = goldShopItems.filter(item => item.category === activeCategory);

  const isItemOwned = (item: GoldItem) => {
    return userPurchases.some(purchase => 
      purchase.item_name === item.name && 
      (!purchase.expires_at || new Date(purchase.expires_at) > new Date())
    );
  };

  const canAfford = (item: GoldItem) => {
    return user && user.gold_collected >= item.gold_cost;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-yellow-500 to-amber-500 p-6 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Crown className="w-8 h-8" />
              <div>
                <h2 className="text-2xl font-bold">Gold Shop</h2>
                <p className="text-yellow-100">Spend your gold on exclusive upgrades and boosts</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:text-yellow-200 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Gold Balance */}
          <div className="mt-4 bg-white/20 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <span className="text-yellow-100">Your Gold Balance</span>
              <span className="text-2xl font-bold">{user?.gold_collected || 0}</span>
            </div>
          </div>
        </div>

        {/* Category Tabs */}
        <div className="border-b border-gray-200 px-6">
          <div className="flex space-x-8 py-4">
            {categories.map((category) => {
              const IconComponent = category.icon;
              return (
                <button
                  key={category.id}
                  onClick={() => setActiveCategory(category.id)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
                    activeCategory === category.id
                      ? 'bg-yellow-100 text-yellow-700'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <IconComponent className="w-4 h-4" />
                  <span>{category.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Items Grid */}
        <div className="p-6 max-h-96 overflow-y-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredItems.map((item) => {
              const owned = isItemOwned(item);
              const affordable = canAfford(item);
              
              return (
                <div
                  key={item.id}
                  className={`p-6 rounded-2xl border transition-all duration-200 ${
                    owned
                      ? 'border-green-200 bg-green-50'
                      : affordable
                      ? 'border-gray-200 bg-white hover:shadow-md'
                      : 'border-gray-200 bg-gray-50'
                  }`}
                >
                  <div className="flex items-start space-x-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                      owned
                        ? 'bg-green-100 text-green-600'
                        : 'bg-gradient-to-r from-yellow-500 to-amber-500 text-white'
                    }`}>
                      {owned ? <Check className="w-6 h-6" /> : getIconComponent(item.icon)}
                    </div>

                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-semibold text-gray-900">{item.name}</h3>
                        {item.duration && (
                          <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                            {item.duration}
                          </span>
                        )}
                      </div>
                      
                      <p className="text-sm text-gray-600 mb-4">{item.description}</p>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Crown className="w-4 h-4 text-yellow-600" />
                          <span className="font-semibold text-yellow-700">{item.gold_cost} Gold</span>
                        </div>

                        <button
                          onClick={() => handlePurchase(item)}
                          disabled={loading || owned || !affordable}
                          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                            owned
                              ? 'bg-green-100 text-green-700 cursor-not-allowed'
                              : affordable
                              ? 'bg-gradient-to-r from-yellow-500 to-amber-500 hover:from-yellow-600 hover:to-amber-600 text-white'
                              : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                          }`}
                        >
                          {loading ? 'Processing...' : owned ? 'Owned' : affordable ? 'Purchase' : 'Not Enough Gold'}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
