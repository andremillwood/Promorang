import { useState, useEffect } from 'react';
import { X, Bookmark, Eye, Calendar, Trash2, ExternalLink } from 'lucide-react';
import { UserType } from '@/shared/types';

interface SavedContent {
  id: number;
  content_id: number;
  content_title: string;
  content_platform: string;
  content_url: string;
  creator_name: string;
  creator_avatar: string;
  created_at: string;
}

interface SavedContentModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserType | null;
}

export default function SavedContentModal({ isOpen, onClose, user }: SavedContentModalProps) {
  const [savedContent, setSavedContent] = useState<SavedContent[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && user) {
      fetchSavedContent();
    }
  }, [isOpen, user]);

  const fetchSavedContent = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/users/saved-content', {
        credentials: 'include'
      });
      
      if (response.ok) {
        const data = await response.json();
        setSavedContent(data);
      }
    } catch (error) {
      console.error('Failed to fetch saved content:', error);
    } finally {
      setLoading(false);
    }
  };

  const removeSavedContent = async (contentId: number) => {
    try {
      const response = await fetch(`/api/users/saved-content/${contentId}`, {
        method: 'DELETE',
        credentials: 'include'
      });

      if (response.ok) {
        setSavedContent(prev => prev.filter(item => item.content_id !== contentId));
      }
    } catch (error) {
      console.error('Failed to remove saved content:', error);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case 'instagram': return '📷';
      case 'tiktok': return '🎵';
      case 'youtube': return '📺';
      case 'twitter': return '🐦';
      case 'linkedin': return '💼';
      default: return '📱';
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <Bookmark className="w-6 h-6 text-orange-600" />
            <h2 className="text-xl font-bold text-gray-900">Saved Content</h2>
            <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded-full text-sm">
              {savedContent.length}
            </span>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full"></div>
            </div>
          ) : savedContent.length === 0 ? (
            <div className="text-center py-12">
              <Bookmark className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No saved content yet</h3>
              <p className="text-gray-600 mb-4">
                Save content you want to revisit later by clicking the bookmark icon.
              </p>
              <button
                onClick={onClose}
                className="bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition-colors"
              >
                Explore Content
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {savedContent.map((item) => (
                <div
                  key={item.id}
                  className="bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-start space-x-4">
                    {/* Platform Icon */}
                    <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center text-white text-xl flex-shrink-0">
                      {getPlatformIcon(item.content_platform)}
                    </div>

                    {/* Content Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-medium text-gray-900 truncate pr-2">
                          {item.content_title}
                        </h4>
                        <div className="flex items-center space-x-2 flex-shrink-0">
                          <button
                            onClick={() => window.open(`/content/${item.content_id}`, '_blank')}
                            className="text-blue-600 hover:text-blue-700 p-1 rounded transition-colors"
                            title="View content"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => window.open(item.content_url, '_blank')}
                            className="text-purple-600 hover:text-purple-700 p-1 rounded transition-colors"
                            title="View original"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => removeSavedContent(item.content_id)}
                            className="text-red-600 hover:text-red-700 p-1 rounded transition-colors"
                            title="Remove from saved"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      <div className="flex items-center space-x-4 text-sm text-gray-600">
                        <div className="flex items-center space-x-1">
                          <span>by {item.creator_name}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <span className="capitalize">{item.content_platform}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Calendar className="w-3 h-3" />
                          <span>Saved {formatDate(item.created_at)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {savedContent.length > 0 && (
          <div className="p-4 border-t border-gray-200 bg-gray-50">
            <p className="text-xs text-gray-600 text-center">
              💡 Tip: Saved content is private and only visible to you. Use this to build your personal content library!
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
