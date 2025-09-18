import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router';
import { AlertTriangle, Home, RefreshCw, Copy, CheckCircle } from 'lucide-react';
import { decodeErrorInfo, type ErrorInfo } from '@/react-app/utils/errorEncoder';

export default function ErrorPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [errorInfo, setErrorInfo] = useState<ErrorInfo | null>(null);
  const [copied, setCopied] = useState(false);
  
  const errorCode = searchParams.get('code') || 'ERR-UNKNOWN';
  const encodedData = searchParams.get('data');

  useEffect(() => {
    if (encodedData) {
      const decoded = decodeErrorInfo(encodedData);
      setErrorInfo(decoded);
    }
  }, [encodedData]);

  const handleGoHome = () => {
    navigate('/home');
  };

  const handleRefresh = () => {
    window.location.reload();
  };

  const handleCopyErrorCode = async () => {
    try {
      await navigator.clipboard.writeText(errorCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy error code:', err);
    }
  };

  const formatTimestamp = (timestamp: number) => {
    return new Date(timestamp).toLocaleString();
  };

  const getErrorTitle = () => {
    if (errorInfo?.component === 'upload') {
      return 'Upload Failed';
    }
    if (errorInfo?.component === 'payment') {
      return 'Payment Error';
    }
    if (errorInfo?.component === 'auth') {
      return 'Authentication Error';
    }
    if (errorInfo?.action === 'create_content') {
      return 'Content Creation Failed';
    }
    return 'Something Went Wrong';
  };

  const getErrorDescription = () => {
    if (errorInfo?.component === 'upload') {
      return 'We couldn\'t process your file upload. This might be due to file size, format, or network issues.';
    }
    if (errorInfo?.component === 'payment') {
      return 'There was an issue processing your payment. Your card was not charged.';
    }
    if (errorInfo?.component === 'auth') {
      return 'We couldn\'t verify your identity. Please try signing in again.';
    }
    if (errorInfo?.action === 'create_content') {
      return 'We couldn\'t create your content. Your data has been preserved and you can try again.';
    }
    return 'We encountered an unexpected error. Our team has been automatically notified.';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center px-4">
      <div className="max-w-lg w-full bg-white rounded-2xl shadow-xl overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-red-500 to-red-600 px-8 py-6 text-white">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">{getErrorTitle()}</h1>
              <p className="text-red-100 text-sm">Error Code: {errorCode}</p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="px-8 py-6">
          <p className="text-gray-600 mb-6 leading-relaxed">
            {getErrorDescription()}
          </p>

          {/* Error Code Card */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-700">Error Reference</p>
                <p className="text-lg font-mono text-gray-900">{errorCode}</p>
              </div>
              <button
                onClick={handleCopyErrorCode}
                className="flex items-center space-x-1 px-3 py-2 bg-white rounded-lg hover:bg-gray-100 transition-colors"
              >
                {copied ? (
                  <CheckCircle className="w-4 h-4 text-green-600" />
                ) : (
                  <Copy className="w-4 h-4 text-gray-600" />
                )}
                <span className="text-sm text-gray-600">
                  {copied ? 'Copied!' : 'Copy'}
                </span>
              </button>
            </div>
          </div>

          {/* Additional Info */}
          {errorInfo && (
            <div className="bg-blue-50 rounded-lg p-4 mb-6">
              <p className="text-sm font-medium text-blue-800 mb-2">
                What happened?
              </p>
              <p className="text-sm text-blue-700 mb-2">
                Time: {formatTimestamp(errorInfo.timestamp)}
              </p>
              {errorInfo.action && (
                <p className="text-sm text-blue-700">
                  Action: {errorInfo.action.replace('_', ' ')}
                </p>
              )}
            </div>
          )}

          {/* Action Buttons */}
          <div className="space-y-3">
            <button
              onClick={handleRefresh}
              className="w-full bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2"
            >
              <RefreshCw className="w-5 h-5" />
              <span>Try Again</span>
            </button>
            
            <button
              onClick={handleGoHome}
              className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-3 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2"
            >
              <Home className="w-5 h-5" />
              <span>Back to Home</span>
            </button>
          </div>

          {/* Help Text */}
          <div className="mt-6 p-4 bg-yellow-50 rounded-lg">
            <p className="text-sm text-yellow-800">
              <strong>Need help?</strong> Share your error code <span className="font-mono">{errorCode}</span> with our support team for faster assistance.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
