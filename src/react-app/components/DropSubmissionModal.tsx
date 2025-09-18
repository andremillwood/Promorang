import { useState } from 'react';
import { X, Upload, Link, FileText, Send, AlertCircle } from 'lucide-react';
import { UserType } from '@/shared/types';

interface DropSubmissionModalProps {
  user: UserType | null;
  applicationId: number;
  dropTitle: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function DropSubmissionModal({ 
  user, 
  applicationId, 
  dropTitle, 
  isOpen, 
  onClose, 
  onSuccess 
}: DropSubmissionModalProps) {
  const [submissionType, setSubmissionType] = useState<'url' | 'text'>('url');
  const [submissionData, setSubmissionData] = useState('');
  const [submissionNotes, setSubmissionNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen || !user) return null;

  const handleSubmit = async () => {
    if (!submissionData.trim()) {
      setError('Please provide your submission data');
      return;
    }

    if (submissionType === 'url' && !isValidUrl(submissionData)) {
      setError('Please provide a valid URL');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/drop-applications/${applicationId}/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          submission_type: submissionType,
          submission_data: submissionData,
          submission_notes: submissionNotes
        })
      });

      if (response.ok) {
        onSuccess();
        onClose();
        resetForm();
        showSuccessNotification();
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Submission failed');
      }
    } catch (error) {
      console.error('Submission failed:', error);
      setError('Network error occurred');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setSubmissionData('');
    setSubmissionNotes('');
    setSubmissionType('url');
    setError(null);
  };

  const isValidUrl = (string: string) => {
    try {
      new URL(string);
      return true;
    } catch (_) {
      return false;
    }
  };

  const showSuccessNotification = () => {
    const notification = document.createElement('div');
    notification.className = 'fixed top-4 right-4 bg-green-500 text-white px-6 py-4 rounded-xl shadow-lg z-50 animate-pulse';
    notification.innerHTML = `
      <div class="flex items-center space-x-3">
        <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
        </svg>
        <div>
          <div class="font-bold">Submission Sent!</div>
          <div class="text-sm">Your work has been submitted for review</div>
        </div>
      </div>
    `;
    document.body.appendChild(notification);
    setTimeout(() => {
      if (document.body.contains(notification)) {
        document.body.removeChild(notification);
      }
    }, 4000);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-2xl">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <Upload className="w-6 h-6 text-purple-600" />
            <div>
              <h2 className="text-xl font-bold text-gray-900">Submit Your Work</h2>
              <p className="text-sm text-gray-600">{dropTitle}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Submission Type Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Submission Type
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setSubmissionType('url')}
                className={`p-4 rounded-xl border-2 transition-colors ${
                  submissionType === 'url'
                    ? 'border-purple-500 bg-purple-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <Link className="w-6 h-6 mx-auto mb-2 text-purple-600" />
                <div className="text-sm font-medium">URL Link</div>
                <div className="text-xs text-gray-500">Submit a link to your work</div>
              </button>
              <button
                onClick={() => setSubmissionType('text')}
                className={`p-4 rounded-xl border-2 transition-colors ${
                  submissionType === 'text'
                    ? 'border-purple-500 bg-purple-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <FileText className="w-6 h-6 mx-auto mb-2 text-purple-600" />
                <div className="text-sm font-medium">Text Content</div>
                <div className="text-xs text-gray-500">Submit text directly</div>
              </button>
            </div>
          </div>

          {/* Submission Data */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {submissionType === 'url' ? 'URL Link *' : 'Text Content *'}
            </label>
            {submissionType === 'url' ? (
              <input
                type="url"
                value={submissionData}
                onChange={(e) => setSubmissionData(e.target.value)}
                placeholder="https://example.com/your-work"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            ) : (
              <textarea
                value={submissionData}
                onChange={(e) => setSubmissionData(e.target.value)}
                placeholder="Enter your text content here..."
                rows={6}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            )}
          </div>

          {/* Submission Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Additional Notes (Optional)
            </label>
            <textarea
              value={submissionNotes}
              onChange={(e) => setSubmissionNotes(e.target.value)}
              placeholder="Any additional context or notes about your submission..."
              rows={3}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>

          {/* Guidelines */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
            <h4 className="font-medium text-blue-900 mb-2">Submission Guidelines</h4>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• Ensure your submission meets all drop requirements</li>
              <li>• Double-check URLs are accessible and working</li>
              <li>• Include any relevant context in the additional notes</li>
              <li>• Your submission will be reviewed within 24-48 hours</li>
            </ul>
          </div>

          {/* Error Display */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start space-x-3">
              <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex space-x-3 pt-4">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-3 border border-gray-300 rounded-xl text-gray-700 font-medium hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={!submissionData.trim() || loading}
              className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 disabled:opacity-50 disabled:cursor-not-allowed text-white px-4 py-3 rounded-xl font-medium transition-all duration-200 flex items-center justify-center space-x-2"
            >
              {loading ? (
                <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full"></div>
              ) : (
                <>
                  <Send className="w-5 h-5" />
                  <span>Submit Work</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
