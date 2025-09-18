import { useState, useEffect } from 'react';
import { MessageCircle, Heart, Reply, Send, Trash2, Pin, MoreVertical } from 'lucide-react';
import UserLink from '@/react-app/components/UserLink';
import { UserType } from '@/shared/types';

interface Comment {
  id: number;
  content_id: number;
  user_id: number;
  comment_text: string;
  parent_comment_id?: number;
  likes_count: number;
  is_pinned: boolean;
  created_at: string;
  updated_at: string;
  user_display_name?: string;
  user_username?: string;
  user_avatar?: string;
  replies?: Comment[];
  has_liked?: boolean;
}

interface CommentSystemProps {
  contentId: number;
  currentUser: UserType | null;
  isOwner?: boolean;
}

export default function CommentSystem({ contentId, currentUser, isOwner = false }: CommentSystemProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [replyingTo, setReplyingTo] = useState<number | null>(null);
  const [replyText, setReplyText] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchComments();
  }, [contentId]);

  const fetchComments = async () => {
    if (!contentId) return;
    
    setLoading(true);
    try {
      const response = await fetch(`/api/content/${contentId}/comments`, {
        credentials: 'include'
      });
      
      if (response.ok) {
        const data = await response.json();
        setComments(data);
      }
    } catch (error) {
      console.error('Failed to fetch comments:', error);
    } finally {
      setLoading(false);
    }
  };

  const submitComment = async (text: string, parentId?: number) => {
    if (!text.trim() || !currentUser) return;

    setSubmitting(true);
    try {
      const response = await fetch(`/api/content/${contentId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          comment_text: text.trim(),
          parent_comment_id: parentId || null
        })
      });

      if (response.ok) {
        await fetchComments(); // Refresh comments
        if (parentId) {
          setReplyText('');
          setReplyingTo(null);
        } else {
          setNewComment('');
        }
      } else {
        throw new Error('Failed to post comment');
      }
    } catch (error) {
      console.error('Error posting comment:', error);
      alert('Failed to post comment. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const likeComment = async (commentId: number) => {
    if (!currentUser) return;

    try {
      const response = await fetch(`/api/content/comments/${commentId}/like`, {
        method: 'POST',
        credentials: 'include'
      });

      if (response.ok) {
        await fetchComments(); // Refresh to get updated like status
      }
    } catch (error) {
      console.error('Error liking comment:', error);
    }
  };

  const deleteComment = async (commentId: number) => {
    if (!currentUser || !window.confirm('Are you sure you want to delete this comment?')) return;

    try {
      const response = await fetch(`/api/content/comments/${commentId}`, {
        method: 'DELETE',
        credentials: 'include'
      });

      if (response.ok) {
        await fetchComments(); // Refresh comments
      }
    } catch (error) {
      console.error('Error deleting comment:', error);
      alert('Failed to delete comment.');
    }
  };

  const pinComment = async (commentId: number) => {
    if (!isOwner) return;

    try {
      const response = await fetch(`/api/content/comments/${commentId}/pin`, {
        method: 'POST',
        credentials: 'include'
      });

      if (response.ok) {
        await fetchComments(); // Refresh comments
      }
    } catch (error) {
      console.error('Error pinning comment:', error);
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    
    return date.toLocaleDateString();
  };

  const CommentItem = ({ comment, isReply = false }: { comment: Comment; isReply?: boolean }) => {
    const isAuthor = currentUser?.id === comment.user_id;
    
    return (
      <div className={`${isReply ? 'ml-8 border-l-2 border-gray-200 pl-4' : ''} mb-4`}>
        <div className="bg-gray-50 rounded-lg p-4">
          {/* Comment Header */}
          <div className="flex items-start justify-between mb-2">
            <div className="flex items-center space-x-2">
              <UserLink
                username={comment.user_username}
                displayName={comment.user_display_name}
                avatarUrl={comment.user_avatar}
                size="sm"
              />
              <span className="text-xs text-gray-500">{formatTimestamp(comment.created_at)}</span>
              {comment.is_pinned && (
                <div className="flex items-center space-x-1 bg-orange-100 text-orange-700 px-2 py-1 rounded-full text-xs">
                  <Pin className="w-3 h-3" />
                  <span>Pinned</span>
                </div>
              )}
            </div>
            
            {(isAuthor || isOwner) && (
              <div className="relative group">
                <button className="text-gray-400 hover:text-gray-600 p-1">
                  <MoreVertical className="w-4 h-4" />
                </button>
                <div className="absolute right-0 top-full bg-white border border-gray-200 rounded-lg shadow-lg z-10 min-w-32 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
                  {isOwner && !comment.is_pinned && (
                    <button
                      onClick={() => pinComment(comment.id)}
                      className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 flex items-center space-x-2"
                    >
                      <Pin className="w-3 h-3" />
                      <span>Pin</span>
                    </button>
                  )}
                  {(isAuthor || isOwner) && (
                    <button
                      onClick={() => deleteComment(comment.id)}
                      className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 text-red-600 flex items-center space-x-2"
                    >
                      <Trash2 className="w-3 h-3" />
                      <span>Delete</span>
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Comment Text */}
          <p className="text-gray-800 mb-3 whitespace-pre-wrap">{comment.comment_text}</p>

          {/* Comment Actions */}
          <div className="flex items-center space-x-4">
            <button
              onClick={() => likeComment(comment.id)}
              disabled={!currentUser}
              className={`flex items-center space-x-1 text-sm transition-colors ${
                comment.has_liked 
                  ? 'text-red-500' 
                  : 'text-gray-500 hover:text-red-500'
              } ${!currentUser ? 'cursor-not-allowed opacity-50' : ''}`}
            >
              <Heart className={`w-4 h-4 ${comment.has_liked ? 'fill-current' : ''}`} />
              <span>{comment.likes_count || 0}</span>
            </button>
            
            {!isReply && currentUser && (
              <button
                onClick={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)}
                className="flex items-center space-x-1 text-sm text-gray-500 hover:text-blue-500 transition-colors"
              >
                <Reply className="w-4 h-4" />
                <span>Reply</span>
              </button>
            )}
          </div>

          {/* Reply Form */}
          {replyingTo === comment.id && (
            <div className="mt-3 pt-3 border-t border-gray-200">
              <div className="flex space-x-2">
                <textarea
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="Write a reply..."
                  className="flex-1 p-2 border border-gray-300 rounded-lg text-sm resize-none"
                  rows={2}
                />
                <div className="flex flex-col space-y-1">
                  <button
                    onClick={() => submitComment(replyText, comment.id)}
                    disabled={!replyText.trim() || submitting}
                    className="bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => {
                      setReplyingTo(null);
                      setReplyText('');
                    }}
                    className="text-gray-500 hover:text-gray-700 p-2"
                  >
                    ✕
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Replies */}
        {comment.replies && comment.replies.length > 0 && (
          <div className="mt-3">
            {comment.replies.map((reply) => (
              <CommentItem key={reply.id} comment={reply} isReply={true} />
            ))}
          </div>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-3 pb-4 border-b border-gray-200">
        <MessageCircle className="w-5 h-5 text-blue-600" />
        <h3 className="text-lg font-semibold text-gray-900">
          Comments ({comments.length})
        </h3>
      </div>

      {/* New Comment Form */}
      {currentUser ? (
        <div className="space-y-3">
          <div className="flex items-start space-x-3">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
              {currentUser.display_name?.[0] || currentUser.username?.[0] || 'U'}
            </div>
            <div className="flex-1">
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Share your thoughts..."
                className="w-full p-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows={3}
              />
              <div className="mt-2 flex justify-between items-center">
                <p className="text-xs text-gray-500">
                  Be respectful and constructive in your comments
                </p>
                <button
                  onClick={() => submitComment(newComment)}
                  disabled={!newComment.trim() || submitting}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 transition-colors"
                >
                  {submitting ? (
                    <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                  <span>Post Comment</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-center">
          <p className="text-gray-600 mb-2">Sign in to join the conversation</p>
          <button 
            onClick={() => window.location.href = '/auth/google'}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Sign In to Comment
          </button>
        </div>
      )}

      {/* Comments List */}
      <div className="space-y-4">
        {comments.length > 0 ? (
          comments.map((comment) => (
            <CommentItem key={comment.id} comment={comment} />
          ))
        ) : (
          <div className="text-center py-12">
            <MessageCircle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <h4 className="text-lg font-medium text-gray-900 mb-2">No comments yet</h4>
            <p className="text-gray-600">
              {currentUser ? 'Be the first to share your thoughts!' : 'Sign in to start the conversation.'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
