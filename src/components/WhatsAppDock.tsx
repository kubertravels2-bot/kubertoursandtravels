import { MessageCircle } from 'lucide-react';
import { SiteSettings } from '../types';
import { securityService } from '../services/security';

interface WhatsAppDockProps {
  settings: SiteSettings;
}

export const WhatsAppDock: React.FC<WhatsAppDockProps> = ({ settings }) => {
  const whatsappUrl = securityService.buildSecureWhatsAppUrl(settings.whatsapp_number, 'Hi');

  return (
    <div className="floating-whatsapp-dock">
      <a 
        href={whatsappUrl} 
        target="_blank" 
        rel="noopener noreferrer"
        className="whatsapp-pulse-btn"
        title="Chat on WhatsApp"
      >
        <MessageCircle size={22} />
        <span>Instant WhatsApp Quote</span>
      </a>
    </div>
  );
};
