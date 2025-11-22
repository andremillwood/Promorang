import { useState, useEffect } from 'react';
import { X, TrendingUp, DollarSign, Target, Clock, AlertCircle } from 'lucide-react';

interface SocialForecast {
  id: number;
  creator_name: string;
  platform: string;
  content_url: string;
  content_title?: string;
  forecast_type: string;
  target_value: number;
  current_value: number;
  odds: number;
  pool_size: number;
  creator_initial_amount: number;
  creator_side: string;
  expires_at: string;
}

interface PlaceForecastModalProps {
  isOpen: boolean;
  onClose: () => void;
  forecast: SocialForecast;
  onPredictionPlaced: () => void;
}

export default function PlaceForecastModal({ isOpen, onClose, forecast, onPredictionPlaced }: PlaceForecastModalProps) {
  const [predictionSide, setPredictionSide] = useState<'over' | 'under'>('over');
  const [predictionAmount, setPredictionAmount] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [userWallet, setUserWallet] = useState({ balance: 0 });

  useEffect(() => {
    if (isOpen) {
      fetchUserWallet();
    }
  }, [isOpen]);

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
      const response = await fetch(`/api/social-forecasts/${forecast.id}/predict`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prediction_amount: parseFloat(predictionAmount),
          prediction_side: predictionSide,
        }),
      });

      if (response.ok) {
        onPredictionPlaced();
        onClose();
        setPredictionAmount('');
        setPredictionSide('over');
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to place prediction');
      }
    } catch (error) {
      setError('Failed to place prediction');
    } finally {
      setIsSubmitting(false);
    }
  };

  const potentialPayout = predictionAmount ? 
    (parseFloat(predictionAmount) * forecast.odds).toFixed(2) : '0';

  const formatTimeRemaining = (expiresAt: string) => {
    const now = new Date();
    const expires = new Date(expiresAt);
    const diff = expires.getTime() - now.getTime();
    
    if (diff <= 0) return 'Expired';
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours > 24) {
      const days = Math.floor(hours / 24);
      return `${days}d ${hours % 24}h`;
    }
    
    return `${hours}h ${minutes}m`;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900 flex items-center">
              <TrendingUp className="w-5 h-5 mr-2 text-blue-600" />
              Make Your Prediction
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        <div className="p-6">
          {/* Forecast Summary */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-medium text-gray-900">Forecast Details</h3>
              <span className="text-sm text-gray-500">{forecast.platform}</span>
            </div>
            
            {forecast.content_title && (
              <p className="text-sm text-gray-700 mb-2">{forecast.content_title}</p>
            )}
            
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-500">Metric</p>
                <p className="font-medium flex items-center">
                  <Target className="w-4 h-4 mr-1 text-blue-600" />
                  {forecast.forecast_type} {forecast.target_value.toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-gray-500">Current Pool</p>
                <p className="font-medium text-green-600">${forecast.pool_size.toFixed(2)}</p>
              </div>
              <div>
                <p className="text-gray-500">Odds</p>
                <p className="font-medium text-blue-600">{forecast.odds}x payout</p>
              </div>
              <div>
                <p className="text-gray-500">Time Left</p>
                <p className="font-medium flex items-center">
                  <Clock className="w-4 h-4 mr-1 text-gray-400" />
                  {formatTimeRemaining(forecast.expires_at)}
                </p>
              </div>
            </div>

            <div className="mt-3 pt-3 border-t border-gray-200">
              <p className="text-xs text-gray-500 mb-1">Creator's Prediction</p>
              <p className="text-sm font-medium text-blue-600">
                {forecast.creator_side.toUpperCase()} • ${forecast.creator_initial_amount.toFixed(2)} staked
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-center">
                <AlertCircle className="w-4 h-4 text-red-600 mr-2" />
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            )}

            {/* Prediction Side Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Your Prediction
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setPredictionSide('over')}
                  className={`p-4 rounded-lg border-2 transition-colors ${
                    predictionSide === 'over'
                      ? 'border-green-500 bg-green-50 text-green-700'
                      : 'border-gray-200 bg-white text-gray-700 hover:border-green-300'
                  }`}
                >
                  <div className="text-center">
                    <p className="font-semibold">OVER</p>
                    <p className="text-xs mt-1">Will exceed {forecast.target_value.toLocaleString()}</p>
                  </div>
                </button>
                
                <button
                  type="button"
                  onClick={() => setPredictionSide('under')}
                  className={`p-4 rounded-lg border-2 transition-colors ${
                    predictionSide === 'under'
                      ? 'border-red-500 bg-red-50 text-red-700'
                      : 'border-gray-200 bg-white text-gray-700 hover:border-red-300'
                  }`}
                >
                  <div className="text-center">
                    <p className="font-semibold">UNDER</p>
                    <p className="text-xs mt-1">Will not reach {forecast.target_value.toLocaleString()}</p>
                  </div>
                </button>
              </div>
            </div>

            {/* Amount Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <DollarSign className="w-4 h-4 inline mr-1" />
                Prediction Amount (USD)
              </label>
              <input
                type="number"
                step="0.01"
                placeholder="Enter amount"
                value={predictionAmount}
                onChange={(e) => setPredictionAmount(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
                min="1"
                max={userWallet.balance}
              />
              <div className="flex justify-between text-sm text-gray-500 mt-1">
                <span>Available: ${userWallet.balance.toFixed(2)}</span>
                <span>Min: $1.00</span>
              </div>
            </div>

            {/* Quick Amount Buttons */}
            <div className="grid grid-cols-4 gap-2">
              {[5, 10, 25, 50].map((amount) => (
                <button
                  key={amount}
                  type="button"
                  onClick={() => setPredictionAmount(amount.toString())}
                  disabled={amount > userWallet.balance}
                  className="py-2 px-3 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  ${amount}
                </button>
              ))}
            </div>

            {/* Payout Preview */}
            {predictionAmount && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-2">Prediction Summary</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Your prediction:</span>
                    <span className="font-medium text-blue-600">
                      {predictionSide.toUpperCase()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Amount staked:</span>
                    <span className="font-medium">${predictionAmount}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Potential payout:</span>
                    <span className="font-medium text-green-600">${potentialPayout}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Potential profit:</span>
                    <span className="font-medium text-green-600">
                      ${(parseFloat(potentialPayout) - parseFloat(predictionAmount)).toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            )}

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
                disabled={isSubmitting || !predictionAmount || parseFloat(predictionAmount) > userWallet.balance}
                className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                  predictionSide === 'over'
                    ? 'bg-green-600 hover:bg-green-700 text-white'
                    : 'bg-red-600 hover:bg-red-700 text-white'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {isSubmitting ? 'Placing...' : `Predict ${predictionSide.toUpperCase()} $${predictionAmount || '0'}`}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
