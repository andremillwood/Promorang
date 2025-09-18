import { useState } from 'react';
import { X, Instagram, CheckCircle, Copy, Check, TrendingUp } from 'lucide-react';
import { UserType } from '@/shared/types';

interface InstagramVerificationModalProps {
  user: UserType | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function InstagramVerificationModal({ user, isOpen, onClose, onSuccess }: InstagramVerificationModalProps) {
  const [step, setStep] = useState(1);
  const [instagramUsername, setInstagramUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen || !user) return null;

  const handleRegisterInstagram = async () => {
    if (!instagramUsername.trim()) {
      setError('Please enter your Instagram username');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/users/register-instagram', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ instagram_username: instagramUsername })
      });

      if (response.ok) {
        setStep(2);
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Registration failed');
      }
    } catch (error) {
      console.error('Instagram registration failed:', error);
      setError('Network error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleClaimPoints = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/users/claim-instagram-points', {
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
        setInstagramUsername('');
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

  const copyToClipboard = async (text: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getTierPoints = (tier: string) => {
    switch (tier) {
      case 'super': return 1000;
      case 'premium': return 750;
      case 'free':
      default: return 500;
    }
  };

  const tierPoints = getTierPoints(user.user_tier);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-2">
            <Instagram className="w-6 h-6 text-pink-600" />
            <h2 className="text-xl font-bold text-gray-900">Instagram Verification</h2>
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
              <div className="w-16 h-16 bg-gradient-to-br from-pink-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Instagram className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Connect Your Instagram</h3>
              <p className="text-gray-600 text-sm">
                Verify your Instagram account to earn {tierPoints} PromoPoints monthly
              </p>
            </div>

            <div className="bg-gradient-to-r from-pink-50 to-purple-50 border border-pink-200 rounded-lg p-4">
              <h4 className="font-medium text-pink-900 mb-2">Monthly Benefits</h4>
              <div className="space-y-2 text-sm text-pink-700">
                <div className="flex items-center justify-between">
                  <span>Your Tier:</span>
                  <span className="font-semibold capitalize">{user.user_tier}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Monthly Points:</span>
                  <span className="font-bold text-pink-600">{tierPoints} points</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Key Equivalent:</span>
                  <span className="font-medium">{Math.floor(tierPoints / 500)} keys</span>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Instagram Username
              </label>
              <input
                type="text"
                value={instagramUsername}
                onChange={(e) => setInstagramUsername(e.target.value)}
                placeholder="@yourusername"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
              />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            {/* Influence Rewards Promotion */}
            <div className="bg-gradient-to-r from-blue-50 to-cyan-50 border border-blue-200 rounded-lg p-4 mt-6">
              <h4 className="font-medium text-blue-900 mb-2 flex items-center space-x-2">
                <TrendingUp className="w-4 h-4" />
                <span>Want Even More Rewards?</span>
              </h4>
              <p className="text-sm text-blue-700 mb-4">
                Try our new <strong>Influence Rewards</strong> program! Earn dynamic monthly points based on your actual follower count (followers × 0.01).
              </p>
              <div className="flex items-center justify-between text-sm">
                <div className="space-y-1">
                  <div className="text-blue-600">• 5,000 followers = 50 points/month</div>
                  <div className="text-blue-600">• 10,000 followers = 100 points/month</div>
                  <div className="text-blue-600">• 50,000 followers = 500 points/month</div>
                </div>
                <button
                  onClick={() => {
                    onClose(); // Close the current modal
                    // Navigate to profile with query param to open Influence Rewards
                    window.location.href = '/profile?openInfluenceRewards=true';
                  }}
                  className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white px-4 py-2 rounded-lg font-medium transition-all duration-200"
                >
                  Learn More
                </button>
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
                onClick={handleRegisterInstagram}
                disabled={loading || !instagramUsername.trim()}
                className="flex-1 bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 disabled:opacity-50 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg font-medium transition-all duration-200"
              >
                {loading ? 'Registering...' : 'Continue'}
              </button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Send Verification DM</h3>
              <p className="text-gray-600 text-sm">
                Send a DM to @promorangco on Instagram with the word below
              </p>
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-gray-900">Message to send:</h4>
                  <code className="text-lg font-mono bg-white px-3 py-2 rounded border mt-2 block">
                    promopoints
                  </code>
                </div>
                <button
                  onClick={() => copyToClipboard('promopoints')}
                  className="p-2 bg-gray-200 hover:bg-gray-300 rounded transition-colors"
                  title="Copy message"
                >
                  {copied ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-medium text-blue-900 mb-2">Next Steps:</h4>
              <ol className="text-sm text-blue-700 space-y-1">
                <li>1. Open Instagram and go to @promorangco</li>
                <li>2. Send a DM with exactly: <strong>promopoints</strong></li>
                <li>3. Wait for verification (usually within 24 hours)</li>
                <li>4. Return here to claim your monthly points</li>
              </ol>
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
                  setInstagramUsername('');
                  setError(null);
                }}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors"
              >
                Try Different Username
              </button>
            </div>

            {/* Influence Rewards Promotion for Step 2 */}
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-lg p-4 mt-6">
              <h4 className="font-medium text-purple-900 mb-2 flex items-center space-x-2">
                <TrendingUp className="w-4 h-4" />
                <span>Maximize Your Instagram Earning Potential!</span>
              </h4>
              <p className="text-sm text-purple-700 mb-4">
                While you wait for verification, explore our <strong>Influence Rewards</strong> program for dynamic monthly points based on your follower count.
              </p>
              <button
                onClick={() => {
                  onClose(); // Close the current modal
                  // Navigate to profile with query param to open Influence Rewards
                  window.location.href = '/profile?openInfluenceRewards=true';
                }}
                className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-4 py-2 rounded-lg font-medium transition-all duration-200"
              >
                Discover Influence Rewards
              </button>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
