import { Link } from 'react-router';
import { User } from 'lucide-react';

interface UserLinkProps {
  username?: string | null;
  userId?: number | null;
  displayName?: string | null;
  avatarUrl?: string | null;
  className?: string;
  showAvatar?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export default function UserLink({ 
  username,
  userId, 
  displayName, 
  avatarUrl, 
  className = '', 
  showAvatar = true,
  size = 'md' 
}: UserLinkProps) {
  const sizeClasses = {
    sm: 'w-6 h-6 text-xs',
    md: 'w-8 h-8 text-sm',
    lg: 'w-10 h-10 text-base'
  };

  // If no username or userId but we have displayName, show as text with proper styling
  if (!username && !userId) {
    return (
      <div className={`flex items-center space-x-2 ${className}`}>
        {showAvatar && (
          <div className={`${sizeClasses[size]} rounded-full overflow-hidden bg-gray-200 flex items-center justify-center`}>
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt={displayName || 'User'}
                className="w-full h-full object-cover"
              />
            ) : (
              <User className="w-1/2 h-1/2 text-gray-500" />
            )}
          </div>
        )}
        <span className="font-medium text-gray-900">
          {displayName || 'User'}
        </span>
      </div>
    );
  }

  // Determine the link URL - prefer username, fallback to userId
  const linkUrl = username ? `/users/${username}` : (userId ? `/users/id/${userId}` : '#');

  return (
    <Link 
      to={linkUrl}
      className={`flex items-center space-x-2 hover:text-orange-600 transition-colors ${className}`}
    >
      {showAvatar && (
        <div className={`${sizeClasses[size]} rounded-full overflow-hidden bg-gray-200 flex items-center justify-center`}>
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt={displayName || username || `User #${userId}`}
              className="w-full h-full object-cover"
            />
          ) : (
            <User className="w-1/2 h-1/2 text-gray-500" />
          )}
        </div>
      )}
      <span className="font-medium">
        {displayName || username || `User #${userId}`}
      </span>
    </Link>
  );
}
