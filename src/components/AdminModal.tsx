import React, { useState, useEffect } from 'react';
import { 
  Inquiry, 
  VisitingSite, 
  TourPlan, 
  GalleryItem, 
  AdminUser, 
  SiteSettings, 
  TravelReason,
  ActivityLog,
  User,
  TourCorridor
} from '../types';
import { dataService, DEFAULT_CORRIDORS, DEFAULT_POPULAR_DESTINATIONS } from '../services/dataService';
import { authService } from '../services/authService';
import { securityService } from '../services/security';
import { 
  X, 
  Lock, 
  LogOut, 
  Inbox, 
  MapPin, 
  Package, 
  Image as ImageIcon, 
  Users, 
  Settings, 
  MessageCircle, 
  Phone, 
  Trash2, 
  Plus, 
  ShieldCheck, 
  CheckCircle,
  Activity,
  KeyRound,
  Clock,
  Upload,
  Navigation,
  ArrowUp,
  ArrowDown,
  RotateCcw,
  Check
} from 'lucide-react';

// Compress image on client-side so localStorage doesn't hit quota limits
const compressImageFile = (file: File, maxWidth = 800, maxHeight = 500, quality = 0.72): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        let { width, height } = img;
        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }
        if (height > maxHeight) {
          width = Math.round((width * maxHeight) / height);
          height = maxHeight;
        }
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(e.target?.result as string);
          return;
        }
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', quality));
      };
      img.onerror = () => resolve(e.target?.result as string);
      img.src = e.target?.result as string;
    };
    reader.onerror = err => reject(err);
    reader.readAsDataURL(file);
  });
};

const FALLBACK_TRAVEL_IMG = 'https://images.unsplash.com/photo-1599661046289-e31897846e41?auto=format&fit=crop&w=800&q=80';

interface AdminModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: SiteSettings;
  onUpdateSettings: (newSettings: Partial<SiteSettings>) => Promise<void>;
  onDataChanged: () => void;
  currentUser?: User | null;
  onAdminLogin?: (user: User) => void;
  onAdminLogout?: () => void;
}

type AdminTab = 'inquiries' | 'sites' | 'plans' | 'gallery' | 'corridors' | 'destinations' | 'admins' | 'activities' | 'settings';

