import { useState, useEffect } from 'react';
import { TrendingUp, Users, Clock, DollarSign, Plus, Target, ExternalLink } from 'lucide-react';
import CreateForecastModal from '../components/CreateForecastModal';
import PlaceForecastModal from '../components/PlaceForecastModal';

interface SocialForecast {
  id: number;
  creator_id: number;
  creator_name: string;
  creator_avatar: string;
  platform: string;
  content_url: string;
  content_id?: number;
  content_title?: string;
  content_platform?: string;
  forecast_type: string;
  target_value: number;
  current_value: number;
  odds: number;
  pool_size: number;
  creator_initial_amount: number;
  creator_side: string;
  expires_at: string;
  status: string;
  created_at: string;
}

interface UserForecast {
  id: number;
  forecast_id: number;
  prediction_amount: number;
  prediction_side: string;
  potential_payout: number;
  actual_payout: number;
  status: string;
  forecast_type: string;
  target_value: number;
  current_value: number;
  platform: string;
  content_url: string;
  expires_at: string;
  forecast_status: string;
  result: string;
  creator_name: string;
  created_at: string;
}

interface ContentPiece {
  id: number;
  title: string;
  creator_name: string;
  creator_avatar: string;
  platform: string;
  share_price: number;
  current_revenue: number;
  available_shares: number;
  total_shares: number;
  created_at: string;
}

