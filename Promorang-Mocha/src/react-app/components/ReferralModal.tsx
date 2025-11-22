import { useState } from 'react';
import { X, Users, Gift, Copy, Check } from 'lucide-react';
import { UserType } from '@/shared/types';

interface ReferralModalProps {
  user: UserType | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function ReferralModal({ user, isOpen, onClose, onSuccess }: ReferralModalProps) {
  const [referralCode, setReferralCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  if (!isOpen || !user) return null;

  const handleSubmitCode = async () => {
    if (!referralCode.trim()) {
      setError('Please enter a referral code');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/users/process-referral', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ referral_code: referralCode.toUpperCase() })
      });

      if (response.ok) {
        const result = await response.json();
        onSuccess();
        onClose();
        showSuccessNotification(result.referred_reward);
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to process referral');
      }
    } catch (error) {
      console.error('Referral processing failed:', error);
      setError('Network error occurred');
    } finally {
      setLoading(false);
    }
  };

  const copyReferralLink = async () => {
    const referralLink = `https://promorang.com?ref=${user.referral_code}`;
    await navigator.clipboard.writeText(referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const showSuccessNotification = (points: number) => {
    const notification = document.createElement('div');
    notification.className = 'fixed top-4 right-4 bg-green-500 text-white px-6 py-4 rounded-xl shadow-lg z-50 animate-pulse';
    notification.innerHTML = `
      <div class="flex items-center space-x-3">
        <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
          <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
        </svg>
        <div>
          <div class="font-bold">Referral Success!</div>
          <div class="text-sm">You earned ${points} points!</div>
        </div>
      </div>
    `;
    document.body.appendChild(notification);
    setTimeout(() => {
      if (document.body.contains(notification)) {
        document.body.removeChild(notification);
      }
    }, 4000);
  };

  const referralLink = `https://promorang.com?ref=${user.referral_code}`;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-2xl">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <Users className="w-6 h-6 text-purple-600" />
            <div>
              <h2 className="text-xl font-bold text-gray-900">Referral Program</h2>
              <p className="text-sm text-gray-600">Invite friends and earn together</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Your Referral Code */}
          <div className="bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-200 rounded-2xl p-6">
            <h3 className="text-lg font-semibold text-purple-900 mb-4">Your Referral Code</h3>
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <code className="flex-1 bg-white px-4 py-3 rounded-xl border font-mono text-lg text-center">
                  {user.referral_code}
                </code>
                <button
                  onClick={copyReferralLink}
                  className="p-3 bg-purple-500 hover:bg-purple-600 text-white rounded-xl transition-colors"
                >
                  {copied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                </button>
              </div>
              <p className="text-sm text-purple-700 text-center">
                Share this code or the link below with friends
              </p>
              <div className="bg-white rounded-xl p-3 border">
                <p className="text-sm text-gray-600 break-all">{referralLink}</p>
              </div>
            </div>
          </div>

          {/* How It Works */}
          <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6">
            <h4 className="font-medium text-blue-900 mb-4">How It Works</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <Users className="w-6 h-6 text-blue-600" />
                </div>
                <h5 className="font-medium text-blue-900 mb-1">Share</h5>
                <p className="text-sm text-blue-700">Send your code to friends</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <Gift className="w-6 h-6 text-blue-600" />
                </div>
                <h5 className="font-medium text-blue-900 mb-1">They Join</h5>
                <p className="text-sm text-blue-700">Friend signs up with your code</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <Gift className="w-6 h-6 text-blue-600" />
                </div>
                <h5 className="font-medium text-blue-900 mb-1">Both Earn</h5>
                <p className="text-sm text-blue-700">You get 500, they get 250 points</p>
              </div>
            </div>
          </div>

          {/* Use Referral Code */}
          {!user.referred_by && (
            <div className="border border-gray-200 rounded-2xl p-6">
              <h4 className="font-medium text-gray-900 mb-4">Have a Referral Code?</h4>
              <div className="space-y-4">
                <input
                  type="text"
                  value={referralCode}
                  onChange={(e) => setReferralCode(e.target.value.toUpperCase())}
                  placeholder="Enter referral code"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent font-mono"
                  maxLength={6}
                />
                
                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-xl p-3">
                    <p className="text-sm text-red-700">{error}</p>
                  </div>
                )}

                <button
                  onClick={handleSubmitCode}
                  disabled={!referralCode.trim() || loading}
                  className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed text-white px-4 py-3 rounded-xl font-medium transition-all duration-200 flex items-center justify-center space-x-2"
                >
                  {loading ? (
                    <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full"></div>
                  ) : (
                    <>
                      <Gift className="w-5 h-5" />
                      <span>Apply Code & Earn 250 Points</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Already Used Code */}
          {user.referred_by && (
            <div className="bg-green-50 border border-green-200 rounded-2xl p-4">
              <div className="flex items-center space-x-3">
                <Check className="w-6 h-6 text-green-600" />
                <div>
                  <h4 className="font-medium text-green-900">Referral Applied</h4>
                  <p className="text-sm text-green-700">You joined using code: {user.referred_by}</p>
                </div>
              </div>
            </div>
          )}

          {/* Rewards Info */}
          <div className="bg-gradient-to-br from-yellow-50 to-orange-50 border border-yellow-200 rounded-2xl p-6">
            <h4 className="font-medium text-yellow-900 mb-3">Earning Potential</h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-700">500</div>
                <div className="text-sm text-yellow-600">Points per referral</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-700">∞</div>
                <div className="text-sm text-yellow-600">No limit on referrals</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
