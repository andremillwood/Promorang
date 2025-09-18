import { useState, useEffect } from 'react';
import { X, Shield, Zap, CheckCircle, Clock, Star } from 'lucide-react';
import { UserType, MasterKeyActivationType } from '@/shared/types';

interface MasterKeyModalProps {
  user: UserType | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function MasterKeyModal({ user, isOpen, onClose, onSuccess }: MasterKeyModalProps) {
  const [loading, setLoading] = useState(false);
  const [masterKeyStatus, setMasterKeyStatus] = useState<MasterKeyActivationType | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && user) {
      fetchMasterKeyStatus();
    }
  }, [isOpen, user]);

  const fetchMasterKeyStatus = async () => {
    try {
      const response = await fetch('/api/users/master-key-status', { credentials: 'include' });
      if (response.ok) {
        const data = await response.json();
        setMasterKeyStatus(data);
      }
    } catch (error) {
      console.error('Failed to fetch master key status:', error);
    }
  };

  const handleActivate = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/users/activate-master-key', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({})
      });

      if (response.ok) {
        await fetchMasterKeyStatus();
        onSuccess();
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Activation failed');
      }
    } catch (error) {
      console.error('Master key activation failed:', error);
      setError('Network error occurred');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !user) return null;

  const getTierInfo = (tier: string) => {
    switch (tier) {
      case 'super':
        return { name: 'Super', required: 1, color: 'text-yellow-600', bgColor: 'bg-yellow-50' };
      case 'premium':
        return { name: 'Premium', required: 2, color: 'text-purple-600', bgColor: 'bg-purple-50' };
      case 'free':
      default:
        return { name: 'Free', required: 5, color: 'text-gray-600', bgColor: 'bg-gray-50' };
    }
  };

  const tierInfo = getTierInfo(user.user_tier);
  const isActivated = masterKeyStatus?.is_activated || false;
  const canActivate = masterKeyStatus ? 
    masterKeyStatus.proof_drops_completed >= masterKeyStatus.proof_drops_required : 
    false;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-lg mx-4">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-2">
            <Shield className="w-6 h-6 text-purple-600" />
            <h2 className="text-xl font-bold text-gray-900">Master Key System</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="space-y-6">
          {/* Tier Information */}
          <div className={`${tierInfo.bgColor} border border-purple-200 rounded-lg p-4`}>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <Star className={`w-5 h-5 ${tierInfo.color}`} />
                <span className={`font-semibold ${tierInfo.color}`}>{tierInfo.name} Tier</span>
              </div>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${tierInfo.color} bg-white`}>
                {tierInfo.required} proof drop{tierInfo.required > 1 ? 's' : ''} required
              </span>
            </div>
            <p className="text-sm text-gray-700">
              Complete {tierInfo.required} proof drop{tierInfo.required > 1 ? 's' : ''} daily to activate your Master Key and unlock the ability to apply for paid drops.
            </p>
          </div>

          {/* Current Status */}
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-gray-900">Today's Progress</h3>
              <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                isActivated 
                  ? 'text-green-600 bg-green-100' 
                  : 'text-orange-600 bg-orange-100'
              }`}>
                {isActivated ? 'Activated' : 'Not Activated'}
              </div>
            </div>
            
            {masterKeyStatus && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Proof Drops Completed</span>
                  <span className="font-semibold text-gray-900">
                    {masterKeyStatus.proof_drops_completed}/{masterKeyStatus.proof_drops_required}
                  </span>
                </div>
                
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full transition-all duration-300 ${
                      isActivated ? 'bg-green-500' : 'bg-orange-500'
                    }`}
                    style={{ 
                      width: `${Math.min(100, (masterKeyStatus.proof_drops_completed / masterKeyStatus.proof_drops_required) * 100)}%` 
                    }}
                  ></div>
                </div>
                
                {!isActivated && masterKeyStatus.proof_drops_completed > 0 && (
                  <p className="text-sm text-gray-600">
                    {masterKeyStatus.proof_drops_required - masterKeyStatus.proof_drops_completed} more proof drop{masterKeyStatus.proof_drops_required - masterKeyStatus.proof_drops_completed > 1 ? 's' : ''} needed
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Benefits */}
          <div className="space-y-3">
            <h3 className="font-semibold text-gray-900">Master Key Benefits</h3>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span className="text-sm text-gray-700">Apply for paid drops using Keys</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span className="text-sm text-gray-700">Earn Gems from completed drops</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span className="text-sm text-gray-700">Access to premium opportunities</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span className="text-sm text-gray-700">Higher earning potential</span>
              </div>
            </div>
          </div>

          {/* How to Earn Proof Drops */}
          {!isActivated && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <Zap className="w-4 h-4 text-blue-600" />
                <span className="font-medium text-blue-900">How to Earn Proof Drops</span>
              </div>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• Complete free social actions (likes, comments, shares)</li>
                <li>• Participate in community challenges</li>
                <li>• Engage with content daily</li>
                <li>• Maintain your daily streak</li>
              </ul>
            </div>
          )}

          {/* Error Display */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex space-x-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors"
            >
              Close
            </button>
            
            {!isActivated && (
              <button
                onClick={handleActivate}
                disabled={!canActivate || loading}
                className="flex-1 bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg font-medium transition-all duration-200 flex items-center justify-center space-x-2"
              >
                {loading ? (
                  <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>
                ) : canActivate ? (
                  <>
                    <Shield className="w-4 h-4" />
                    <span>Activate</span>
                  </>
                ) : (
                  <>
                    <Clock className="w-4 h-4" />
                    <span>Complete Proofs</span>
                  </>
                )}
              </button>
            )}
            
            {isActivated && (
              <div className="flex-1 bg-green-100 text-green-700 px-4 py-2 rounded-lg font-medium flex items-center justify-center space-x-2">
                <CheckCircle className="w-4 h-4" />
                <span>Activated</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
