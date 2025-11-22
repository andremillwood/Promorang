import { useState } from 'react';
import { Calendar, Upload, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { DropApplicationType } from '@/shared/types';
import DropSubmissionModal from './DropSubmissionModal';

interface ApplicationCardProps {
  application: DropApplicationType;
  onSubmissionSuccess: () => void;
}

export default function ApplicationCard({ application, onSubmissionSuccess }: ApplicationCardProps) {
  const [showSubmissionModal, setShowSubmissionModal] = useState(false);

  // Check if this is demo content
  const isDemo = (application as any).drop_title?.toLowerCase().includes('[demo]') || 
                 (application as any).drop_title?.toLowerCase().includes('demo') ||
                 application.application_message?.toLowerCase().includes('demo');

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'approved':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
        return 'bg-purple-100 text-purple-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'submitted':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4" />;
      case 'pending':
      case 'submitted':
        return <Clock className="w-4 h-4" />;
      case 'rejected':
        return <AlertCircle className="w-4 h-4" />;
      default:
        return null;
    }
  };

  const canSubmit = application.status === 'approved';
  const needsSubmission = application.status === 'approved';

  return (
    <>
      <div className={`rounded-2xl p-6 border ${
        isDemo ? 'bg-orange-50 border-orange-200' : 'bg-gray-50 border-gray-100'
      }`}>
        {/* Demo Banner */}
        {isDemo && (
          <div className="bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-lg px-3 py-2 mb-4 text-center">
            <div className="flex items-center justify-center space-x-2 text-sm font-medium">
              <span>🧪</span>
              <span>DEMO APPLICATION - No real gems earned</span>
              <span>🧪</span>
            </div>
          </div>
        )}

        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-2">
              <h4 className="font-semibold text-gray-900">{(application as any).drop_title}</h4>
              {(application as any).advertiser_brand_name && (
                <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full font-medium">
                  {(application as any).advertiser_brand_name}
                </span>
              )}
            </div>
            <p className="text-gray-600 mb-3">{application.application_message}</p>
            <div className="flex flex-wrap items-center gap-3">
              <span className={`px-3 py-1 rounded-full text-xs font-medium flex items-center space-x-1 ${getStatusColor(application.status)}`}>
                {getStatusIcon(application.status)}
                <span>{application.status.charAt(0).toUpperCase() + application.status.slice(1)}</span>
              </span>
              {isDemo && (
                <span className="bg-orange-100 text-orange-700 px-2 py-1 rounded-full text-xs font-medium">
                  DEMO
                </span>
              )}
              {application.review_score && (
                <span className="text-sm text-gray-600">
                  Score: {application.review_score}/10
                </span>
              )}
              {needsSubmission && (
                <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded-full animate-pulse">
                  Submission Required
                </span>
              )}
            </div>
          </div>
          <div className="text-right ml-6">
            <div className="text-sm text-gray-500 mb-1">
              {isDemo ? 'Demo Earned' : 'Earned'}
            </div>
            <div className={`font-semibold ${isDemo ? 'text-orange-600' : 'text-purple-600'}`}>
              {application.gems_earned} gems {isDemo && '(Demo)'}
            </div>
            <div className="text-sm text-gray-500 mt-1">
              Cost: {(application as any).key_cost} keys
            </div>
          </div>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 text-gray-500">
            <Calendar className="w-4 h-4" />
            <span className="text-sm">Applied {new Date(application.applied_at).toLocaleDateString()}</span>
          </div>
          
          <div className="flex items-center space-x-3">
            {application.completed_at && (
              <div className="text-green-600 font-medium text-sm">
                Completed {new Date(application.completed_at).toLocaleDateString()}
              </div>
            )}
            
            {canSubmit && (
              <button
                onClick={() => setShowSubmissionModal(true)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center space-x-2 text-white ${
                  isDemo
                    ? 'bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600'
                    : 'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600'
                }`}
              >
                <Upload className="w-4 h-4" />
                <span>{isDemo ? 'Demo Submit' : 'Submit Work'}</span>
              </button>
            )}
          </div>
        </div>
      </div>

      <DropSubmissionModal
        user={null} // Will be passed from parent if needed
        applicationId={application.id}
        dropTitle={(application as any).drop_title}
        isOpen={showSubmissionModal}
        onClose={() => setShowSubmissionModal(false)}
        onSuccess={() => {
          onSubmissionSuccess();
          setShowSubmissionModal(false);
        }}
      />
    </>
  );
}
