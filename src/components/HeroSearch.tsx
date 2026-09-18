import React, { useState, useEffect } from 'react';
import { 
  MapPin, 
  Navigation, 
  Calendar, 
  Clock, 
  Users, 
  Car, 
  User, 
  Phone, 
  Mail, 
  ShieldCheck, 
  Send,
  Briefcase,
  Heart,
  Palmtree,
  Building,
  Sparkles,
  AlertTriangle,
  X
} from 'lucide-react';
import { TravelReason, CarCategory, Inquiry, SiteSettings } from '../types';
import { securityService } from '../services/security';

interface HeroSearchProps {
  selectedDestination: string;
  onDestinationChange: (dest: string) => void;
  selectedReason: TravelReason;
  onReasonChange: (reason: TravelReason) => void;
  onSubmitInquiry: (inquiryData: Omit<Inquiry, 'id' | 'created_at' | 'status'>) => Promise<void>;
  settings?: SiteSettings;
}

const POPULAR_DESTINATIONS = [
  'Pune', 'Jaipur', 'Agra', 'Manali', 'Goa', 'Varanasi', 'Udaipur', 
  'Rishikesh', 'Mahabaleshwar', 'Lonavala', 'Shirdi', 'Mumbai'
];

const POPULAR_PICKUPS = [
  'Pune', 'Mumbai', 'Delhi NCR', 'Jaipur', 'Bengaluru', 'Chandigarh', 
  'Ahmedabad', 'Lucknow', 'Kolkata', 'Hyderabad', 'Chennai'
];

const REASONS: { id: TravelReason; label: string; icon: React.ReactNode }[] = [
  { id: 'Family Vacation', label: 'Family Vacation', icon: <Heart size={16} /> },
  { id: 'Holiday Trip', label: 'Holiday & Friends Trip', icon: <Palmtree size={16} /> },
  { id: 'Business', label: 'Business Travel', icon: <Briefcase size={16} /> },
  { id: 'Site Visit', label: 'Site / Official Visit', icon: <Building size={16} /> },
  { id: 'Pilgrimage', label: 'Pilgrimage / Spiritual', icon: <Sparkles size={16} /> },
  { id: 'Wedding', label: 'Wedding / Event', icon: <Users size={16} /> }
];

const CAR_OPTIONS: { id: CarCategory; name: string; capacity: string }[] = [
  { id: 'Sedan (Dzire / Etios)', name: 'Sedan (Dzire/Etios)', capacity: '4 Seats • 2 Bags' },
  { id: 'SUV (Ertiga / Carens)', name: 'SUV (Ertiga/Carens)', capacity: '6 Seats • 3 Bags' },
  { id: 'Innova Crysta (Premium SUV)', name: 'Innova Crysta', capacity: '7 Seats • 4 Bags • VIP' },
  { id: 'Hatchback (WagonR / Swift)', name: 'Hatchback (WagonR)', capacity: '4 Seats • Budget' },
  { id: 'Tempo Traveller (12-20 Seater)', name: 'Tempo Traveller', capacity: '12-20 Seats • Group Tour' },
  { id: 'Luxury (BMW / Audi / Mercedes)', name: 'Luxury (BMW/Audi)', capacity: '4 Seats • Premium' }
];

