import { useState } from 'react';
import { X, ArrowRight, Coins, Key, Star, AlertCircle, CheckCircle } from 'lucide-react';
import { UserType } from '@/shared/types';

interface CurrencyConversionModalProps {
  user: UserType | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function CurrencyConversionModal({ user, isOpen, onClose, onSuccess }: CurrencyConversionModalProps) {
  const [fromCurrency, setFromCurrency] = useState<'points' | 'gems'>('points');
  const [amount, setAmount] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen || !user) return null;

  const conversionRates = {
    points: { keys: 500 }, // 500 points = 1 key
    gems: { keys: 2 },     // 2 gems = 1 key
  };

  const getCurrentBalance = () => {
    return fromCurrency === 'points' ? user.points_balance : user.gems_balance;
  };

  const getRequiredAmount = () => {
    return amount * conversionRates[fromCurrency].keys;
  };

  const canAfford = getCurrentBalance() >= getRequiredAmount();

  const handleConvert = async () => {
    if (!canAfford || amount < 1) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/users/convert', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          from_currency: fromCurrency,
          to_currency: 'keys',
          amount: amount
        })
      });

      if (response.ok) {
        onSuccess();
        onClose();
        setAmount(1);
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Conversion failed');
      }
    } catch (error) {
      console.error('Conversion failed:', error);
      setError('Network error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900">Convert Currency</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="space-y-6">
          {/* Currency Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Convert from:
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setFromCurrency('points')}
                className={`p-4 rounded-lg border-2 transition-colors ${
                  fromCurrency === 'points'
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center space-x-2 mb-1">
                  <Coins className="w-5 h-5 text-blue-600" />
                  <span className="font-medium">Points</span>
                </div>
                <p className="text-sm text-gray-600">Balance: {user.points_balance}</p>
                <p className="text-xs text-blue-600 mt-1">500 pts = 1 key</p>
              </button>
              
              <button
                onClick={() => setFromCurrency('gems')}
                className={`p-4 rounded-lg border-2 transition-colors ${
                  fromCurrency === 'gems'
                    ? 'border-purple-500 bg-purple-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center space-x-2 mb-1">
                  <Star className="w-5 h-5 text-purple-600" />
                  <span className="font-medium">Gems</span>
                </div>
                <p className="text-sm text-gray-600">Balance: {user.gems_balance}</p>
                <p className="text-xs text-purple-600 mt-1">2 gems = 1 key</p>
              </button>
            </div>
          </div>

          {/* Amount Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Keys to get:
            </label>
            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={() => setAmount(Math.max(1, amount - 1))}
                disabled={amount <= 1}
                className="w-8 h-8 bg-gray-200 hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed rounded text-gray-700 font-bold"
              >
                -
              </button>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(Math.max(1, parseInt(e.target.value) || 1))}
                min="1"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-center"
              />
              <button
                type="button"
                onClick={() => setAmount(amount + 1)}
                className="w-8 h-8 bg-gray-200 hover:bg-gray-300 rounded text-gray-700 font-bold"
              >
                +
              </button>
            </div>
            <div className="flex space-x-2 mt-2">
              {[1, 3, 5, 10].map((qty) => (
                <button
                  key={qty}
                  onClick={() => setAmount(qty)}
                  className="px-3 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded-full text-gray-700"
                >
                  {qty} key{qty > 1 ? 's' : ''}
                </button>
              ))}
            </div>
          </div>

          {/* Conversion Preview */}
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                {fromCurrency === 'points' ? (
                  <Coins className="w-5 h-5 text-blue-600" />
                ) : (
                  <Star className="w-5 h-5 text-purple-600" />
                )}
                <span className="font-medium capitalize">{fromCurrency}</span>
              </div>
              <ArrowRight className="w-4 h-4 text-gray-400" />
              <div className="flex items-center space-x-2">
                <Key className="w-5 h-5 text-orange-600" />
                <span className="font-medium">Keys</span>
              </div>
            </div>
            
            <div className="flex items-center justify-between text-lg font-bold">
              <span className={fromCurrency === 'points' ? 'text-blue-600' : 'text-purple-600'}>
                -{getRequiredAmount().toLocaleString()}
              </span>
              <span className="text-orange-600">+{amount}</span>
            </div>
            
            <div className="flex items-center justify-between text-sm text-gray-600 mt-2">
              <span>
                Remaining: {(getCurrentBalance() - getRequiredAmount()).toLocaleString()}
              </span>
              <span>New total: {user.keys_balance + amount}</span>
            </div>
          </div>

          {/* Daily Limit Notice for Points */}
          {fromCurrency === 'points' && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <div className="flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 text-blue-600" />
                <span className="text-sm text-blue-700">
                  Daily limit: 3 keys from points conversion
                </span>
              </div>
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
              Cancel
            </button>
            <button
              onClick={handleConvert}
              disabled={!canAfford || loading || amount < 1}
              className="flex-1 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 disabled:opacity-50 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg font-medium transition-all duration-200 flex items-center justify-center space-x-2"
            >
              {loading ? (
                <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4" />
                  <span>Convert</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
