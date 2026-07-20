'use client';

import { useState } from 'react';

export default function MediaGallery({ images = [], videos = [], name = '' }) {
  const allMedia = [
    ...images.map(img => ({ type: 'image', url: img })),
    ...videos.map(vid => ({ type: 'video', url: vid }))
  ];

  const [activeMedia, setActiveMedia] = useState(allMedia[0] || { type: 'image', url: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=800&auto=format&fit=crop' });
  const [zoomStyle, setZoomStyle] = useState({
    transformOrigin: 'center center',
    transform: 'scale(1)'
  });

  const handleMouseMove = (e) => {
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    // Calculate cursor percentage relative to image
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;
    
    setZoomStyle({
      transformOrigin: `${x}% ${y}%`,
      transform: 'scale(2)'
    });
  };

  const handleMouseLeave = () => {
    setZoomStyle({
      transformOrigin: 'center center',
      transform: 'scale(1)'
    });
  };

  return (
    <div className="media-gallery">
      {/* Main Preview */}
      <div className="main-preview-container">
        {activeMedia.type === 'image' ? (
          <div
            className="main-image-zoom-box"
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
          >
            <img
              src={activeMedia.url}
              alt={name}
              style={zoomStyle}
              className="main-preview-image"
            />
          </div>
        ) : (
          <div className="main-video-box">
            <video
              src={activeMedia.url}
              controls
              autoPlay
              muted
              className="main-preview-video"
            />
          </div>
        )}
      </div>

      {/* Thumbnails Row */}
      {allMedia.length > 1 && (
        <div className="thumbnails-grid">
          {allMedia.map((media, idx) => {
            const isActive = media.url === activeMedia.url;
            return (
              <button
                key={idx}
                onClick={() => setActiveMedia(media)}
                className={`thumbnail-btn ${isActive ? 'active' : ''}`}
                type="button"
              >
                {media.type === 'image' ? (
                  <img src={media.url} alt={`${name} thumb ${idx}`} className="thumbnail-img" />
                ) : (
                  <div className="thumbnail-video-placeholder">
                    {/* Video Icon symbol */}
                    <span className="play-icon">▶</span>
                    <span className="play-text">Video</span>
                  </div>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
