import { useState } from 'react';
import { X, DollarSign, Gem, Zap } from 'lucide-react';

interface ContentFundingModalProps {
  isOpen: boolean;
  onClose: () => void;
  contentId: number;
  contentTitle: string;
  isOwner: boolean;
  currentRevenue: number;
  sharePrice: number;
  totalShares: number;
  onSuccess: (newRevenue: number, newSharePrice: number) => void;
}

export default function ContentFundingModal({
  isOpen,
  onClose,
  contentId,
  contentTitle,
  isOwner,
  currentRevenue,
  sharePrice,
  totalShares,
  onSuccess
}: ContentFundingModalProps) {
  const [amount, setAmount] = useState<number>(0);
  const [currency, setCurrency] = useState<'USD' | 'Gems' | 'Points'>('USD');
  const [loading, setLoading] = useState(false);
  const [actionType, setActionType] = useState<'fund' | 'tip'>('tip');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (amount <= 0) return;

    setLoading(true);
    try {
      const endpoint = actionType === 'fund' ? `/api/content/${contentId}/fund` : `/api/content/${contentId}/tip`;
      
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          amount,
          currency_type: currency
        })
      });

      if (response.ok) {
        const result = await response.json();
        onSuccess(result.new_revenue, result.new_share_price);
        onClose();
        setAmount(0);
      } else {
        const error = await response.json();
        alert(error.error || `Failed to ${actionType} content`);
      }
    } catch (error) {
      console.error(`Failed to ${actionType} content:`, error);
      alert(`Failed to ${actionType} content. Please try again.`);
    } finally {
      setLoading(false);
    }
  };

  const calculateNewSharePrice = () => {
    const convertedAmount = currency === 'Points' ? amount / 1000 : amount;
    return totalShares > 0 ? (currentRevenue + convertedAmount) / totalShares : 0;
  };

  const getCurrencyIcon = (curr: string) => {
    switch (curr) {
      case 'USD': return <DollarSign className="w-4 h-4" />;
      case 'Gems': return <Gem className="w-4 h-4" />;
      case 'Points': return <Zap className="w-4 h-4" />;
      default: return <DollarSign className="w-4 h-4" />;
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">
            {isOwner ? 'Fund or Receive Tips' : 'Tip Creator'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6">
          {/* Content Info */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <h3 className="font-medium text-gray-900 mb-2">{contentTitle}</h3>
            <div className="text-sm text-gray-600 space-y-1">
              <div>Current Revenue: ${currentRevenue.toFixed(2)}</div>
              <div>Share Price: ${sharePrice.toFixed(4)}</div>
              <div>Total Shares: {totalShares}</div>
            </div>
          </div>

          {/* Action Type Selection (only for owners) */}
          {isOwner && (
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Action</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setActionType('fund')}
                  className={`p-3 border rounded-lg text-sm font-medium transition-all ${
                    actionType === 'fund'
                      ? 'border-purple-500 bg-purple-50 text-purple-700'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                >
                  Fund Content
                </button>
                <button
                  type="button"
                  onClick={() => setActionType('tip')}
                  className={`p-3 border rounded-lg text-sm font-medium transition-all ${
                    actionType === 'tip'
                      ? 'border-green-500 bg-green-50 text-green-700'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                >
                  Enable Tips
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                {actionType === 'fund' 
                  ? 'Add your own money to increase content value'
                  : 'Allow others to tip and increase content value'
                }
              </p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Currency Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Currency</label>
              <div className="grid grid-cols-3 gap-2">
                {(['USD', 'Gems', 'Points'] as const).map((curr) => (
                  <button
                    key={curr}
                    type="button"
                    onClick={() => setCurrency(curr)}
                    className={`p-3 border rounded-lg text-sm font-medium transition-all flex items-center justify-center space-x-2 ${
                      currency === curr
                        ? 'border-orange-500 bg-orange-50 text-orange-700'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    {getCurrencyIcon(curr)}
                    <span>{curr}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Amount Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Amount {currency === 'Points' && '(1000 Points = $1 USD)'}
              </label>
              <input
                type="number"
                min="0"
                step={currency === 'Points' ? '100' : '0.01'}
                value={amount || ''}
                onChange={(e) => setAmount(Number(e.target.value))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                placeholder={`Enter ${currency.toLowerCase()} amount`}
                required
              />
            </div>

            {/* Preview */}
            {amount > 0 && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="text-sm font-medium text-blue-900 mb-2">Preview Impact</h4>
                <div className="text-sm text-blue-700 space-y-1">
                  <div>
                    New Revenue: ${(currentRevenue + (currency === 'Points' ? amount / 1000 : amount)).toFixed(2)}
                  </div>
                  <div>
                    New Share Price: ${calculateNewSharePrice().toFixed(4)}
                  </div>
                  <div className="text-xs text-blue-600 mt-2">
                    Share price increase: ${(calculateNewSharePrice() - sharePrice).toFixed(4)}
                  </div>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading || amount <= 0}
              className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white py-3 rounded-lg font-medium transition-all duration-200 disabled:opacity-50"
            >
              {loading ? 'Processing...' : `${actionType === 'fund' ? 'Fund' : 'Tip'} Content`}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
