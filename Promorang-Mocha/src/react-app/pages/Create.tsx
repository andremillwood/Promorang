import { useState, useRef } from 'react';
import { 
  Upload, 
  Camera, 
  Video, 
  FileText, 
  Link as LinkIcon,
  Instagram,
  Twitter,
  Youtube,
  Linkedin,
  Music,
  X,
  Image as ImageIcon
} from 'lucide-react';
import { PlatformSchema } from '@/shared/types';
import { useAuth } from '@getmocha/users-service/react';

import { createErrorHandler } from '@/react-app/utils/errorHandler';


export default function Create() {
  const { } = useAuth();
  
  const errorHandler = createErrorHandler('Create');
  const [activeTab, setActiveTab] = useState<'post' | 'upload'>('post');
  const [postData, setPostData] = useState<{
    platform: 'instagram' | 'tiktok' | 'youtube' | 'linkedin' | 'twitter';
    title: string;
    description: string;
    platform_url: string;
    media_url: string;
    total_shares: number;
    share_price: number;
  }>({
    platform: 'instagram',
    title: '',
    description: '',
    platform_url: '',
    media_url: '',
    total_shares: 100,
    share_price: 0.0,
  });
  const [fundWithGems, setFundWithGems] = useState(false);
  const [gemFundingAmount, setGemFundingAmount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [uploadMode, setUploadMode] = useState<'url' | 'file'>('url');
  const [uploadingFile, setUploadingFile] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
      
      // Instead of throwing an error, always provide a fallback
      // This prevents the error from bubbling up and causing error page redirects
      
      // Try to generate a placeholder image first
      try {
        const fallbackResponse = await fetch('/api/content/generate-placeholder', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify({
            description: postData.title || 'Social media content',
            platform: postData.platform
          }),
        });

        if (fallbackResponse.ok) {
          const fallbackResult = await fallbackResponse.json();
          
          // Show user that a placeholder was used
          const notification = document.createElement('div');
          notification.className = 'fixed top-4 right-4 bg-orange-500 text-white px-4 py-3 rounded-lg shadow-lg z-50';
          notification.innerHTML = `
            <div class="flex items-center space-x-2">
              <span>📷</span>
              <div>
                <div class="font-semibold">Using Placeholder Image</div>
                <div class="text-xs opacity-90">Original upload failed, but your content will still be created</div>
              </div>
            </div>
          `;
          document.body.appendChild(notification);
          setTimeout(() => {
            if (document.body.contains(notification)) {
              document.body.removeChild(notification);
            }
          }, 4000);
          
          return fallbackResult.imageUrl;
        }
      } catch (fallbackError) {
        console.error('Fallback image generation failed:', fallbackError);
      }
      
      // Last resort: use a generic placeholder (never throw error)
      const placeholderUrl = `https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=800&h=600&fit=crop&crop=center`;
      
      // Show user that a generic placeholder was used
      const notification = document.createElement('div');
      notification.className = 'fixed top-4 right-4 bg-orange-500 text-white px-4 py-3 rounded-lg shadow-lg z-50';
      notification.innerHTML = `
        <div class="flex items-center space-x-2">
          <span>📷</span>
          <div>
            <div class="font-semibold">Using Default Image</div>
            <div class="text-xs opacity-90">Upload service temporarily unavailable</div>
          </div>
        </div>
      `;
      document.body.appendChild(notification);
      setTimeout(() => {
        if (document.body.contains(notification)) {
          document.body.removeChild(notification);
        }
      }, 4000);
      
      return placeholderUrl;
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
        const typeError = new Error('Please upload a valid image file (JPG, PNG, GIF, WEBP).');
        errorHandler.handleError(typeError, 'invalid_file_type');
        return;
      }

      // Validate file size (increased limit to 15MB for better user experience)
      if (file.size > 15 * 1024 * 1024) {
        const sizeError = new Error('File size must be less than 15MB. Please compress your image or use a URL instead.');
        errorHandler.handleError(sizeError, 'file_too_large');
        return;
      }

      setUploadedFile(file);
      
      // Create preview URL
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      
      // Upload the file and get the real URL
      try {
        const uploadedUrl = await uploadImageToStorage(file);
        setPostData({ 
          ...postData, 
          media_url: uploadedUrl
        });
      } catch (error) {
        console.error('File upload failed:', error);
        
        // Only redirect to error page for critical upload failures, not fallback scenarios
        const errorMessage = error instanceof Error ? error.message : String(error);
        if (errorMessage.includes('too large') || errorMessage.includes('Invalid file type')) {
          const uploadError = error instanceof Error ? error : new Error(errorMessage);
          errorHandler.handleError(uploadError, 'upload_image');
        } else {
          // For other upload issues, show a toast notification instead of error page
          const notification = document.createElement('div');
          notification.className = 'fixed top-4 right-4 bg-red-500 text-white px-4 py-3 rounded-lg shadow-lg z-50';
          notification.innerHTML = `
            <div class="flex items-center space-x-2">
              <span>❌</span>
              <div>
                <div class="font-semibold">Upload Failed</div>
                <div class="text-xs opacity-90">Please try again or use an image URL instead</div>
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
    setPostData({ ...postData, media_url: '' });
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

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validate image URL if provided
      if (postData.media_url && uploadMode === 'url') {
        const isValidImage = await validateImageUrl(postData.media_url);
        if (!isValidImage) {
          const urlError = new Error('The provided image URL is not accessible. Please check the URL or upload an image file instead.');
          errorHandler.handleError(urlError, 'invalid_image_url');
          setLoading(false);
          return;
        }
      }

      // Calculate share price based on gem funding
      const finalPostData = {
        ...postData,
        share_price: fundWithGems && gemFundingAmount > 0 ? gemFundingAmount / postData.total_shares : 0.0
      };

      console.log('Sending content creation request:', finalPostData);
      
      const response = await fetch('/api/content', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(finalPostData),
      });

      console.log('Content creation response status:', response.status);
      
      if (response.ok) {
        const result = await response.json();
        
        // If funding with gems, make a funding request
        if (fundWithGems && gemFundingAmount > 0) {
          try {
            await fetch(`/api/content/${result.contentId}/fund`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              credentials: 'include',
              body: JSON.stringify({
                amount: gemFundingAmount,
                currency_type: 'Gems'
              })
            });
          } catch (fundingError) {
            console.error('Funding failed:', fundingError);
            // Content was still created, so we continue
          }
        }
        
        // Reset form
        setPostData({
          platform: 'instagram',
          title: '',
          description: '',
          platform_url: '',
          media_url: '',
          total_shares: 100,
          share_price: 0.0,
        });
        setFundWithGems(false);
        setGemFundingAmount(0);
        removeUploadedFile();
        setUploadMode('url');
        
        // Show success notification
        const notification = document.createElement('div');
        notification.className = 'fixed top-4 right-4 bg-green-500 text-white px-4 py-3 rounded-lg shadow-lg z-50 animate-bounce';
        notification.innerHTML = `
          <div class="flex items-center space-x-2">
            <span class="text-lg">🎉</span>
            <div>
              <div class="font-semibold">Content Created!</div>
              <div class="text-xs opacity-90">Redirecting to your content page...</div>
            </div>
          </div>
        `;
        document.body.appendChild(notification);
        
        // Redirect to content page after a brief delay
        setTimeout(() => {
          if (document.body.contains(notification)) {
            document.body.removeChild(notification);
          }
          // Redirect to the content detail page
          window.location.href = `/content/${result.contentId}`;
        }, 2000);
      } else {
        let errorMessage = 'Failed to create content. Please try again.';
        let errorDetails = null;
        try {
          const error = await response.json();
          console.error('Failed to create content:', error);
          
          if (error.error) {
            errorMessage = error.error;
          }
          
          // Log detailed error information for debugging
          if (error.details) {
            console.error('Error details:', error.details);
            errorDetails = error.details;
          }
          
          if (error.field_errors) {
            console.error('Field validation errors:', error.field_errors);
            const fieldErrors = error.field_errors.map((fe: any) => `${fe.field}: ${fe.message}`).join(', ');
            errorMessage = `Validation failed: ${fieldErrors}`;
          }
        } catch (e) {
          console.error('Error parsing error response:', e);
        }
        
        // Enhanced error handling with more specific conditions
        const isServerError = response.status >= 500;
        const isDatabaseError = errorMessage.includes('database') || errorMessage.includes('Database');
        const isValidationError = response.status === 400 && errorMessage.includes('Validation');
        
        if (isServerError || isDatabaseError) {
          // Critical errors should redirect to error page
          const contentError = new Error(`${errorMessage}${errorDetails ? ` - ${errorDetails}` : ''}`);
          errorHandler.handleError(contentError, 'create_content');
        } else {
          // For client-side, validation, or other correctable errors, show toast notification
          const notification = document.createElement('div');
          notification.className = 'fixed top-4 right-4 bg-red-500 text-white px-4 py-3 rounded-lg shadow-lg z-50';
          notification.innerHTML = `
            <div class="flex items-center space-x-2">
              <span>❌</span>
              <div>
                <div class="font-semibold">Content Creation Failed</div>
                <div class="text-xs opacity-90">${errorMessage}</div>
                ${isValidationError ? '<div class="text-xs opacity-75 mt-1">Please check all form fields and try again</div>' : ''}
              </div>
            </div>
          `;
          document.body.appendChild(notification);
          setTimeout(() => {
            if (document.body.contains(notification)) {
              document.body.removeChild(notification);
            }
          }, 8000);
        }
      }
    } catch (error) {
      console.error('Failed to create content:', error);
      
      // Use error handler for network/connection errors
      const createError = error instanceof Error ? error : new Error('Failed to create content. Please check your connection and try again.');
      errorHandler.handleError(createError, 'create_content_network');
    } finally {
      setLoading(false);
    }
  };

  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case 'instagram': return <Instagram className="w-5 h-5" />;
      case 'twitter': return <Twitter className="w-5 h-5" />;
      case 'youtube': return <Youtube className="w-5 h-5" />;
      case 'linkedin': return <Linkedin className="w-5 h-5" />;
      case 'tiktok': return <Music className="w-5 h-5" />;
      default: return <LinkIcon className="w-5 h-5" />;
    }
  };

  const getPlatformColor = (platform: string) => {
    switch (platform) {
      case 'instagram': return 'from-pink-500 to-purple-600';
      case 'twitter': return 'from-blue-400 to-blue-600';
      case 'youtube': return 'from-red-500 to-red-600';
      case 'linkedin': return 'from-blue-600 to-blue-800';
      case 'tiktok': return 'from-black to-gray-800';
      default: return 'from-gray-500 to-gray-600';
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Create</h1>
          <p className="text-gray-600 mt-2">Share your content and unlock earning opportunities</p>
        </div>
        
        {/* Info about monetization */}
        <div className="text-right">
          <p className="text-sm text-gray-500">Need to create marketing campaigns?</p>
          <p className="text-xs text-gray-400">Check "Become Advertiser" in your profile menu</p>
        </div>
      </div>

      {/* Creation Tabs */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            <button
              onClick={() => setActiveTab('post')}
              className={`py-4 border-b-2 font-medium text-sm ${
                activeTab === 'post'
                  ? 'border-orange-500 text-orange-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Share Existing Content
            </button>
            <button
              onClick={() => setActiveTab('upload')}
              className={`py-4 border-b-2 font-medium text-sm ${
                activeTab === 'upload'
                  ? 'border-orange-500 text-orange-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Upload New Content
            </button>
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'post' && (
            <form onSubmit={handleCreatePost} className="space-y-6">
              {/* Platform Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">Platform</label>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                  {PlatformSchema.options.map((platform) => (
                    <button
                      key={platform}
                      type="button"
                      onClick={() => setPostData({ ...postData, platform })}
                      className={`p-4 border rounded-lg flex flex-col items-center space-y-2 transition-all ${
                        postData.platform === platform
                          ? 'border-orange-500 bg-orange-50 text-orange-700'
                          : 'border-gray-300 hover:border-gray-400'
                      }`}
                    >
                      <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${getPlatformColor(platform)} flex items-center justify-center text-white`}>
                        {getPlatformIcon(platform)}
                      </div>
                      <span className="text-sm font-medium capitalize">{platform}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Content Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Content Title</label>
                  <input
                    type="text"
                    required
                    value={postData.title}
                    onChange={(e) => setPostData({ ...postData, title: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    placeholder="My amazing content piece..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Platform URL</label>
                  <input
                    type="url"
                    required
                    value={postData.platform_url}
                    onChange={(e) => setPostData({ ...postData, platform_url: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    placeholder="https://instagram.com/p/..."
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <textarea
                  rows={3}
                  value={postData.description}
                  onChange={(e) => setPostData({ ...postData, description: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  placeholder="Describe your content..."
                />
              </div>

              {/* Enhanced Media Upload/URL Section */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">Media Content (Optional)</label>
                
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
                      setPostData({ ...postData, media_url: '' });
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
                      value={postData.media_url}
                      onChange={(e) => setPostData({ ...postData, media_url: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      placeholder="Direct link to image..."
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Make sure the image URL is publicly accessible and ends with .jpg, .png, .gif, or .webp
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
                              <p className="font-medium text-gray-900">{uploadedFile.name}</p>
                              <p className="text-sm text-gray-500">
                                {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB
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

              {/* Investment Settings */}
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-purple-900 mb-4">Investment Settings</h3>
                
                {/* Total Shares */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-purple-700 mb-2">Total Shares Available</label>
                  <input
                    type="number"
                    min="100"
                    max="1000"
                    value={postData.total_shares}
                    onChange={(e) => setPostData({ ...postData, total_shares: Math.max(100, Number(e.target.value)) })}
                    className="w-full px-4 py-2 border border-purple-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                  <p className="text-xs text-purple-600 mt-1">Minimum 100 shares required</p>
                </div>

                {/* Fund with Gems Toggle */}
                <div className="mb-4">
                  <label className="flex items-center space-x-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={fundWithGems}
                      onChange={(e) => {
                        setFundWithGems(e.target.checked);
                        if (!e.target.checked) {
                          setGemFundingAmount(0);
                          setPostData({ ...postData, share_price: 0.0 });
                        }
                      }}
                      className="w-4 h-4 text-purple-600 border-purple-300 rounded focus:ring-purple-500"
                    />
                    <div>
                      <span className="text-sm font-medium text-purple-700">Fund content with gems</span>
                      <p className="text-xs text-purple-600">Give your content initial value by funding it with gems</p>
                    </div>
                  </label>
                </div>

                {/* Gem Funding Amount (only shown if funding enabled) */}
                {fundWithGems && (
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-purple-700 mb-2">Gem Funding Amount</label>
                    <input
                      type="number"
                      min="1"
                      step="1"
                      value={gemFundingAmount || ''}
                      onChange={(e) => {
                        const amount = Number(e.target.value);
                        setGemFundingAmount(amount);
                        setPostData({ 
                          ...postData, 
                          share_price: amount > 0 ? amount / postData.total_shares : 0.0 
                        });
                      }}
                      className="w-full px-4 py-2 border border-purple-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="Enter gems to fund content"
                    />
                    <div className="text-xs text-purple-600 mt-1 space-y-1">
                      <p>This will be split across all {postData.total_shares} shares</p>
                      {gemFundingAmount > 0 && (
                        <p>Share price: {(gemFundingAmount / postData.total_shares).toFixed(4)} gems per share</p>
                      )}
                    </div>
                  </div>
                )}

                <div className="bg-purple-100 border border-purple-300 rounded-lg p-3">
                  <p className="text-sm text-purple-700">
                    <strong>Total shares:</strong> {postData.total_shares}
                    {fundWithGems && gemFundingAmount > 0 && (
                      <>
                        <br />
                        <strong>Total funding:</strong> {gemFundingAmount} gems
                        <br />
                        <strong>Value per share:</strong> {(gemFundingAmount / postData.total_shares).toFixed(4)} gems
                      </>
                    )}
                    {!fundWithGems && (
                      <>
                        <br />
                        <strong>Initial value:</strong> Free shares (investors can add value later)
                      </>
                    )}
                  </p>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || uploadingFile}
                className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white py-3 rounded-lg font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Creating...' : uploadingFile ? 'Processing Image...' : 'Create Content Post'}
              </button>
            </form>
          )}

          {activeTab === 'upload' && (
            <div className="space-y-6">
              {/* Upload Area */}
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center">
                <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Upload your content</h3>
                <p className="text-gray-600 mb-4">
                  Drag and drop your files here, or click to browse
                </p>
                <button className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white px-6 py-3 rounded-lg font-medium transition-all duration-200">
                  Choose Files
                </button>
                <p className="text-sm text-gray-500 mt-4">
                  Supports: Images (JPG, PNG, WEBP), Videos (MP4, MOV), Documents (PDF, DOC)
                </p>
              </div>

              {/* Content Types */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-center">
                  <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <Camera className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="font-semibold text-blue-900 mb-2">Photos</h3>
                  <p className="text-sm text-blue-700">High-quality images for social sharing</p>
                </div>

                <div className="bg-purple-50 border border-purple-200 rounded-lg p-6 text-center">
                  <div className="w-12 h-12 bg-purple-500 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <Video className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="font-semibold text-purple-900 mb-2">Videos</h3>
                  <p className="text-sm text-purple-700">Engaging video content for maximum reach</p>
                </div>

                <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
                  <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <FileText className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="font-semibold text-green-900 mb-2">Documents</h3>
                  <p className="text-sm text-green-700">Educational and informational content</p>
                </div>
              </div>

              {/* Coming Soon */}
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Direct Upload Coming Soon</h3>
                <p className="text-gray-600">
                  We're working on direct upload functionality. For now, please use the "Share Existing Content" tab 
                  to upload images and link to content you've posted on social platforms.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
