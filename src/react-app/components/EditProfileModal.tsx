import { useState, useEffect } from 'react';
import { 
  X, 
  User, 
  Camera, 
  Globe, 
  Instagram, 
  Twitter, 
  Linkedin, 
  Facebook,
  Youtube,
  Check,
  AlertCircle
} from 'lucide-react';
import { UserType, UpdateProfileRequestType } from '@/shared/types';

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserType;
  onSuccess: (updatedUser: UserType) => void;
}

export default function EditProfileModal({ isOpen, onClose, user, onSuccess }: EditProfileModalProps) {
  const [formData, setFormData] = useState<UpdateProfileRequestType>({});
  const [socialLinks, setSocialLinks] = useState({
    instagram: '',
    twitter: '',
    linkedin: '',
    facebook: '',
    youtube: '',
    tiktok: ''
  });
  const [loading, setLoading] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [uploadingBanner, setUploadingBanner] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (isOpen && user) {
      setFormData({
        username: user.username || '',
        display_name: user.display_name || '',
        bio: user.bio || '',
        avatar_url: user.avatar_url || '',
        banner_url: user.banner_url || '',
        website_url: user.website_url || '',
        social_links: user.social_links || '',
      });

      // Parse existing social links
      if (user.social_links) {
        try {
          const parsed = JSON.parse(user.social_links);
          setSocialLinks({
            instagram: parsed.instagram || '',
            twitter: parsed.twitter || '',
            linkedin: parsed.linkedin || '',
            facebook: parsed.facebook || '',
            youtube: parsed.youtube || '',
            tiktok: parsed.tiktok || ''
          });
        } catch (error) {
          console.error('Failed to parse social links:', error);
        }
      }
    }
  }, [isOpen, user]);

  const handleImageUpload = async (file: File, type: 'avatar' | 'banner') => {
    if (type === 'avatar') setUploadingAvatar(true);
    else setUploadingBanner(true);

    try {
      const formData = new FormData();
      formData.append('image', file);

      const response = await fetch('/api/images/upload', {
        method: 'POST',
        credentials: 'include',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const data = await response.json();
      
      if (type === 'avatar') {
        setFormData(prev => ({ ...prev, avatar_url: data.url }));
      } else {
        setFormData(prev => ({ ...prev, banner_url: data.url }));
      }
    } catch (error) {
      console.error('Image upload failed:', error);
      setErrors(prev => ({ 
        ...prev, 
        [type]: 'Failed to upload image. Please try again.' 
      }));
    } finally {
      if (type === 'avatar') setUploadingAvatar(false);
      else setUploadingBanner(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'avatar' | 'banner') => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setErrors(prev => ({ 
        ...prev, 
        [type]: 'Please select an image file.' 
      }));
      return;
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      setErrors(prev => ({ 
        ...prev, 
        [type]: 'Image size must be less than 5MB.' 
      }));
      return;
    }

    // Clear any previous errors
    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[type];
      return newErrors;
    });

    handleImageUpload(file, type);
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (formData.username && formData.username.length < 3) {
      newErrors.username = 'Username must be at least 3 characters long';
    }

    if (formData.username && !/^[a-zA-Z0-9_]+$/.test(formData.username)) {
      newErrors.username = 'Username can only contain letters, numbers, and underscores';
    }

    if (formData.bio && formData.bio.length > 500) {
      newErrors.bio = 'Bio must be less than 500 characters';
    }

    if (formData.website_url && formData.website_url) {
      try {
        new URL(formData.website_url);
      } catch {
        newErrors.website_url = 'Please enter a valid URL';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      // Build social links object
      const filteredSocialLinks = Object.entries(socialLinks)
        .filter(([_, value]) => value.trim() !== '')
        .reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {});

      const updateData = {
        ...formData,
        social_links: Object.keys(filteredSocialLinks).length > 0 
          ? JSON.stringify(filteredSocialLinks) 
          : ''
      };

      const response = await fetch('/api/users/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(updateData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update profile');
      }

      const updatedUser = await response.json();
      onSuccess(updatedUser);
      onClose();
    } catch (error) {
      console.error('Failed to update profile:', error);
      setErrors({ general: error instanceof Error ? error.message : 'Failed to update profile' });
    } finally {
      setLoading(false);
    }
  };

  const getSocialIcon = (platform: string) => {
    switch (platform) {
      case 'instagram': return <Instagram className="w-4 h-4" />;
      case 'twitter': return <Twitter className="w-4 h-4" />;
      case 'linkedin': return <Linkedin className="w-4 h-4" />;
      case 'facebook': return <Facebook className="w-4 h-4" />;
      case 'youtube': return <Youtube className="w-4 h-4" />;
      case 'tiktok': return <div className="w-4 h-4 bg-black rounded text-white text-xs flex items-center justify-center font-bold">T</div>;
      default: return <Globe className="w-4 h-4" />;
    }
  };

  const getSocialPlaceholder = (platform: string) => {
    switch (platform) {
      case 'instagram': return '@username';
      case 'twitter': return '@username';
      case 'linkedin': return 'username or profile URL';
      case 'facebook': return 'username or profile URL';
      case 'youtube': return 'channel name or URL';
      case 'tiktok': return '@username';
      default: return 'username';
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl flex items-center justify-center">
              <User className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Edit Profile</h2>
              <p className="text-sm text-gray-600">Update your profile information and appearance</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto max-h-[calc(90vh-140px)]">
          <div className="p-6 space-y-8">
            {/* Profile Images Section */}
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900">Profile Images</h3>
              
              {/* Banner Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">Banner Image</label>
                <div className="relative">
                  <div className="w-full h-48 bg-gradient-to-r from-orange-500 via-red-500 to-pink-500 rounded-xl overflow-hidden">
                    {formData.banner_url ? (
                      <img 
                        src={formData.banner_url} 
                        alt="Banner preview" 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-r from-orange-500 via-red-500 to-pink-500"></div>
                    )}
                    <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                      <label className="cursor-pointer bg-white/90 backdrop-blur-sm hover:bg-white text-gray-700 px-4 py-2 rounded-xl flex items-center space-x-2 transition-colors">
                        {uploadingBanner ? (
                          <div className="animate-spin w-4 h-4 border-2 border-gray-600 border-t-transparent rounded-full"></div>
                        ) : (
                          <Camera className="w-4 h-4" />
                        )}
                        <span className="text-sm font-medium">
                          {uploadingBanner ? 'Uploading...' : 'Change Banner'}
                        </span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleFileChange(e, 'banner')}
                          className="hidden"
                          disabled={uploadingBanner}
                        />
                      </label>
                    </div>
                  </div>
                  {errors.banner && (
                    <p className="text-red-600 text-sm mt-2 flex items-center space-x-1">
                      <AlertCircle className="w-4 h-4" />
                      <span>{errors.banner}</span>
                    </p>
                  )}
                </div>
              </div>

              {/* Avatar Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">Profile Picture</label>
                <div className="flex items-center space-x-6">
                  <div className="relative">
                    <img
                      src={formData.avatar_url || '/default-avatar.png'}
                      alt="Profile picture"
                      className="w-24 h-24 rounded-2xl object-cover border-4 border-white shadow-lg"
                    />
                    <label className="absolute -bottom-2 -right-2 w-8 h-8 bg-orange-500 hover:bg-orange-600 text-white rounded-xl flex items-center justify-center cursor-pointer transition-colors">
                      {uploadingAvatar ? (
                        <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>
                      ) : (
                        <Camera className="w-4 h-4" />
                      )}
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleFileChange(e, 'avatar')}
                        className="hidden"
                        disabled={uploadingAvatar}
                      />
                    </label>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-600 mb-2">
                      Upload a new profile picture. Use a square image for best results.
                    </p>
                    <p className="text-xs text-gray-500">
                      Supported formats: JPG, PNG, GIF (max 5MB)
                    </p>
                  </div>
                </div>
                {errors.avatar && (
                  <p className="text-red-600 text-sm mt-2 flex items-center space-x-1">
                    <AlertCircle className="w-4 h-4" />
                    <span>{errors.avatar}</span>
                  </p>
                )}
              </div>
            </div>

            {/* Basic Information */}
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900">Basic Information</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Username</label>
                  <input
                    type="text"
                    value={formData.username || ''}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-colors ${
                      errors.username ? 'border-red-300 bg-red-50' : 'border-gray-300'
                    }`}
                    placeholder="Enter username"
                  />
                  {errors.username && (
                    <p className="text-red-600 text-sm mt-1 flex items-center space-x-1">
                      <AlertCircle className="w-4 h-4" />
                      <span>{errors.username}</span>
                    </p>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Display Name</label>
                  <input
                    type="text"
                    value={formData.display_name || ''}
                    onChange={(e) => setFormData({ ...formData, display_name: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-colors"
                    placeholder="Enter display name"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Bio</label>
                <textarea
                  value={formData.bio || ''}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  placeholder="Tell us about yourself..."
                  rows={4}
                  className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-colors resize-none ${
                    errors.bio ? 'border-red-300 bg-red-50' : 'border-gray-300'
                  }`}
                />
                <div className="flex justify-between items-center mt-2">
                  {errors.bio && (
                    <p className="text-red-600 text-sm flex items-center space-x-1">
                      <AlertCircle className="w-4 h-4" />
                      <span>{errors.bio}</span>
                    </p>
                  )}
                  <p className="text-xs text-gray-500 ml-auto">
                    {(formData.bio || '').length}/500 characters
                  </p>
                </div>
              </div>
            </div>

            {/* Website */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Website</h3>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Website URL</label>
                <div className="relative">
                  <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="url"
                    value={formData.website_url || ''}
                    onChange={(e) => setFormData({ ...formData, website_url: e.target.value })}
                    className={`w-full pl-12 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-colors ${
                      errors.website_url ? 'border-red-300 bg-red-50' : 'border-gray-300'
                    }`}
                    placeholder="https://yourwebsite.com"
                  />
                </div>
                {errors.website_url && (
                  <p className="text-red-600 text-sm mt-1 flex items-center space-x-1">
                    <AlertCircle className="w-4 h-4" />
                    <span>{errors.website_url}</span>
                  </p>
                )}
              </div>
            </div>

            {/* Social Media Links */}
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900">Social Media</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {Object.entries(socialLinks).map(([platform, value]) => (
                  <div key={platform}>
                    <label className="block text-sm font-medium text-gray-700 mb-2 capitalize">
                      {platform}
                    </label>
                    <div className="relative">
                      <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                        {getSocialIcon(platform)}
                      </div>
                      <input
                        type="text"
                        value={value}
                        onChange={(e) => setSocialLinks({ ...socialLinks, [platform]: e.target.value })}
                        className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-colors"
                        placeholder={getSocialPlaceholder(platform)}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* General Error */}
            {errors.general && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                <div className="flex items-center space-x-3">
                  <AlertCircle className="w-5 h-5 text-red-600" />
                  <p className="text-red-700">{errors.general}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end space-x-4 p-6 border-t border-gray-100 bg-gray-50">
          <button
            onClick={onClose}
            className="px-6 py-3 text-gray-700 hover:text-gray-900 transition-colors"
            disabled={loading}
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={loading || uploadingAvatar || uploadingBanner}
            className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 disabled:from-gray-400 disabled:to-gray-500 text-white px-8 py-3 rounded-xl font-medium transition-all duration-200 flex items-center space-x-2"
          >
            {loading ? (
              <>
                <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>
                <span>Saving...</span>
              </>
            ) : (
              <>
                <Check className="w-4 h-4" />
                <span>Save Changes</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
