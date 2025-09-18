import { useState, useEffect } from 'react';
import { X, Save, Loader2 } from 'lucide-react';
import { DropType, CreateDropRequestSchema, DropTypeSchema, DropDifficultySchema } from '@/shared/types';

interface EditDropModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (updatedDrop: DropType) => void;
  drop: DropType;
}

export default function EditDropModal({
  isOpen,
  onClose,
  onSuccess,
  drop
}: EditDropModalProps) {
  const [formData, setFormData] = useState({
    title: drop.title,
    description: drop.description,
    drop_type: drop.drop_type,
    difficulty: drop.difficulty,
    key_cost: drop.key_cost,
    gem_reward_base: drop.gem_reward_base,
    gem_pool_total: drop.gem_pool_total,
    follower_threshold: drop.follower_threshold,
    time_commitment: drop.time_commitment || '',
    requirements: drop.requirements || '',
    deliverables: drop.deliverables || '',
    deadline_at: drop.deadline_at ? drop.deadline_at.split('T')[0] : '',
    max_participants: drop.max_participants || undefined,
    platform: drop.platform || '',
    content_url: drop.content_url || '',
    move_cost_points: drop.move_cost_points,
    key_reward_amount: drop.key_reward_amount,
    is_proof_drop: drop.is_proof_drop,
    is_paid_drop: drop.is_paid_drop,
    reward_logic: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (drop) {
      setFormData({
        title: drop.title,
        description: drop.description,
        drop_type: drop.drop_type,
        difficulty: drop.difficulty,
        key_cost: drop.key_cost,
        gem_reward_base: drop.gem_reward_base,
        gem_pool_total: drop.gem_pool_total,
        follower_threshold: drop.follower_threshold,
        time_commitment: drop.time_commitment || '',
        requirements: drop.requirements || '',
        deliverables: drop.deliverables || '',
        deadline_at: drop.deadline_at ? drop.deadline_at.split('T')[0] : '',
        max_participants: drop.max_participants || undefined,
        platform: drop.platform || '',
        content_url: drop.content_url || '',
        move_cost_points: drop.move_cost_points,
        key_reward_amount: drop.key_reward_amount,
        is_proof_drop: drop.is_proof_drop,
        is_paid_drop: drop.is_paid_drop,
        reward_logic: '',
      });
    }
  }, [drop]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Prepare the data for validation
      const submitData = {
        ...formData,
        deadline_at: formData.deadline_at ? new Date(formData.deadline_at).toISOString() : undefined,
      };

      // Validate form data
      const validationResult = CreateDropRequestSchema.safeParse(submitData);
      if (!validationResult.success) {
        setError('Please check all required fields');
        return;
      }

      const response = await fetch(`/api/drops/${drop.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(submitData),
      });

      if (response.ok) {
        const result = await response.json();
        onSuccess(result.drop);
        onClose();
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to update drop');
      }
    } catch (error) {
      console.error('Error updating drop:', error);
      setError('Failed to update drop');
    } finally {
      setLoading(false);
    }
  };

  

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">Edit Drop</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            disabled={loading}
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          {/* Drop Type Info (Read-only) */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Drop Type</h3>
            <div className="flex items-center space-x-2">
              {drop.is_proof_drop && (
                <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                  Proof Drop - Free to apply
                </span>
              )}
              {drop.is_paid_drop && (
                <span className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm font-medium">
                  Paid Drop - Costs keys, rewards gems
                </span>
              )}
              {!drop.is_proof_drop && !drop.is_paid_drop && (
                <span className="bg-orange-100 text-orange-800 px-3 py-1 rounded-full text-sm font-medium">
                  Move Drop - Social actions for keys
                </span>
              )}
            </div>
            <p className="text-sm text-gray-600 mt-2">Drop type cannot be changed after creation</p>
          </div>

          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Title *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-colors"
                placeholder="Enter drop title"
                required
                disabled={loading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Drop Category *
              </label>
              <select
                value={formData.drop_type}
                onChange={(e) => setFormData({ ...formData, drop_type: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-colors"
                required
                disabled={loading}
              >
                {DropTypeSchema.options.map(dropType => (
                  <option key={dropType} value={dropType}>
                    {dropType.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Difficulty *
              </label>
              <select
                value={formData.difficulty}
                onChange={(e) => setFormData({ ...formData, difficulty: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-colors"
                required
                disabled={loading}
              >
                {DropDifficultySchema.options.map(difficulty => (
                  <option key={difficulty} value={difficulty} className="capitalize">
                    {difficulty}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description *
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={4}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-colors"
              placeholder="Describe what needs to be done..."
              required
              disabled={loading}
            />
          </div>

          {/* Drop-specific fields */}
          {drop.is_paid_drop && (
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-purple-900 mb-4">Paid Drop Settings</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-purple-700 mb-2">Key Cost</label>
                  <input
                    type="number"
                    min="1"
                    value={formData.key_cost}
                    onChange={(e) => setFormData({ ...formData, key_cost: Number(e.target.value) })}
                    className="w-full px-4 py-2 border border-purple-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    disabled={loading}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-purple-700 mb-2">Gem Reward</label>
                  <input
                    type="number"
                    min="1"
                    value={formData.gem_reward_base}
                    onChange={(e) => setFormData({ ...formData, gem_reward_base: Number(e.target.value) })}
                    className="w-full px-4 py-2 border border-purple-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    disabled={loading}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-purple-700 mb-2">Total Gem Pool</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.gem_pool_total}
                    onChange={(e) => setFormData({ ...formData, gem_pool_total: Number(e.target.value) })}
                    className="w-full px-4 py-2 border border-purple-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    disabled={loading}
                  />
                </div>
              </div>
            </div>
          )}

          {!drop.is_proof_drop && !drop.is_paid_drop && (
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-orange-900 mb-4">Move Drop Settings</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-orange-700 mb-2">Points Cost</label>
                  <input
                    type="number"
                    min="1"
                    value={formData.move_cost_points}
                    onChange={(e) => setFormData({ ...formData, move_cost_points: Number(e.target.value) })}
                    className="w-full px-4 py-2 border border-orange-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    disabled={loading}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-orange-700 mb-2">Keys Reward</label>
                  <input
                    type="number"
                    min="1"
                    value={formData.key_reward_amount}
                    onChange={(e) => setFormData({ ...formData, key_reward_amount: Number(e.target.value) })}
                    className="w-full px-4 py-2 border border-orange-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    disabled={loading}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Additional Settings */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Min. Followers Required
              </label>
              <input
                type="number"
                min="0"
                value={formData.follower_threshold}
                onChange={(e) => setFormData({ ...formData, follower_threshold: Number(e.target.value) })}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-colors"
                placeholder="0"
                disabled={loading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Max Participants
              </label>
              <input
                type="number"
                min="1"
                value={formData.max_participants || ''}
                onChange={(e) => setFormData({ ...formData, max_participants: e.target.value ? Number(e.target.value) : undefined })}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-colors"
                placeholder="Unlimited"
                disabled={loading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Time Commitment
              </label>
              <input
                type="text"
                value={formData.time_commitment}
                onChange={(e) => setFormData({ ...formData, time_commitment: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-colors"
                placeholder="e.g., 2-3 hours"
                disabled={loading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Deadline
              </label>
              <input
                type="date"
                value={formData.deadline_at}
                onChange={(e) => setFormData({ ...formData, deadline_at: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-colors"
                disabled={loading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Platform
              </label>
              <input
                type="text"
                value={formData.platform}
                onChange={(e) => setFormData({ ...formData, platform: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-colors"
                placeholder="e.g., Instagram, TikTok"
                disabled={loading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Content URL
              </label>
              <input
                type="url"
                value={formData.content_url}
                onChange={(e) => setFormData({ ...formData, content_url: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-colors"
                placeholder="https://..."
                disabled={loading}
              />
            </div>
          </div>

          {/* Requirements and Deliverables */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Requirements
              </label>
              <textarea
                value={formData.requirements}
                onChange={(e) => setFormData({ ...formData, requirements: e.target.value })}
                rows={4}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-colors"
                placeholder="What are the requirements to participate?"
                disabled={loading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Deliverables
              </label>
              <textarea
                value={formData.deliverables}
                onChange={(e) => setFormData({ ...formData, deliverables: e.target.value })}
                rows={4}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-colors"
                placeholder="What should participants deliver?"
                disabled={loading}
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-4 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white px-6 py-3 rounded-xl font-medium transition-all duration-200 disabled:opacity-50 flex items-center justify-center space-x-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Updating...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Update Drop</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
