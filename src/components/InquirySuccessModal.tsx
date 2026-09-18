import React, { useEffect } from 'react';
import { Inquiry, SiteSettings } from '../types';
import { CheckCircle2, MessageCircle, X } from 'lucide-react';
import confetti from 'canvas-confetti';
import { securityService } from '../services/security';

interface InquirySuccessModalProps {
  inquiry: Inquiry | null;
  settings: SiteSettings;
  onClose: () => void;
}

export const InquirySuccessModal: React.FC<InquirySuccessModalProps> = ({
  inquiry,
  settings,
  onClose
}) => {
  useEffect(() => {
    if (inquiry) {
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 }
        });
      } catch (err) {
        // Safe fallback
      }
    }
  }, [inquiry]);

  if (!inquiry) return null;

  // Clean WhatsApp message without security seal / technical codes
  const safeMessage = 
    `Hi 🚗\n` +
    `I have submitted a trip request on your website Kuber Tours and Travels:\n\n` +
    `📍 Route: ${inquiry.pickup_location} ➔ ${inquiry.drop_location}\n` +
    `📅 Date & Time: ${inquiry.travel_date} (${inquiry.travel_time || 'Morning'})\n` +
    `🎯 Purpose: ${inquiry.travel_reason}\n` +
    `👥 Passengers: ${inquiry.passengers_count} Persons\n` +
    `🚘 Vehicle: ${inquiry.car_type}\n` +
    `👤 Customer: ${inquiry.customer_name}\n` +
    `📱 Phone: ${inquiry.customer_phone}\n` +
    (inquiry.notes ? `📝 Note: ${inquiry.notes}\n` : '') +
    `\nPlease share the best price quote and driver confirmation. Thank you!`;

  // Programmatic launcher sends via secure WhatsApp API
  const handleSendWhatsApp = () => {
    securityService.openSecureWhatsApp(settings.whatsapp_number, safeMessage);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <button className="modal-close-btn" onClick={onClose}>
          <X size={18} />
        </button>

        <div style={{ textAlign: 'center', marginBottom: '1.25rem' }}>
          <div style={{
            width: '60px',
            height: '60px',
            background: '#dcfce7',
            color: '#16a34a',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 0.75rem'
          }}>
            <CheckCircle2 size={36} />
          </div>
          <h3 style={{ fontSize: '1.45rem', fontWeight: 800, color: '#0f172a' }}>
            Trip Inquiry Received!
          </h3>
          <p style={{ color: '#64748b', fontSize: '0.9rem' }}>
            The website owner and tour coordinator will contact you shortly on <strong>+91 {inquiry.customer_phone}</strong>.
          </p>
        </div>

        {/* SUMMARY TICKET */}
        <div className="ticket-container">
          <div className="ticket-header">
            <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#d84e55', textTransform: 'uppercase' }}>
              Kuber Tours Ticket #{inquiry.id.substring(0, 8).toUpperCase()}
            </span>
            <span className="badge-status New">Pending Confirmation</span>
          </div>

          <div className="ticket-row">
            <span className="ticket-row-label">Route</span>
            <span className="ticket-row-val">{inquiry.pickup_location} ➔ {inquiry.drop_location}</span>
          </div>

          <div className="ticket-row">
            <span className="ticket-row-label">Date & Time</span>
            <span className="ticket-row-val">{inquiry.travel_date} • {inquiry.travel_time}</span>
          </div>

          <div className="ticket-row">
            <span className="ticket-row-label">Travel Reason</span>
            <span className="ticket-row-val">{inquiry.travel_reason}</span>
          </div>

          <div className="ticket-row">
            <span className="ticket-row-label">Passengers & Vehicle</span>
            <span className="ticket-row-val">{inquiry.passengers_count} People • {inquiry.car_type}</span>
          </div>

          <div className="ticket-row" style={{ borderTop: '1px solid #e7e5e4', paddingTop: '0.5rem', marginTop: '0.5rem' }}>
            <span className="ticket-row-label">Customer Contact</span>
            <span className="ticket-row-val">{inquiry.customer_name} ({inquiry.customer_phone})</span>
          </div>
        </div>

        {/* DIRECT SECURE WHATSAPP ACTION BUTTON */}
        <button 
          type="button"
          onClick={handleSendWhatsApp}
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.65rem',
            background: 'linear-gradient(135deg, #25d366 0%, #128c7e 100%)',
            color: '#fff',
            padding: '0.95rem 1.25rem',
            borderRadius: '12px',
            fontSize: '1.02rem',
            fontWeight: 700,
            border: 'none',
            cursor: 'pointer',
            boxShadow: '0 8px 20px rgba(37, 211, 102, 0.35)',
            marginBottom: '0.75rem',
            transition: 'all 0.2s ease'
          }}
        >
          <MessageCircle size={22} />
          <span>Send Inquiry Directly on WhatsApp</span>
        </button>

        <div style={{ textAlign: 'center' }}>
          <button 
            type="button" 
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#64748b',
              fontSize: '0.88rem',
              fontWeight: 600,
              cursor: 'pointer',
              padding: '0.5rem'
            }}
          >
            Close & Continue Browsing
          </button>
        </div>
      </div>
    </div>
  );
};
