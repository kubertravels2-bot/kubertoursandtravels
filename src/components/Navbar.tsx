import React, { useState } from 'react';
import { Compass, Phone, Shield, MessageCircle, Menu, X } from 'lucide-react';
import { SiteSettings, User } from '../types';
import { securityService } from '../services/security';

interface NavbarProps {
  settings: SiteSettings;
  currentUser: User | null;
  onOpenAdmin: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  settings,
  currentUser,
  onOpenAdmin
}) => {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav className="navbar">
      <div className="nav-container">
        <div className="brand-logo" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
          <div className="brand-icon-box">
            <Compass size={26} strokeWidth={2.4} />
          </div>
          <div>
            <div className="brand-name">
              Kuber<span>Tours</span>
              <span className="brand-badge">and Travels</span>
            </div>
          </div>
        </div>

        {/* Desktop Nav Links */}
        <div className="nav-links">
          <a href="#plan-trip" className="nav-link">Book Tour / Cab</a>
          <a href="#nearby-sites" className="nav-link">Sightseeing Places</a>
          <a href="#tour-packages" className="nav-link">Tour Packages</a>
          <a href="#past-tours" className="nav-link">Past Tours & Gallery</a>
        </div>

        <div className="nav-actions">
          <a 
            href={securityService.buildSecureWhatsAppUrl(settings.whatsapp_number, 'Hi')} 
            target="_blank" 
            rel="noopener noreferrer"
            className="btn-whatsapp-nav"
            title="Chat directly on WhatsApp"
          >
            <MessageCircle size={17} />
            <span>WhatsApp</span>
          </a>

          {/* Admin Button - always visible */}
          <button 
            onClick={onOpenAdmin} 
            className="btn-admin-nav"
            title="Admin Portal"
          >
            <Shield size={16} />
            <span>{currentUser?.role === 'admin' ? 'Dashboard' : 'Admin'}</span>
          </button>

          {/* Mobile hamburger */}
          <button
            className="nav-hamburger"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
          >
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile Dropdown Menu */}
      {menuOpen && (
        <div className="nav-mobile-menu">
          <a href="#plan-trip" className="nav-link" onClick={() => setMenuOpen(false)}>Book Tour / Cab</a>
          <a href="#nearby-sites" className="nav-link" onClick={() => setMenuOpen(false)}>Sightseeing Places</a>
          <a href="#tour-packages" className="nav-link" onClick={() => setMenuOpen(false)}>Tour Packages</a>
          <a href="#past-tours" className="nav-link" onClick={() => setMenuOpen(false)}>Past Tours & Gallery</a>
          <a 
            href={securityService.buildSecureWhatsAppUrl(settings.whatsapp_number, 'Hi')} 
            target="_blank" 
            rel="noopener noreferrer"
            className="nav-link"
            style={{ color: '#25d366', fontWeight: 700 }}
            onClick={() => setMenuOpen(false)}
          >
            💬 WhatsApp Us
          </a>
        </div>
      )}
    </nav>
  );
};
