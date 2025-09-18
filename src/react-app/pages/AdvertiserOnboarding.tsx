import { useState } from 'react';
import { useAuth } from '@getmocha/users-service/react';
import { useNavigate } from 'react-router';
import { 
  Megaphone, 
  Users, 
  TrendingUp, 
  Star, 
  CheckCircle, 
  ArrowRight,
  Crown,
  Zap,
  BarChart3,
  Target,
  DollarSign
} from 'lucide-react';

export default function AdvertiserOnboarding() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isConverting, setIsConverting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleBecomeAdvertiser = async () => {
    if (!user) {
      navigate('/?error=auth_required');
      return;
    }

    setIsConverting(true);
    setError(null);

    try {
      const response = await fetch('/api/users/become-advertiser', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include'
      });

      if (response.ok) {
        // Signal conversion to other tabs/windows
        localStorage.setItem('advertiser_conversion', 'true');
        // Navigate with hash to indicate fresh conversion
        window.location.href = '/advertiser#converted';
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to become advertiser');
      }
    } catch (error) {
      console.error('Error becoming advertiser:', error);
      setError('Network error occurred');
    } finally {
      setIsConverting(false);
    }
  };

  const tierBenefits = {
    free: {
      name: 'Free Advertiser',
      color: 'text-gray-600 bg-gray-50 border-gray-200',
      inventory: 'Monthly Sample: 50 moves, 5 proof drops',
      features: ['Basic analytics', 'Standard support', 'Create proof drops only', 'Sponsor any content with gems']
    },
    premium: {
      name: 'Premium Advertiser',
      color: 'text-purple-600 bg-purple-50 border-purple-200', 
      inventory: 'Weekly: 200 moves, 15 proof drops, 8 paid drops',
      features: ['Advanced analytics', 'Priority support', 'Custom targeting', 'Create proof & paid drops', 'Sponsor content with gems']
    },
    super: {
      name: 'Super Advertiser',
      color: 'text-yellow-600 bg-yellow-50 border-yellow-200',
      inventory: 'Weekly: 500 moves, 25 proof drops, 15 paid drops',
      features: ['Premium analytics', 'Priority support', 'Custom targeting', 'Advanced reporting', 'Create proof & paid drops', 'Sponsor content with gems']
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-red-50 to-purple-50">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-r from-orange-500 to-red-500">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative z-10 px-6 py-20">
          <div className="max-w-4xl mx-auto text-center text-white">
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                <Megaphone className="w-8 h-8" />
              </div>
            </div>
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              Advertise on Promorang
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-orange-100 max-w-3xl mx-auto">
              Connect with thousands of creators and build authentic campaigns that drive real engagement
            </p>
            <div className="flex items-center justify-center space-x-8 text-orange-100">
              <div className="flex items-center space-x-2">
                <Users className="w-5 h-5" />
                <span>50k+ Active Creators</span>
              </div>
              <div className="flex items-center space-x-2">
                <TrendingUp className="w-5 h-5" />
                <span>95% Completion Rate</span>
              </div>
              <div className="flex items-center space-x-2">
                <Star className="w-5 h-5" />
                <span>4.9★ Average Rating</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-6 py-16">
        {/* Benefits Section */}
        <div className="mb-16">
          <h2 className="text-4xl font-bold text-center text-gray-900 mb-12">
            Why Choose Promorang for Advertising?
          </h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-200 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-6">
                <Target className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Moves & Proof System</h3>
              <p className="text-gray-600">
                Create "moves" that help users earn keys for their Master Key progression, and "proof drops" that contribute to daily activation requirements.
              </p>
            </div>

            <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-200 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mb-6">
                <BarChart3 className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Flexible Inventory System</h3>
              <p className="text-gray-600">
                Start with free monthly samples, then upgrade to weekly inventory allocations for moves, proof drops, and paid opportunities.
              </p>
            </div>

            <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-200 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mb-6">
                <DollarSign className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Gem Sponsorship System</h3>
              <p className="text-gray-600">
                All advertisers can allocate gems to sponsor any content, boosting visibility and engagement regardless of tier level.
              </p>
            </div>
          </div>
        </div>

        {/* Advertiser Tiers */}
        <div className="mb-16">
          <h2 className="text-4xl font-bold text-center text-gray-900 mb-4">
            Advertiser Tiers
          </h2>
          <p className="text-center text-gray-600 mb-12 text-lg">
            Choose the tier that matches your advertising needs and scale
          </p>
          
          <div className="grid md:grid-cols-3 gap-8">
            {Object.entries(tierBenefits).map(([tier, info]) => (
              <div key={tier} className={`border-2 rounded-2xl p-8 ${info.color} relative`}>
                {tier === 'premium' && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <span className="bg-purple-500 text-white px-4 py-1 rounded-full text-sm font-medium">
                      Most Popular
                    </span>
                  </div>
                )}
                
                <div className="text-center mb-6">
                  <div className="flex justify-center mb-4">
                    {tier === 'free' && <Zap className="w-8 h-8 text-gray-600" />}
                    {tier === 'premium' && <Star className="w-8 h-8 text-purple-600" />}
                    {tier === 'super' && <Crown className="w-8 h-8 text-yellow-600" />}
                  </div>
                  <h3 className="text-2xl font-bold mb-2">{info.name}</h3>
                  <p className="text-lg font-semibold">{info.inventory}</p>
                  <p className="text-sm opacity-75">
                    {tier === 'free' ? 'Sample inventory allocation' : 'Weekly inventory allocation'}
                  </p>
                </div>
                
                <ul className="space-y-3 mb-6">
                  {info.features.map((feature, index) => (
                    <li key={index} className="flex items-center space-x-2">
                      <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
                
                {tier === 'free' && (
                  <p className="text-xs opacity-75 text-center">
                    Free tier can create proof drops and sponsor content. Upgrade to create paid drops.
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* How It Works */}
        <div className="mb-16">
          <h2 className="text-4xl font-bold text-center text-gray-900 mb-12">
            How It Works
          </h2>
          
          <div className="grid md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <span className="text-white font-bold text-xl">1</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Create Campaigns</h3>
              <p className="text-gray-600 text-sm">
                Set up drops with your requirements, budget, and target audience
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <span className="text-white font-bold text-xl">2</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Creators Apply</h3>
              <p className="text-gray-600 text-sm">
                Qualified creators apply to your campaigns with their proposals
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <span className="text-white font-bold text-xl">3</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Review & Approve</h3>
              <p className="text-gray-600 text-sm">
                Review submissions and approve the best content for your brand
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <span className="text-white font-bold text-xl">4</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Track Results</h3>
              <p className="text-gray-600 text-sm">
                Monitor performance and measure ROI with detailed analytics
              </p>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-12 text-center">
          <div className="max-w-2xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Ready to Start Advertising?
            </h2>
            <p className="text-gray-600 mb-8 text-lg">
              Join hundreds of brands already using Promorang to create authentic, high-performing campaigns
            </p>
            
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-6">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}
            
            <button
              onClick={handleBecomeAdvertiser}
              disabled={isConverting}
              className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold px-8 py-4 rounded-xl text-lg transition-all duration-200 transform hover:scale-105 shadow-lg flex items-center space-x-2 mx-auto"
            >
              {isConverting ? (
                <>
                  <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full"></div>
                  <span>Setting up your account...</span>
                </>
              ) : (
                <>
                  <span>Become an Advertiser</span>
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
            
            <p className="text-sm text-gray-500 mt-4">
              Free to get started • No setup fees • Pay only for completed work
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
