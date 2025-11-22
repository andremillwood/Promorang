import { useState } from 'react';
import Tooltip from '@/react-app/components/Tooltip';
import { 
  Heart, 
  MessageCircle, 
  Share, 
  Bookmark, 
  RepeatIcon,
  Key,
  Loader
} from 'lucide-react';

interface MoveActionButtonProps {
  actionType: 'like' | 'comment' | 'share' | 'save' | 'repost';
  contentId?: number;
  dropId?: number;
  userTier: string;
  userPointsBalance: number;
  onSuccess?: (result: any) => void;
}

export default function MoveActionButton({ 
  actionType, 
  contentId, 
  dropId, 
  userTier, 
  userPointsBalance,
  onSuccess 
}: MoveActionButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [showCostTooltip, setShowCostTooltip] = useState(false);

  const getActionIcon = () => {
    switch (actionType) {
      case 'like': return <Heart className="w-4 h-4" />;
      case 'comment': return <MessageCircle className="w-4 h-4" />;
      case 'share': return <Share className="w-4 h-4" />;
      case 'save': return <Bookmark className="w-4 h-4" />;
      case 'repost': return <RepeatIcon className="w-4 h-4" />;
    }
  };

  const getActionLabel = () => {
    switch (actionType) {
      case 'like': return 'Like';
      case 'comment': return 'Comment';
      case 'share': return 'Share';
      case 'save': return 'Save';
      case 'repost': return 'Repost';
    }
  };

  const getMoveCost = () => {
    const baseCosts = {
      'like': { points: 2, keys: 1 },
      'comment': { points: 5, keys: 2 },
      'save': { points: 3, keys: 1 },
      'share': { points: 8, keys: 3 },
      'repost': { points: 10, keys: 4 }
    };

    const base = baseCosts[actionType];
    
    // Apply user tier discounts
    const tierDiscounts = { 'free': 1.0, 'premium': 0.8, 'super': 0.6 };
    const discount = tierDiscounts[userTier as keyof typeof tierDiscounts] || 1.0;
    
    return {
      pointsCost: Math.ceil(base.points * discount),
      keysEarned: base.keys
    };
  };

  const moveCost = getMoveCost();
  const canAfford = userPointsBalance >= moveCost.pointsCost;

  const handleMove = async () => {
    if (!canAfford) return;

    setIsLoading(true);
    try {
      const response = await fetch('/api/users/move', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          action_type: actionType,
          reference_id: contentId || dropId,
          reference_type: contentId ? 'content' : 'drop'
        })
      });

      if (response.ok) {
        const result = await response.json();
        onSuccess?.(result);
      } else {
        const error = await response.json();
        console.error('Move failed:', error);
      }
    } catch (error) {
      console.error('Move error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative">
      <Tooltip 
        content={
          canAfford 
            ? `${moveCost.pointsCost}p → ${moveCost.keysEarned} keys`
            : `Need ${moveCost.pointsCost} points`
        }
        disabled={showCostTooltip}
        compact={true}
      >
        <button
          onClick={handleMove}
          disabled={!canAfford || isLoading}
          onMouseEnter={() => setShowCostTooltip(true)}
          onMouseLeave={() => setShowCostTooltip(false)}
          className={`flex items-center space-x-2 px-3 py-2 rounded-lg font-medium transition-all duration-200 ${
            canAfford
              ? 'bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white shadow-md hover:shadow-lg'
              : 'bg-gray-200 text-gray-400 cursor-not-allowed'
          }`}
        >
          {isLoading ? (
            <Loader className="w-4 h-4 animate-spin" />
          ) : (
            <>
              {getActionIcon()}
              <span className="text-sm">{getActionLabel()}</span>
              <div className="flex items-center space-x-1 bg-white/20 rounded px-2 py-1">
                <span className="text-xs font-bold">{moveCost.pointsCost}p</span>
                <span className="text-xs">→</span>
                <Key className="w-3 h-3" />
                <span className="text-xs font-bold">{moveCost.keysEarned}</span>
              </div>
            </>
          )}
        </button>
      </Tooltip>

      {/* Cost Tooltip */}
      {showCostTooltip && (
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 bg-black text-white text-xs rounded-lg px-3 py-2 whitespace-nowrap z-10">
          <div className="flex items-center space-x-2">
            <span>Cost: {moveCost.pointsCost} points</span>
            <span>•</span>
            <span>Earn: {moveCost.keysEarned} keys</span>
          </div>
          {userTier !== 'free' && (
            <div className="text-orange-300 text-xs mt-1">
              {userTier} tier discount applied
            </div>
          )}
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-black"></div>
        </div>
      )}
    </div>
  );
}
