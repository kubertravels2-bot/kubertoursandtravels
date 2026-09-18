import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { HeroSearch } from './components/HeroSearch';
import { NearbySitesShowcase } from './components/NearbySitesShowcase';
import { TourPackages } from './components/TourPackages';
import { VisitedGallery } from './components/VisitedGallery';
import { WhatsAppDock } from './components/WhatsAppDock';
import { InquirySuccessModal } from './components/InquirySuccessModal';
import { AdminModal } from './components/AdminModal';
import { 
  VisitingSite, 
  TourPlan, 
  GalleryItem, 
  SiteSettings, 
  TravelReason, 
  Inquiry,
  User 
} from './types';
import { dataService } from './services/dataService';
import { authService } from './services/authService';
import { Phone, Mail, MapPin, ShieldCheck } from 'lucide-react';

export const App: React.FC = () => {
  // Current authenticated admin session
  const [currentUser, setCurrentUser] = useState<User | null>(() => authService.getCurrentUser());

  // Active search selections
  const [selectedDestination, setSelectedDestination] = useState('Jaipur');
  const [selectedReason, setSelectedReason] = useState<TravelReason>('Family Vacation');

  // Dynamic datasets from database
  const [sites, setSites] = useState<VisitingSite[]>([]);
  const [plans, setPlans] = useState<TourPlan[]>([]);
  const [gallery, setGallery] = useState<GalleryItem[]>([]);
  const [settings, setSettings] = useState<SiteSettings>({
    whatsapp_number: '919168741540',
    call_number: '+91 91687 41540',
    email: 'tours@kubertours.in',
    company_name: 'Kuber Tours and Travels',
    total_trips: 1850,
    destinations_covered: 420,
    happy_travelers: '25,000+',
    rating: 4.9
  });

  // Modals state
  const [adminOpen, setAdminOpen] = useState(false);
  const [successInquiry, setSuccessInquiry] = useState<Inquiry | null>(null);

  // Load all data
  const loadData = async () => {
    try {
      const [fetchedSites, fetchedPlans, fetchedGallery, fetchedSettings] = await Promise.all([
        dataService.getVisitingSites(),
        dataService.getTourPlans(),
        dataService.getGalleryItems(),
        dataService.getSettings()
      ]);
      setSites(fetchedSites);
      setPlans(fetchedPlans);
      setGallery(fetchedGallery);
      setSettings(fetchedSettings);
    } catch (err) {
      console.error('Error fetching website data', err);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Handle Admin Login / Logout
  const handleAdminLoginSuccess = (user: User) => {
    setCurrentUser(user);
    setAdminOpen(true);
  };

  const handleLogout = () => {
    authService.logout();
    setCurrentUser(null);
  };

  // Handle Inquiry submission
  const handleSubmitInquiry = async (inquiryData: Omit<Inquiry, 'id' | 'created_at' | 'status'>) => {
    const created = await dataService.addInquiry(inquiryData);
    setSuccessInquiry(created);
  };

  // When customer clicks "Book Package" from tour packages section
  const handleSelectPlan = (plan: TourPlan) => {
    setSelectedDestination(plan.destinations.split('-')[1]?.trim() || plan.destinations);
    const element = document.getElementById('plan-trip');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Update Settings from Admin
  const handleUpdateSettings = async (newSettings: Partial<SiteSettings>) => {
    await dataService.updateSettings(newSettings, currentUser?.name || 'Kuber Admin');
    const updated = await dataService.getSettings();
    setSettings(updated);
  };

  return (
    <div className="app-container">
      {/* 1. TOP NAVIGATION */}
      <Navbar 
        settings={settings} 
        currentUser={currentUser}
        onOpenAdmin={() => setAdminOpen(true)}
      />

      {/* 2. HERO & COMPACT TRIP INQUIRY PLANNER */}
      <HeroSearch 
        selectedDestination={selectedDestination}
        onDestinationChange={setSelectedDestination}
        selectedReason={selectedReason}
        onReasonChange={setSelectedReason}
        onSubmitInquiry={handleSubmitInquiry}
        settings={settings}
      />

      {/* 3. DYNAMIC SIGHTSEEING PLACES BASED ON DESTINATION & REASON */}
      <NearbySitesShowcase 
        destination={selectedDestination}
        travelReason={selectedReason}
        sites={sites}
        onSelectCity={setSelectedDestination}
      />

      {/* 4. CURATED POPULAR TOUR PACKAGES */}
      <TourPackages 
        plans={plans}
        onSelectPlan={handleSelectPlan}
      />

      {/* 5. VISITED TOURS GALLERY & LIVE STATS COUNTER */}
      <VisitedGallery 
        gallery={gallery}
        settings={settings}
      />

      {/* 6. FLOATING QUICK WHATSAPP DOCK */}
      <WhatsAppDock settings={settings} />

      {/* 7. INQUIRY SUCCESS MODAL WITH 1-CLICK WHATSAPP */}
      <InquirySuccessModal 
        inquiry={successInquiry}
        settings={settings}
        onClose={() => setSuccessInquiry(null)}
      />

      {/* 8. OWNER ADMIN DASHBOARD MODAL WITH AUDIT LOGS */}
      <AdminModal 
        isOpen={adminOpen}
        onClose={() => setAdminOpen(false)}
        settings={settings}
        onUpdateSettings={handleUpdateSettings}
        onDataChanged={loadData}
        currentUser={currentUser}
        onAdminLogin={handleAdminLoginSuccess}
        onAdminLogout={handleLogout}
      />

      {/* 9. FOOTER */}
      <footer className="footer">
        <div className="footer-container">
          <div className="footer-brand">
            <h3>Kuber<span>Tours</span> and Travels</h3>
            <p style={{ fontSize: '0.9rem', color: '#94a3b8', lineHeight: 1.6, marginBottom: '1rem' }}>
              Your dedicated partner for intercity private cabs, custom tour itineraries, and safe family road trips across India.
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#cbd5e1', fontSize: '0.85rem' }}>
              <ShieldCheck size={18} color="#22c55e" />
              <span>Verified Chauffeurs • Commercial Permits • Sanitized Cabs</span>
            </div>
          </div>

          <div className="footer-col">
            <h4>Popular Tour Corridors</h4>
            <ul>
              {(settings.tour_corridors || [
                { id: 'cor-1', label: 'Pune ➔ Jaipur Pink City', destination: 'Jaipur' },
                { id: 'cor-2', label: 'Pune ➔ Agra Taj Mahal Express', destination: 'Agra' },
                { id: 'cor-3', label: 'Pune ➔ Manali Snow Tour', destination: 'Manali' },
                { id: 'cor-4', label: 'Pune ➔ Goa Coastal Drive', destination: 'Goa' },
                { id: 'cor-5', label: 'Pune ➔ Shirdi Pilgrimage', destination: 'Shirdi' },
                { id: 'cor-6', label: 'Pune ➔ Mahabaleshwar Weekend', destination: 'Mahabaleshwar' }
              ]).map(cor => (
                <li key={cor.id}>
                  <a href="#plan-trip" onClick={() => setSelectedDestination(cor.destination)}>
                    {cor.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div className="footer-col">
            <h4>Direct Tour Assistance</h4>
            <ul>
              <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Phone size={15} color="#d84e55" />
                <span>{settings.call_number}</span>
              </li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Mail size={15} color="#d84e55" />
                <span>{settings.email}</span>
              </li>
              <li style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
                <MapPin size={15} color="#d84e55" style={{ flexShrink: 0, marginTop: '2px' }} />
                <span>Punch Ganga Society, Flat No.3, Shinde Nagar, Old Sanghvi, Pune - 411027</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          <div>
            © {new Date().getFullYear()} {settings.company_name}. All rights reserved.
          </div>
          <div style={{ display: 'flex', gap: '1rem', color: '#94a3b8' }}>
            <span style={{ cursor: 'pointer' }} onClick={() => setAdminOpen(true)}>Admin Control</span>
            <span>•</span>
            <span>Privacy Policy</span>
            <span>•</span>
            <span>Terms of Travel</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
