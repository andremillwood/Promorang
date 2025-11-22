import { useState } from 'react';
import { X, Instagram, TrendingUp, Users, CheckCircle, AlertCircle, Phone, Mail, User, Calendar } from 'lucide-react';
import { UserType } from '@/shared/types';

interface InfluenceRewardsModalProps {
  user: UserType | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

interface InfluenceRewardData {
  id: number;
  platform: string;
  platform_username: string;
  follower_count: number;
  points_calculated: number;
  points_awarded: number;
  current_month: string;
  status: string;
  last_updated_at: string;
  created_at: string;
}

export default function InfluenceRewardsModal({ user, isOpen, onClose, onSuccess }: InfluenceRewardsModalProps) {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    full_name: '',
    instagram_username: '',
    phone_number: '',
    email: '',
    follower_count: ''
  });
  const [rewardData, setRewardData] = useState<InfluenceRewardData | null>(null);

  if (!isOpen || !user) return null;

  const handleSubmit = async () => {
    if (!formData.full_name || !formData.instagram_username || !formData.phone_number || !formData.email || !formData.follower_count) {
      setError('Please fill in all required fields');
      return;
    }

    if (parseInt(formData.follower_count) < 500) {
      setError('Minimum 500 followers required for influence rewards');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/users/register-influence-rewards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          full_name: formData.full_name,
          platform: 'instagram',
          platform_username: formData.instagram_username,
          phone_number: formData.phone_number,
          email: formData.email,
          follower_count: parseInt(formData.follower_count)
        })
      });

      if (response.ok) {
        const data = await response.json();
        setRewardData(data);
        setStep(2);
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Registration failed');
      }
    } catch (error) {
      console.error('Influence rewards registration failed:', error);
      setError('Network error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleClaimPoints = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/users/claim-influence-points', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({})
      });

      if (response.ok) {
        await response.json();
        onSuccess();
        onClose();
        setStep(1);
        setFormData({
          full_name: '',
          instagram_username: '',
          phone_number: '',
          email: '',
          follower_count: ''
        });
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to claim points');
      }
    } catch (error) {
      console.error('Point claiming failed:', error);
      setError('Network error occurred');
    } finally {
      setLoading(false);
    }
  };

  const calculatePoints = (followers: number) => {
    return Math.floor(followers * 0.01);
  };

  const getCurrentMonth = () => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-2">
            <TrendingUp className="w-6 h-6 text-blue-600" />
            <h2 className="text-xl font-bold text-gray-900">Influence Rewards</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {step === 1 && (
          <div className="space-y-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Earn Points from Your Influence</h3>
              <p className="text-gray-600 text-sm">
                Get dynamic monthly points based on your real social media follower count
              </p>
            </div>

            <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-medium text-blue-900 mb-2">How It Works</h4>
              <div className="space-y-2 text-sm text-blue-700">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-blue-600" />
                  <span>Your follower count × 0.01 = monthly points</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-blue-600" />
                  <span>Points refresh monthly - no rollover</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-blue-600" />
                  <span>Must re-verify each month to maintain points</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-blue-600" />
                  <span>Minimum 500 followers required</span>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="font-medium text-gray-900">Enter Your Information</h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <User className="w-4 h-4 inline mr-1" />
                    Full Name *
                  </label>
                  <input
                    type="text"
                    value={formData.full_name}
                    onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                    placeholder="Enter your full name"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Instagram className="w-4 h-4 inline mr-1" />
                    Instagram Username *
                  </label>
                  <input
                    type="text"
                    value={formData.instagram_username}
                    onChange={(e) => setFormData({ ...formData, instagram_username: e.target.value })}
                    placeholder="@yourusername"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Phone className="w-4 h-4 inline mr-1" />
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    value={formData.phone_number}
                    onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
                    placeholder="+1 (555) 123-4567"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Mail className="w-4 h-4 inline mr-1" />
                    Email Address *
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="your@email.com"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Users className="w-4 h-4 inline mr-1" />
                  Current Follower Count *
                </label>
                <input
                  type="number"
                  min="500"
                  value={formData.follower_count}
                  onChange={(e) => setFormData({ ...formData, follower_count: e.target.value })}
                  placeholder="e.g. 5000"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                {formData.follower_count && (
                  <div className="mt-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-green-700">
                        Monthly Points:
                      </span>
                      <span className="font-bold text-green-800">
                        {calculatePoints(parseInt(formData.follower_count) || 0)} points
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <div className="flex items-start space-x-2">
                  <AlertCircle className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              </div>
            )}

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-start space-x-2">
                <AlertCircle className="w-4 h-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-yellow-800">
                  <p className="font-medium mb-1">Important Notes:</p>
                  <ul className="space-y-1">
                    <li>• Your information will be verified through our Many Chat integration</li>
                    <li>• Points are awarded monthly and do not carry over</li>
                    <li>• You must re-register each month to maintain your rewards</li>
                    <li>• Minimum 500 followers required</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="flex space-x-3">
              <button
                onClick={onClose}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 disabled:opacity-50 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg font-medium transition-all duration-200"
              >
                {loading ? 'Processing...' : 'Register for Rewards'}
              </button>
            </div>
          </div>
        )}

        {step === 2 && rewardData && (
          <div className="space-y-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Registration Successful!</h3>
              <p className="text-gray-600 text-sm">
                Your influence rewards have been calculated for {getCurrentMonth()}
              </p>
            </div>

            <div className="bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg p-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-700">Platform:</span>
                  <div className="flex items-center space-x-2">
                    <Instagram className="w-4 h-4 text-pink-600" />
                    <span className="font-medium">Instagram</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-700">Username:</span>
                  <span className="font-medium">@{rewardData.platform_username}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-700">Followers:</span>
                  <span className="font-bold text-blue-600">{rewardData.follower_count.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-700">Monthly Points:</span>
                  <span className="font-bold text-green-600">{rewardData.points_calculated} points</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-700">Current Month:</span>
                  <span className="font-medium">{rewardData.current_month}</span>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start space-x-2">
                <Calendar className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-blue-800">
                  <p className="font-medium mb-1">Next Steps:</p>
                  <p>Your registration has been submitted for verification through our Many Chat system. You'll be able to claim your {rewardData.points_calculated} points once verification is complete.</p>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <button
                onClick={handleClaimPoints}
                disabled={loading}
                className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 disabled:opacity-50 text-white px-4 py-2 rounded-lg font-medium transition-all duration-200"
              >
                {loading ? 'Checking...' : 'Claim Points (if verified)'}
              </button>
              
              <button
                onClick={() => {
                  setStep(1);
                  setRewardData(null);
                  setError(null);
                }}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors"
              >
                Register Different Account
              </button>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <div className="flex items-start space-x-2">
                  <AlertCircle className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