export const AdminModal: React.FC<AdminModalProps> = ({
  isOpen,
  onClose,
  settings,
  onUpdateSettings,
  onDataChanged,
  currentUser,
  onAdminLogin,
  onAdminLogout
}) => {
  // Auth state
  const [session, setSession] = useState<{ username: string; role: string } | null>(() => {
    if (currentUser && currentUser.role === 'admin') {
      return { username: currentUser.email || currentUser.name, role: 'super_admin' };
    }
    return securityService.getAdminSession();
  });

  const [loginUser, setLoginUser] = useState('');
  const [loginPass, setLoginPass] = useState('');

  const [loginError, setLoginError] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);

  // Tab state
  const [activeTab, setActiveTab] = useState<AdminTab>('inquiries');

  // Data states
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [sites, setSites] = useState<VisitingSite[]>([]);
  const [plans, setPlans] = useState<TourPlan[]>([]);
  const [gallery, setGallery] = useState<GalleryItem[]>([]);
  const [admins, setAdmins] = useState<AdminUser[]>([]);
  const [auditLogs, setAuditLogs] = useState<ActivityLog[]>([]);
  const [msg, setMsg] = useState('');

  // Form states for adding items
  const [showAddSite, setShowAddSite] = useState(false);
  const [newSite, setNewSite] = useState({
    city: 'Jaipur',
    place_name: '',
    category: 'Heritage' as VisitingSite['category'],
    image_url: '',
    description: '',
    reasons: ['Family Vacation', 'Holiday Trip'] as TravelReason[]
  });

  const [showAddPlan, setShowAddPlan] = useState(false);
  const [newPlan, setNewPlan] = useState({
    title: '',
    duration: '3 Days / 2 Nights',
    price: 9999,
    starting_city: 'Delhi',
    destinations: '',
    image_url: '',
    highlights: 'AC Cab, Driver Allowance, Sightseeing, Tolls',
    description: ''
  });

  const [showAddGallery, setShowAddGallery] = useState(false);
  const [newGallery, setNewGallery] = useState({
    title: '',
    location: '',
    category: 'Heritage' as GalleryItem['category'],
    image_url: '',
    caption: '',
    traveler_name: '',
    rating: 5
  });

  const [showAddAdmin, setShowAddAdmin] = useState(false);
  const [newAdmin, setNewAdmin] = useState({
    username: '',
    password: '',
    name: '',
    role: 'operator' as 'super_admin' | 'operator'
  });

  // Settings form
  const [settingsForm, setSettingsForm] = useState({ ...settings });

  // Tour Corridors state (Changeable by admin)
  const [corridors, setCorridors] = useState<TourCorridor[]>(settings.tour_corridors || DEFAULT_CORRIDORS);
  const [newCorridorLabel, setNewCorridorLabel] = useState('');
  const [newCorridorDest, setNewCorridorDest] = useState('');
  const [corridorSaveMsg, setCorridorSaveMsg] = useState('');
  const [savingCorridors, setSavingCorridors] = useState(false);

  // Popular Destinations state (Changeable by admin)
  const [popularDestinations, setPopularDestinations] = useState<string[]>(settings.popular_destinations || DEFAULT_POPULAR_DESTINATIONS);
  const [newDestinationInput, setNewDestinationInput] = useState('');
  const [destSaveMsg, setDestSaveMsg] = useState('');
  const [savingDest, setSavingDest] = useState(false);

  useEffect(() => {
    if (settings.tour_corridors && settings.tour_corridors.length > 0) {
      setCorridors(settings.tour_corridors);
    }
  }, [settings.tour_corridors]);

  useEffect(() => {
    if (settings.popular_destinations && settings.popular_destinations.length > 0) {
      setPopularDestinations(settings.popular_destinations);
    }
  }, [settings.popular_destinations]);

  // Sync session if currentUser prop changes
  useEffect(() => {
    if (currentUser && currentUser.role === 'admin') {
      setSession({ username: currentUser.email || currentUser.name, role: 'super_admin' });
    }
  }, [currentUser]);

  // Load data when session is active
  useEffect(() => {
    if (session) {
      loadAllData();
    }
  }, [session, activeTab]);

  const loadAllData = async () => {
    try {
      const [inqs, st, pl, gl, ad, logs] = await Promise.all([
        dataService.getInquiries(),
        dataService.getVisitingSites(),
        dataService.getTourPlans(),
        dataService.getGalleryItems(),
        dataService.getAdmins(),
        dataService.getActivityLogs()
      ]);
      setInquiries(inqs);
      setSites(st);
      setPlans(pl);
      setGallery(gl);
      setAdmins(ad);
      setAuditLogs(logs);
    } catch (err) {
      console.error(err);
    }
  };

  if (!isOpen) return null;

  // Handle Login via Password
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    setLoginLoading(true);

    try {
      const verified = await dataService.verifyAdminLogin(loginUser, loginPass);
      if (verified) {
        securityService.setAdminSession(verified.username, verified.role);
        setSession({ username: verified.username, role: verified.role });
        if (onAdminLogin) {
          onAdminLogin({
            id: verified.id,
            name: verified.name,
            email: verified.email || `${verified.username}@kubertours.in`,
            phone: verified.phone || '9168741540',
            role: 'admin',
            created_at: verified.created_at
          });
        }
      } else {
        setLoginError('Invalid Admin ID or Password. Please try again.');
      }
    } catch (err) {
      setLoginError('Login verification failed.');
    } finally {
      setLoginLoading(false);
    }
  };


  const handleLogout = () => {
    securityService.clearAdminSession();
    authService.logout();
    setSession(null);
    if (onAdminLogout) onAdminLogout();
  };

  // Inquiry actions
  const handleUpdateStatus = async (id: string, newStatus: Inquiry['status']) => {
    await dataService.updateInquiryStatus(id, newStatus, session?.username || 'admin');
    setInquiries(prev => prev.map(i => i.id === id ? { ...i, status: newStatus } : i));
    setMsg('Status updated successfully');
    setTimeout(() => setMsg(''), 2500);
  };

  const handleDeleteInquiry = async (id: string) => {
    if (confirm('Delete this inquiry?')) {
      await dataService.deleteInquiry(id);
      setInquiries(prev => prev.filter(i => i.id !== id));
    }
  };

  // Image upload helpers using client-side compression
  const handleSiteImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const compressed = await compressImageFile(file);
      setNewSite(prev => ({ ...prev, image_url: compressed }));
    } catch {
      alert('Could not read image file. Please try a different image.');
    }
  };

  const handlePlanImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const compressed = await compressImageFile(file);
      setNewPlan(prev => ({ ...prev, image_url: compressed }));
    } catch {
      alert('Could not read image file. Please try a different image.');
    }
  };

  const handleGalleryImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const compressed = await compressImageFile(file);
      setNewGallery(prev => ({ ...prev, image_url: compressed }));
    } catch {
      alert('Could not read image file. Please try a different image.');
    }
  };

  // Site actions
  const handleAddSite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSite.place_name.trim()) {
      alert('Please enter place name.');
      return;
    }
    const finalImg = newSite.image_url.trim() || FALLBACK_TRAVEL_IMG;
    await dataService.addVisitingSite({
      city: newSite.city.trim() || 'Pune',
      place_name: newSite.place_name.trim(),
      category: newSite.category,
      image_url: finalImg,
      description: newSite.description.trim() || `${newSite.place_name} in ${newSite.city}`,
      recommended_reasons: newSite.reasons.length > 0 ? newSite.reasons : ['Family Vacation', 'Holiday Trip']
    }, session?.username || 'admin');
    setShowAddSite(false);
    setNewSite({
      city: 'Pune',
      place_name: '',
      category: 'Heritage',
      image_url: '',
      description: '',
      reasons: ['Family Vacation', 'Holiday Trip']
    });
    await loadAllData();
    onDataChanged();
    setMsg('Visiting site added successfully!');
    setTimeout(() => setMsg(''), 2500);
  };

  const handleDeleteSite = async (id: string) => {
    if (confirm('Delete this visiting site?')) {
      await dataService.deleteVisitingSite(id, session?.username || 'admin');
      setSites(prev => prev.filter(s => s.id !== id));
      onDataChanged();
    }
  };

  // Tour Plan actions
  const handleAddPlan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPlan.title.trim()) {
      alert('Please enter package title.');
      return;
    }
    const finalImg = newPlan.image_url.trim() || FALLBACK_TRAVEL_IMG;
    const highlightsArr = newPlan.highlights.split(',').map(h => h.trim()).filter(Boolean);
    await dataService.addTourPlan({
      title: newPlan.title.trim(),
      duration: newPlan.duration.trim() || '3 Days / 2 Nights',
      price: Number(newPlan.price) || 9999,
      starting_city: newPlan.starting_city.trim() || 'Pune',
      destinations: newPlan.destinations.trim() || 'Pune Sightseeing',
      image_url: finalImg,
      highlights: highlightsArr.length > 0 ? highlightsArr : ['AC Cab with Chauffeur', 'All Tolls & Parking included'],
      description: newPlan.description.trim() || `${newPlan.title} custom tour package.`,
      is_featured: true
    }, session?.username || 'admin');
    setShowAddPlan(false);
    setNewPlan({
      title: '',
      duration: '3 Days / 2 Nights',
      price: 9999,
      starting_city: 'Pune',
      destinations: '',
      image_url: '',
      highlights: 'AC Cab, Driver Allowance, Sightseeing, Tolls',
      description: ''
    });
    await loadAllData();
    onDataChanged();
    setMsg('Tour plan package created!');
    setTimeout(() => setMsg(''), 2500);
  };

  const handleDeletePlan = async (id: string) => {
    if (confirm('Delete this tour package?')) {
      await dataService.deleteTourPlan(id, session?.username || 'admin');
      setPlans(prev => prev.filter(p => p.id !== id));
      onDataChanged();
    }
  };

  // Gallery actions
  const handleAddGallery = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGallery.title.trim()) {
      alert('Please enter tour title.');
      return;
    }
    const finalImg = newGallery.image_url.trim() || FALLBACK_TRAVEL_IMG;
    await dataService.addGalleryItem({
      title: newGallery.title.trim(),
      location: newGallery.location.trim() || 'Pune, India',
      category: newGallery.category,
      image_url: finalImg,
      caption: newGallery.caption.trim() || `Memorable trip with Kuber Tours and Travels.`,
      traveler_name: newGallery.traveler_name.trim() || 'Happy Customer',
      rating: Number(newGallery.rating) || 5
    }, session?.username || 'admin');
    setShowAddGallery(false);
    setNewGallery({
      title: '',
      location: '',
      category: 'Heritage',
      image_url: '',
      caption: '',
      traveler_name: '',
      rating: 5
    });
    await loadAllData();
    onDataChanged();
    setMsg('Past tour photo added to gallery!');
    setTimeout(() => setMsg(''), 2500);
  };

  const handleDeleteGallery = async (id: string) => {
    if (confirm('Delete this gallery photo?')) {
      await dataService.deleteGalleryItem(id, session?.username || 'admin');
      setGallery(prev => prev.filter(g => g.id !== id));
      onDataChanged();
    }
  };

  // Admin Management Actions (Add and Remove Admin System)
  const handleAddAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = await dataService.addAdmin(newAdmin, session?.username || 'admin');
    if (result.success) {
      setShowAddAdmin(false);
      setNewAdmin({ username: '', password: '', name: '', role: 'operator' });
      loadAllData();
      setMsg('New Administrator account created successfully!');
      setTimeout(() => setMsg(''), 2500);
    } else {
      alert(result.message || 'Could not add administrator.');
    }
  };

  const handleRemoveAdmin = async (id: string, username: string) => {
    if (confirm(`Are you sure you want to remove administrator "${username}"?`)) {
      const result = await dataService.removeAdmin(id, session?.username || 'admin');
      if (result.success) {
        loadAllData();
        setMsg(`Admin "${username}" removed.`);
        setTimeout(() => setMsg(''), 2500);
      } else {
        alert(result.message || 'Cannot remove admin.');
      }
    }
  };

  // Save Settings
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    await onUpdateSettings(settingsForm);
    setMsg('Website settings saved!');
    setTimeout(() => setMsg(''), 2500);
  };

  // Popular Tour Corridors Handlers
  const handleAddCorridor = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCorridorLabel.trim() || !newCorridorDest.trim()) {
      alert('Please provide both the Route Display Name and Destination City.');
      return;
    }
    const item: TourCorridor = {
      id: 'cor-' + Date.now(),
      label: newCorridorLabel.trim(),
      destination: newCorridorDest.trim()
    };
    setCorridors(prev => [...prev, item]);
    setNewCorridorLabel('');
    setNewCorridorDest('');
  };

  const handleDeleteCorridor = (id: string) => {
    setCorridors(prev => prev.filter(c => c.id !== id));
  };

  const handleMoveCorridor = (index: number, direction: 'up' | 'down') => {
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= corridors.length) return;
    const copy = [...corridors];
    const [moved] = copy.splice(index, 1);
    copy.splice(targetIdx, 0, moved);
    setCorridors(copy);
  };

  const handleSaveCorridors = async () => {
    try {
      setSavingCorridors(true);
      await onUpdateSettings({ tour_corridors: corridors });
      setCorridorSaveMsg('✅ Popular Tour Corridors saved and published live to website footer!');
      setTimeout(() => setCorridorSaveMsg(''), 4000);
      onDataChanged();
    } catch (err: any) {
      setCorridorSaveMsg('❌ Error saving corridors: ' + (err.message || 'Unknown error'));
    } finally {
      setSavingCorridors(false);
    }
  };

  const handleResetCorridors = () => {
    if (window.confirm('Reset all tour corridors to standard default Maharashtra/Outstation routes?')) {
      setCorridors(DEFAULT_CORRIDORS);
    }
  };

  const handleQuickAddCorridor = (label: string, destination: string) => {
    if (corridors.some(c => c.destination.toLowerCase() === destination.toLowerCase())) {
      alert(`A route corridor for "${destination}" is already added.`);
      return;
    }
    const item: TourCorridor = {
      id: 'cor-' + Date.now(),
      label,
      destination
    };
    setCorridors(prev => [...prev, item]);
  };

  // Popular Destinations Handlers (Changeable by Admin)
  const handleAddDestination = (city: string) => {
    const trimmed = city.trim();
    if (!trimmed) {
      alert('Please enter a destination city name.');
      return;
    }
    if (popularDestinations.some(d => d.toLowerCase() === trimmed.toLowerCase())) {
      alert(`"${trimmed}" is already in the Popular Destinations list.`);
      return;
    }
    setPopularDestinations(prev => [...prev, trimmed]);
    setNewDestinationInput('');
  };

  const handleRemoveDestination = (city: string) => {
    setPopularDestinations(prev => prev.filter(d => d.toLowerCase() !== city.toLowerCase()));
  };

  const handleMoveDestination = (index: number, direction: 'left' | 'right') => {
    const targetIdx = direction === 'left' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= popularDestinations.length) return;
    const copy = [...popularDestinations];
    const [moved] = copy.splice(index, 1);
    copy.splice(targetIdx, 0, moved);
    setPopularDestinations(copy);
  };

  const handleSaveDestinations = async () => {
    try {
      setSavingDest(true);
      await onUpdateSettings({ popular_destinations: popularDestinations });
      setDestSaveMsg('✅ Popular Destinations saved & published live to booking form!');
      setTimeout(() => setDestSaveMsg(''), 4000);
      onDataChanged();
    } catch (err: any) {
      setDestSaveMsg('❌ Error saving destinations: ' + (err.message || 'Unknown error'));
    } finally {
      setSavingDest(false);
    }
  };

  const handleResetDestinations = () => {
    if (window.confirm('Reset Popular Destinations pills to standard default cities?')) {
      setPopularDestinations(DEFAULT_POPULAR_DESTINATIONS);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div 
        className="modal-content modal-content-lg" 
        onClick={e => e.stopPropagation()}
        style={{ padding: '1.75rem' }}
      >
        <button className="modal-close-btn" onClick={onClose}>
          <X size={18} />
        </button>

        {/* NOT LOGGED IN - LOGIN VIEW */}
        {!session ? (
          <div style={{ maxWidth: '420px', margin: '1rem auto' }}>
            <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
              <div style={{
                width: '54px',
                height: '54px',
                background: '#fff1f2',
                color: '#d84e55',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 0.75rem'
              }}>
                <Lock size={26} />
              </div>
              <h2 style={{ fontSize: '1.4rem', fontWeight: 800 }}>Admin Portal Login</h2>
              <p style={{ color: '#64748b', fontSize: '0.85rem' }}>
                Secure administrator control for leads, tour packages & system logs.
              </p>
            </div>

            {loginError && (
              <div style={{
                background: '#fee2e2',
                color: '#991b1b',
                padding: '0.65rem 0.85rem',
                borderRadius: '8px',
                fontSize: '0.84rem',
                marginBottom: '1rem',
                fontWeight: 600
              }}>
                ⚠️ {loginError}
              </div>
            )}

            <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div className="input-field-group">
                <label>Admin ID</label>
                <input 
                  type="text" 
                  value={loginUser} 
                  onChange={e => setLoginUser(e.target.value)}
                  placeholder="Enter Admin ID"
                  required
                  autoComplete="username"
                  style={{
                    padding: '0.7rem 0.85rem',
                    border: '1.5px solid #cbd5e1',
                    borderRadius: '8px',
                    fontSize: '0.95rem'
                  }}
                />
              </div>

              <div className="input-field-group">
                <label>Admin Password</label>
                <input 
                  type="password" 
                  value={loginPass} 
                  onChange={e => setLoginPass(e.target.value)}
                  placeholder="Enter Password"
                  required
                  autoComplete="current-password"
                  style={{
                    padding: '0.7rem 0.85rem',
                    border: '1.5px solid #cbd5e1',
                    borderRadius: '8px',
                    fontSize: '0.95rem'
                  }}
                />
              </div>

              <button 
                type="submit" 
                className="btn-submit-inquiry"
                disabled={loginLoading}
                style={{ marginTop: '0.5rem', padding: '0.85rem' }}
              >
                {loginLoading ? 'Verifying...' : 'Login to Admin Dashboard'}
              </button>
            </form>
          </div>
        ) : (
          /* LOGGED IN - ADMIN DASHBOARD */
          <div>
            {/* Top Bar */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              paddingBottom: '1rem',
              marginBottom: '1rem',
              borderBottom: '1px solid #e2e8f0',
              flexWrap: 'wrap',
              gap: '0.75rem'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <ShieldCheck size={24} color="#d84e55" />
                <div>
                  <h2 style={{ fontSize: '1.3rem', fontWeight: 800, margin: 0 }}>
                    Kuber Tours Admin Control Center
                  </h2>
                  <span style={{ fontSize: '0.78rem', color: '#64748b' }}>
                    Logged in as <strong>{session.username}</strong> ({session.role})
                  </span>
                </div>
              </div>

              <button 
                onClick={handleLogout}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  background: '#f1f5f9',
                  color: '#475569',
                  border: '1px solid #cbd5e1',
                  padding: '0.45rem 0.85rem',
                  borderRadius: '6px',
                  fontSize: '0.82rem',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                <LogOut size={14} />
                <span>Logout</span>
              </button>
            </div>

            {msg && (
              <div style={{
                background: '#dcfce7',
                color: '#166534',
                padding: '0.6rem 0.85rem',
                borderRadius: '8px',
                fontSize: '0.86rem',
                fontWeight: 600,
                marginBottom: '1rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}>
                <CheckCircle size={16} />
                <span>{msg}</span>
              </div>
            )}

            {/* Navigation Tabs */}
            <div className="admin-tabs">
              <button 
                className={`admin-tab-btn ${activeTab === 'inquiries' ? 'active' : ''}`}
                onClick={() => setActiveTab('inquiries')}
              >
                <Inbox size={16} />
                <span>Inquiries ({inquiries.length})</span>
              </button>

              <button 
                className={`admin-tab-btn ${activeTab === 'sites' ? 'active' : ''}`}
                onClick={() => setActiveTab('sites')}
              >
                <MapPin size={16} />
                <span>Sites ({sites.length})</span>
              </button>

              <button 
                className={`admin-tab-btn ${activeTab === 'plans' ? 'active' : ''}`}
                onClick={() => setActiveTab('plans')}
              >
                <Package size={16} />
                <span>Tour Plans ({plans.length})</span>
              </button>

              <button 
                className={`admin-tab-btn ${activeTab === 'gallery' ? 'active' : ''}`}
                onClick={() => setActiveTab('gallery')}
              >
                <ImageIcon size={16} />
                <span>Gallery ({gallery.length})</span>
              </button>

              <button 
                className={`admin-tab-btn ${activeTab === 'corridors' ? 'active' : ''}`}
                onClick={() => setActiveTab('corridors')}
              >
                <Navigation size={16} />
                <span>Tour Corridors ({corridors.length})</span>
              </button>

              <button 
                className={`admin-tab-btn ${activeTab === 'destinations' ? 'active' : ''}`}
                onClick={() => setActiveTab('destinations')}
              >
                <MapPin size={16} />
                <span>Popular Destinations ({popularDestinations.length})</span>
              </button>

              <button 
                className={`admin-tab-btn ${activeTab === 'admins' ? 'active' : ''}`}
                onClick={() => setActiveTab('admins')}
              >
                <Users size={16} />
                <span>Admins ({admins.length})</span>
              </button>

              <button 
                className={`admin-tab-btn ${activeTab === 'activities' ? 'active' : ''}`}
                onClick={() => setActiveTab('activities')}
              >
                <Activity size={16} />
                <span>Audit Logs ({auditLogs.length})</span>
              </button>

              <button 
                className={`admin-tab-btn ${activeTab === 'settings' ? 'active' : ''}`}
                onClick={() => setActiveTab('settings')}
              >
                <Settings size={16} />
                <span>Settings</span>
              </button>
            </div>

            {/* TAB 1: INQUIRIES & LEADS */}
            {activeTab === 'inquiries' && (
              <div>
                <div style={{ marginBottom: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.9rem', color: '#475569' }}>
                    Customer travel inquiries. Click the green <strong>WhatsApp button</strong> or blue <strong>Call button</strong> to contact immediately!
                  </span>
                </div>

                <div className="admin-table-wrap">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Date</th>
                        <th>Customer</th>
                        <th>Route & Date</th>
                        <th>Vehicle & Passengers</th>
                        <th>Reason</th>
                        <th>Status</th>
                        <th>Contact Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {inquiries.length === 0 ? (
                        <tr>
                          <td colSpan={7} style={{ textAlign: 'center', padding: '2rem', color: '#94a3b8' }}>
                            No inquiries yet.
                          </td>
                        </tr>
                      ) : (
                        inquiries.map(inq => {
                          const waCustomerUrl = securityService.buildSecureWhatsAppUrl(
                            inq.customer_phone,
                            `Hi! This is Kuber Tours and Travels regarding your trip from ${inq.pickup_location} to ${inq.drop_location} on ${inq.travel_date} in ${inq.car_type}. We have verified availability. Can we discuss your preferred timing and quote?`
                          );

                          return (
                            <tr key={inq.id}>
                              <td style={{ fontSize: '0.78rem', color: '#64748b' }}>
                                {new Date(inq.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
                              </td>
                              <td>
                                <strong>{inq.customer_name}</strong>
                                <div style={{ fontSize: '0.78rem', color: '#475569' }}>
                                  +91 {inq.customer_phone}
                                </div>
                                {inq.customer_email && (
                                  <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>
                                    {inq.customer_email}
                                  </div>
                                )}
                              </td>
                              <td>
                                <div style={{ fontWeight: 600 }}>{inq.pickup_location} ➔ {inq.drop_location}</div>
                                <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                                  {inq.travel_date} • {inq.travel_time}
                                </div>
                              </td>
                              <td>
                                <div>{inq.car_type}</div>
                                <span style={{ fontSize: '0.78rem', color: '#64748b' }}>
                                  {inq.passengers_count} People
                                </span>
                              </td>
                              <td>
                                <span style={{ fontSize: '0.78rem', background: '#f1f5f9', padding: '2px 8px', borderRadius: '4px' }}>
                                  {inq.travel_reason}
                                </span>
                              </td>
                              <td>
                                <select 
                                  value={inq.status}
                                  onChange={e => handleUpdateStatus(inq.id, e.target.value as Inquiry['status'])}
                                  style={{
                                    fontSize: '0.78rem',
                                    padding: '3px 6px',
                                    borderRadius: '6px',
                                    border: '1px solid #cbd5e1'
                                  }}
                                >
                                  <option value="New">New</option>
                                  <option value="Contacted">Contacted</option>
                                  <option value="Quoted">Quoted</option>
                                  <option value="Booked">Booked</option>
                                  <option value="Completed">Completed</option>
                                  <option value="Cancelled">Cancelled</option>
                                </select>
                              </td>
                              <td>
                                <div style={{ display: 'flex', gap: '0.35rem', alignItems: 'center' }}>
                                  <a 
                                    href={waCustomerUrl} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="btn-action-icon btn-wa-action"
                                    title="WhatsApp Customer"
                                  >
                                    <MessageCircle size={16} />
                                  </a>

                                  <a 
                                    href={`tel:${inq.customer_phone}`}
                                    className="btn-action-icon btn-call-action"
                                    title="Call Customer"
                                  >
                                    <Phone size={16} />
                                  </a>

                                  <button 
                                    onClick={() => handleDeleteInquiry(inq.id)}
                                    className="btn-action-icon btn-del-action"
                                    title="Delete Inquiry"
                                  >
                                    <Trash2 size={16} />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* TAB 2: VISITING SITES MANAGER */}
            {activeTab === 'sites' && (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                  <span style={{ fontSize: '0.9rem', color: '#475569' }}>
                    Attractions displayed to customers when searching for a destination.
                  </span>
                  <button 
                    onClick={() => setShowAddSite(!showAddSite)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.4rem',
                      background: '#d84e55',
                      color: '#fff',
                      border: 'none',
                      padding: '0.55rem 1rem',
                      borderRadius: '8px',
                      fontSize: '0.85rem',
                      fontWeight: 700,
                      cursor: 'pointer'
                    }}
                  >
                    <Plus size={16} />
                    <span>Add New Site</span>
                  </button>
                </div>

                {showAddSite && (
                  <form onSubmit={handleAddSite} style={{
                    background: '#f8fafc',
                    padding: '1.25rem',
                    borderRadius: '10px',
                    border: '1.5px dashed #cbd5e1',
                    marginBottom: '1.5rem'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                      <h4 style={{ margin: 0, fontWeight: 700 }}>Add Tourist Attraction</h4>
                      <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap' }}>
                        <span style={{ fontSize: '0.75rem', color: '#64748b', alignSelf: 'center' }}>Quick Presets:</span>
                        <button
                          type="button"
                          onClick={() => setNewSite({
                            city: 'Pune',
                            place_name: 'Shaniwar Wada Palace',
                            category: 'Heritage',
                            image_url: 'https://images.unsplash.com/photo-1590050752117-238cb0fb12b1?auto=format&fit=crop&w=800&q=80',
                            description: 'Historical 18th-century fortified palace of the Maratha Peshwas in Pune.',
                            reasons: ['Family Vacation', 'Holiday Trip', 'Site Visit']
                          })}
                          style={{ fontSize: '0.72rem', background: '#fff', border: '1px solid #cbd5e1', padding: '2px 8px', borderRadius: '12px', cursor: 'pointer' }}
                        >
                          + Shaniwar Wada
                        </button>
                        <button
                          type="button"
                          onClick={() => setNewSite({
                            city: 'Pune',
                            place_name: 'Sinhagad Fort',
                            category: 'Scenic / Nature',
                            image_url: 'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?auto=format&fit=crop&w=800&q=80',
                            description: 'Majestic Sahyadri hill fortress southwest of Pune with scenic trekking trails.',
                            reasons: ['Family Vacation', 'Holiday Trip']
                          })}
                          style={{ fontSize: '0.72rem', background: '#fff', border: '1px solid #cbd5e1', padding: '2px 8px', borderRadius: '12px', cursor: 'pointer' }}
                        >
                          + Sinhagad Fort
                        </button>
                        <button
                          type="button"
                          onClick={() => setNewSite({
                            city: 'Pune',
                            place_name: 'Aga Khan Palace',
                            category: 'Heritage',
                            image_url: 'https://images.unsplash.com/photo-1564507592333-c60657eea523?auto=format&fit=crop&w=800&q=80',
                            description: 'Italian arches and sprawling lawns. A premier national memorial in Pune.',
                            reasons: ['Family Vacation', 'Site Visit']
                          })}
                          style={{ fontSize: '0.72rem', background: '#fff', border: '1px solid #cbd5e1', padding: '2px 8px', borderRadius: '12px', cursor: 'pointer' }}
                        >
                          + Aga Khan Palace
                        </button>
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.75rem', marginBottom: '0.75rem' }}>
                      <div className="input-field-group">
                        <label>City Name</label>
                        <input 
                          type="text" 
                          value={newSite.city} 
                          onChange={e => setNewSite({ ...newSite, city: e.target.value })} 
                          placeholder="e.g. Pune, Goa, Jaipur..."
                          required 
                        />
                      </div>

                      <div className="input-field-group">
                        <label>Place Name</label>
                        <input 
                          type="text" 
                          value={newSite.place_name} 
                          onChange={e => setNewSite({ ...newSite, place_name: e.target.value })} 
                          placeholder="e.g. Shaniwar Wada"
                          required 
                        />
                      </div>

                      <div className="input-field-group">
                        <label>Category</label>
                        <select 
                          value={newSite.category} 
                          onChange={e => setNewSite({ ...newSite, category: e.target.value as any })}
                        >
                          <option value="Heritage">Heritage</option>
                          <option value="Scenic / Nature">Scenic / Nature</option>
                          <option value="Spiritual">Spiritual</option>
                          <option value="Adventure">Adventure</option>
                          <option value="Beach">Beach</option>
                        </select>
                      </div>
                    </div>

                    {/* Image URL or File Upload */}
                    <div style={{ background: '#fff', padding: '0.85rem', borderRadius: '8px', border: '1px solid #e2e8f0', marginBottom: '0.75rem' }}>
                      <label style={{ fontSize: '0.82rem', fontWeight: 700, display: 'block', marginBottom: '0.4rem' }}>
                        Attraction Photo (Paste Web Link OR Upload From Device)
                      </label>
                      <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
                        <input 
                          type="text" 
                          value={newSite.image_url} 
                          onChange={e => setNewSite({ ...newSite, image_url: e.target.value })} 
                          placeholder="https://... direct image URL or upload below"
                          style={{ flex: '1', minWidth: '220px', padding: '0.55rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.85rem' }}
                        />
                        <label style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.35rem',
                          background: '#1e293b',
                          color: '#fff',
                          padding: '0.55rem 0.9rem',
                          borderRadius: '6px',
                          fontSize: '0.82rem',
                          fontWeight: 600,
                          cursor: 'pointer'
                        }}>
                          <Upload size={14} />
                          <span>Upload File</span>
                          <input 
                            type="file" 
                            accept="image/*" 
                            onChange={handleSiteImageUpload} 
                            style={{ display: 'none' }} 
                          />
                        </label>
                        {newSite.image_url && (
                          <button 
                            type="button" 
                            onClick={() => setNewSite({ ...newSite, image_url: '' })}
                            style={{ background: '#fee2e2', color: '#991b1b', border: 'none', padding: '0.55rem 0.75rem', borderRadius: '6px', fontSize: '0.8rem', cursor: 'pointer', fontWeight: 600 }}
                          >
                            Clear
                          </button>
                        )}
                      </div>

                      {newSite.image_url && (
                        <div style={{ marginTop: '0.65rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                          <img 
                            src={newSite.image_url} 
                            alt="Preview" 
                            style={{ width: '80px', height: '55px', objectFit: 'cover', borderRadius: '6px', border: '1.5px solid #22c55e' }}
                            onError={(e) => { (e.target as HTMLImageElement).src = FALLBACK_TRAVEL_IMG; }}
                          />
                          <span style={{ fontSize: '0.78rem', color: '#15803d', fontWeight: 600 }}>✓ Image loaded & ready to save</span>
                        </div>
                      )}
                    </div>

                    <div className="input-field-group" style={{ marginBottom: '0.75rem' }}>
                      <label>Description</label>
                      <textarea 
                        value={newSite.description} 
                        onChange={e => setNewSite({ ...newSite, description: e.target.value })} 
                        rows={2} 
                        placeholder="Short highlights of this attraction for visitors..."
                        style={{ padding: '0.5rem', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                      />
                    </div>

                    {/* Travel Reasons Tag Checkboxes */}
                    <div style={{ marginBottom: '0.9rem' }}>
                      <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '0.35rem' }}>
                        Recommended For Journeys:
                      </label>
                      <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                        {(['Family Vacation', 'Holiday Trip', 'Business', 'Site Visit', 'Pilgrimage', 'Wedding'] as TravelReason[]).map(r => {
                          const checked = newSite.reasons.includes(r);
                          return (
                            <button
                              type="button"
                              key={r}
                              onClick={() => {
                                setNewSite(prev => ({
                                  ...prev,
                                  reasons: checked ? prev.reasons.filter(x => x !== r) : [...prev.reasons, r]
                                }));
                              }}
                              style={{
                                background: checked ? '#d84e55' : '#fff',
                                color: checked ? '#fff' : '#475569',
                                border: checked ? '1px solid #d84e55' : '1px solid #cbd5e1',
                                padding: '3px 10px',
                                borderRadius: '14px',
                                fontSize: '0.78rem',
                                fontWeight: 600,
                                cursor: 'pointer'
                              }}
                            >
                              {checked ? '✓ ' : '+ '}{r}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button type="submit" style={{ background: '#059669', color: '#fff', border: 'none', padding: '0.55rem 1.25rem', borderRadius: '6px', fontWeight: 700, cursor: 'pointer' }}>
                        Save Attraction
                      </button>
                      <button type="button" onClick={() => setShowAddSite(false)} style={{ background: '#cbd5e1', border: 'none', padding: '0.55rem 1rem', borderRadius: '6px', cursor: 'pointer' }}>
                        Cancel
                      </button>
                    </div>
                  </form>
                )}

                <div className="admin-table-wrap">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Image</th>
                        <th>City</th>
                        <th>Place Name</th>
                        <th>Category</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {sites.map(site => (
                        <tr key={site.id}>
                          <td>
                            <img 
                              src={site.image_url} 
                              alt={site.place_name} 
                              style={{ width: '48px', height: '48px', objectFit: 'cover', borderRadius: '6px' }} 
                              onError={(e) => { (e.target as HTMLImageElement).src = FALLBACK_TRAVEL_IMG; }}
                            />
                          </td>
                          <td><strong>{site.city}</strong></td>
                          <td>{site.place_name}</td>
                          <td>
                            <span style={{ fontSize: '0.75rem', background: '#f1f5f9', padding: '2px 8px', borderRadius: '12px' }}>
                              {site.category}
                            </span>
                          </td>
                          <td>
                            <button onClick={() => handleDeleteSite(site.id)} className="btn-action-icon btn-del-action" title="Delete Site">
                              <Trash2 size={16} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* TAB 3: TOUR PLANS */}
            {activeTab === 'plans' && (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                  <span style={{ fontSize: '0.9rem', color: '#475569' }}>
                    Curated packages with pricing in ₹.
                  </span>
                  <button 
                    onClick={() => setShowAddPlan(!showAddPlan)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.4rem',
                      background: '#d84e55',
                      color: '#fff',
                      border: 'none',
                      padding: '0.55rem 1rem',
                      borderRadius: '8px',
                      fontSize: '0.85rem',
                      fontWeight: 700,
                      cursor: 'pointer'
                    }}
                  >
                    <Plus size={16} />
                    <span>Add Tour Plan</span>
                  </button>
                </div>

                {showAddPlan && (
                  <form onSubmit={handleAddPlan} style={{
                    background: '#f8fafc',
                    padding: '1.25rem',
                    borderRadius: '10px',
                    border: '1.5px dashed #cbd5e1',
                    marginBottom: '1.5rem'
                  }}>
                    <h4 style={{ marginBottom: '0.75rem', fontWeight: 700 }}>Add Tour Package</h4>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.75rem', marginBottom: '0.75rem' }}>
                      <div className="input-field-group">
                        <label>Package Title</label>
                        <input type="text" value={newPlan.title} onChange={e => setNewPlan({ ...newPlan, title: e.target.value })} placeholder="e.g. Pune to Mahabaleshwar Weekend" required />
                      </div>
                      <div className="input-field-group">
                        <label>Starting City</label>
                        <input type="text" value={newPlan.starting_city} onChange={e => setNewPlan({ ...newPlan, starting_city: e.target.value })} placeholder="e.g. Pune" required />
                      </div>
                      <div className="input-field-group">
                        <label>Duration</label>
                        <input type="text" value={newPlan.duration} onChange={e => setNewPlan({ ...newPlan, duration: e.target.value })} placeholder="e.g. 3 Days / 2 Nights" required />
                      </div>
                      <div className="input-field-group">
                        <label>Price (₹)</label>
                        <input type="number" value={newPlan.price} onChange={e => setNewPlan({ ...newPlan, price: Number(e.target.value) })} required />
                      </div>
                      <div className="input-field-group">
                        <label>Route / Destinations</label>
                        <input type="text" value={newPlan.destinations} onChange={e => setNewPlan({ ...newPlan, destinations: e.target.value })} placeholder="e.g. Pune - Mahabaleshwar - Panchgani" required />
                      </div>
                    </div>

                    {/* Image URL or File Upload */}
                    <div style={{ background: '#fff', padding: '0.85rem', borderRadius: '8px', border: '1px solid #e2e8f0', marginBottom: '0.75rem' }}>
                      <label style={{ fontSize: '0.82rem', fontWeight: 700, display: 'block', marginBottom: '0.4rem' }}>
                        Package Photo (Paste Link OR Upload From Device)
                      </label>
                      <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
                        <input 
                          type="text" 
                          value={newPlan.image_url} 
                          onChange={e => setNewPlan({ ...newPlan, image_url: e.target.value })} 
                          placeholder="https://... direct image URL or upload below"
                          style={{ flex: '1', minWidth: '220px', padding: '0.55rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.85rem' }}
                        />
                        <label style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.35rem',
                          background: '#1e293b',
                          color: '#fff',
                          padding: '0.55rem 0.9rem',
                          borderRadius: '6px',
                          fontSize: '0.82rem',
                          fontWeight: 600,
                          cursor: 'pointer'
                        }}>
                          <Upload size={14} />
                          <span>Upload File</span>
                          <input 
                            type="file" 
                            accept="image/*" 
                            onChange={handlePlanImageUpload} 
                            style={{ display: 'none' }} 
                          />
                        </label>
                        {newPlan.image_url && (
                          <button 
                            type="button" 
                            onClick={() => setNewPlan({ ...newPlan, image_url: '' })}
                            style={{ background: '#fee2e2', color: '#991b1b', border: 'none', padding: '0.55rem 0.75rem', borderRadius: '6px', fontSize: '0.8rem', cursor: 'pointer', fontWeight: 600 }}
                          >
                            Clear
                          </button>
                        )}
                      </div>

                      {newPlan.image_url && (
                        <div style={{ marginTop: '0.65rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                          <img 
                            src={newPlan.image_url} 
                            alt="Preview" 
                            style={{ width: '80px', height: '55px', objectFit: 'cover', borderRadius: '6px', border: '1.5px solid #22c55e' }}
                            onError={(e) => { (e.target as HTMLImageElement).src = FALLBACK_TRAVEL_IMG; }}
                          />
                          <span style={{ fontSize: '0.78rem', color: '#15803d', fontWeight: 600 }}>✓ Image loaded & ready to save</span>
                        </div>
                      )}
                    </div>

                    <div className="input-field-group" style={{ marginBottom: '0.75rem' }}>
                      <label>Highlights (comma separated)</label>
                      <input 
                        type="text" 
                        value={newPlan.highlights} 
                        onChange={e => setNewPlan({ ...newPlan, highlights: e.target.value })} 
                        placeholder="e.g. Dedicated AC Sedan, Chauffeur Allowance, Fuel & Tolls Included"
                        style={{ padding: '0.55rem', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                      />
                    </div>

                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button type="submit" style={{ background: '#059669', color: '#fff', border: 'none', padding: '0.55rem 1.25rem', borderRadius: '6px', fontWeight: 700, cursor: 'pointer' }}>
                        Publish Package
                      </button>
                      <button type="button" onClick={() => setShowAddPlan(false)} style={{ background: '#cbd5e1', border: 'none', padding: '0.55rem 1rem', borderRadius: '6px', cursor: 'pointer' }}>
                        Cancel
                      </button>
                    </div>
                  </form>
                )}

                <div className="admin-table-wrap">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Title</th>
                        <th>Duration</th>
                        <th>Route</th>
                        <th>Price (₹)</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {plans.map(p => (
                        <tr key={p.id}>
                          <td><strong>{p.title}</strong></td>
                          <td>{p.duration}</td>
                          <td>{p.destinations}</td>
                          <td style={{ fontWeight: 700 }}>₹{p.price.toLocaleString('en-IN')}</td>
                          <td>
                            <button onClick={() => handleDeletePlan(p.id)} className="btn-action-icon btn-del-action" title="Delete">
                              <Trash2 size={16} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* TAB 4: VISITED GALLERY */}
            {activeTab === 'gallery' && (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                  <span style={{ fontSize: '0.9rem', color: '#475569' }}>
                    Past visited tour photos & customer reviews.
                  </span>
                  <button 
                    onClick={() => setShowAddGallery(!showAddGallery)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.4rem',
                      background: '#d84e55',
                      color: '#fff',
                      border: 'none',
                      padding: '0.55rem 1rem',
                      borderRadius: '8px',
                      fontSize: '0.85rem',
                      fontWeight: 700,
                      cursor: 'pointer'
                    }}
                  >
                    <Plus size={16} />
                    <span>Add Visited Photo</span>
                  </button>
                </div>

                {showAddGallery && (
                  <form onSubmit={handleAddGallery} style={{
                    background: '#f8fafc',
                    padding: '1.25rem',
                    borderRadius: '10px',
                    border: '1.5px dashed #cbd5e1',
                    marginBottom: '1.5rem'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                      <h4 style={{ margin: 0, fontWeight: 700 }}>Add Past Tour Photo</h4>
                      <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap' }}>
                        <span style={{ fontSize: '0.75rem', color: '#64748b', alignSelf: 'center' }}>Presets:</span>
                        <button
                          type="button"
                          onClick={() => setNewGallery({
                            title: 'Goa Coastal Roadtrip with Friends',
                            location: 'Goa, South India',
                            category: 'Beach',
                            image_url: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=800&q=80',
                            caption: 'Booked Innova Crysta for 5 days. Chauffeur was very polite and knew all best spots!',
                            traveler_name: 'Pooja & Friends, Pune',
                            rating: 5
                          })}
                          style={{ fontSize: '0.72rem', background: '#fff', border: '1px solid #cbd5e1', padding: '2px 8px', borderRadius: '12px', cursor: 'pointer' }}
                        >
                          + Goa Trip
                        </button>
                        <button
                          type="button"
                          onClick={() => setNewGallery({
                            title: 'Mahabaleshwar Family Vacation',
                            location: 'Mahabaleshwar, Maharashtra',
                            category: 'Hill Station',
                            image_url: 'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?auto=format&fit=crop&w=800&q=80',
                            caption: 'Clean sanitized Ertiga cab. Enjoyed strawberry farms and viewpoints with family.',
                            traveler_name: 'Deshmukh Family, Pune',
                            rating: 5
                          })}
                          style={{ fontSize: '0.72rem', background: '#fff', border: '1px solid #cbd5e1', padding: '2px 8px', borderRadius: '12px', cursor: 'pointer' }}
                        >
                          + Mahabaleshwar
                        </button>
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.75rem', marginBottom: '0.75rem' }}>
                      <div className="input-field-group">
                        <label>Tour Title</label>
                        <input type="text" value={newGallery.title} onChange={e => setNewGallery({ ...newGallery, title: e.target.value })} required placeholder="e.g. Goa Coastal Roadtrip" />
                      </div>
                      <div className="input-field-group">
                        <label>Location</label>
                        <input type="text" value={newGallery.location} onChange={e => setNewGallery({ ...newGallery, location: e.target.value })} required placeholder="e.g. Pune / Goa / Manali" />
                      </div>
                      <div className="input-field-group">
                        <label>Category</label>
                        <select value={newGallery.category} onChange={e => setNewGallery({ ...newGallery, category: e.target.value as any })}>
                          <option value="Heritage">Heritage</option>
                          <option value="Hill Station">Hill Station</option>
                          <option value="Beach">Beach</option>
                          <option value="Spiritual">Spiritual</option>
                          <option value="Wildlife">Wildlife</option>
                        </select>
                      </div>
                      <div className="input-field-group">
                        <label>Traveler / Group Name</label>
                        <input type="text" value={newGallery.traveler_name} onChange={e => setNewGallery({ ...newGallery, traveler_name: e.target.value })} placeholder="e.g. Sharma Family, Pune" />
                      </div>
                      <div className="input-field-group">
                        <label>Rating (1-5)</label>
                        <select value={newGallery.rating} onChange={e => setNewGallery({ ...newGallery, rating: Number(e.target.value) })}>
                          <option value={5}>⭐⭐⭐⭐⭐ 5 Stars</option>
                          <option value={4}>⭐⭐⭐⭐ 4 Stars</option>
                          <option value={3}>⭐⭐⭐ 3 Stars</option>
                        </select>
                      </div>
                    </div>

                    {/* Image URL or File Upload */}
                    <div style={{ background: '#fff', padding: '0.85rem', borderRadius: '8px', border: '1px solid #e2e8f0', marginBottom: '0.75rem' }}>
                      <label style={{ fontSize: '0.82rem', fontWeight: 700, display: 'block', marginBottom: '0.4rem' }}>
                        Tour Photo (Paste Web Link OR Upload From Device)
                      </label>
                      <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
                        <input 
                          type="text" 
                          value={newGallery.image_url} 
                          onChange={e => setNewGallery({ ...newGallery, image_url: e.target.value })} 
                          placeholder="https://... direct image URL or upload below"
                          style={{ flex: '1', minWidth: '220px', padding: '0.55rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.85rem' }}
                        />
                        <label style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.35rem',
                          background: '#1e293b',
                          color: '#fff',
                          padding: '0.55rem 0.9rem',
                          borderRadius: '6px',
                          fontSize: '0.82rem',
                          fontWeight: 600,
                          cursor: 'pointer'
                        }}>
                          <Upload size={14} />
                          <span>Upload File</span>
                          <input 
                            type="file" 
                            accept="image/*" 
                            onChange={handleGalleryImageUpload} 
                            style={{ display: 'none' }} 
                          />
                        </label>
                        {newGallery.image_url && (
                          <button 
                            type="button" 
                            onClick={() => setNewGallery({ ...newGallery, image_url: '' })}
                            style={{ background: '#fee2e2', color: '#991b1b', border: 'none', padding: '0.55rem 0.75rem', borderRadius: '6px', fontSize: '0.8rem', cursor: 'pointer', fontWeight: 600 }}
                          >
                            Clear
                          </button>
                        )}
                      </div>

                      {newGallery.image_url && (
                        <div style={{ marginTop: '0.65rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                          <img 
                            src={newGallery.image_url} 
                            alt="Preview" 
                            style={{ width: '80px', height: '55px', objectFit: 'cover', borderRadius: '6px', border: '1.5px solid #22c55e' }}
                            onError={(e) => { (e.target as HTMLImageElement).src = FALLBACK_TRAVEL_IMG; }}
                          />
                          <span style={{ fontSize: '0.78rem', color: '#15803d', fontWeight: 600 }}>✓ Image loaded & ready to save</span>
                        </div>
                      )}
                    </div>

                    <div className="input-field-group" style={{ marginBottom: '0.75rem' }}>
                      <label>Caption / Review</label>
                      <textarea 
                        value={newGallery.caption} 
                        onChange={e => setNewGallery({ ...newGallery, caption: e.target.value })} 
                        rows={2} 
                        placeholder="e.g. Booked Innova Crysta for 5 days. Excellent service!"
                        style={{ padding: '0.5rem', borderRadius: '6px', border: '1px solid #cbd5e1', width: '100%' }}
                      />
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button type="submit" style={{ background: '#059669', color: '#fff', border: 'none', padding: '0.55rem 1.25rem', borderRadius: '6px', fontWeight: 700, cursor: 'pointer' }}>
                        Save Photo
                      </button>
                      <button type="button" onClick={() => setShowAddGallery(false)} style={{ background: '#cbd5e1', border: 'none', padding: '0.55rem 1rem', borderRadius: '6px', cursor: 'pointer' }}>
                        Cancel
                      </button>
                    </div>
                  </form>
                )}

                <div className="admin-table-wrap">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Photo</th>
                        <th>Title</th>
                        <th>Location</th>
                        <th>Traveler</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {gallery.map(item => (
                        <tr key={item.id}>
                          <td>
                            <img 
                              src={item.image_url} 
                              alt={item.title} 
                              style={{ width: '48px', height: '48px', objectFit: 'cover', borderRadius: '6px' }} 
                              onError={(e) => { (e.target as HTMLImageElement).src = FALLBACK_TRAVEL_IMG; }}
                            />
                          </td>
                          <td><strong>{item.title}</strong></td>
                          <td>{item.location}</td>
                          <td>{item.traveler_name}</td>
                          <td>
                            <button onClick={() => handleDeleteGallery(item.id)} className="btn-action-icon btn-del-action">
                              <Trash2 size={16} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* TAB 5: ADMIN USERS (ADD & REMOVE ADMIN SYSTEM) */}
            {activeTab === 'admins' && (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                  <div>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Administrator Accounts</h3>
                    <p style={{ fontSize: '0.82rem', color: '#64748b' }}>
                      Add or remove administrator login accounts.
                    </p>
                  </div>

                  <button 
                    onClick={() => setShowAddAdmin(!showAddAdmin)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.4rem',
                      background: '#d84e55',
                      color: '#fff',
                      border: 'none',
                      padding: '0.55rem 1rem',
                      borderRadius: '8px',
                      fontSize: '0.85rem',
                      fontWeight: 700,
                      cursor: 'pointer'
                    }}
                  >
                    <Plus size={16} />
                    <span>Add New Admin</span>
                  </button>
                </div>

                {showAddAdmin && (
                  <form onSubmit={handleAddAdmin} style={{
                    background: '#f8fafc',
                    padding: '1.25rem',
                    borderRadius: '10px',
                    border: '1.5px dashed #cbd5e1',
                    marginBottom: '1.5rem'
                  }}>
                    <h4 style={{ marginBottom: '0.75rem', fontWeight: 700 }}>Create New Administrator</h4>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.75rem', marginBottom: '0.75rem' }}>
                      <div className="input-field-group">
                        <label>Admin Full Name</label>
                        <input type="text" value={newAdmin.name} onChange={e => setNewAdmin({ ...newAdmin, name: e.target.value })} required />
                      </div>
                      <div className="input-field-group">
                        <label>Login ID / Username</label>
                        <input type="text" value={newAdmin.username} onChange={e => setNewAdmin({ ...newAdmin, username: e.target.value })} required />
                      </div>
                      <div className="input-field-group">
                        <label>Password</label>
                        <input type="text" value={newAdmin.password} onChange={e => setNewAdmin({ ...newAdmin, password: e.target.value })} required />
                      </div>
                      <div className="input-field-group">
                        <label>Role</label>
                        <select value={newAdmin.role} onChange={e => setNewAdmin({ ...newAdmin, role: e.target.value as any })}>
                          <option value="operator">Operator</option>
                          <option value="super_admin">Super Administrator</option>
                        </select>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button type="submit" style={{ background: '#059669', color: '#fff', border: 'none', padding: '0.55rem 1.25rem', borderRadius: '6px', fontWeight: 700, cursor: 'pointer' }}>
                        Create Admin
                      </button>
                      <button type="button" onClick={() => setShowAddAdmin(false)} style={{ background: '#cbd5e1', border: 'none', padding: '0.55rem 1rem', borderRadius: '6px', cursor: 'pointer' }}>
                        Cancel
                      </button>
                    </div>
                  </form>
                )}

                <div className="admin-table-wrap">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Name</th>
                        <th>ID / Username</th>
                        <th>Role</th>
                        <th>Created</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {admins.map(adm => (
                        <tr key={adm.id}>
                          <td><strong>{adm.name}</strong></td>
                          <td><code>{adm.username}</code></td>
                          <td>
                            <span style={{ fontSize: '0.75rem', fontWeight: 700, background: '#fef3c7', color: '#92400e', padding: '2px 8px', borderRadius: '12px' }}>
                              {adm.role}
                            </span>
                          </td>
                          <td style={{ fontSize: '0.78rem', color: '#64748b' }}>
                            {new Date(adm.created_at).toLocaleDateString()}
                          </td>
                          <td>
                            {admins.length > 1 ? (
                              <button onClick={() => handleRemoveAdmin(adm.id, adm.username)} className="btn-action-icon btn-del-action">
                                <Trash2 size={16} />
                              </button>
                            ) : (
                              <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Primary Admin</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* TAB 6: ACTIVITY AUDIT LOG */}
            {activeTab === 'activities' && (
              <div>
                <div style={{ marginBottom: '1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Activity Audit Trail</h3>
                    <p style={{ fontSize: '0.82rem', color: '#64748b' }}>
                      Security audit logging: tracks user logins, trip submissions, status updates, and administrative changes.
                    </p>
                  </div>
                  <button 
                    onClick={loadAllData}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.35rem',
                      background: '#f1f5f9',
                      border: '1px solid #cbd5e1',
                      padding: '0.4rem 0.8rem',
                      borderRadius: '6px',
                      fontSize: '0.8rem',
                      cursor: 'pointer'
                    }}
                  >
                    <Clock size={14} />
                    <span>Refresh Logs</span>
                  </button>
                </div>

                <div className="admin-table-wrap">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Time</th>
                        <th>User / Admin</th>
                        <th>Role</th>
                        <th>Action Type</th>
                        <th>Activity Description</th>
                      </tr>
                    </thead>
                    <tbody>
                      {auditLogs.length === 0 ? (
                        <tr>
                          <td colSpan={5} style={{ textAlign: 'center', padding: '2rem', color: '#94a3b8' }}>
                            No activities logged yet.
                          </td>
                        </tr>
                      ) : (
                        auditLogs.map(log => (
                          <tr key={log.id}>
                            <td style={{ fontSize: '0.78rem', color: '#64748b', whiteSpace: 'nowrap' }}>
                              {new Date(log.timestamp).toLocaleString('en-IN', {
                                day: '2-digit',
                                month: 'short',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </td>
                            <td>
                              <strong>{log.user_identifier}</strong>
                            </td>
                            <td>
                              <span style={{
                                fontSize: '0.72rem',
                                fontWeight: 700,
                                background: log.role === 'admin' ? '#fef3c7' : '#e0e7ff',
                                color: log.role === 'admin' ? '#92400e' : '#3730a3',
                                padding: '2px 8px',
                                borderRadius: '10px'
                              }}>
                                {log.role}
                              </span>
                            </td>
                            <td>
                              <span style={{ fontSize: '0.75rem', background: '#f1f5f9', padding: '2px 6px', borderRadius: '4px', fontFamily: 'monospace' }}>
                                {log.action_type}
                              </span>
                            </td>
                            <td style={{ fontSize: '0.84rem' }}>
                              {log.description}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* TAB: POPULAR TOUR CORRIDORS (ADMIN MANAGEABLE) */}
            {activeTab === 'corridors' && (
              <div>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  flexWrap: 'wrap',
                  gap: '1rem',
                  marginBottom: '1.25rem',
                  paddingBottom: '1rem',
                  borderBottom: '1px solid #e2e8f0'
                }}>
                  <div>
                    <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                      <Navigation size={20} color="#d84e55" />
                      <span>Popular Tour Corridors (Changeable by Admin)</span>
                    </h3>
                    <p style={{ fontSize: '0.86rem', color: '#64748b', maxWidth: '650px', lineHeight: 1.5 }}>
                      These routes are displayed on the public website in the footer under <strong>"Popular Tour Corridors"</strong>. 
                      Clicking any route pre-selects the destination and takes travelers straight to the booking calculator!
                    </p>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                    <button
                      type="button"
                      onClick={handleResetCorridors}
                      style={{
                        padding: '0.55rem 0.9rem',
                        fontSize: '0.82rem',
                        fontWeight: 600,
                        color: '#64748b',
                        background: '#f8fafc',
                        border: '1px solid #cbd5e1',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.35rem'
                      }}
                      title="Reset routes to default list"
                    >
                      <RotateCcw size={14} />
                      <span>Reset Defaults</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleSaveCorridors}
                      disabled={savingCorridors}
                      style={{
                        padding: '0.6rem 1.25rem',
                        fontSize: '0.88rem',
                        fontWeight: 700,
                        color: '#fff',
                        background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                        border: 'none',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.4rem',
                        boxShadow: '0 4px 12px rgba(16, 185, 129, 0.28)'
                      }}
                    >
                      <CheckCircle size={16} />
                      <span>{savingCorridors ? 'Saving Changes...' : 'Save & Publish Corridors'}</span>
                    </button>
                  </div>
                </div>

                {/* Status Message */}
                {corridorSaveMsg && (
                  <div style={{
                    padding: '0.75rem 1rem',
                    borderRadius: '8px',
                    marginBottom: '1rem',
                    fontSize: '0.9rem',
                    fontWeight: 700,
                    background: corridorSaveMsg.startsWith('✅') ? '#ecfdf5' : '#fef2f2',
                    color: corridorSaveMsg.startsWith('✅') ? '#065f46' : '#991b1b',
                    border: `1px solid ${corridorSaveMsg.startsWith('✅') ? '#a7f3d0' : '#fecaca'}`
                  }}>
                    {corridorSaveMsg}
                  </div>
                )}

                {/* Quick Add Presets */}
                <div style={{
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: '12px',
                  padding: '1rem 1.2rem',
                  marginBottom: '1.25rem'
                }}>
                  <div style={{ fontSize: '0.82rem', fontWeight: 700, textTransform: 'uppercase', color: '#64748b', letterSpacing: '0.04em', marginBottom: '0.6rem' }}>
                    ⚡ 1-Click Quick Add Popular Routes
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.45rem' }}>
                    {[
                      { label: 'Pune ➔ Mahabaleshwar Weekend', dest: 'Mahabaleshwar' },
                      { label: 'Pune ➔ Shirdi Pilgrimage', dest: 'Shirdi' },
                      { label: 'Pune ➔ Lonavala & Khandala', dest: 'Lonavala' },
                      { label: 'Pune ➔ Goa Coastal Drive', dest: 'Goa' },
                      { label: 'Pune ➔ Alibaug Beach Escape', dest: 'Alibaug' },
                      { label: 'Pune ➔ Nashik & Trimbakeshwar', dest: 'Nashik' },
                      { label: 'Pune ➔ Lavasa Hill City', dest: 'Lavasa' },
                      { label: 'Pune ➔ Bhimashankar Jyotirlinga', dest: 'Bhimashankar' },
                      { label: 'Pune ➔ Mumbai Airport Transfer', dest: 'Mumbai' },
                      { label: 'Pune ➔ Jaipur Pink City', dest: 'Jaipur' },
                      { label: 'Pune ➔ Agra Taj Mahal Express', dest: 'Agra' },
                      { label: 'Pune ➔ Manali Snow Tour', dest: 'Manali' }
                    ].map(p => (
                      <button
                        key={p.dest}
                        type="button"
                        onClick={() => handleQuickAddCorridor(p.label, p.dest)}
                        style={{
                          background: '#fff',
                          border: '1px solid #cbd5e1',
                          padding: '0.35rem 0.65rem',
                          borderRadius: '20px',
                          fontSize: '0.78rem',
                          color: '#334155',
                          cursor: 'pointer',
                          fontWeight: 600,
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.3rem',
                          transition: 'all 0.15s ease'
                        }}
                        onMouseEnter={e => {
                          e.currentTarget.style.borderColor = '#d84e55';
                          e.currentTarget.style.color = '#d84e55';
                        }}
                        onMouseLeave={e => {
                          e.currentTarget.style.borderColor = '#cbd5e1';
                          e.currentTarget.style.color = '#334155';
                        }}
                      >
                        <Plus size={12} color="#d84e55" />
                        <span>{p.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Add Custom Corridor Form */}
                <form 
                  onSubmit={handleAddCorridor}
                  style={{
                    background: '#fff',
                    border: '1.5px dashed #cbd5e1',
                    borderRadius: '12px',
                    padding: '1.1rem 1.25rem',
                    marginBottom: '1.5rem'
                  }}
                >
                  <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#1e293b', marginBottom: '0.75rem' }}>
                    + Add New Custom Route Corridor
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr auto', gap: '0.75rem', alignItems: 'flex-end' }}>
                    <div className="input-field-group" style={{ margin: 0 }}>
                      <label style={{ fontSize: '0.8rem' }}>Route Display Title (e.g. Pune ➔ Kolhapur Mahalaxmi)</label>
                      <input 
                        type="text" 
                        placeholder="e.g. Pune ➔ Kolhapur Mahalaxmi"
                        value={newCorridorLabel}
                        onChange={e => setNewCorridorLabel(e.target.value)}
                        required
                        style={{ padding: '0.65rem 0.85rem' }}
                      />
                    </div>

                    <div className="input-field-group" style={{ margin: 0 }}>
                      <label style={{ fontSize: '0.8rem' }}>Destination City (Filter key)</label>
                      <input 
                        type="text" 
                        placeholder="e.g. Kolhapur"
                        value={newCorridorDest}
                        onChange={e => setNewCorridorDest(e.target.value)}
                        required
                        style={{ padding: '0.65rem 0.85rem' }}
                      />
                    </div>

                    <button
                      type="submit"
                      style={{
                        padding: '0.65rem 1.2rem',
                        fontSize: '0.85rem',
                        fontWeight: 700,
                        color: '#fff',
                        background: '#d84e55',
                        border: 'none',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        whiteSpace: 'nowrap',
                        height: '42px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.35rem'
                      }}
                    >
                      <Plus size={16} />
                      <span>Add Route</span>
                    </button>
                  </div>
                </form>

                {/* Current Corridors List */}
                <div style={{ marginBottom: '1.25rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                    <h4 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#1e293b' }}>
                      Active Live Corridors ({corridors.length})
                    </h4>
                    <span style={{ fontSize: '0.78rem', color: '#64748b' }}>
                      Use ↑ ↓ arrows to reorder how they appear in the footer
                    </span>
                  </div>

                  {corridors.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '2rem', background: '#f8fafc', borderRadius: '10px', color: '#64748b' }}>
                      No tour corridors added yet. Click any quick preset above or add a custom route!
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      {corridors.map((c, idx) => (
                        <div
                          key={c.id}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            padding: '0.75rem 1rem',
                            background: '#fff',
                            border: '1px solid #e2e8f0',
                            borderRadius: '10px',
                            boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
                            transition: 'border-color 0.15s ease'
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', flex: 1, minWidth: 0 }}>
                            <span style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              width: '24px',
                              height: '24px',
                              borderRadius: '6px',
                              background: '#f1f5f9',
                              color: '#64748b',
                              fontSize: '0.75rem',
                              fontWeight: 800,
                              flexShrink: 0
                            }}>
                              {idx + 1}
                            </span>

                            <div style={{ minWidth: 0 }}>
                              <div style={{ fontWeight: 700, color: '#1e293b', fontSize: '0.92rem', wordBreak: 'break-word' }}>
                                {c.label}
                              </div>
                              <div style={{ fontSize: '0.75rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '0.25rem', marginTop: '2px' }}>
                                <MapPin size={11} color="#d84e55" />
                                <span>Destination: <strong style={{ color: '#0f172a' }}>{c.destination}</strong></span>
                              </div>
                            </div>
                          </div>

                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', flexShrink: 0 }}>
                            <button
                              type="button"
                              onClick={() => handleMoveCorridor(idx, 'up')}
                              disabled={idx === 0}
                              style={{
                                border: '1px solid #e2e8f0',
                                background: idx === 0 ? '#f8fafc' : '#fff',
                                color: idx === 0 ? '#cbd5e1' : '#475569',
                                width: '28px',
                                height: '28px',
                                borderRadius: '6px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                cursor: idx === 0 ? 'not-allowed' : 'pointer'
                              }}
                              title="Move up"
                            >
                              <ArrowUp size={14} />
                            </button>

                            <button
                              type="button"
                              onClick={() => handleMoveCorridor(idx, 'down')}
                              disabled={idx === corridors.length - 1}
                              style={{
                                border: '1px solid #e2e8f0',
                                background: idx === corridors.length - 1 ? '#f8fafc' : '#fff',
                                color: idx === corridors.length - 1 ? '#cbd5e1' : '#475569',
                                width: '28px',
                                height: '28px',
                                borderRadius: '6px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                cursor: idx === corridors.length - 1 ? 'not-allowed' : 'pointer'
                              }}
                              title="Move down"
                            >
                              <ArrowDown size={14} />
                            </button>

                            <button
                              type="button"
                              onClick={() => handleDeleteCorridor(c.id)}
                              style={{
                                border: '1px solid #fecaca',
                                background: '#fff5f5',
                                color: '#dc2626',
                                width: '28px',
                                height: '28px',
                                borderRadius: '6px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                cursor: 'pointer',
                                marginLeft: '0.25rem'
                              }}
                              title="Delete route"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {corridors.length > 3 && (
                  <div style={{ textAlign: 'right', marginTop: '1rem' }}>
                    <button
                      type="button"
                      onClick={handleSaveCorridors}
                      disabled={savingCorridors}
                      style={{
                        padding: '0.65rem 1.5rem',
                        fontSize: '0.9rem',
                        fontWeight: 700,
                        color: '#fff',
                        background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                        border: 'none',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.4rem',
                        boxShadow: '0 4px 12px rgba(16, 185, 129, 0.28)'
                      }}
                    >
                      <CheckCircle size={16} />
                      <span>{savingCorridors ? 'Saving Changes...' : 'Save & Publish Corridors'}</span>
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* TAB: POPULAR DESTINATIONS (ADMIN MANAGEABLE) */}
            {activeTab === 'destinations' && (
              <div>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  flexWrap: 'wrap',
                  gap: '1rem',
                  marginBottom: '1.25rem',
                  paddingBottom: '1rem',
                  borderBottom: '1px solid #e2e8f0'
                }}>
                  <div>
                    <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                      <MapPin size={20} color="#d84e55" />
                      <span>Popular Destinations: Options (Changeable by Admin)</span>
                    </h3>
                    <p style={{ fontSize: '0.86rem', color: '#64748b', maxWidth: '680px', lineHeight: 1.5 }}>
                      These interactive destination pills appear right under the booking calculator next to <strong>"Popular Destinations:"</strong>. 
                      Clicking any pill immediately pre-selects the drop location for instant booking calculation!
                    </p>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                    <button
                      type="button"
                      onClick={handleResetDestinations}
                      style={{
                        padding: '0.55rem 0.9rem',
                        fontSize: '0.82rem',
                        fontWeight: 600,
                        color: '#64748b',
                        background: '#f8fafc',
                        border: '1px solid #cbd5e1',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.35rem'
                      }}
                      title="Reset destinations to default list"
                    >
                      <RotateCcw size={14} />
                      <span>Reset Defaults</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleSaveDestinations}
                      disabled={savingDest}
                      style={{
                        padding: '0.6rem 1.25rem',
                        fontSize: '0.88rem',
                        fontWeight: 700,
                        color: '#fff',
                        background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                        border: 'none',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.4rem',
                        boxShadow: '0 4px 12px rgba(16, 185, 129, 0.28)'
                      }}
                    >
                      <CheckCircle size={16} />
                      <span>{savingDest ? 'Saving...' : 'Save & Publish Destinations'}</span>
                    </button>
                  </div>
                </div>

                {/* Status Message */}
                {destSaveMsg && (
                  <div style={{
                    padding: '0.75rem 1rem',
                    borderRadius: '8px',
                    marginBottom: '1rem',
                    fontSize: '0.9rem',
                    fontWeight: 700,
                    background: destSaveMsg.startsWith('✅') ? '#ecfdf5' : '#fef2f2',
                    color: destSaveMsg.startsWith('✅') ? '#065f46' : '#991b1b',
                    border: `1px solid ${destSaveMsg.startsWith('✅') ? '#a7f3d0' : '#fecaca'}`
                  }}>
                    {destSaveMsg}
                  </div>
                )}

                {/* 1-Click Quick Add Presets */}
                <div style={{
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: '12px',
                  padding: '1rem 1.2rem',
                  marginBottom: '1.25rem'
                }}>
                  <div style={{ fontSize: '0.82rem', fontWeight: 700, textTransform: 'uppercase', color: '#64748b', letterSpacing: '0.04em', marginBottom: '0.6rem' }}>
                    ⚡ 1-Click Quick Add Popular Tourist Cities
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                    {[
                      'Pune', 'Goa', 'Mahabaleshwar', 'Lonavala', 'Shirdi', 
                      'Alibaug', 'Nashik', 'Lavasa', 'Bhimashankar', 'Mumbai', 
                      'Jaipur', 'Agra', 'Manali', 'Udaipur', 'Rishikesh', 
                      'Kerala', 'Ooty', 'Varanasi', 'Kolkata', 'Hyderabad', 'Bangalore'
                    ].map(city => {
                      const isAdded = popularDestinations.some(d => d.toLowerCase() === city.toLowerCase());
                      return (
                        <button
                          key={city}
                          type="button"
                          onClick={() => {
                            if (isAdded) {
                              handleRemoveDestination(city);
                            } else {
                              handleAddDestination(city);
                            }
                          }}
                          style={{
                            background: isAdded ? '#dcfce7' : '#fff',
                            border: `1px solid ${isAdded ? '#86efac' : '#cbd5e1'}`,
                            padding: '0.35rem 0.65rem',
                            borderRadius: '20px',
                            fontSize: '0.78rem',
                            color: isAdded ? '#166534' : '#334155',
                            cursor: 'pointer',
                            fontWeight: 600,
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.3rem',
                            transition: 'all 0.15s ease'
                          }}
                          title={isAdded ? 'Click to remove' : 'Click to add'}
                        >
                          {isAdded ? <Check size={12} color="#16a34a" /> : <Plus size={12} color="#d84e55" />}
                          <span>{city}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Add Custom Destination Form */}
                <form 
                  onSubmit={e => {
                    e.preventDefault();
                    handleAddDestination(newDestinationInput);
                  }}
                  style={{
                    background: '#fff',
                    border: '1.5px dashed #cbd5e1',
                    borderRadius: '12px',
                    padding: '1.1rem 1.25rem',
                    marginBottom: '1.5rem'
                  }}
                >
                  <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#1e293b', marginBottom: '0.75rem' }}>
                    + Add New Custom Destination Option
                  </div>
                  <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                    <div style={{ flex: 1 }}>
                      <input 
                        type="text" 
                        placeholder="e.g. Kolhapur, Panchgani, Matheran, Amritsar..."
                        value={newDestinationInput}
                        onChange={e => setNewDestinationInput(e.target.value)}
                        style={{
                          width: '100%',
                          padding: '0.65rem 0.85rem',
                          border: '1.5px solid #e2e8f0',
                          borderRadius: '8px',
                          fontSize: '0.9rem',
                          outline: 'none'
                        }}
                      />
                    </div>

                    <button
                      type="submit"
                      style={{
                        padding: '0.65rem 1.25rem',
                        fontSize: '0.85rem',
                        fontWeight: 700,
                        color: '#fff',
                        background: '#d84e55',
                        border: 'none',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        whiteSpace: 'nowrap',
                        height: '42px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.35rem'
                      }}
                    >
                      <Plus size={16} />
                      <span>Add Destination</span>
                    </button>
                  </div>
                </form>

                {/* Active Destinations Chips & Reordering */}
                <div style={{ marginBottom: '1.5rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                    <h4 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#1e293b' }}>
                      Active Live Destination Options ({popularDestinations.length})
                    </h4>
                    <span style={{ fontSize: '0.78rem', color: '#64748b' }}>
                      Use ← → buttons to reorder how they appear to travelers
                    </span>
                  </div>

                  {popularDestinations.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '2rem', background: '#f8fafc', borderRadius: '10px', color: '#64748b' }}>
                      No destinations added yet. Click any quick preset above or add a city!
                    </div>
                  ) : (
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
                      gap: '0.6rem'
                    }}>
                      {popularDestinations.map((city, idx) => (
                        <div
                          key={city}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            padding: '0.6rem 0.85rem',
                            background: '#fff',
                            border: '1px solid #e2e8f0',
                            borderRadius: '10px',
                            boxShadow: '0 1px 3px rgba(0,0,0,0.03)'
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', minWidth: 0 }}>
                            <span style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              width: '20px',
                              height: '20px',
                              borderRadius: '5px',
                              background: '#f1f5f9',
                              color: '#64748b',
                              fontSize: '0.72rem',
                              fontWeight: 800,
                              flexShrink: 0
                            }}>
                              {idx + 1}
                            </span>
                            <span style={{ fontWeight: 700, color: '#1e293b', fontSize: '0.88rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {city}
                            </span>
                          </div>

                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.2rem', flexShrink: 0 }}>
                            <button
                              type="button"
                              onClick={() => handleMoveDestination(idx, 'left')}
                              disabled={idx === 0}
                              style={{
                                border: '1px solid #e2e8f0',
                                background: idx === 0 ? '#f8fafc' : '#fff',
                                color: idx === 0 ? '#cbd5e1' : '#475569',
                                width: '24px',
                                height: '24px',
                                borderRadius: '5px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                cursor: idx === 0 ? 'not-allowed' : 'pointer',
                                fontSize: '0.75rem',
                                padding: 0
                              }}
                              title="Move backward"
                            >
                              ←
                            </button>

                            <button
                              type="button"
                              onClick={() => handleMoveDestination(idx, 'right')}
                              disabled={idx === popularDestinations.length - 1}
                              style={{
                                border: '1px solid #e2e8f0',
                                background: idx === popularDestinations.length - 1 ? '#f8fafc' : '#fff',
                                color: idx === popularDestinations.length - 1 ? '#cbd5e1' : '#475569',
                                width: '24px',
                                height: '24px',
                                borderRadius: '5px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                cursor: idx === popularDestinations.length - 1 ? 'not-allowed' : 'pointer',
                                fontSize: '0.75rem',
                                padding: 0
                              }}
                              title="Move forward"
                            >
                              →
                            </button>

                            <button
                              type="button"
                              onClick={() => handleRemoveDestination(city)}
                              style={{
                                border: '1px solid #fecaca',
                                background: '#fff5f5',
                                color: '#dc2626',
                                width: '24px',
                                height: '24px',
                                borderRadius: '5px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                cursor: 'pointer',
                                marginLeft: '0.2rem'
                              }}
                              title={`Remove ${city}`}
                            >
                              <X size={12} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* LIVE PREVIEW OF HOW IT LOOKS ON WEBSITE */}
                <div style={{
                  background: '#f8fafc',
                  border: '1.5px solid #e2e8f0',
                  borderRadius: '12px',
                  padding: '1.1rem 1.25rem',
                  marginBottom: '1.25rem'
                }}>
                  <div style={{ fontSize: '0.8rem', fontWeight: 800, textTransform: 'uppercase', color: '#d84e55', letterSpacing: '0.04em', marginBottom: '0.6rem' }}>
                    👁️ Live Website Preview:
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                    <span style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 600 }}>Popular Destinations:</span>
                    {popularDestinations.map(city => (
                      <span
                        key={city}
                        style={{
                          background: '#f1f5f9',
                          color: '#334155',
                          border: 'none',
                          padding: '3px 10px',
                          borderRadius: '20px',
                          fontSize: '0.78rem',
                          fontWeight: 600,
                          display: 'inline-block'
                        }}
                      >
                        {city}
                      </span>
                    ))}
                  </div>
                </div>

                <div style={{ textAlign: 'right', marginTop: '1rem' }}>
                  <button
                    type="button"
                    onClick={handleSaveDestinations}
                    disabled={savingDest}
                    style={{
                      padding: '0.65rem 1.5rem',
                      fontSize: '0.9rem',
                      fontWeight: 700,
                      color: '#fff',
                      background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                      border: 'none',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.4rem',
                      boxShadow: '0 4px 12px rgba(16, 185, 129, 0.28)'
                    }}
                  >
                    <CheckCircle size={16} />
                    <span>{savingDest ? 'Saving...' : 'Save & Publish Destinations'}</span>
                  </button>
                </div>
              </div>
            )}

            {/* TAB 7: SETTINGS */}
            {activeTab === 'settings' && (
              <form onSubmit={handleSaveSettings} style={{ maxWidth: '650px' }}>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '1rem' }}>
                  Business Contact & Counters
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                  <div className="input-field-group">
                    <label>WhatsApp Number</label>
                    <input type="text" value={settingsForm.whatsapp_number} onChange={e => setSettingsForm({ ...settingsForm, whatsapp_number: e.target.value })} required />
                  </div>
                  <div className="input-field-group">
                    <label>Phone Number</label>
                    <input type="text" value={settingsForm.call_number} onChange={e => setSettingsForm({ ...settingsForm, call_number: e.target.value })} required />
                  </div>
                  <div className="input-field-group">
                    <label>Email</label>
                    <input type="email" value={settingsForm.email} onChange={e => setSettingsForm({ ...settingsForm, email: e.target.value })} />
                  </div>
                  <div className="input-field-group">
                    <label>Brand Name</label>
                    <input type="text" value={settingsForm.company_name} onChange={e => setSettingsForm({ ...settingsForm, company_name: e.target.value })} />
                  </div>
                  <div className="input-field-group">
                    <label>Completed Trips Counter</label>
                    <input type="number" value={settingsForm.total_trips} onChange={e => setSettingsForm({ ...settingsForm, total_trips: Number(e.target.value) })} />
                  </div>
                  <div className="input-field-group">
                    <label>Destinations Counter</label>
                    <input type="number" value={settingsForm.destinations_covered} onChange={e => setSettingsForm({ ...settingsForm, destinations_covered: Number(e.target.value) })} />
                  </div>
                </div>
                <button type="submit" className="btn-submit-inquiry" style={{ padding: '0.75rem 1.5rem', width: 'auto' }}>
                  Save Settings
                </button>
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
