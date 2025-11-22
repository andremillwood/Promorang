import { useState } from 'react';
import { X, Share2, Copy, Check, Facebook, Twitter, MessageCircle } from 'lucide-react';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  contentId: number;
  contentTitle: string;
  contentUrl?: string;
}

export default function ShareModal({ isOpen, onClose, contentId, contentTitle, contentUrl }: ShareModalProps) {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const shareUrl = contentUrl || `${window.location.origin}/content/${contentId}`;
  const shareText = `Check out this amazing content: "${contentTitle}" on Promorang!`;

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  const shareToFacebook = () => {
    const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`;
    window.open(url, '_blank', 'width=600,height=400');
  };

  const shareToTwitter = () => {
    const text = encodeURIComponent(`${shareText} ${shareUrl}`);
    const url = `https://twitter.com/intent/tweet?text=${text}`;
    window.open(url, '_blank', 'width=600,height=400');
  };

  const shareToWhatsApp = () => {
    const text = encodeURIComponent(`${shareText} ${shareUrl}`);
    const url = `https://wa.me/?text=${text}`;
    window.open(url, '_blank');
  };

  const shareViaEmail = () => {
    const subject = encodeURIComponent('Check out this content on Promorang');
    const body = encodeURIComponent(`${shareText}\n\n${shareUrl}`);
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
  };

  const shareNative = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: contentTitle,
          text: shareText,
          url: shareUrl,
        });
      } catch (error) {
        console.error('Error sharing:', error);
      }
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-md w-full p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-2">
            <Share2 className="w-6 h-6 text-blue-600" />
            <h2 className="text-xl font-bold text-gray-900">Share Content</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content Preview */}
        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <h3 className="font-medium text-gray-900 mb-2">{contentTitle}</h3>
          <p className="text-sm text-gray-600 break-all">{shareUrl}</p>
        </div>

        {/* Share Options */}
        <div className="space-y-4">
          {/* Copy Link */}
          <button
            onClick={copyToClipboard}
            className="w-full flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center space-x-3">
              {copied ? (
                <Check className="w-5 h-5 text-green-600" />
              ) : (
                <Copy className="w-5 h-5 text-gray-600" />
              )}
              <span className="font-medium text-gray-900">
                {copied ? 'Copied!' : 'Copy Link'}
              </span>
            </div>
          </button>

          {/* Social Media Buttons */}
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={shareToFacebook}
              className="flex items-center justify-center space-x-2 p-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Facebook className="w-4 h-4" />
              <span>Facebook</span>
            </button>

            <button
              onClick={shareToTwitter}
              className="flex items-center justify-center space-x-2 p-3 bg-sky-500 text-white rounded-lg hover:bg-sky-600 transition-colors"
            >
              <Twitter className="w-4 h-4" />
              <span>Twitter</span>
            </button>

            <button
              onClick={shareToWhatsApp}
              className="flex items-center justify-center space-x-2 p-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
            >
              <MessageCircle className="w-4 h-4" />
              <span>WhatsApp</span>
            </button>

            <button
              onClick={shareViaEmail}
              className="flex items-center justify-center space-x-2 p-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              <span className="text-sm">📧</span>
              <span>Email</span>
            </button>
          </div>

          {/* Native Share (if supported) */}
          {typeof window !== 'undefined' && 'share' in navigator && (
            <button
              onClick={shareNative}
              className="w-full flex items-center justify-center space-x-2 p-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600 transition-colors"
            >
              <Share2 className="w-4 h-4" />
              <span>Share via...</span>
            </button>
          )}
        </div>

        {/* Tips */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-3">
          <p className="text-xs text-blue-700">
            💡 <strong>Tip:</strong> Share this content to earn points and help creators grow their audience!
          </p>
        </div>
      </div>
    </div>
  );
}
