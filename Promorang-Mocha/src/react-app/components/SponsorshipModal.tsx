import { useState } from 'react';
import { X, Clock, Zap, Star, Crown, Flame } from 'lucide-react';

interface SponsorshipModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSponsor: (gemAmount: number, boostMultiplier: number, durationHours: number) => void;
  contentTitle: string;
  userGems: number;
}

export default function SponsorshipModal({ 
  isOpen, 
  onClose, 
  onSponsor, 
  contentTitle, 
  userGems 
}: SponsorshipModalProps) {
  const [selectedPackage, setSelectedPackage] = useState<any>(null);

  if (!isOpen) return null;

  const sponsorshipPackages = [
    { 
      id: 'quick',
      name: "Quick Boost", 
      gems: 25, 
      multiplier: 1.5, 
      duration: 1, 
      description: "1.5x visibility for 1 hour",
      icon: <Zap className="w-5 h-5" />,
      color: "from-blue-500 to-cyan-500"
    },
    { 
      id: 'popular',
      name: "Popular Boost", 
      gems: 50, 
      multiplier: 2.0, 
      duration: 6, 
      description: "2x visibility for 6 hours",
      icon: <Star className="w-5 h-5" />,
      color: "from-purple-500 to-pink-500"
    },
    { 
      id: 'daily',
      name: "Daily Featured", 
      gems: 100, 
      multiplier: 3.0, 
      duration: 24, 
      description: "3x visibility for 24 hours",
      icon: <Crown className="w-5 h-5" />,
      color: "from-orange-500 to-red-500"
    },
    { 
      id: 'premium',
      name: "Premium Spotlight", 
      gems: 200, 
      multiplier: 4.0, 
      duration: 72, 
      description: "4x visibility for 3 days",
      icon: <Flame className="w-5 h-5" />,
      color: "from-red-500 to-pink-500"
    },
    { 
      id: 'viral',
      name: "Viral Campaign", 
      gems: 500, 
      multiplier: 6.0, 
      duration: 168, 
      description: "6x visibility for 1 week",
      icon: <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
      </svg>,
      color: "from-yellow-500 to-orange-500"
    }
  ];

  const formatDuration = (hours: number) => {
    if (hours < 24) {
      return `${hours} hour${hours !== 1 ? 's' : ''}`;
    } else if (hours < 168) {
      const days = Math.floor(hours / 24);
      return `${days} day${days !== 1 ? 's' : ''}`;
    } else {
      const weeks = Math.floor(hours / 168);
      return `${weeks} week${weeks !== 1 ? 's' : ''}`;
    }
  };

  const handleSponsor = () => {
    if (!selectedPackage) return;
    onSponsor(selectedPackage.gems, selectedPackage.multiplier, selectedPackage.duration);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Sponsor Content</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="mb-6">
            <h3 className="font-semibold text-gray-900 mb-2">{contentTitle}</h3>
            <p className="text-sm text-gray-600 leading-relaxed">
              Sponsoring content boosts its visibility in user feeds and gives it priority placement. 
              Multiple sponsors can boost the same content, increasing its reach exponentially. 
              Your brand will be credited as a sponsor to all users who see this content.
            </p>
          </div>

          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-gray-700">Your Gem Balance</span>
              <span className="text-lg font-semibold text-purple-600">{userGems} gems</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div 
                className="bg-gradient-to-r from-purple-500 to-pink-500 h-3 rounded-full transition-all duration-300"
                style={{ width: `${Math.min(100, (userGems / 500) * 100)}%` }}
              ></div>
            </div>
          </div>

          <div className="space-y-4 mb-8">
            <h4 className="font-semibold text-gray-900 text-lg mb-4">Choose Your Sponsorship Package</h4>
            <div className="grid gap-4">
              {sponsorshipPackages.map((pkg) => (
                <div
                  key={pkg.id}
                  className={`border rounded-xl p-4 cursor-pointer transition-all duration-200 ${
                    selectedPackage?.id === pkg.id
                      ? 'border-purple-500 bg-purple-50 shadow-lg scale-[1.02]'
                      : 'border-gray-200 hover:border-gray-300 hover:shadow-md'
                  } ${pkg.gems > userGems ? 'opacity-50 cursor-not-allowed' : ''}`}
                  onClick={() => {
                    if (pkg.gems <= userGems) {
                      setSelectedPackage(pkg);
                    }
                  }}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4">
                      <div className={`p-3 rounded-xl bg-gradient-to-r ${pkg.color} text-white`}>
                        {pkg.icon}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <h5 className="font-semibold text-gray-900">{pkg.name}</h5>
                          {pkg.id === 'popular' && (
                            <span className="bg-orange-100 text-orange-700 px-2 py-1 rounded-full text-xs font-medium">
                              Most Popular
                            </span>
                          )}
                          {pkg.id === 'viral' && (
                            <span className="bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full text-xs font-medium">
                              Best Value
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 mb-2">{pkg.description}</p>
                        <div className="flex items-center space-x-4 text-xs text-gray-500">
                          <div className="flex items-center space-x-1">
                            <Clock className="w-3 h-3" />
                            <span>Duration: {formatDuration(pkg.duration)}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Zap className="w-3 h-3" />
                            <span>{pkg.multiplier}x visibility boost</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-purple-600">{pkg.gems}</p>
                      <p className="text-xs text-gray-500">gems</p>
                      {pkg.gems > userGems && (
                        <p className="text-xs text-red-500 mt-1">Insufficient gems</p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {selectedPackage && (
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-xl p-4 mb-6">
              <h5 className="font-semibold text-purple-900 mb-2">Sponsorship Preview</h5>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-purple-700">Package:</span>
                  <span className="font-medium text-purple-900 ml-2">{selectedPackage.name}</span>
                </div>
                <div>
                  <span className="text-purple-700">Duration:</span>
                  <span className="font-medium text-purple-900 ml-2">{formatDuration(selectedPackage.duration)}</span>
                </div>
                <div>
                  <span className="text-purple-700">Visibility Boost:</span>
                  <span className="font-medium text-purple-900 ml-2">{selectedPackage.multiplier}x</span>
                </div>
                <div>
                  <span className="text-purple-700">Cost:</span>
                  <span className="font-medium text-purple-900 ml-2">{selectedPackage.gems} gems</span>
                </div>
              </div>
              <div className="mt-3 pt-3 border-t border-purple-200">
                <p className="text-xs text-purple-700">
                  Your brand name will be displayed as a sponsor on this content. 
                  Multiple sponsors can boost the same content for increased visibility.
                </p>
              </div>
            </div>
          )}

          <div className="space-y-3">
            <button
              onClick={handleSponsor}
              disabled={!selectedPackage || (selectedPackage?.gems > userGems)}
              className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-6 py-4 rounded-xl font-semibold transition-all duration-200 shadow-lg"
            >
              {selectedPackage 
                ? `Sponsor for ${selectedPackage.gems} gems` 
                : 'Select a sponsorship package'
              }
            </button>
            <button
              onClick={onClose}
              className="w-full border border-gray-300 hover:border-gray-400 text-gray-700 px-6 py-3 rounded-xl font-medium transition-all duration-200"
            >
              Cancel
            </button>
          </div>

          <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h5 className="font-medium text-blue-900 mb-2">💡 Sponsorship Benefits</h5>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• Your brand appears on sponsored content</li>
              <li>• Content gets priority placement in feeds</li>
              <li>• Multiple sponsors increase total visibility boost</li>
              <li>• Reach engaged users interested in the content topic</li>
              <li>• Analytics provided on sponsorship performance</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
