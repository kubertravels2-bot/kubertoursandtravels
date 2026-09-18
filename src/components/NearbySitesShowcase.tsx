import React from 'react';
import { VisitingSite, TravelReason } from '../types';
import { MapPin, Sparkles, Compass } from 'lucide-react';

interface NearbySitesShowcaseProps {
  destination: string;
  travelReason: TravelReason;
  sites: VisitingSite[];
  onSelectCity: (city: string) => void;
}

export const NearbySitesShowcase: React.FC<NearbySitesShowcaseProps> = ({
  destination,
  travelReason,
  sites,
  onSelectCity
}) => {
  // Normalize destination text
  const cleanDest = destination.trim().toLowerCase();
  const isShowAll = cleanDest === 'all' || cleanDest === 'all cities';

  // Filter sites matching destination city or show all
  let matchedSites = isShowAll
    ? sites
    : sites.filter(s => 
        s.city.toLowerCase().includes(cleanDest) || cleanDest.includes(s.city.toLowerCase())
      );

  // If no direct city match, display all sites or top recommendations
  const isCustomOrUnmatched = !isShowAll && matchedSites.length === 0;
  if (isCustomOrUnmatched) {
    matchedSites = sites.slice(0, 6);
  }

  // Sort: places recommended for this travel reason come first!
  const sortedSites = [...matchedSites].sort((a, b) => {
    const aMatch = a.recommended_reasons.includes(travelReason) ? 1 : 0;
    const bMatch = b.recommended_reasons.includes(travelReason) ? 1 : 0;
    return bMatch - aMatch;
  });

  // Extract all unique cities dynamically from database
  const existingCities = Array.from(new Set(sites.map(s => s.city.trim()))).filter(Boolean);
  const dynamicCities = Array.from(new Set(['Pune', ...existingCities, 'Jaipur', 'Agra', 'Goa', 'Manali']));

  return (
    <section className="section" id="nearby-sites">
      <div className="section-head">
        <div>
          <div className="section-label">Tailored Sightseeing Suggestions</div>
          <h2 className="section-title">
            {isShowAll 
              ? 'Must-Visit Tourist Attractions Across India' 
              : `Must-Visit Places Near ${isCustomOrUnmatched ? `"${destination}" & Beyond` : destination}`}
          </h2>
          <p className="section-subtitle">
            Curated attractions and scenic locations tailored for your{' '}
            <strong style={{ color: '#d84e55' }}>{travelReason}</strong> journey.
          </p>
        </div>

        <div className="sights-banner-city">
          <MapPin size={15} />
          <span>Active Location: {destination}</span>
        </div>
      </div>

      <div className="sights-grid">
        {sortedSites.map(site => {
          const isReasonMatch = site.recommended_reasons.includes(travelReason);

          return (
            <div key={site.id} className="sight-card">
              <div className="sight-img-box">
                <img 
                  src={site.image_url} 
                  alt={site.place_name} 
                  loading="lazy"
                  onError={(e) => {
                    // Fallback image if unsplash URL encounters network failure
                    (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1599661046289-e31897846e41?auto=format&fit=crop&w=800&q=80';
                  }}
                />
                <span className="sight-category-badge">{site.category}</span>
                {isReasonMatch && (
                  <span style={{
                    position: 'absolute',
                    top: '0.75rem',
                    right: '0.75rem',
                    background: 'rgba(216, 78, 85, 0.92)',
                    backdropFilter: 'blur(6px)',
                    color: '#fff',
                    fontSize: '0.7rem',
                    fontWeight: 700,
                    padding: '0.2rem 0.6rem',
                    borderRadius: '20px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '3px'
                  }}>
                    <Sparkles size={11} />
                    <span>Best for {travelReason}</span>
                  </span>
                )}
              </div>

              <div className="sight-body">
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#64748b', fontSize: '0.78rem', marginBottom: '4px' }}>
                  <MapPin size={12} />
                  <span>{site.city}, India</span>
                </div>

                <h3 className="sight-name">{site.place_name}</h3>
                <p className="sight-desc">{site.description}</p>

                <div className="sight-tags">
                  {site.recommended_reasons.map(r => (
                    <span 
                      key={r} 
                      className="sight-tag-item"
                      style={r === travelReason ? { background: '#fff1f2', color: '#d84e55', fontWeight: 700 } : {}}
                    >
                      {r}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Explore other Indian destinations quick-switch */}
      <div style={{
        marginTop: '2rem',
        padding: '1.25rem',
        background: '#fff',
        borderRadius: '12px',
        border: '1px solid #e2e8f0',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Compass size={18} color="#d84e55" />
          <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>Explore Sightseeing:</span>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          <button
            onClick={() => onSelectCity('All')}
            style={{
              background: cleanDest === 'all' ? '#d84e55' : '#f8fafc',
              color: cleanDest === 'all' ? '#fff' : '#475569',
              border: cleanDest === 'all' ? '1px solid #d84e55' : '1px solid #cbd5e1',
              padding: '4px 12px',
              borderRadius: '16px',
              fontSize: '0.82rem',
              fontWeight: 700,
              cursor: 'pointer',
              transition: 'all 0.15s ease'
            }}
          >
            All Places ({sites.length})
          </button>
          {dynamicCities.map(city => (
            <button
              key={city}
              onClick={() => onSelectCity(city)}
              style={{
                background: destination.toLowerCase() === city.toLowerCase() ? '#1e293b' : '#f8fafc',
                color: destination.toLowerCase() === city.toLowerCase() ? '#fff' : '#475569',
                border: '1px solid #cbd5e1',
                padding: '4px 12px',
                borderRadius: '16px',
                fontSize: '0.82rem',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              {city}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
};
