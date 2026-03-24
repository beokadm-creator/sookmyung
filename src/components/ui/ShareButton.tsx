import React, { useState } from 'react';
import { Facebook, Twitter, Copy, MessageCircle } from 'lucide-react';

export interface ShareButtonProps {
  url: string;
  title?: string;
}

/**
 * Social share button group
 * - Platforms: Facebook, Twitter, KakaoTalk (placeholder), Copy Link
 * - Copy uses clipboard; shows toast "링크 복사됨!"
 * - Tooltips provided via title attribute
 */
const ShareButton: React.FC<ShareButtonProps> = ({ url, title }) => {
  const [copied, setCopied] = useState(false);

  const shareFacebook = () => {
    const shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
    window.open(shareUrl, '_blank', 'noopener,noreferrer,width=600,height=600');
  };

  const shareTwitter = () => {
    const shareUrl = `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title ?? '')}`;
    window.open(shareUrl, '_blank', 'noopener,noreferrer,width=600,height=600');
  };

  const shareKakao = () => {
    // Placeholder: Kakao SDK not included in this task
  };

  const copyLink = async () => {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(url);
      } else {
        const ta = document.createElement('textarea');
        ta.value = url;
        ta.style.position = 'fixed';
        ta.style.opacity = '0';
        document.body.appendChild(ta);
        ta.focus();
        ta.select();
        document.execCommand('copy');
        document.body.removeChild(ta);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // ignore
    }
  };

  return (
    <div className="flex items-center space-x-2">
      <button
        type="button"
        className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700"
        onClick={shareFacebook}
        title="Facebook"
      >
        <Facebook className="h-5 w-5" />
      </button>

      <button
        type="button"
        className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700"
        onClick={shareTwitter}
        title="X( Twitter )"
      >
        <Twitter className="h-5 w-5" />
      </button>

      <button
        type="button"
        className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700"
        onClick={shareKakao}
        title="KakaoTalk"
      >
        <MessageCircle className="h-5 w-5" />
      </button>

      <button
        type="button"
        className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700"
        onClick={copyLink}
        title="Copy Link"
      >
        <Copy className="h-5 w-5" />
      </button>

      {copied && (
        <output
          className="fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-black text-white text-sm px-4 py-2 rounded-md shadow-lg"
          aria-live="polite"
        >
          링크 복사됨!
        </output>
      )}
    </div>
  );
};

export default ShareButton;
