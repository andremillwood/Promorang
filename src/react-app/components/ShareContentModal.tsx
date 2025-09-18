import { useState } from 'react';
import { X, Share2, ExternalLink, Copy, Check } from 'lucide-react';
import { UserType } from '@/shared/types';

interface ShareContentModalProps {
  user: UserType | null;
  contentId?: number;
  contentTitle?: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function ShareContentModal({ user, contentId, contentTitle, isOpen, onClose, onSuccess }: ShareContentModalProps) {
  const [platform, setPlatform] = useState('instagram');
  const [shareUrl, setShareUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen || !user) return null;

  const platforms = [
    { id: 'instagram', name: 'Instagram', color: 'from-pink-500 to-purple-600' },
    { id: 'tiktok', name: 'TikTok', color: 'from-black to-gray-800' },
    { id: 'twitter', name: 'Twitter', color: 'from-blue-400 to-blue-600' },
    { id: 'facebook', name: 'Facebook', color: 'from-blue-600 to-blue-800' },
    { id: 'linkedin', name: 'LinkedIn', color: 'from-blue-500 to-blue-700' },
  ];

  const getTierMultiplier = (tier: string) => {
    switch (tier) {
      case 'super': return 2.0;
      case 'premium': return 1.5;
      case 'free':
      default: return 1.0;
    }
  };

  const calculatePoints = () => {
    const basePoints = 10;
    const multiplier = getTierMultiplier(user.user_tier);
    return Math.floor(basePoints * multiplier);
  };

  const handleShare = async () => {
    if (!shareUrl.trim()) {
      setError('Please enter the share URL');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/users/share-content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          content_id: contentId,
          platform,
          share_url: shareUrl
        })
      });

      if (response.ok) {
        await response.json();
        onSuccess();
        onClose();
        // Reset form
        setShareUrl('');
        setPlatform('instagram');
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Share recording failed');
      }
    } catch (error) {
      console.error('Share recording failed:', error);
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

  const generateShareText = () => {
    const baseText = contentTitle 
      ? `Check out this amazing content: "${contentTitle}" on Promorang!`
      : 'Discover amazing content and earn while you engage on Promorang!';
    
    return `${baseText} Join me: https://promorang.com`;
  };

  const pointsToEarn = calculatePoints();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-2">
            <Share2 className="w-6 h-6 text-orange-600" />
            <h2 className="text-xl font-bold text-gray-900">Share Content</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="space-y-6">
          {/* Points Preview */}
          <div className="bg-gradient-to-r from-orange-50 to-red-50 border border-orange-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-orange-900">Points to Earn</span>
              <span className="text-xl font-bold text-orange-600">{pointsToEarn}</span>
            </div>
            <div className="text-xs text-orange-700">
              Base: 10 pts × {getTierMultiplier(user.user_tier)}x ({user.user_tier} tier)
            </div>
          </div>

          {/* Platform Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Platform
            </label>
            <div className="grid grid-cols-2 gap-2">
              {platforms.map((p) => (
                <button
                  key={p.id}
                  onClick={() => setPlatform(p.id)}
                  className={`p-3 rounded-lg border-2 transition-colors ${
                    platform === p.id
                      ? 'border-orange-500 bg-orange-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className={`w-8 h-8 bg-gradient-to-r ${p.color} rounded-lg mx-auto mb-1`}></div>
                  <span className="text-sm font-medium">{p.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Share Text */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Suggested Share Text
            </label>
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-sm text-gray-700 mb-2">{generateShareText()}</p>
              <button
                onClick={() => copyToClipboard(generateShareText())}
                className="flex items-center space-x-2 text-orange-600 hover:text-orange-700 text-sm font-medium"
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                <span>{copied ? 'Copied!' : 'Copy Text'}</span>
              </button>
            </div>
          </div>

          {/* Share URL Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Share URL *
            </label>
            <input
              type="url"
              value={shareUrl}
              onChange={(e) => setShareUrl(e.target.value)}
              placeholder="https://instagram.com/p/your-post-id/"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            />
            <p className="text-xs text-gray-600 mt-1">
              Paste the URL of your shared post to verify and earn points
            </p>
          </div>

          {/* How it Works */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-medium text-blue-900 mb-2">How It Works</h4>
            <ol className="text-sm text-blue-700 space-y-1">
              <li>1. Copy the suggested text or create your own</li>
              <li>2. Share on your chosen platform with Promorang mention</li>
              <li>3. Paste the URL of your shared post here</li>
              <li>4. Earn {pointsToEarn} points instantly!</li>
            </ol>
          </div>

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
              Cancel
            </button>
            <button
              onClick={handleShare}
              disabled={!shareUrl.trim() || loading}
              className="flex-1 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 disabled:opacity-50 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg font-medium transition-all duration-200 flex items-center justify-center space-x-2"
            >
              {loading ? (
                <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>
              ) : (
                <>
                  <ExternalLink className="w-4 h-4" />
                  <span>Record Share</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