export default function Invest() {
  const [activeTab, setActiveTab] = useState<'forecasts' | 'my-forecasts' | 'my-created' | 'content'>('forecasts');
  const [forecasts, setForecasts] = useState<SocialForecast[]>([]);
  const [myForecasts, setMyForecasts] = useState<UserForecast[]>([]);
  const [myCreatedForecasts, setMyCreatedForecasts] = useState<SocialForecast[]>([]);
  const [content, setContent] = useState<ContentPiece[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showPlaceModal, setShowPlaceModal] = useState(false);
  const [selectedForecast, setSelectedForecast] = useState<SocialForecast | null>(null);

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'forecasts') {
        const response = await fetch('/api/social-forecasts');
        if (response.ok) {
          const data = await response.json();
          setForecasts(data);
        } else {
          console.error('Failed to fetch forecasts:', response.status);
        }
      } else if (activeTab === 'my-forecasts') {
        const response = await fetch('/api/users/forecasts', { credentials: 'include' });
        if (response.ok) {
          const data = await response.json();
          setMyForecasts(data);
        } else {
          console.error('Failed to fetch user forecasts:', response.status);
          setMyForecasts([]); // Set empty array on failure
        }
      } else if (activeTab === 'my-created') {
        const response = await fetch('/api/users/created-forecasts', { credentials: 'include' });
        if (response.ok) {
          const data = await response.json();
          setMyCreatedForecasts(data);
        } else {
          console.error('Failed to fetch created forecasts:', response.status);
          setMyCreatedForecasts([]); // Set empty array on failure
        }
      } else if (activeTab === 'content') {
        const response = await fetch('/api/content');
        if (response.ok) {
          const data = await response.json();
          setContent(data);
        } else {
          console.error('Failed to fetch content:', response.status);
        }
      }
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePlacePrediction = (forecast: SocialForecast) => {
    setSelectedForecast(forecast);
    setShowPlaceModal(true);
  };

  const handleForecastCreated = () => {
    fetchData();
    setShowCreateModal(false);
  };

  const handlePredictionPlaced = () => {
    fetchData();
  };

  const formatTimeRemaining = (expiresAt: string) => {
    const now = new Date();
    const expires = new Date(expiresAt);
    const diff = expires.getTime() - now.getTime();
    
    if (diff <= 0) return 'Expired';
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours > 24) {
      const days = Math.floor(hours / 24);
      return `${days}d ${hours % 24}h`;
    }
    
    return `${hours}h ${minutes}m`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-600 bg-green-100';
      case 'expired': return 'text-gray-600 bg-gray-100';
      case 'resolved': return 'text-blue-600 bg-blue-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const ForecastCard = ({ forecast }: { forecast: SocialForecast }) => {
    const isExpired = new Date(forecast.expires_at) <= new Date();
    
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            <img
              src={forecast.creator_avatar || '/api/placeholder/32/32'}
              alt={forecast.creator_name}
              className="w-8 h-8 rounded-full"
            />
            <div>
              <p className="font-medium text-gray-900">{forecast.creator_name}</p>
              <p className="text-xs text-gray-500">{forecast.platform}</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(forecast.status)}`}>
              {forecast.status}
            </span>
            <a
              href={forecast.content_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-gray-600"
            >
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        </div>

        {forecast.content_title && (
          <div className="mb-3 p-3 bg-gray-50 rounded-lg">
            <p className="text-sm font-medium text-gray-900">{forecast.content_title}</p>
            <p className="text-xs text-gray-500">{forecast.content_platform}</p>
          </div>
        )}

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Target className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-medium">
                {forecast.forecast_type} {forecast.target_value.toLocaleString()}
              </span>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600">Pool</p>
              <p className="font-semibold text-green-600">${forecast.pool_size.toFixed(2)}</p>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Clock className="w-4 h-4 text-gray-400" />
              <span className="text-sm text-gray-600">
                {formatTimeRemaining(forecast.expires_at)}
              </span>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600">Odds</p>
              <p className="font-semibold text-blue-600">{forecast.odds}x</p>
            </div>
          </div>

          {forecast.creator_side && forecast.creator_initial_amount > 0 && (
            <div className="bg-blue-50 rounded-lg p-3">
              <p className="text-xs text-gray-600 mb-1">Creator's Prediction</p>
              <p className="text-sm font-medium text-blue-600">
                {forecast.creator_side.toUpperCase()} • ${forecast.creator_initial_amount.toFixed(2)} staked
              </p>
            </div>
          )}

          {!isExpired && (
            <button
              onClick={() => handlePlacePrediction(forecast)}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Make Your Prediction
            </button>
          )}
        </div>
      </div>
    );
  };

  const MyForecastCard = ({ forecast }: { forecast: UserForecast }) => {
    const isResolved = forecast.forecast_status === 'resolved';
    const isWin = isResolved && forecast.actual_payout > 0;
    
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <p className="font-medium text-gray-900">
              {forecast.forecast_type} forecast by {forecast.creator_name}
            </p>
            <p className="text-sm text-gray-600">{forecast.platform}</p>
          </div>
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(forecast.forecast_status)}`}>
            {forecast.forecast_status}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <p className="text-xs text-gray-500">Your Prediction</p>
            <p className="font-medium text-blue-600">{forecast.prediction_side.toUpperCase()}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Amount Staked</p>
            <p className="font-medium">${forecast.prediction_amount.toFixed(2)}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Target Value</p>
            <p className="font-medium">{forecast.target_value.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Current Value</p>
            <p className="font-medium">{forecast.current_value.toLocaleString()}</p>
          </div>
        </div>

        {isResolved ? (
          <div className={`p-3 rounded-lg ${isWin ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
            <p className={`text-sm font-medium ${isWin ? 'text-green-600' : 'text-red-600'}`}>
              {isWin ? 'Won!' : 'Lost'} • {isWin ? `+$${forecast.actual_payout.toFixed(2)}` : `$${forecast.prediction_amount.toFixed(2)} lost`}
            </p>
          </div>
        ) : (
          <div className="bg-gray-50 rounded-lg p-3">
            <p className="text-sm text-gray-600">
              Potential payout: <span className="font-medium text-green-600">${forecast.potential_payout.toFixed(2)}</span>
            </p>
            <p className="text-xs text-gray-500">
              Expires: {formatTimeRemaining(forecast.expires_at)}
            </p>
          </div>
        )}
      </div>
    );
  };

  const ContentShareCard = ({ content }: { content: ContentPiece }) => (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center space-x-3 mb-4">
        <img
          src={content.creator_avatar || '/api/placeholder/32/32'}
          alt={content.creator_name}
          className="w-8 h-8 rounded-full"
        />
        <div>
          <p className="font-medium text-gray-900">{content.creator_name}</p>
          <p className="text-xs text-gray-500">{content.platform}</p>
        </div>
      </div>
      
      <h3 className="font-medium text-gray-900 mb-3">{content.title}</h3>
      
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <p className="text-xs text-gray-500">Share Price</p>
          <p className="font-medium">${content.share_price.toFixed(2)}</p>
        </div>
        <div>
          <p className="text-xs text-gray-500">Available</p>
          <p className="font-medium">{content.available_shares}/{content.total_shares}</p>
        </div>
      </div>
      
      <div className="bg-green-50 rounded-lg p-3 mb-4">
        <p className="text-sm text-green-600 font-medium">
          Revenue: ${content.current_revenue.toFixed(2)}
        </p>
      </div>
      
      <button className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors">
        Buy Shares
      </button>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Investment Hub</h1>
            <p className="text-gray-600">Create forecasts, make predictions, and invest in creator success</p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>Create Forecast</span>
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="border-b border-gray-200 mb-8">
          <nav className="-mb-px flex space-x-8">
            {[
              { id: 'forecasts', label: 'All Forecasts', icon: TrendingUp },
              { id: 'my-forecasts', label: 'My Predictions', icon: Users },
              { id: 'my-created', label: 'My Forecasts', icon: Target },
              { id: 'content', label: 'Content Shares', icon: DollarSign },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {activeTab === 'forecasts' && forecasts.map((forecast) => (
              <ForecastCard key={forecast.id} forecast={forecast} />
            ))}
            
            {activeTab === 'my-forecasts' && myForecasts.map((forecast) => (
              <MyForecastCard key={forecast.id} forecast={forecast} />
            ))}
            
            {activeTab === 'my-created' && myCreatedForecasts.map((forecast) => (
              <ForecastCard key={forecast.id} forecast={forecast} />
            ))}
            
            {activeTab === 'content' && content.map((piece) => (
              <ContentShareCard key={piece.id} content={piece} />
            ))}
          </div>
        )}

        {/* Empty States */}
        {!loading && (
          <>
            {activeTab === 'forecasts' && forecasts.length === 0 && (
              <div className="text-center py-12">
                <TrendingUp className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Active Forecasts</h3>
                <p className="text-gray-600 mb-4">Be the first to create a prediction market! Put up your own stake and let others predict on your forecast.</p>
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Create First Forecast
                </button>
              </div>
            )}
            
            {activeTab === 'my-forecasts' && myForecasts.length === 0 && (
              <div className="text-center py-12">
                <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Predictions Yet</h3>
                <p className="text-gray-600">Browse active forecasts and make your first prediction to start earning!</p>
              </div>
            )}
            
            {activeTab === 'my-created' && myCreatedForecasts.length === 0 && (
              <div className="text-center py-12">
                <Target className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Created Forecasts</h3>
                <p className="text-gray-600 mb-4">Create your first prediction market by putting up initial stake and letting others predict against you!</p>
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Create Forecast
                </button>
              </div>
            )}
            
            {activeTab === 'content' && content.length === 0 && (
              <div className="text-center py-12">
                <DollarSign className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Content Available</h3>
                <p className="text-gray-600">No content shares are currently available for investment.</p>
              </div>
            )}
          </>
        )}
      </div>

      {/* Modals */}
      <CreateForecastModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onForecastCreated={handleForecastCreated}
      />

      {selectedForecast && (
        <PlaceForecastModal
          isOpen={showPlaceModal}
          onClose={() => setShowPlaceModal(false)}
          forecast={selectedForecast}
          onPredictionPlaced={handlePredictionPlaced}
        />
      )}
    </div>
  );
}
