import { useEffect, useState, useRef } from 'react';
import { useLocation } from 'react-router';
import { useAuth } from '@getmocha/users-service/react';
import { 
  Plus, 
  Search, 
  Filter, 
  Clock, 
  Users,
  Star,
  Calendar,
  Key,
  Diamond,
  Upload,
  X,
  Link as LinkIcon,
  Image as ImageIcon
} from 'lucide-react';
import UserLink from '@/react-app/components/UserLink';
import { DropType, CreateDropRequestType, DropTypeSchema, DropDifficultySchema, UserType } from '@/shared/types';

export default function Earn() {
  const { user: authUser } = useAuth();
  const location = useLocation();
  const [drops, setDrops] = useState<DropType[]>([]);
  const [userData, setUserData] = useState<UserType | null>(null);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDropType, setSelectedDropType] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState('');

  useEffect(() => {
    fetchDrops();
    if (authUser) {
      fetchUserData();
    }
  }, [authUser]);

  // Check URL parameters to auto-open create modal
  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const createParam = urlParams.get('create');
    if ((createParam === 'proof' || createParam === 'paid') && userData && userData.user_type === 'advertiser') {
      setShowCreateForm(true);
    }
  }, [location, userData]);

  const fetchUserData = async () => {
    try {
      const response = await fetch('/api/app/users/me', { credentials: 'include' });
      if (response.ok) {
        const data = await response.json();
        setUserData(data);
      }
    } catch (error) {
      console.error('Failed to fetch user data:', error);
    }
  };

  const fetchDrops = async () => {
    try {
      const response = await fetch('/api/drops');
      const data = await response.json();
      setDrops(data);
    } catch (error) {
      console.error('Failed to fetch drops:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredDrops = drops.filter(drop => {
    const matchesSearch = drop.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         drop.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDropType = !selectedDropType || drop.drop_type === selectedDropType;
    const matchesDifficulty = !selectedDifficulty || drop.difficulty === selectedDifficulty;
    
    return matchesSearch && matchesDropType && matchesDifficulty;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Earn</h1>
          <p className="text-gray-600 mt-2">Discover earning drops that match your skills</p>
        </div>
        {userData && userData.user_type === 'advertiser' && (
          <button
            onClick={() => setShowCreateForm(true)}
            className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white px-6 py-3 rounded-lg font-medium flex items-center space-x-2 transition-all duration-200 shadow-lg"
          >
            <Plus className="w-5 h-5" />
            <span>Create Drop</span>
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search drops..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            />
          </div>

          <select
            value={selectedDropType}
            onChange={(e) => setSelectedDropType(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          >
            <option value="">All Drop Types</option>
            {DropTypeSchema.options.map(dropType => (
              <option key={dropType} value={dropType}>
                {dropType.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
              </option>
            ))}
          </select>

          <select
            value={selectedDifficulty}
            onChange={(e) => setSelectedDifficulty(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          >
            <option value="">All Difficulties</option>
            {DropDifficultySchema.options.map(difficulty => (
              <option key={difficulty} value={difficulty} className="capitalize">{difficulty}</option>
            ))}
          </select>

          <button className="flex items-center justify-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
            <Filter className="w-5 h-5 text-gray-500" />
            <span>More Filters</span>
          </button>
        </div>
      </div>

      {/* Drops Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredDrops.map((drop) => (
          <DropCard key={drop.id} drop={drop} />
        ))}
      </div>

      {filteredDrops.length === 0 && (
        <div className="text-center py-12">
          <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Search className="w-12 h-12 text-gray-400" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No drops found</h3>
          <p className="text-gray-600">Try adjusting your search criteria or create a new drop.</p>
        </div>
      )}

      {/* Create Drop Modal */}
      {showCreateForm && userData && userData.user_type === 'advertiser' && (
        <CreateDropModal 
          onClose={() => setShowCreateForm(false)} 
          onSuccess={() => {
            setShowCreateForm(false);
            fetchDrops();
          }}
        />
      )}
    </div>
  );
}

function DropCard({ drop }: { drop: DropType }) {
  const getDropTypeImage = (dropType: string) => {
    // Use the drop's content_url if available, otherwise fallback to default images
    if (drop?.content_url) {
      return drop.content_url;
    }
    
    switch (dropType) {
      case 'content_clipping': return 'https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=400&h=250&fit=crop';
      case 'reviews': return 'https://images.unsplash.com/photo-1556155092-490a1ba16284?w=400&h=250&fit=crop';
      case 'ugc_creation': return 'https://images.unsplash.com/photo-1558403194-611308249627?w=400&h=250&fit=crop';
      case 'affiliate_referral': return 'https://images.unsplash.com/photo-1516251193007-45ef944ab0c6?w=400&h=250&fit=crop';
      case 'surveys': return 'https://images.unsplash.com/photo-1432888622747-4eb9a8efeb07?w=400&h=250&fit=crop';
      case 'challenges_events': return 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400&h=250&fit=crop';
      default: return 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400&h=250&fit=crop';
    }
  };

  const handleApply = async () => {
    // TODO: Implement drop application
    console.log('Apply to drop:', drop.id);
  };

  const handleDropClick = () => {
    // Use React Router navigation instead of window.location
    window.location.href = `/drops/${drop.id}`;
  };

  // Check if this is demo content
  const isDemo = drop.title?.toLowerCase().includes('[demo]') || 
                 drop.title?.toLowerCase().includes('demo') ||
                 drop.description?.toLowerCase().includes('demo');

  return (
    <div className={`bg-white rounded-xl overflow-hidden shadow-sm border hover:shadow-md transition-shadow ${
      isDemo ? 'border-orange-300 bg-orange-50/30' : 'border-gray-200'
    }`}>
      {/* Demo Banner */}
      {isDemo && (
        <div className="bg-gradient-to-r from-orange-500 to-amber-500 text-white px-4 py-2 text-center">
          <div className="flex items-center justify-center space-x-2 text-sm font-medium">
            <span>🧪</span>
            <span>DEMO DROP - No real gems awarded</span>
            <span>🧪</span>
          </div>
        </div>
      )}

      <div className="relative cursor-pointer" onClick={handleDropClick}>
        <img 
          src={getDropTypeImage(drop.drop_type)} 
          alt={drop.title}
          className="w-full h-48 object-cover hover:opacity-95 transition-opacity"
        />
        <div className="absolute inset-0 bg-black bg-opacity-20" />
        <div className="absolute top-4 right-4 flex space-x-2">
          {isDemo && (
            <span className="bg-orange-500/90 backdrop-blur-sm text-white px-2 py-1 rounded-full text-xs font-medium">
              DEMO
            </span>
          )}
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${getDifficultyColor(drop.difficulty)}`}>
            {drop.difficulty}
          </span>
        </div>
        <div className="absolute top-4 left-4">
          {drop.is_proof_drop ? (
            <div className="bg-green-500/90 backdrop-blur-sm px-2 py-1 rounded-full">
              <span className="text-white text-sm font-medium">Proof Drop</span>
            </div>
          ) : drop.is_paid_drop ? (
            <div className="bg-purple-500/90 backdrop-blur-sm px-2 py-1 rounded-full">
              <span className="text-white text-sm font-medium">Paid Drop</span>
            </div>
          ) : (
            <div className="flex items-center space-x-1 bg-orange-500/90 backdrop-blur-sm px-2 py-1 rounded-full">
              <Key className="w-3 h-3 text-white" />
              <span className="text-white text-sm font-medium">{drop.key_cost}</span>
            </div>
          )}
        </div>
        <div className="absolute bottom-4 left-4">
          <div className="flex items-center space-x-2">
            <Diamond className="w-6 h-6 text-purple-300 drop-shadow" />
            <p className="text-3xl font-bold text-white drop-shadow-lg">
              {drop.gem_reward_base}{isDemo && <span className="text-lg opacity-80"> (Demo)</span>}
            </p>
          </div>
          <p className="text-sm text-white/80 drop-shadow">
            {isDemo ? 'Demo gems (no real value)' : 'Gems reward'}
          </p>
        </div>
      </div>

      <div className="p-6">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center space-x-2">
            <span className="text-xl">{getDropTypeIcon(drop.drop_type)}</span>
            {drop.is_proof_drop ? (
              <div className="flex items-center space-x-1 text-sm bg-green-100 px-2 py-1 rounded">
                <span className="font-medium text-green-700">Proof Drop - Free</span>
              </div>
            ) : drop.is_paid_drop ? (
              <div className="flex items-center space-x-1 text-sm bg-purple-100 px-2 py-1 rounded">
                <span className="font-medium text-purple-700">Paid Drop</span>
              </div>
            ) : (
              <div className="flex items-center space-x-1 text-sm">
                <Key className="w-3 h-3 text-orange-600" />
                <span className="font-medium text-orange-700">{drop.key_cost} keys</span>
              </div>
            )}
          </div>
        </div>

        <h3 className="text-lg font-semibold text-gray-900 mb-2 cursor-pointer hover:text-orange-600 transition-colors" onClick={handleDropClick}>
          {drop.title}
        </h3>
        <p className="text-gray-600 text-sm mb-4 line-clamp-3">{drop.description}</p>

        <div className="mb-4">
          <UserLink 
            username={drop.creator_name}
            displayName={drop.creator_name}
            avatarUrl={drop.creator_avatar}
            className="flex items-center space-x-2"
            size="sm"
          />
        </div>

        <div className="space-y-2 mb-6">
          <div className="flex items-center space-x-2 text-sm text-gray-500">
            <Users className="w-4 h-4" />
            <span>{drop.current_participants}/{drop.max_participants || '∞'} participants</span>
          </div>
          
          {drop.follower_threshold > 0 && (
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <Star className="w-4 h-4" />
              <span>{drop.follower_threshold}+ followers required</span>
            </div>
          )}

          {drop.deadline_at && (
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <Calendar className="w-4 h-4" />
              <span>Due {new Date(drop.deadline_at).toLocaleDateString()}</span>
            </div>
          )}

          {drop.time_commitment && (
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <Clock className="w-4 h-4" />
              <span>{drop.time_commitment}</span>
            </div>
          )}

          {drop.gem_pool_total > 0 && (
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <Diamond className="w-4 h-4" />
              <span>{drop.gem_pool_remaining} gems remaining in pool</span>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
            {drop.drop_type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
          </span>
          <div className="flex space-x-2">
            <button
              onClick={handleDropClick}
              className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              View Details
            </button>
            <button
              onClick={handleApply}
              className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200"
            >
              Apply Now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function CreateDropModal({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) {
  const location = useLocation();
  const urlParams = new URLSearchParams(location.search);
  const createParam = urlParams.get('create');
  
  // Determine initial drop type based on URL parameter
  const getInitialDropType = () => {
    if (createParam === 'paid') return 'paid';
    return 'proof'; // Default to proof drop
  };

  const [formData, setFormData] = useState<CreateDropRequestType>({
    title: '',
    description: '',
    drop_type: 'content_clipping',
    difficulty: 'easy',
    key_cost: createParam === 'paid' ? 1 : 0,
    gem_reward_base: createParam === 'paid' ? 50 : 0,
    gem_pool_total: 0,
    follower_threshold: 0,
    time_commitment: '',
    requirements: '',
    deliverables: '',
    deadline_at: '',
    max_participants: undefined,
    platform: '',
    content_url: '',
    is_proof_drop: createParam !== 'paid',
    is_paid_drop: createParam === 'paid',
    move_cost_points: 0,
    key_reward_amount: 0,
  });
  const [dropType, setDropType] = useState<'proof' | 'paid' | 'move'>(getInitialDropType());
  const [loading, setLoading] = useState(false);
  
  // Image upload states  
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [uploadMode, setUploadMode] = useState<'url' | 'file'>('url');
  const [uploadingFile, setUploadingFile] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dropImageUrl, setDropImageUrl] = useState<string>('');
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);

  const uploadImageToStorage = async (file: File): Promise<string> => {
    try {
      setUploadingFile(true);
      
      // Convert file to base64 for transmission
      const base64 = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onload = () => {
          const result = reader.result as string;
          resolve(result.split(',')[1]); // Remove data:image/jpeg;base64, prefix
        };
        reader.readAsDataURL(file);
      });

      // Upload to backend
      const response = await fetch('/api/content/upload-image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          fileName: file.name,
          fileType: file.type,
          fileData: base64
        }),
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const result = await response.json();
      
      // Check if a fallback was used
      if (result.fallback) {
        console.warn('Upload fallback used:', result.fallbackReason);
        // Show user that fallback was used
        const notification = document.createElement('div');
        notification.className = 'fixed top-4 right-4 bg-yellow-500 text-white px-4 py-3 rounded-lg shadow-lg z-50';
        notification.innerHTML = `
          <div class="flex items-center space-x-2">
            <span>⚠️</span>
            <div>
              <div class="font-semibold">Image Upload Notice</div>
              <div class="text-xs opacity-90">${result.fallbackReason || 'Using fallback image'}</div>
            </div>
          </div>
        `;
        document.body.appendChild(notification);
        setTimeout(() => {
          if (document.body.contains(notification)) {
            document.body.removeChild(notification);
          }
        }, 5000);
      }
      
      return result.imageUrl;
    } catch (error) {
      console.error('Error uploading image:', error);
      
      // Fallback: generate a placeholder image using AI
      try {
        const fallbackResponse = await fetch('/api/content/generate-placeholder', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify({
            description: formData.title || 'Marketing drop',
            platform: formData.platform || 'general'
          }),
        });

        if (fallbackResponse.ok) {
          const fallbackResult = await fallbackResponse.json();
          return fallbackResult.imageUrl;
        }
      } catch (fallbackError) {
        console.error('Fallback image generation failed:', fallbackError);
      }
      
      // Last resort: use a generic placeholder
      return `https://images.unsplash.com/photo-1516251193007-45ef944ab0c6?w=800&h=600&fit=crop&crop=center`;
    } finally {
      setUploadingFile(false);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type
      const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
      if (!validTypes.includes(file.type)) {
        alert('Please upload a valid image file (JPG, PNG, GIF, WEBP).');
        return;
      }

      // Validate file size (more lenient check - server will provide detailed error)
      if (file.size > 10 * 1024 * 1024) {
        alert('File size must be less than 10MB. Please compress your image or use a URL instead.');
        return;
      }

      setUploadedFile(file);
      
      // Create preview URL
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      
      // Upload the file and get the real URL
      try {
        const uploadedUrl = await uploadImageToStorage(file);
        setDropImageUrl(uploadedUrl);
      } catch (error) {
        console.error('File upload failed:', error);
        alert('Failed to upload image. Please try again or use a URL instead.');
        removeUploadedFile();
      }
    }
  };

  const removeUploadedFile = () => {
    setUploadedFile(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl('');
    }
    setDropImageUrl('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const validateImageUrl = async (url: string): Promise<boolean> => {
    try {
      const response = await fetch(url, { method: 'HEAD' });
      const contentType = response.headers.get('content-type');
      return response.ok && contentType?.startsWith('image/') || false;
    } catch {
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validate image URL if provided
      if (dropImageUrl && uploadMode === 'url') {
        const isValidImage = await validateImageUrl(dropImageUrl);
        if (!isValidImage) {
          alert('The provided image URL is not accessible. Please check the URL or upload an image file instead.');
          setLoading(false);
          return;
        }
      }

      // Create the drop data including the image URL
      const dropDataWithImage = {
        ...formData,
        content_url: dropImageUrl || formData.content_url || '', // Use image URL as content URL if available
      };

      const response = await fetch('/api/drops', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(dropDataWithImage),
      });

      if (response.ok) {
        await response.json();
        
        // Reset form
        setFormData({
          title: '',
          description: '',
          drop_type: 'content_clipping',
          difficulty: 'easy',
          key_cost: createParam === 'paid' ? 1 : 0,
          gem_reward_base: createParam === 'paid' ? 50 : 0,
          gem_pool_total: 0,
          follower_threshold: 0,
          time_commitment: '',
          requirements: '',
          deliverables: '',
          deadline_at: '',
          max_participants: undefined,
          platform: '',
          content_url: '',
          is_proof_drop: createParam !== 'paid',
          is_paid_drop: createParam === 'paid',
          move_cost_points: 0,
          key_reward_amount: 0,
        });
        removeUploadedFile();
        setUploadMode('url');
        setDropImageUrl('');
        
        // Show success notification
        const notification = document.createElement('div');
        notification.className = 'fixed top-4 right-4 bg-green-500 text-white px-4 py-3 rounded-lg shadow-lg z-50 animate-bounce';
        notification.innerHTML = `
          <div class="flex items-center space-x-2">
            <span class="text-lg">🎯</span>
            <div>
              <div class="font-semibold">Drop Created!</div>
              <div class="text-xs opacity-90">Redirecting to drops page...</div>
            </div>
          </div>
        `;
        document.body.appendChild(notification);
        
        // Clear URL parameters and close modal
        const newUrl = window.location.pathname;
        window.history.replaceState({}, '', newUrl);
        onSuccess();
        
        // Remove notification after delay
        setTimeout(() => {
          if (document.body.contains(notification)) {
            document.body.removeChild(notification);
          }
        }, 3000);
      } else {
        const error = await response.json();
        console.error('Failed to create drop:', error);
        alert(error.error || 'Failed to create drop. Please try again.');
      }
    } catch (error) {
      console.error('Failed to create drop:', error);
      alert('Failed to create drop. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    // Clear URL parameters when closing modal
    const newUrl = window.location.pathname;
    window.history.replaceState({}, '', newUrl);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">Create New Drop</h2>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Show helper text for advertiser-initiated creation */}
          {createParam && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                  <span className="text-blue-600 font-bold text-sm">💡</span>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-blue-900">
                    {createParam === 'paid' ? 'Creating Paid Drop' : 'Creating Proof Drop'}
                  </h3>
                  <p className="text-xs text-blue-700">
                    {createParam === 'paid' 
                      ? 'This will use your paid drop inventory and require keys from applicants.'
                      : 'This will use your proof drop inventory and help users with their Master Key activation.'
                    }
                  </p>
                </div>
              </div>
            </div>
          )}
          {/* Drop Type Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">Drop Type</label>
            <div className="grid grid-cols-3 gap-3">
              <button
                type="button"
                onClick={() => {
                  setDropType('proof');
                  setFormData({ ...formData, is_proof_drop: true, is_paid_drop: false, key_cost: 0, gem_reward_base: 0 });
                }}
                className={`p-4 border rounded-lg text-center transition-all ${
                  dropType === 'proof'
                    ? 'border-green-500 bg-green-50 text-green-700'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
              >
                <div className="w-8 h-8 bg-green-500 rounded-lg mx-auto mb-2 flex items-center justify-center">
                  <span className="text-white font-bold text-sm">P</span>
                </div>
                <span className="text-sm font-medium">Proof Drop</span>
                <p className="text-xs text-gray-500 mt-1">Helps users get Master Key</p>
              </button>

              <button
                type="button"
                onClick={() => {
                  setDropType('paid');
                  setFormData({ ...formData, is_proof_drop: false, is_paid_drop: true, key_cost: 1, gem_reward_base: 50 });
                }}
                className={`p-4 border rounded-lg text-center transition-all ${
                  dropType === 'paid'
                    ? 'border-purple-500 bg-purple-50 text-purple-700'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
              >
                <div className="w-8 h-8 bg-purple-500 rounded-lg mx-auto mb-2 flex items-center justify-center">
                  <span className="text-white font-bold text-sm">$</span>
                </div>
                <span className="text-sm font-medium">Paid Drop</span>
                <p className="text-xs text-gray-500 mt-1">Costs keys, rewards gems</p>
              </button>

              <button
                type="button"
                onClick={() => {
                  setDropType('move');
                  setFormData({ ...formData, is_proof_drop: false, is_paid_drop: false, key_cost: 0, gem_reward_base: 0, move_cost_points: 5, key_reward_amount: 2 });
                }}
                className={`p-4 border rounded-lg text-center transition-all ${
                  dropType === 'move'
                    ? 'border-orange-500 bg-orange-50 text-orange-700'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
              >
                <div className="w-8 h-8 bg-orange-500 rounded-lg mx-auto mb-2 flex items-center justify-center">
                  <span className="text-white font-bold text-sm">M</span>
                </div>
                <span className="text-sm font-medium">Move Drop</span>
                <p className="text-xs text-gray-500 mt-1">Social actions for keys</p>
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              placeholder="e.g., Create TikTok Video for Brand Campaign"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
            <textarea
              required
              rows={4}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              placeholder="Describe what needs to be done..."
            />
          </div>

          {/* Image Upload Section */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">Drop Image (Optional)</label>
            
            {/* Upload Mode Toggle */}
            <div className="flex space-x-4 mb-4">
              <button
                type="button"
                onClick={() => {
                  setUploadMode('url');
                  removeUploadedFile();
                }}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  uploadMode === 'url'
                    ? 'bg-orange-100 text-orange-700 border border-orange-300'
                    : 'bg-gray-100 text-gray-600 border border-gray-300 hover:bg-gray-200'
                }`}
              >
                <LinkIcon className="w-4 h-4 inline mr-2" />
                Use URL
              </button>
              <button
                type="button"
                onClick={() => {
                  setUploadMode('file');
                  setDropImageUrl('');
                }}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  uploadMode === 'file'
                    ? 'bg-orange-100 text-orange-700 border border-orange-300'
                    : 'bg-gray-100 text-gray-600 border border-gray-300 hover:bg-gray-200'
                }`}
              >
                <Upload className="w-4 h-4 inline mr-2" />
                Upload File
              </button>
            </div>

            {uploadMode === 'url' ? (
              <div>
                <input
                  type="url"
                  value={dropImageUrl}
                  onChange={(e) => setDropImageUrl(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  placeholder="Direct link to image..."
                />
                <p className="text-xs text-gray-500 mt-1">
                  Add an image to make your drop more appealing to participants
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {!uploadedFile ? (
                  <div 
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-orange-400 hover:bg-orange-50 transition-all"
                  >
                    <Upload className="w-8 h-8 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-600 mb-2">Click to upload or drag and drop</p>
                    <p className="text-sm text-gray-500">
                      Images (JPG, PNG, GIF, WEBP) • Max 10 MB
                    </p>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </div>
                ) : (
                  <div className="border border-gray-300 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                          <ImageIcon className="w-5 h-5 text-orange-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{uploadedFile?.name}</p>
                          <p className="text-sm text-gray-500">
                            {uploadedFile ? (uploadedFile.size / 1024 / 1024).toFixed(2) : 0} MB
                          </p>
                          {uploadingFile && (
                            <p className="text-xs text-blue-600">Uploading...</p>
                          )}
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={removeUploadedFile}
                        className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                        disabled={uploadingFile}
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                    
                    {/* Image Preview */}
                    {previewUrl && (
                      <div className="relative">
                        <img
                          src={previewUrl}
                          alt="Preview"
                          className="w-full h-48 object-cover rounded-lg"
                        />
                        {uploadingFile && (
                          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center rounded-lg">
                            <div className="text-white text-center">
                              <div className="animate-spin w-6 h-6 border-2 border-white border-t-transparent rounded-full mx-auto mb-2"></div>
                              <p className="text-sm">Processing image...</p>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Drop Type</label>
              <select
                value={formData.drop_type}
                onChange={(e) => setFormData({ ...formData, drop_type: e.target.value as any })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              >
                {DropTypeSchema.options.map(dropType => (
                  <option key={dropType} value={dropType}>
                    {dropType.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Difficulty</label>
              <select
                value={formData.difficulty}
                onChange={(e) => setFormData({ ...formData, difficulty: e.target.value as any })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              >
                {DropDifficultySchema.options.map(difficulty => (
                  <option key={difficulty} value={difficulty} className="capitalize">{difficulty}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Drop-specific fields */}
          {dropType === 'proof' && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-green-900 mb-2">Proof Drop Settings</h3>
              <p className="text-sm text-green-700 mb-4">
                Proof drops help users activate their Master Key. They're free to apply and don't reward gems.
              </p>
              <div>
                <label className="block text-sm font-medium text-green-700 mb-2">Max Participants</label>
                <input
                  type="number"
                  min="1"
                  value={formData.max_participants || ''}
                  onChange={(e) => setFormData({ ...formData, max_participants: Number(e.target.value) })}
                  className="w-full px-4 py-2 border border-green-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="e.g., 50"
                />
              </div>
            </div>
          )}

          {dropType === 'paid' && (
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-purple-900 mb-2">Paid Drop Settings</h3>
              <p className="text-sm text-purple-700 mb-4">
                Paid drops cost keys to apply and reward gems upon completion.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-purple-700 mb-2">Key Cost</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={formData.key_cost}
                    onChange={(e) => setFormData({ ...formData, key_cost: Number(e.target.value) })}
                    className="w-full px-4 py-2 border border-purple-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-purple-700 mb-2">Gem Reward</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={formData.gem_reward_base}
                    onChange={(e) => setFormData({ ...formData, gem_reward_base: Number(e.target.value) })}
                    className="w-full px-4 py-2 border border-purple-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-purple-700 mb-2">Total Gem Pool</label>
                  <input
                    type="number"
                    min="1"
                    value={formData.gem_pool_total}
                    onChange={(e) => setFormData({ ...formData, gem_pool_total: Number(e.target.value) })}
                    className="w-full px-4 py-2 border border-purple-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>
          )}

          {dropType === 'move' && (
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-orange-900 mb-2">Move Drop Settings</h3>
              <p className="text-sm text-orange-700 mb-4">
                Move drops define social actions that cost points and reward keys.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-orange-700 mb-2">Points Cost</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={formData.move_cost_points}
                    onChange={(e) => setFormData({ ...formData, move_cost_points: Number(e.target.value) })}
                    className="w-full px-4 py-2 border border-orange-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-orange-700 mb-2">Keys Reward</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={formData.key_reward_amount}
                    onChange={(e) => setFormData({ ...formData, key_reward_amount: Number(e.target.value) })}
                    className="w-full px-4 py-2 border border-orange-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>
          )}

          <div className="flex space-x-4">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || uploadingFile}
              className="flex-1 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white px-4 py-2 rounded-lg font-medium transition-all duration-200 disabled:opacity-50"
            >
              {loading ? 'Creating...' : uploadingFile ? 'Processing Image...' : 'Create Drop'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function getDropTypeIcon(dropType: string) {
  switch (dropType) {
    case 'content_clipping': return '✂️';
    case 'reviews': return '⭐';
    case 'ugc_creation': return '🎨';
    case 'affiliate_referral': return '🔗';
    case 'surveys': return '📊';
    case 'challenges_events': return '🏆';
    default: return '📝';
  }
}

function getDifficultyColor(difficulty: string) {
  switch (difficulty) {
    case 'easy': return 'text-green-600 bg-green-100';
    case 'medium': return 'text-yellow-600 bg-yellow-100';
    case 'hard': return 'text-red-600 bg-red-100';
    default: return 'text-gray-600 bg-gray-100';
  }
}
