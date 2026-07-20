'use client';

export default function ShareRow({ shareText = '', productCode = '' }) {
  const handleCopyLink = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      alert('Product link copied to clipboard!');
    }
  };

  const getProductUrl = () => {
    if (typeof window !== 'undefined') {
      return window.location.href;
    }
    return `https://vasthrakadtha.com/product/${productCode.toLowerCase()}`;
  };

  return (
    <div className="share-row">
      <span>Share Product:</span>
      
      <a
        href={`https://api.whatsapp.com/send?text=${encodeURIComponent(shareText + ' - ' + getProductUrl())}`}
        target="_blank"
        rel="noopener noreferrer"
        className="share-btn"
      >
        WhatsApp
      </a>
      
      <a
        href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(getProductUrl())}`}
        target="_blank"
        rel="noopener noreferrer"
        className="share-btn"
      >
        Facebook
      </a>
      
      <button
        type="button"
        onClick={handleCopyLink}
        className="share-btn"
        style={{ borderStyle: 'dashed', cursor: 'pointer', background: 'transparent' }}
      >
        Copy Link
      </button>
    </div>
  );
}
