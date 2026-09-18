export type TravelReason = 
  | 'Family Vacation'
  | 'Holiday Trip'
  | 'Business'
  | 'Site Visit'
  | 'Pilgrimage'
  | 'Wedding'
  | 'Other';

export type CarCategory = 
  | 'Hatchback (WagonR / Swift)'
  | 'Sedan (Dzire / Etios)'
  | 'SUV (Ertiga / Carens)'
  | 'Innova Crysta (Premium SUV)'
  | 'Tempo Traveller (12-20 Seater)'
  | 'Luxury (BMW / Audi / Mercedes)';

export type UserRole = 'customer' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  created_at: string;
}

export interface ActivityLog {
  id: string;
  user_id: string;
  user_identifier: string; // email or phone or username
  role: UserRole;
  action_type: 
    | 'USER_LOGIN' 
    | 'USER_SIGNUP' 
    | 'TRIP_INQUIRY_SUBMITTED' 
    | 'PASSWORD_RESET' 
    | 'STATUS_CHANGE' 
    | 'SITE_ADDED' 
    | 'SITE_DELETED'
    | 'TOUR_PLAN_ADDED' 
    | 'TOUR_PLAN_DELETED'
    | 'GALLERY_ADDED' 
    | 'GALLERY_DELETED'
    | 'ADMIN_ADDED' 
    | 'ADMIN_REMOVED' 
    | 'SETTINGS_UPDATED';
  description: string;
  timestamp: string;
}

export interface OTPRecord {
  id: string;
  identifier: string; // phone or email
  code: string;
  expires_at: number;
  purpose: 'login' | 'forgot_password';
}

export interface Inquiry {
  id: string;
  created_at: string;
  user_id?: string;
  customer_name: string;
  customer_phone: string;
  customer_email?: string;
  pickup_location: string;
  drop_location: string;
  travel_date: string;
  travel_time?: string;
  travel_reason: TravelReason;
  passengers_count: number;
  car_type: CarCategory;
  notes?: string;
  status: 'New' | 'Contacted' | 'Quoted' | 'Booked' | 'Completed' | 'Cancelled';
}

export interface VisitingSite {
  id: string;
  city: string;
  place_name: string;
  category: 'Heritage' | 'Scenic / Nature' | 'Spiritual' | 'Adventure' | 'Beach' | 'Market & Culture';
  image_url: string;
  description: string;
  recommended_reasons: TravelReason[];
}

export interface TourPlan {
  id: string;
  title: string;
  duration: string;
  price: number;
  starting_city: string;
  destinations: string;
  image_url: string;
  highlights: string[];
  description: string;
  is_featured: boolean;
}

export interface GalleryItem {
  id: string;
  title: string;
  location: string;
  category: 'Hill Station' | 'Heritage' | 'Beach' | 'Spiritual' | 'Family';
  image_url: string;
  caption: string;
  traveler_name: string;
  rating: number;
}

export interface TourCorridor {
  id: string;
  label: string;
  destination: string;
}

export interface AdminUser {
  id: string;
  username: string;
  password_hash: string;
  role: 'super_admin' | 'operator';
  name: string;
  email?: string;
  phone?: string;
  created_at: string;
}

export interface SiteSettings {
  whatsapp_number: string;
  call_number: string;
  email: string;
  company_name: string;
  total_trips: number;
  destinations_covered: number;
  happy_travelers: string;
  rating: number;
  tour_corridors?: TourCorridor[];
  popular_destinations?: string[];
}
