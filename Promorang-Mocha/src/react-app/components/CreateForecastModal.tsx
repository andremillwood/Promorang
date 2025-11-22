import { useState, useEffect } from 'react';
import { X, TrendingUp, Clock, Target, DollarSign } from 'lucide-react';

interface CreateForecastModalProps {
  isOpen: boolean;
  onClose: () => void;
  onForecastCreated: () => void;
}

interface ContentOption {
  id: number;
  title: string;
  platform: string;
  platform_url: string;
  creator_name: string;
}

export default function CreateForecastModal({ isOpen, onClose, onForecastCreated }: CreateForecastModalProps) {
  const [formData, setFormData] = useState({
    content_id: '',
    platform: 'instagram',
    content_url: '',
    forecast_type: 'views',
    target_value: '',
    odds: '2',
    expires_at: '',
    initial_amount: '',
    initial_side: 'over'
  });
  const [contentOptions, setContentOptions] = useState<ContentOption[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [userWallet, setUserWallet] = useState({ balance: 0 });

  useEffect(() => {
    if (isOpen) {
      fetchContentOptions();
      fetchUserWallet();
      
      // Set default expiration to 24 hours from now
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      setFormData(prev => ({
        ...prev,
        expires_at: tomorrow.toISOString().slice(0, 16)
      }));
    }
  }, [isOpen]);

  const fetchContentOptions = async () => {
    try {
      const response = await fetch('/api/content');
      if (response.ok) {
        const content = await response.json();
        setContentOptions(content.slice(0, 20)); // Limit to recent 20 pieces
      }
    } catch (error) {
      console.error('Failed to fetch content:', error);
    }
  };

  const fetchUserWallet = async () => {
    try {
      const response = await fetch('/api/users/wallets');
      if (response.ok) {
        const wallets = await response.json();
        const usdWallet = wallets.find((w: any) => w.currency_type === 'USD');
        setUserWallet({ balance: usdWallet?.balance || 0 });
      }
    } catch (error) {
      console.error('Failed to fetch wallet:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      const response = await fetch('/api/social-forecasts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          content_id: formData.content_id ? parseInt(formData.content_id) : undefined,
          target_value: parseInt(formData.target_value),
          odds: parseFloat(formData.odds),
          initial_amount: parseFloat(formData.initial_amount),
        }),
      });

      if (response.ok) {
        onForecastCreated();
        onClose();
        setFormData({
          content_id: '',
          platform: 'instagram',
          content_url: '',
          forecast_type: 'views',
          target_value: '',
          odds: '2',
          expires_at: '',
          initial_amount: '',
          initial_side: 'over'
        });
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to create forecast');
      }
    } catch (error) {
      setError('Failed to create forecast');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleContentSelect = (content: ContentOption) => {
    setFormData(prev => ({
      ...prev,
      content_id: content.id.toString(),
      platform: content.platform,
      content_url: content.platform_url
    }));
  };

  const potentialPayout = formData.initial_amount ? 
    (parseFloat(formData.initial_amount) * parseFloat(formData.odds)).toFixed(2) : '0';

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900 flex items-center">
              <TrendingUp className="w-5 h-5 mr-2 text-blue-600" />
              Create Social Forecast
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
          <p className="text-sm text-gray-600 mt-2">
            Create a prediction market by putting up your own initial stake. Others can then predict on your forecast.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          {/* Content Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Content to Forecast On
            </label>
            <div className="space-y-3">
              {/* Existing Content Options */}
              {contentOptions.length > 0 && (
                <div>
                  <p className="text-xs text-gray-500 mb-2">Select from Promorang content:</p>
                  <div className="max-h-32 overflow-y-auto border border-gray-200 rounded-lg">
                    {contentOptions.map((content) => (
                      <button
                        key={content.id}
                        type="button"
                        onClick={() => handleContentSelect(content)}
                        className={`w-full text-left p-3 border-b border-gray-100 hover:bg-gray-50 ${
                          formData.content_id === content.id.toString() ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''
                        }`}
                      >
                        <div className="text-sm font-medium text-gray-900">{content.title}</div>
                        <div className="text-xs text-gray-500">{content.platform} • by {content.creator_name}</div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Manual URL Entry */}
              <div>
                <p className="text-xs text-gray-500 mb-2">Or enter external content URL:</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <select
                    value={formData.platform}
                    onChange={(e) => setFormData({ ...formData, platform: e.target.value })}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="instagram">Instagram</option>
                    <option value="tiktok">TikTok</option>
                    <option value="youtube">YouTube</option>
                    <option value="twitter">Twitter</option>
                  </select>
                  <input
                    type="url"
                    placeholder="Content URL"
                    value={formData.content_url}
                    onChange={(e) => setFormData({ ...formData, content_url: e.target.value, content_id: '' })}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Forecast Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Target className="w-4 h-4 inline mr-1" />
                Metric to Predict
              </label>
              <select
                value={formData.forecast_type}
                onChange={(e) => setFormData({ ...formData, forecast_type: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              >
                <option value="views">Views</option>
                <option value="likes">Likes</option>
                <option value="shares">Shares</option>
                <option value="comments">Comments</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Target Value
              </label>
              <input
                type="number"
                placeholder="e.g., 10000"
                value={formData.target_value}
                onChange={(e) => setFormData({ ...formData, target_value: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
                min="1"
              />
            </div>
          </div>

          {/* Odds and Timing */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Payout Odds (multiplier)
              </label>
              <select
                value={formData.odds}
                onChange={(e) => setFormData({ ...formData, odds: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              >
                <option value="1.5">1.5x</option>
                <option value="2">2x</option>
                <option value="2.5">2.5x</option>
                <option value="3">3x</option>
                <option value="4">4x</option>
                <option value="5">5x</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Clock className="w-4 h-4 inline mr-1" />
                Expires At
              </label>
              <input
                type="datetime-local"
                value={formData.expires_at}
                onChange={(e) => setFormData({ ...formData, expires_at: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
                min={new Date().toISOString().slice(0, 16)}
              />
            </div>
          </div>

          {/* Initial Stake */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-3">Your Initial Prediction & Stake</h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Your Prediction
                </label>
                <select
                  value={formData.initial_side}
                  onChange={(e) => setFormData({ ...formData, initial_side: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                >
                  <option value="over">OVER (will exceed target)</option>
                  <option value="under">UNDER (will not reach target)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <DollarSign className="w-4 h-4 inline mr-1" />
                  Initial Stake (USD)
                </label>
                <input
                  type="number"
                  step="0.01"
                  placeholder="Amount to stake"
                  value={formData.initial_amount}
                  onChange={(e) => setFormData({ ...formData, initial_amount: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                  min="1"
                  max={userWallet.balance}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Available: ${userWallet.balance.toFixed(2)}
                </p>
              </div>
            </div>

            {formData.initial_amount && (
              <div className="mt-3 p-3 bg-white rounded-lg border border-blue-200">
                <p className="text-sm text-gray-600">
                  Your stake: <span className="font-medium">${formData.initial_amount}</span>
                </p>
                <p className="text-sm text-gray-600">
                  Potential payout if correct: <span className="font-medium text-green-600">${potentialPayout}</span>
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  This creates the initial pool that others can predict against
                </p>
              </div>
            )}
          </div>

          {/* Submit Button */}
          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !formData.content_url || !formData.target_value || !formData.initial_amount}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isSubmitting ? 'Creating...' : 'Create Forecast'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
