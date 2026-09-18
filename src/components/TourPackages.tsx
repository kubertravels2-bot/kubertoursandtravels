import React from 'react';
import { TourPlan } from '../types';
import { Clock, Check } from 'lucide-react';

interface TourPackagesProps {
  plans: TourPlan[];
  onSelectPlan: (plan: TourPlan) => void;
}

export const TourPackages: React.FC<TourPackagesProps> = ({ plans, onSelectPlan }) => {
  return (
    <section className="section" id="tour-packages">
      <div className="section-head">
        <div>
          <div className="section-label">All-Inclusive Tour Packages</div>
          <h2 className="section-title">Popular Private Tour Packages Across India</h2>
          <p className="section-subtitle">
            Curated itineraries with dedicated private chauffeur, fuel, tolls, and intercity transfers included.
          </p>
        </div>
      </div>

      <div className="packages-grid">
        {plans.map(plan => (
          <div key={plan.id} className="pkg-card">
            <div className="pkg-img-wrap">
              <img 
                src={plan.image_url} 
                alt={plan.title} 
                loading="lazy"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1564507592333-c60657eea523?auto=format&fit=crop&w=1000&q=80';
                }}
              />
              <div className="pkg-duration-badge">
                <Clock size={13} />
                <span>{plan.duration}</span>
              </div>
            </div>

            <div className="pkg-body">
              <div className="pkg-destinations">{plan.destinations}</div>
              <h3 className="pkg-title">{plan.title}</h3>
              
              <p style={{ fontSize: '0.84rem', color: '#64748b', marginBottom: '0.75rem', lineHeight: 1.45 }}>
                {plan.description}
              </p>

              <ul className="pkg-highlights">
                {plan.highlights.slice(0, 4).map((h, idx) => (
                  <li key={idx}>
                    <Check size={14} />
                    <span>{h}</span>
                  </li>
                ))}
              </ul>

              <div className="pkg-footer">
                <div className="pkg-price-box">
                  <span className="pkg-price-label">Starting From</span>
                  <span className="pkg-price-val">₹{plan.price.toLocaleString('en-IN')}</span>
                </div>

                <button 
                  className="btn-book-pkg"
                  onClick={() => onSelectPlan(plan)}
                >
                  <span>Book Package</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
