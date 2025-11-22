import { useState } from 'react';
import { X, TrendingUp, DollarSign } from 'lucide-react';
import { ContentPieceType, WalletType } from '@/shared/types';

interface BuySharesModalProps {
  content: ContentPieceType;
  wallet: WalletType | undefined;
  isOpen: boolean;
  onClose: () => void;
  onPurchase: (contentId: number, sharesCount: number) => Promise<void>;
}

export default function BuySharesModal({ content, wallet, isOpen, onClose, onPurchase }: BuySharesModalProps) {
  const [sharesCount, setSharesCount] = useState(1);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const totalCost = sharesCount * content.share_price;
  const canAfford = wallet && wallet.balance >= totalCost;
  const maxShares = Math.min(
    content.available_shares,
    wallet ? Math.floor(wallet.balance / content.share_price) : 0
  );

  const handlePurchase = async () => {
    if (!canAfford || sharesCount < 1) return;
    
    setLoading(true);
    try {
      await onPurchase(content.id, sharesCount);
      onClose();
    } catch (error) {
      console.error('Purchase failed:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900">Buy Content Shares</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="space-y-4">
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-semibold text-gray-900 mb-2">{content.title}</h3>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Platform:</span>
              <span className="font-medium capitalize">{content.platform}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Price per share:</span>
              <span className="font-bold text-green-600">${content.share_price.toFixed(2)}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Available:</span>
              <span className="font-medium">{content.available_shares} shares</span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Number of shares
            </label>
            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={() => setSharesCount(Math.max(1, sharesCount - 1))}
                disabled={sharesCount <= 1}
                className="w-8 h-8 bg-gray-200 hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed rounded text-gray-700 font-bold"
              >
                -
              </button>
              <input
                type="number"
                value={sharesCount}
                onChange={(e) => setSharesCount(Math.max(1, Math.min(maxShares, parseInt(e.target.value) || 1)))}
                min="1"
                max={maxShares}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-center"
              />
              <button
                type="button"
                onClick={() => setSharesCount(Math.min(maxShares, sharesCount + 1))}
                disabled={sharesCount >= maxShares}
                className="w-8 h-8 bg-gray-200 hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed rounded text-gray-700 font-bold"
              >
                +
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-1">Max: {maxShares} shares</p>
          </div>

          <div className="bg-blue-50 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                <DollarSign className="w-4 h-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-900">Your Balance:</span>
              </div>
              <span className="font-bold text-blue-900">${(wallet?.balance || 0).toFixed(2)}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <TrendingUp className="w-4 h-4 text-green-600" />
                <span className="text-sm font-medium text-gray-700">Total Cost:</span>
              </div>
              <span className="font-bold text-gray-900">${totalCost.toFixed(2)}</span>
            </div>
          </div>

          {!canAfford && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-sm text-red-700">Insufficient balance to purchase {sharesCount} shares</p>
            </div>
          )}

          <div className="flex space-x-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handlePurchase}
              disabled={!canAfford || loading || sharesCount < 1}
              className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 disabled:opacity-50 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg font-medium transition-all duration-200"
            >
              {loading ? 'Processing...' : `Buy ${sharesCount} Share${sharesCount > 1 ? 's' : ''}`}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
