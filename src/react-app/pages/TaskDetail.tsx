import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router';
import { useAuth } from '@getmocha/users-service/react';
import { 
  ArrowLeft,
  Clock,
  Users,
  Star,
  Calendar,
  Key,
  Diamond,
  CheckCircle,
  AlertCircle,
  FileText,
  Target,
  User,
  Zap,
  Shield,
  Edit,
  Trash2
} from 'lucide-react';
import UserLink from '@/react-app/components/UserLink';
import EditDropModal from '@/react-app/components/EditDropModal';
import ConfirmationModal from '@/react-app/components/ConfirmationModal';
import { DropType, DropApplicationType, UserType } from '@/shared/types';

export default function TaskDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { } = useAuth();
  const [drop, setDrop] = useState<DropType | null>(null);
  const [application, setApplication] = useState<DropApplicationType | null>(null);
  const [userData, setUserData] = useState<UserType | null>(null);
  const [masterKeyStatus, setMasterKeyStatus] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);
  const [applicationMessage, setApplicationMessage] = useState('');
  const [isCreator, setIsCreator] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Check if this is demo content
  const isDemo = drop?.title?.toLowerCase().includes('[demo]') || 
                 drop?.title?.toLowerCase().includes('demo') ||
                 drop?.description?.toLowerCase().includes('demo');

  useEffect(() => {
    if (id) {
      fetchDropDetail();
      checkApplication();
      fetchUserData();
      fetchMasterKeyStatus();
    }
  }, [id]);

  // Update creator status when both drop and userData are available
  useEffect(() => {
    if (drop && userData) {
      const isUserCreator = drop.creator_id === userData.id;
      console.log('Checking creator status:', {
        dropCreatorId: drop.creator_id,
        userId: userData.id,
        isCreator: isUserCreator
      });
      setIsCreator(isUserCreator);
    }
  }, [drop, userData]);

  const fetchDropDetail = async () => {
    try {
      console.log('Fetching drop detail for ID:', id);
      const response = await fetch(`/api/drops/${id}`);
      console.log('Drop detail response status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('Drop data received:', data);
        console.log('Drop creator_id:', data.creator_id);
        setDrop(data);
      } else {
        const errorData = await response.json().catch(() => ({}));
        console.error('Drop fetch failed:', response.status, errorData);
        navigate('/earn');
      }
    } catch (error) {
      console.error('Failed to fetch drop:', error);
      navigate('/earn');
    } finally {
      setLoading(false);
    }
  };

  const fetchUserData = async () => {
    try {
      // Fetch the database user data which contains the correct ID to match with creator_id
      const response = await fetch('/api/app/users/me', { credentials: 'include' });
      if (response.ok) {
        const data = await response.json();
        console.log('Database user data received:', data);
        console.log('Database user id:', data?.id);
        setUserData(data);
      }
    } catch (error) {
      console.error('Failed to fetch user data:', error);
    }
  };

  const fetchMasterKeyStatus = async () => {
    try {
      const response = await fetch('/api/users/master-key-status', { credentials: 'include' });
      if (response.ok) {
        const data = await response.json();
        setMasterKeyStatus(data);
      }
    } catch (error) {
      console.error('Failed to fetch master key status:', error);
    }
  };

  const checkApplication = async () => {
    try {
      const response = await fetch('/api/users/drop-applications', { credentials: 'include' });
      if (response.ok) {
        const applications = await response.json();
        const existingApp = applications.find((app: DropApplicationType) => app.drop_id === parseInt(id!));
        setApplication(existingApp || null);
      }
    } catch (error) {
      console.error('Failed to check application:', error);
    }
  };

  const handleApply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!drop || !applicationMessage.trim()) return;

    setApplying(true);
    try {
      const response = await fetch(`/api/drops/${drop.id}/apply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ application_message: applicationMessage })
      });

      if (response.ok) {
        await Promise.all([checkApplication(), fetchUserData(), fetchMasterKeyStatus()]);
        setApplicationMessage('');
      } else {
        const error = await response.json();
        console.error('Failed to apply:', error);
        alert(error.error || 'Failed to apply to drop');
      }
    } catch (error) {
      console.error('Failed to apply:', error);
      alert('Failed to apply to drop');
    } finally {
      setApplying(false);
    }
  };

  const getDropTypeImage = (dropType: string) => {
    // Use the drop's content_url if available, otherwise fallback to default images
    if (drop?.content_url) {
      return drop.content_url;
    }
    
    switch (dropType) {
      case 'content_clipping': return 'https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=800&h=400&fit=crop';
      case 'reviews': return 'https://images.unsplash.com/photo-1556155092-490a1ba16284?w=800&h=400&fit=crop';
      case 'ugc_creation': return 'https://images.unsplash.com/photo-1558403194-611308249627?w=800&h=400&fit=crop';
      case 'affiliate_referral': return 'https://images.unsplash.com/photo-1516251193007-45ef944ab0c6?w=800&h=400&fit=crop';
      case 'surveys': return 'https://images.unsplash.com/photo-1432888622747-4eb9a8efeb07?w=800&h=400&fit=crop';
      case 'challenges_events': return 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&h=400&fit=crop';
      case 'engagement': return 'https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=800&h=400&fit=crop';
      default: return 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&h=400&fit=crop';
    }
  };

  const getDropTypeIcon = (dropType: string) => {
    switch (dropType) {
      case 'content_clipping': return '✂️';
      case 'reviews': return '⭐';
      case 'ugc_creation': return '🎨';
      case 'affiliate_referral': return '🔗';
      case 'surveys': return '📊';
      case 'challenges_events': return '🏆';
      default: return '📝';
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'text-green-600 bg-green-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'hard': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'text-yellow-600 bg-yellow-100';
      case 'approved': return 'text-blue-600 bg-blue-100';
      case 'rejected': return 'text-red-600 bg-red-100';
      case 'completed': return 'text-green-600 bg-green-100';
      case 'paid': return 'text-purple-600 bg-purple-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const handleEdit = () => {
    setShowEditModal(true);
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      const response = await fetch(`/api/drops/${drop!.id}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (response.ok) {
        navigate('/earn');
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to delete drop');
      }
    } catch (error) {
      console.error('Failed to delete drop:', error);
      alert('Failed to delete drop');
    } finally {
      setDeleting(false);
      setShowDeleteModal(false);
    }
  };

  const handleEditSuccess = (updatedDrop: DropType) => {
    setDrop(updatedDrop);
    setShowEditModal(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (!drop) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Drop not found</h2>
        <button 
          onClick={() => navigate('/earn')}
          className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-lg font-medium transition-colors"
        >
          Browse Drops
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Demo Alert Banner */}
      {isDemo && (
        <div className="bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-xl p-6 shadow-lg">
          <div className="flex items-center justify-center space-x-3 mb-2">
            <span className="text-2xl">🧪</span>
            <h2 className="text-xl font-bold">DEMO CONTENT</h2>
            <span className="text-2xl">🧪</span>
          </div>
          <p className="text-center text-orange-100">
            This is demo content for testing purposes. No real gems will be awarded even if the interface suggests otherwise.
          </p>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center space-x-4">
        <button
          onClick={() => navigate('/earn')}
          className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">
            Drop Details {isDemo && <span className="text-orange-600">(Demo)</span>}
          </h1>
          <p className="text-gray-600">
            {isDemo ? 'Demo earning opportunity - no real rewards' : 'Earning opportunity'}
          </p>
        </div>
        
        {/* Creator Actions */}
        {isCreator && (
          <div className="flex space-x-3">
            <button
              onClick={handleEdit}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
            >
              <Edit className="w-4 h-4" />
              <span>Edit</span>
            </button>
            <button
              onClick={() => setShowDeleteModal(true)}
              className="flex items-center space-x-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              <span>Delete</span>
            </button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Hero Image & Basic Info */}
          <div className="bg-white rounded-xl overflow-hidden border border-gray-200">
            <div className="relative">
              <img 
                src={getDropTypeImage(drop.drop_type)} 
                alt={drop.title}
                className="w-full h-64 object-cover"
              />
              <div className="absolute inset-0 bg-black bg-opacity-30" />
              <div className="absolute top-4 right-4">
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
                  <div className="bg-orange-500/90 backdrop-blur-sm px-2 py-1 rounded-full">
                    <span className="text-white text-sm font-medium">Move Drop</span>
                  </div>
                )}
              </div>
              <div className="absolute bottom-4 left-4">
                <div className="flex items-center space-x-3 mb-2">
                  <span className="text-3xl">{getDropTypeIcon(drop.drop_type)}</span>
                  <span className="text-white bg-black bg-opacity-30 px-3 py-1 rounded-full text-sm font-medium">
                    {drop.drop_type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </span>
                </div>
                <h1 className="text-3xl font-bold text-white drop-shadow-lg mb-1">{drop.title}</h1>
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <Diamond className="w-6 h-6 text-purple-300 drop-shadow" />
                    <p className="text-2xl font-bold text-white drop-shadow-lg">{drop.gem_reward_base}</p>
                  </div>
                  <p className="text-white/80 drop-shadow">Gems reward</p>
                </div>
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Description</h2>
            <p className="text-gray-700 leading-relaxed">{drop.description}</p>
          </div>

          {/* Requirements & Deliverables */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {drop.requirements && (
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <div className="flex items-center space-x-2 mb-4">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <h3 className="text-lg font-semibold text-gray-900">Requirements</h3>
                </div>
                <p className="text-gray-700 leading-relaxed">{drop.requirements}</p>
              </div>
            )}

            {drop.deliverables && (
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <div className="flex items-center space-x-2 mb-4">
                  <Target className="w-5 h-5 text-blue-600" />
                  <h3 className="text-lg font-semibold text-gray-900">Deliverables</h3>
                </div>
                <p className="text-gray-700 leading-relaxed">{drop.deliverables}</p>
              </div>
            )}
          </div>

          {/* Master Key Status */}
          {userData && masterKeyStatus && (
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-center space-x-2 mb-4">
                <Shield className="w-5 h-5 text-purple-600" />
                <h3 className="text-lg font-semibold text-gray-900">Master Key Status</h3>
              </div>
              
              <div className="bg-purple-50 rounded-lg p-4 mb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-purple-700">Today's Master Key</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    masterKeyStatus.is_activated ? 'text-green-600 bg-green-100' : 'text-orange-600 bg-orange-100'
                  }`}>
                    {masterKeyStatus.is_activated ? 'Activated' : 'Not Activated'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-purple-700">Proof Drops Completed</span>
                  <span className="text-sm font-medium text-purple-900">
                    {masterKeyStatus.proof_drops_completed}/{masterKeyStatus.proof_drops_required}
                  </span>
                </div>
              </div>
              
              {!masterKeyStatus.is_activated && (
                <p className="text-sm text-purple-700">
                  Complete {masterKeyStatus.proof_drops_required - masterKeyStatus.proof_drops_completed} more proof drops to activate your Master Key and unlock the ability to use Keys for drops.
                </p>
              )}
            </div>
          )}

          {/* User Currency Balance */}
          {userData && (
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-center space-x-2 mb-4">
                <Zap className="w-5 h-5 text-blue-600" />
                <h3 className="text-lg font-semibold text-gray-900">Your Balance</h3>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-blue-50 rounded-lg p-3">
                  <div className="flex items-center space-x-2 mb-1">
                    <Key className="w-4 h-4 text-orange-600" />
                    <span className="text-sm font-medium text-gray-700">Keys</span>
                  </div>
                  <p className="text-xl font-bold text-gray-900">{userData.keys_balance}</p>
                </div>
                <div className="bg-purple-50 rounded-lg p-3">
                  <div className="flex items-center space-x-2 mb-1">
                    <Diamond className="w-4 h-4 text-purple-600" />
                    <span className="text-sm font-medium text-gray-700">Gems</span>
                  </div>
                  <p className="text-xl font-bold text-gray-900">{userData.gems_balance}</p>
                </div>
              </div>
              
              {userData.keys_balance < drop.key_cost && (
                <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-700">
                    You need {drop.key_cost - userData.keys_balance} more keys to apply for this drop.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Application Status or Form */}
          {application ? (
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-center space-x-2 mb-4">
                <FileText className="w-5 h-5 text-blue-600" />
                <h3 className="text-lg font-semibold text-gray-900">Your Application</h3>
              </div>
              
              <div className="bg-gray-50 rounded-lg p-4 mb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600">Status</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(application.status)}`}>
                    {application.status}
                  </span>
                </div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600">Applied</span>
                  <span className="text-sm text-gray-900">
                    {new Date(application.applied_at).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Keys Used</span>
                  <span className="text-sm text-gray-900">{drop.key_cost}</span>
                </div>
              </div>
              
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Your Message</h4>
                <p className="text-gray-700 text-sm leading-relaxed">{application.application_message}</p>
              </div>
              
              {application.gems_earned > 0 && (
                <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <Diamond className="w-4 h-4 text-green-600" />
                    <span className="text-sm font-medium text-green-700">
                      Earned {application.gems_earned} gems!
                    </span>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-center space-x-2 mb-4">
                <User className="w-5 h-5 text-orange-600" />
                <h3 className="text-lg font-semibold text-gray-900">Apply for this Drop</h3>
              </div>
              
              {userData && (userData.keys_balance < drop.key_cost || !masterKeyStatus?.is_activated) && (
                <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <h4 className="font-medium text-yellow-800 mb-2">Requirements not met:</h4>
                  <ul className="text-sm text-yellow-700 space-y-1">
                    {userData.keys_balance < drop.key_cost && (
                      <li>• Need {drop.key_cost - userData.keys_balance} more keys</li>
                    )}
                    {!masterKeyStatus?.is_activated && (
                      <li>• Master Key must be activated for today</li>
                    )}
                  </ul>
                </div>
              )}
              
              <form onSubmit={handleApply} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Why are you the right person for this drop?
                  </label>
                  <textarea
                    value={applicationMessage}
                    onChange={(e) => setApplicationMessage(e.target.value)}
                    rows={4}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    placeholder="Tell us about your relevant experience and why you'd be perfect for this drop..."
                    required
                  />
                </div>
                
                <button
                  type="submit"
                  disabled={
                    applying || 
                    !applicationMessage.trim() || 
                    !userData ||
                    userData.keys_balance < drop.key_cost ||
                    !masterKeyStatus?.is_activated
                  }
                  className={`w-full px-6 py-3 rounded-lg font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed text-white ${
                    isDemo 
                      ? 'bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600'
                      : 'bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600'
                  }`}
                >
                  {applying ? 'Submitting...' : `${isDemo ? 'Demo Apply' : 'Apply Now'} (${drop.key_cost} keys)`}
                </button>
              </form>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Drop Stats */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Drop Information</h3>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Key className="w-4 h-4 text-orange-600" />
                  <span className="text-gray-600">Key Cost</span>
                </div>
                <span className="font-bold text-orange-600">{drop.key_cost}</span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Diamond className="w-4 h-4 text-purple-600" />
                  <span className="text-gray-600">Gem Reward</span>
                </div>
                <span className="font-bold text-purple-600">{drop.gem_reward_base}</span>
              </div>

              {drop.gem_pool_total > 0 && (
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Zap className="w-4 h-4 text-blue-600" />
                    <span className="text-gray-600">Pool Remaining</span>
                  </div>
                  <span className="font-semibold text-gray-900">{drop.gem_pool_remaining}</span>
                </div>
              )}
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Users className="w-4 h-4 text-blue-600" />
                  <span className="text-gray-600">Participants</span>
                </div>
                <span className="font-semibold text-gray-900">
                  {drop.current_participants}/{drop.max_participants || '∞'}
                </span>
              </div>

              {drop.follower_threshold > 0 && (
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Star className="w-4 h-4 text-yellow-600" />
                    <span className="text-gray-600">Min. Followers</span>
                  </div>
                  <span className="font-semibold text-gray-900">{drop.follower_threshold}+</span>
                </div>
              )}

              {drop.time_commitment && (
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Clock className="w-4 h-4 text-purple-600" />
                    <span className="text-gray-600">Time</span>
                  </div>
                  <span className="font-semibold text-gray-900">{drop.time_commitment}</span>
                </div>
              )}

              {drop.deadline_at && (
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Calendar className="w-4 h-4 text-red-600" />
                    <span className="text-gray-600">Deadline</span>
                  </div>
                  <span className="font-semibold text-gray-900">
                    {new Date(drop.deadline_at).toLocaleDateString()}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Creator Info */}
          <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Posted By</h3>
            <UserLink 
              username={drop.creator_name}
              displayName={drop.creator_name || 'Drop Creator'}
              avatarUrl={drop.creator_avatar}
              className="flex items-center space-x-3"
              size="lg"
            />
            <div className="mt-2">
              <p className="text-sm text-gray-600">Verified creator</p>
            </div>
            
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="grid grid-cols-2 gap-4 text-center">
                <div>
                  <p className="text-lg font-bold text-gray-900">12</p>
                  <p className="text-xs text-gray-600">Drops Posted</p>
                </div>
                <div>
                  <p className="text-lg font-bold text-gray-900">4.8</p>
                  <p className="text-xs text-gray-600">Avg Rating</p>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Tips */}
          <div className="bg-blue-50 rounded-xl p-6 border border-blue-100">
            <div className="flex items-center space-x-2 mb-3">
              <AlertCircle className="w-5 h-5 text-blue-600" />
              <h3 className="font-semibold text-blue-900">Pro Tips</h3>
            </div>
            <ul className="text-sm text-blue-800 space-y-2">
              <li>• Ensure you have enough keys before applying</li>
              <li>• Activate your Master Key daily</li>
              <li>• Read all requirements carefully</li>
              <li>• Submit high-quality work on time</li>
              <li>• Communicate with the drop creator</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      {drop && showEditModal && (
        <EditDropModal
          isOpen={showEditModal}
          onClose={() => setShowEditModal(false)}
          onSuccess={handleEditSuccess}
          drop={drop}
        />
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDelete}
        title="Delete Drop"
        message="Are you sure you want to delete this drop? This action cannot be undone and will remove all applications."
        confirmText="Delete"
        cancelText="Cancel"
        type="danger"
        loading={deleting}
      />
    </div>
  );
}
