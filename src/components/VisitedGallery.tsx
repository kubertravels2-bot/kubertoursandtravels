import React, { useState } from 'react';
import { GalleryItem, SiteSettings } from '../types';
import { MapPin, Star } from 'lucide-react';

interface VisitedGalleryProps {
  gallery: GalleryItem[];
  settings: SiteSettings;
}

export const VisitedGallery: React.FC<VisitedGalleryProps> = ({ gallery, settings }) => {
  const [activeCategory, setActiveCategory] = useState<string>('All');

  const categories = ['All', 'Heritage', 'Hill Station', 'Beach', 'Spiritual'];

  const filtered = activeCategory === 'All'
    ? gallery
    : gallery.filter(item => item.category.toLowerCase() === activeCategory.toLowerCase());

  return (
    <>
      {/* LIVE ACHIEVEMENTS & COMPLETED TRIPS COUNTER */}
      <div className="stats-banner">
        <div className="stat-item">
          <span className="stat-num">{settings.total_trips.toLocaleString('en-IN')}+</span>
          <span className="stat-text">Completed Trips Across India</span>
        </div>
        <div className="stat-item">
          <span className="stat-num">{settings.destinations_covered}+</span>
          <span className="stat-text">Cities & Tourist Destinations</span>
        </div>
        <div className="stat-item">
          <span className="stat-num">{settings.happy_travelers}</span>
          <span className="stat-text">Delighted Travelers</span>
        </div>
        <div className="stat-item">
          <span className="stat-num">★ {settings.rating} / 5</span>
          <span className="stat-text">Average Chauffeur & Tour Rating</span>
        </div>
      </div>

      {/* VISITED TOURS PHOTO GALLERY */}
      <section className="section" id="past-tours">
        <div className="section-head">
          <div>
            <div className="section-label">Real Traveler Experiences</div>
            <h2 className="section-title">Moments From Our Past Tours Across India</h2>
            <p className="section-subtitle">
              Authentic photos and reviews captured by families, corporate travelers, and tourists who traveled with us.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                style={{
                  background: activeCategory === cat ? '#d84e55' : '#fff',
                  color: activeCategory === cat ? '#fff' : '#475569',
                  border: '1px solid',
                  borderColor: activeCategory === cat ? '#d84e55' : '#cbd5e1',
                  padding: '5px 14px',
                  borderRadius: '20px',
                  fontSize: '0.82rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        <div className="gallery-grid">
          {filtered.map(item => (
            <div key={item.id} className="gallery-card">
              <div className="gallery-img-box">
                <img 
                  src={item.image_url} 
                  alt={item.title} 
                  loading="lazy"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1599661046289-e31897846e41?auto=format&fit=crop&w=800&q=80';
                  }}
                />
                <span className="gallery-location-tag">
                  <MapPin size={11} />
                  <span>{item.location}</span>
                </span>
              </div>

              <div className="gallery-body">
                <div className="gallery-stars">
                  {[...Array(item.rating || 5)].map((_, i) => (
                    <Star key={i} size={14} fill="#f59e0b" />
                  ))}
                </div>

                <h3 className="gallery-title">{item.title}</h3>
                <p className="gallery-quote">"{item.caption}"</p>
                <div className="gallery-author">— {item.traveler_name}</div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </>
  );
};