export const HeroSearch: React.FC<HeroSearchProps> = ({
  selectedDestination,
  onDestinationChange,
  selectedReason,
  onReasonChange,
  onSubmitInquiry,
  settings
}) => {
  const destinationOptions = (settings?.popular_destinations && settings.popular_destinations.length > 0)
    ? settings.popular_destinations 
    : POPULAR_DESTINATIONS;

  const [pickup, setPickup] = useState('Pune');
  const [drop, setDrop] = useState(() => {
    return selectedDestination && selectedDestination.toLowerCase() !== 'akira' && selectedDestination.toLowerCase() !== 'all' 
      ? selectedDestination 
      : 'Goa';
  });

  // Keep drop location synchronized with destination clicks
  useEffect(() => {
    if (selectedDestination && selectedDestination.toLowerCase() !== 'all' && selectedDestination.toLowerCase() !== 'akira') {
      setDrop(selectedDestination);
    }
  }, [selectedDestination]);

  const [date, setDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 2);
    return d.toISOString().split('T')[0];
  });
  const [time, setTime] = useState('07:00 AM');
  const [passengers, setPassengers] = useState(4);
  const [carType, setCarType] = useState<CarCategory>('Innova Crysta (Premium SUV)');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [phoneAlertPopup, setPhoneAlertPopup] = useState(false);
  const [phoneAlertMsg, setPhoneAlertMsg] = useState('Please enter a valid 10-digit Indian mobile number (e.g. 9876543210)');

  const handleDestinationSelect = (city: string) => {
    setDrop(city);
    onDestinationChange(city);
  };

  const handleReasonClick = (reason: TravelReason) => {
    onReasonChange(reason);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Prevent browser autofill inserting system username 'Akira' or invalid values into drop
    let sanitizedDrop = drop.trim();
    if (!sanitizedDrop || sanitizedDrop.toLowerCase() === 'akira') {
      sanitizedDrop = selectedDestination && selectedDestination.toLowerCase() !== 'akira' && selectedDestination.toLowerCase() !== 'all'
        ? selectedDestination 
        : 'Goa';
      setDrop(sanitizedDrop);
    }

    let sanitizedPickup = pickup.trim();
    if (!sanitizedPickup || sanitizedPickup.toLowerCase() === 'akira') {
      sanitizedPickup = 'Pune';
      setPickup('Pune');
    }

    // Validation
    if (!name.trim()) {
      setError('Please enter your full name.');
      return;
    }

    if (!phone.trim()) {
      setError('Please enter your 10-digit Indian mobile number.');
      setPhoneAlertMsg('Please enter a valid 10-digit Indian mobile number (e.g. 9876543210)');
      setPhoneAlertPopup(true);
      return;
    }

    if (!securityService.isValidIndianPhone(phone)) {
      setError('Please enter a valid 10-digit Indian mobile number (e.g. 9876543210).');
      setPhoneAlertMsg('Please enter a valid 10-digit Indian mobile number (e.g. 9876543210)');
      setPhoneAlertPopup(true);
      return;
    }

    if (email && !securityService.isValidEmail(email)) {
      setError('Please enter a valid email address.');
      return;
    }

    if (!sanitizedPickup || !sanitizedDrop) {
      setError('Please provide both pick-up and destination locations.');
      return;
    }

    setLoading(true);
    try {
      await onSubmitInquiry({
        customer_name: name.trim(),
        customer_phone: phone.trim(),
        customer_email: email.trim(),
        pickup_location: sanitizedPickup,
        drop_location: sanitizedDrop,
        travel_date: date,
        travel_time: time,
        travel_reason: selectedReason,
        passengers_count: passengers,
        car_type: carType,
        notes: notes.trim()
      });
    } catch (err: any) {
      setError(err.message || 'Error submitting inquiry. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <section className="hero-section">
        <div className="hero-bg-overlay" />
        <div className="hero-pattern" />
        <div className="hero-container">
          <div className="hero-tag">
            <span className="hero-tag-dot" />
            <span>India's Most Trusted Tour & Cab Network</span>
          </div>

          <h1 className="hero-title">
            Explore India with <span>Private Cabs & Custom Tours</span>
          </h1>

          <p className="hero-subtitle">
            Reliable chauffeur-driven outstation cabs, scenic sightseeing trips, and family tour packages.
            Choose your destination below to explore nearby famous attractions!
          </p>
        </div>
      </section>

      {/* SEARCH WIDGET CARD */}
      <div className="search-widget-wrap" id="plan-trip">
        <div className="search-card">
          <div className="search-header">
            <div className="search-header-title">
              <Navigation size={22} />
              <span>Plan Your Trip / Book Tour Cab</span>
            </div>
            <div className="search-guarantee-badge">
              <ShieldCheck size={16} />
              <span>Direct Owner Quote • Zero Hidden Charges</span>
            </div>
          </div>

          {error && (
            <div style={{
              background: '#fee2e2',
              color: '#991b1b',
              padding: '0.75rem 1rem',
              borderRadius: '8px',
              fontSize: '0.9rem',
              marginBottom: '1rem',
              fontWeight: 600
            }}>
              ⚠️ {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {/* Step 1: Locations, Dates, Passengers */}
            <div className="search-grid">
              <div className="input-field-group">
                <label><MapPin size={15} /> Pick-up Location (From)</label>
                <div className="input-with-icon">
                  <MapPin size={18} />
                  <input 
                    type="text" 
                    name="kuber_pickup_source"
                    id="kuber-pickup-input"
                    value={pickup} 
                    onChange={e => setPickup(e.target.value)}
                    placeholder="e.g. Pune, Mumbai, Delhi..." 
                    required
                    autoComplete="off"
                    data-lpignore="true"
                    list="pickups-list"
                  />
                  <datalist id="pickups-list">
                    {POPULAR_PICKUPS.map(p => <option key={p} value={p} />)}
                  </datalist>
                </div>
              </div>

              <div className="input-field-group">
                <label><Navigation size={15} /> Destination Location (Where to Go)</label>
                <div className="input-with-icon">
                  <Navigation size={18} />
                  <input 
                    type="text" 
                    name="kuber_drop_destination"
                    id="kuber-drop-input"
                    value={drop} 
                    onChange={e => {
                      setDrop(e.target.value);
                      onDestinationChange(e.target.value);
                    }}
                    placeholder="e.g. Goa, Mahabaleshwar, Jaipur..." 
                    required
                    autoComplete="off"
                    data-lpignore="true"
                    list="destinations-list"
                  />
                  <datalist id="destinations-list">
                    {destinationOptions.map(d => <option key={d} value={d} />)}
                  </datalist>
                </div>
              </div>

              <div className="input-field-group">
                <label><Calendar size={15} /> Travel Date</label>
                <div className="input-with-icon">
                  <Calendar size={18} />
                  <input 
                    type="date" 
                    value={date} 
                    onChange={e => setDate(e.target.value)}
                    required 
                  />
                </div>
              </div>

              <div className="input-field-group">
                <label><Clock size={15} /> Pick-up Time</label>
                <div className="input-with-icon">
                  <Clock size={18} />
                  <select value={time} onChange={e => setTime(e.target.value)}>
                    <option value="05:00 AM">05:00 AM (Early Sunrise)</option>
                    <option value="06:00 AM">06:00 AM</option>
                    <option value="07:00 AM">07:00 AM</option>
                    <option value="08:00 AM">08:00 AM</option>
                    <option value="09:00 AM">09:00 AM</option>
                    <option value="10:00 AM">10:00 AM</option>
                    <option value="12:00 PM">12:00 PM (Afternoon)</option>
                    <option value="03:00 PM">03:00 PM</option>
                    <option value="06:00 PM">06:00 PM (Evening)</option>
                    <option value="09:00 PM">09:00 PM (Night Journey)</option>
                  </select>
                </div>
              </div>

              <div className="input-field-group">
                <label><Users size={15} /> Number of People</label>
                <div className="input-with-icon">
                  <Users size={18} />
                  <select value={passengers} onChange={e => setPassengers(Number(e.target.value))}>
                    <option value={1}>1 Person (Solo traveler)</option>
                    <option value={2}>2 People (Couple)</option>
                    <option value={3}>3 People</option>
                    <option value={4}>4 People (Small Family)</option>
                    <option value={5}>5 People</option>
                    <option value={6}>6 People</option>
                    <option value={7}>7 People (Innova)</option>
                    <option value={10}>8-10 People (Large Group)</option>
                    <option value={14}>12-16 People (Tempo Traveller)</option>
                    <option value={20}>20+ People (Bus / Mini-coach)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Quick Destination Pill Suggestions (Changeable by Admin) */}
            <div style={{ marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 600 }}>Popular Destinations:</span>
              {destinationOptions.map(city => (
                <button
                  type="button"
                  key={city}
                  onClick={() => handleDestinationSelect(city)}
                  style={{
                    background: drop.toLowerCase() === city.toLowerCase() ? '#d84e55' : '#f1f5f9',
                    color: drop.toLowerCase() === city.toLowerCase() ? '#fff' : '#334155',
                    border: 'none',
                    padding: '3px 10px',
                    borderRadius: '20px',
                    fontSize: '0.78rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                >
                  {city}
                </button>
              ))}
            </div>

            {/* Step 2: Reason for Traveling */}
            <div className="reason-section">
              <div className="reason-section-label">
                <Briefcase size={16} />
                <span>Purpose / Reason for Traveling (Shows tailored sightseeing spots below):</span>
              </div>
              <div className="reason-pills">
                {REASONS.map(r => (
                  <button
                    type="button"
                    key={r.id}
                    className={`reason-pill ${selectedReason === r.id ? 'active' : ''}`}
                    onClick={() => handleReasonClick(r.id)}
                  >
                    {r.icon}
                    <span>{r.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Step 3: Preferred Car Type */}
            <div className="car-type-section">
              <div className="reason-section-label">
                <Car size={16} />
                <span>Choose Preferred Vehicle:</span>
              </div>
              <div className="car-type-grid">
                {CAR_OPTIONS.map(c => (
                  <div 
                    key={c.id} 
                    className={`car-card-option ${carType === c.id ? 'active' : ''}`}
                    onClick={() => setCarType(c.id)}
                  >
                    <div className="car-option-name">{c.name}</div>
                    <div className="car-option-capacity">
                      <Users size={12} />
                      <span>{c.capacity}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Step 4: Contact Details (Owner contacts customer for details) */}
            <div className="contact-row">
              <div className="input-field-group">
                <label><User size={15} /> Your Full Name *</label>
                <div className="input-with-icon">
                  <User size={18} />
                  <input 
                    type="text" 
                    value={name} 
                    onChange={e => setName(e.target.value)}
                    placeholder="e.g. Ramesh Kumar"
                    required 
                  />
                </div>
              </div>

              <div className="input-field-group">
                <label><Phone size={15} /> 10-Digit Mobile Number *</label>
                <div className="input-with-icon">
                  <Phone size={18} />
                  <input 
                    type="tel" 
                    id="kuber-phone-input"
                    value={phone} 
                    onChange={e => setPhone(e.target.value)}
                    placeholder="e.g. 9876543210"
                    maxLength={12}
                    required 
                  />
                </div>
              </div>

              <div className="input-field-group">
                <label><Mail size={15} /> Email Address (Optional)</label>
                <div className="input-with-icon">
                  <Mail size={18} />
                  <input 
                    type="email" 
                    value={email} 
                    onChange={e => setEmail(e.target.value)}
                    placeholder="e.g. ramesh@example.com" 
                  />
                </div>
              </div>
            </div>

            <div className="input-field-group" style={{ marginBottom: '1.25rem' }}>
              <label style={{ fontSize: '0.82rem', fontWeight: 600, color: '#475569' }}>
                Special Requirements / Exact Pick-up Address (Optional)
              </label>
              <textarea 
                value={notes}
                onChange={e => setNotes(e.target.value)}
                placeholder="e.g. Airport pickup required, need luggage carrier or child seat..."
                rows={2}
                style={{
                  width: '100%',
                  padding: '0.65rem 0.85rem',
                  border: '1.5px solid #e2e8f0',
                  borderRadius: '10px',
                  fontSize: '0.9rem',
                  fontFamily: 'inherit',
                  resize: 'vertical'
                }}
              />
            </div>

            {/* Submit Button */}
            <button 
              type="submit" 
              className="btn-submit-inquiry"
              disabled={loading}
            >
              {loading ? (
                <span>Submitting Your Travel Request...</span>
              ) : (
                <>
                  <Send size={20} />
                  <span>Request Best Travel Quote & WhatsApp Itinerary</span>
                </>
              )}
            </button>
          </form>
        </div>
      </div>

      {/* PHONE VALIDATION ALERT POP-UP SYSTEM */}
      {phoneAlertPopup && (
        <div 
          className="modal-overlay" 
          onClick={() => {
            setPhoneAlertPopup(false);
            const input = document.getElementById('kuber-phone-input');
            if (input) input.focus();
          }}
          style={{ zIndex: 99999, animation: 'fadeIn 0.2s ease-out' }}
        >
          <div 
            className="modal-content" 
            onClick={e => e.stopPropagation()}
            style={{
              maxWidth: '430px',
              padding: '2rem 1.75rem',
              textAlign: 'center',
              borderRadius: '16px',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.4)',
              border: '2px solid #fed7aa',
              background: '#fff'
            }}
          >
            <button 
              className="modal-close-btn" 
              onClick={() => {
                setPhoneAlertPopup(false);
                const input = document.getElementById('kuber-phone-input');
                if (input) input.focus();
              }}
            >
              <X size={18} />
            </button>

            <div style={{
              width: '64px',
              height: '64px',
              background: '#fff7ed',
              color: '#ea580c',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1rem',
              boxShadow: '0 0 0 8px #ffedd5'
            }}>
              <AlertTriangle size={32} strokeWidth={2.4} />
            </div>

            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#1e293b', marginBottom: '0.6rem' }}>
              Action Required
            </h3>

            <div style={{
              background: '#fff1f2',
              color: '#991b1b',
              padding: '0.85rem 1rem',
              borderRadius: '10px',
              border: '1px solid #fecdd3',
              fontSize: '0.92rem',
              fontWeight: 700,
              lineHeight: 1.5,
              marginBottom: '1rem'
            }}>
              ⚠️ {phoneAlertMsg}
            </div>

            <p style={{ fontSize: '0.85rem', color: '#64748b', lineHeight: 1.5, marginBottom: '1.5rem' }}>
              A valid 10-digit mobile number is required so our booking team can confirm available drivers and share your exact cab quotation on WhatsApp.
            </p>

            <button
              type="button"
              onClick={() => {
                setPhoneAlertPopup(false);
                setTimeout(() => {
                  const input = document.getElementById('kuber-phone-input');
                  if (input) {
                    input.focus();
                    input.scrollIntoView({ behavior: 'smooth', block: 'center' });
                  }
                }, 100);
              }}
              style={{
                width: '100%',
                background: 'linear-gradient(135deg, #ea580c 0%, #d84e55 100%)',
                color: '#fff',
                border: 'none',
                padding: '0.8rem 1.5rem',
                borderRadius: '10px',
                fontSize: '0.95rem',
                fontWeight: 700,
                cursor: 'pointer',
                boxShadow: '0 4px 14px rgba(216, 78, 85, 0.35)',
                transition: 'all 0.2s ease'
              }}
            >
              Enter Mobile Number
            </button>
          </div>
        </div>
      )}
    </>
  );
};
