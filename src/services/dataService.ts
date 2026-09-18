import { Inquiry, VisitingSite, TourPlan, GalleryItem, AdminUser, SiteSettings, ActivityLog, UserRole, TourCorridor } from '../types';
import { supabase, isSupabaseConfigured } from './supabaseClient';
import { securityService } from './security';

export const DEFAULT_CORRIDORS: TourCorridor[] = [
  { id: 'cor-1', label: 'Pune ➔ Jaipur Pink City', destination: 'Jaipur' },
  { id: 'cor-2', label: 'Pune ➔ Agra Taj Mahal Express', destination: 'Agra' },
  { id: 'cor-3', label: 'Pune ➔ Manali Snow Tour', destination: 'Manali' },
  { id: 'cor-4', label: 'Pune ➔ Goa Coastal Drive', destination: 'Goa' },
  { id: 'cor-5', label: 'Pune ➔ Shirdi Pilgrimage', destination: 'Shirdi' },
  { id: 'cor-6', label: 'Pune ➔ Mahabaleshwar Weekend', destination: 'Mahabaleshwar' }
];

export const DEFAULT_POPULAR_DESTINATIONS: string[] = [
  'Pune', 'Goa', 'Mahabaleshwar', 'Lonavala', 'Shirdi', 'Jaipur', 'Agra', 'Manali', 'Udaipur', 'Alibaug', 'Nashik', 'Mumbai'
];

// Admin credentials: Kuber@admin / Kuber@8080
const DEFAULT_ADMINS: AdminUser[] = [
  {
    id: 'admin-1',
    username: 'Kuber@admin',
    password_hash: 'Kuber@8080',
    role: 'super_admin',
    name: 'Kuber Admin',
    created_at: new Date().toISOString()
  }
];

const DEFAULT_SETTINGS: SiteSettings = {
  whatsapp_number: '919168741540',
  call_number: '+91 91687 41540',
  email: 'tours@kubertours.in',
  company_name: 'Kuber Tours and Travels',
  total_trips: 1850,
  destinations_covered: 420,
  happy_travelers: '25,000+',
  rating: 4.9,
  tour_corridors: DEFAULT_CORRIDORS,
  popular_destinations: DEFAULT_POPULAR_DESTINATIONS
};

const INITIAL_SITES: VisitingSite[] = [
  {
    id: 'site-pune-1',
    city: 'Pune',
    place_name: 'Shaniwar Wada Palace Fort',
    category: 'Heritage',
    image_url: 'https://images.unsplash.com/photo-1590050752117-238cb0fb12b1?auto=format&fit=crop&w=800&q=80',
    description: 'Historical 18th-century seat of the Peshwa rulers of the Maratha Empire with majestic gates and landscaped lawns.',
    recommended_reasons: ['Family Vacation', 'Holiday Trip', 'Site Visit']
  },
  {
    id: 'site-pune-2',
    city: 'Pune',
    place_name: 'Sinhagad Fort & Sahyadri Hills',
    category: 'Scenic / Nature',
    image_url: 'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?auto=format&fit=crop&w=800&q=80',
    description: 'Iconic hilltop fortress southwest of Pune with stunning panoramic Western Ghats views and historic memorial gates.',
    recommended_reasons: ['Holiday Trip', 'Family Vacation', 'Site Visit']
  },
  {
    id: 'site-pune-3',
    city: 'Pune',
    place_name: 'Aga Khan Palace',
    category: 'Heritage',
    image_url: 'https://images.unsplash.com/photo-1564507592333-c60657eea523?auto=format&fit=crop&w=800&q=80',
    description: 'Italian arches and expansive manicured gardens. A premier historical monument in Pune associated with Mahatma Gandhi.',
    recommended_reasons: ['Family Vacation', 'Site Visit']
  },
  {
    id: 'site-1',
    city: 'Jaipur',
    place_name: 'Amber Fort & Palace',
    category: 'Heritage',
    image_url: 'https://images.unsplash.com/photo-1599661046289-e31897846e41?auto=format&fit=crop&w=800&q=80',
    description: 'Majestic 16th-century hilltop fortress with artistic Rajput architecture, mirror palace (Sheesh Mahal), and elephant courtyards.',
    recommended_reasons: ['Family Vacation', 'Holiday Trip', 'Site Visit']
  },
  {
    id: 'site-2',
    city: 'Jaipur',
    place_name: 'Hawa Mahal (Palace of Winds)',
    category: 'Heritage',
    image_url: 'https://images.unsplash.com/photo-1609137144822-2647c223c9ff?auto=format&fit=crop&w=800&q=80',
    description: 'High-screen pink sandstone facade with 953 honeycombed jharokhas built for royal ladies to view city festivals.',
    recommended_reasons: ['Holiday Trip', 'Family Vacation', 'Site Visit']
  },
  {
    id: 'site-3',
    city: 'Jaipur',
    place_name: 'Jal Mahal (Water Palace)',
    category: 'Scenic / Nature',
    image_url: 'https://images.unsplash.com/photo-1590050752117-238cb0fb12b1?auto=format&fit=crop&w=800&q=80',
    description: 'Picturesque palace set in the middle of Man Sagar Lake, surrounded by the Aravalli hills. Splendid for photography.',
    recommended_reasons: ['Family Vacation', 'Holiday Trip']
  },
  {
    id: 'site-4',
    city: 'Agra',
    place_name: 'Taj Mahal',
    category: 'Heritage',
    image_url: 'https://images.unsplash.com/photo-1564507592333-c60657eea523?auto=format&fit=crop&w=800&q=80',
    description: 'World Wonder ivory-white marble monument commissioned by Shah Jahan on the banks of Yamuna river. Breathtaking at sunrise.',
    recommended_reasons: ['Family Vacation', 'Holiday Trip', 'Business', 'Wedding']
  },
  {
    id: 'site-5',
    city: 'Agra',
    place_name: 'Agra Fort',
    category: 'Heritage',
    image_url: 'https://images.unsplash.com/photo-1585135497273-1a86b09fe70e?auto=format&fit=crop&w=800&q=80',
    description: 'Grand red sandstone UNESCO World Heritage citadel of the Mughal dynasty with grand courtyards and Taj views.',
    recommended_reasons: ['Family Vacation', 'Holiday Trip', 'Site Visit']
  },
  {
    id: 'site-6',
    city: 'Manali',
    place_name: 'Solang Valley & Rohtang Snow Point',
    category: 'Adventure',
    image_url: 'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?auto=format&fit=crop&w=800&q=80',
    description: 'Thrilling mountain valley known for paragliding, skiing, zorbing, snow scooter rides, and snow peaks.',
    recommended_reasons: ['Holiday Trip', 'Family Vacation']
  },
  {
    id: 'site-7',
    city: 'Manali',
    place_name: 'Hadimba Devi Temple',
    category: 'Spiritual',
    image_url: 'https://images.unsplash.com/photo-1605649487212-47bdab064df7?auto=format&fit=crop&w=800&q=80',
    description: 'Peaceful 16th-century wooden pagoda temple tucked inside dense deodar (cedar) forests with prayer bells.',
    recommended_reasons: ['Pilgrimage', 'Family Vacation', 'Holiday Trip']
  },
  {
    id: 'site-8',
    city: 'Goa',
    place_name: 'Calangute, Baga & Anjuna Coast',
    category: 'Beach',
    image_url: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=800&q=80',
    description: 'Vibrant golden sand shoreline offering beach shacks, jet-skiing, parasailing, and sunset views.',
    recommended_reasons: ['Holiday Trip', 'Wedding', 'Family Vacation']
  },
  {
    id: 'site-9',
    city: 'Goa',
    place_name: 'Basilica of Bom Jesus & Old Goa',
    category: 'Heritage',
    image_url: 'https://images.unsplash.com/photo-1590050752117-238cb0fb12b1?auto=format&fit=crop&w=800&q=80',
    description: 'UNESCO World Heritage 400-year-old baroque church housing the sacred relics of St. Francis Xavier.',
    recommended_reasons: ['Family Vacation', 'Site Visit', 'Pilgrimage']
  },
  {
    id: 'site-10',
    city: 'Varanasi',
    place_name: 'Dashashwamedh Ghat & Ganga Aarti',
    category: 'Spiritual',
    image_url: 'https://images.unsplash.com/photo-1561361513-2d000a50f0dc?auto=format&fit=crop&w=800&q=80',
    description: 'Mesmerizing evening Aarti with grand brass lamps, Vedic chanting, floating oil diyas, and boat darshan.',
    recommended_reasons: ['Pilgrimage', 'Family Vacation']
  },
  {
    id: 'site-11',
    city: 'Udaipur',
    place_name: 'City Palace & Lake Pichola',
    category: 'Heritage',
    image_url: 'https://images.unsplash.com/photo-1615836245337-f5b9b2303f10?auto=format&fit=crop&w=800&q=80',
    description: 'Palatial Mewar dynasty complex overlooking serene lake waters, courtyards, marble balconies, and sunset boat rides.',
    recommended_reasons: ['Family Vacation', 'Wedding', 'Holiday Trip', 'Site Visit']
  },
  {
    id: 'site-12',
    city: 'Rishikesh',
    place_name: 'Ram Jhula, Triveni Ghat & Ganga Rafting',
    category: 'Adventure',
    image_url: 'https://images.unsplash.com/photo-1588096344356-9b5774a3f3b9?auto=format&fit=crop&w=800&q=80',
    description: 'Yoga capital of the world offering scenic white-water river rafting, suspension bridges, and evening Ganga Aarti.',
    recommended_reasons: ['Pilgrimage', 'Holiday Trip', 'Family Vacation']
  }
];

const INITIAL_TOUR_PLANS: TourPlan[] = [
  {
    id: 'plan-1',
    title: 'Golden Triangle Heritage Express',
    duration: '4 Days / 3 Nights',
    price: 14999,
    starting_city: 'Delhi',
    destinations: 'Delhi - Agra - Jaipur - Delhi',
    image_url: 'https://images.unsplash.com/photo-1564507592333-c60657eea523?auto=format&fit=crop&w=1000&q=80',
    highlights: [
      'Taj Mahal & Agra Fort with sunrise guide',
      'Amber Fort, Jal Mahal & Hawa Mahal in Jaipur',
      'Dedicated AC Sedan / SUV with Chauffeur',
      'All Tolls, State Taxes & Driver Allowance included'
    ],
    description: 'Discover the heart and soul of royal Northern India. A seamless, private chauffeur-driven tour linking the capital with Mughal Agra and the royal Pink City.',
    is_featured: true
  },
  {
    id: 'plan-2',
    title: 'Devbhoomi Haridwar & Rishikesh Sacred Tour',
    duration: '3 Days / 2 Nights',
    price: 9499,
    starting_city: 'Delhi / NCR',
    destinations: 'Delhi - Haridwar - Rishikesh',
    image_url: 'https://images.unsplash.com/photo-1588096344356-9b5774a3f3b9?auto=format&fit=crop&w=1000&q=80',
    highlights: [
      'VIP Ganga Aarti darshan at Har Ki Pauri',
      'Ram Jhula, Lakshman Jhula & Beatles Ashram',
      'Option for safe Ganga River Rafting & Riverside Camp',
      'Comfortable private cab with polite hill-driver'
    ],
    description: 'Recharge your mind and spirit on the banks of holy River Ganga with mesmerizing evening rituals and serene mountain breezes.',
    is_featured: true
  },
  {
    id: 'plan-3',
    title: 'Himachal Snow & Valleys Expedition',
    duration: '5 Days / 4 Nights',
    price: 18500,
    starting_city: 'Delhi / Chandigarh',
    destinations: 'Shimla - Kufri - Kullu - Manali - Solang',
    image_url: 'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?auto=format&fit=crop&w=1000&q=80',
    highlights: [
      'Solang Valley Snow Point & Atal Tunnel drive',
      'Shimla Mall Road, Ridge & Jakhu Temple',
      'Kullu River Rafting and Shawl weaving center',
      'Experienced mountain driver with 4x4 options'
    ],
    description: 'Soak in the grandeur of snow-clad Himalayan peaks, apple orchards, and colonial charm across Shimla and Manali.',
    is_featured: true
  },
  {
    id: 'plan-4',
    title: 'Goa Coastal Sun & Heritage Explorer',
    duration: '4 Days / 3 Nights',
    price: 12999,
    starting_city: 'Goa (Airport/Station)',
    destinations: 'North Goa - South Goa - Dudhsagar',
    image_url: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=1000&q=80',
    highlights: [
      'Baga, Calangute, and Anjuna beach tour',
      'Old Goa UNESCO Churches & Mangueshi Temple',
      'Scenic Dudhsagar Waterfalls day excursion',
      'Dedicated AC Ertiga/Innova for local convenience'
    ],
    description: 'Experience sunny coastal drives, Portuguese heritage, fresh seafood shacks, and tropical sunsets in total comfort.',
    is_featured: true
  }
];

const INITIAL_GALLERY: GalleryItem[] = [
  // 1. Maharashtra - Mahabaleshwar
  {
    id: 'gal-mh-1',
    title: 'Mahabaleshwar & Western Ghats Valley Retreat',
    location: 'Mahabaleshwar, Maharashtra',
    category: 'Hill Station',
    image_url: 'https://images.unsplash.com/photo-1596401057633-54a8fe8ef647?auto=format&fit=crop&w=800&q=80',
    caption: 'Family holiday booked from Pune. Clean Ertiga, smooth drive through Pasarni Ghat and fresh strawberry farm tour.',
    traveler_name: 'Pawar Family, Pune',
    rating: 5
  },
  // 2. Maharashtra - Shirdi & Pune
  {
    id: 'gal-mh-2',
    title: 'Divine Shirdi Sai Baba & Historic Forts Tour',
    location: 'Shirdi & Pune, Maharashtra',
    category: 'Spiritual',
    image_url: 'https://images.unsplash.com/photo-1590050752117-238cb0fb12b1?auto=format&fit=crop&w=800&q=80',
    caption: 'Same-day return yatra from Pune. On-time 5 AM pickup, VIP darshan assistance, and comfortable AC sedan drive.',
    traveler_name: 'Suresh & Meena Deshmukh, Kothrud',
    rating: 5
  },
  // 3. Uttar Pradesh - Agra Taj Mahal
  {
    id: 'gal-up-1',
    title: 'Sunrise Marvel at the Taj Mahal',
    location: 'Agra, Uttar Pradesh',
    category: 'Heritage',
    image_url: 'https://images.unsplash.com/photo-1564507592333-c60657eea523?auto=format&fit=crop&w=800&q=80',
    caption: 'Chauffeur picked us up early morning. Fast Yamuna Expressway drive, seamless guide arrangement and royal monument tour.',
    traveler_name: 'Vikram & Ananya Malhotra, Delhi',
    rating: 5
  },
  // 4. Uttar Pradesh - Varanasi Ganga Ghats
  {
    id: 'gal-up-2',
    title: 'Sacred Ganga Aarti & Kashi Vishwanath Yatra',
    location: 'Varanasi, Uttar Pradesh',
    category: 'Spiritual',
    image_url: 'https://images.unsplash.com/photo-1561361513-2d000a50f0dc?auto=format&fit=crop&w=800&q=80',
    caption: 'Magnificent evening Dashashwamedh Ghat aarti with boat ride. The chauffeur escorted our senior parents patiently.',
    traveler_name: 'Rameshwar Kulkarni, Pune',
    rating: 5
  },
  // 5. Madhya Pradesh - Gwalior Fort
  {
    id: 'gal-mp-1',
    title: 'Majestic Gwalior Fort & Scindia Palace Circuit',
    location: 'Gwalior, Madhya Pradesh',
    category: 'Heritage',
    image_url: 'https://images.unsplash.com/photo-1627894483216-2138af692e32?auto=format&fit=crop&w=800&q=80',
    caption: 'Imposing hill fortress known as the Pearl among fortresses in India. Super comfortable Innova Crysta for our Madhya Pradesh heritage circuit.',
    traveler_name: 'Dr. Arvind & Neha Saxena, Bhopal',
    rating: 5
  },
  // 6. Madhya Pradesh - Ujjain Mahakaleshwar
  {
    id: 'gal-mp-2',
    title: 'Holy Mahakaleshwar & Shipra River Yatra',
    location: 'Ujjain, Madhya Pradesh',
    category: 'Spiritual',
    image_url: 'https://images.unsplash.com/photo-1609766857041-ed402ea8069a?auto=format&fit=crop&w=800&q=80',
    caption: 'Peaceful pilgrimage covering Mahakal temple and Ram Ghat. Chauffeur ensured timely reporting for the sacred Bhasma Aarti.',
    traveler_name: 'Gupta Family, Indore',
    rating: 5
  },
  // 7. Andhra Pradesh - Tirupati Balaji
  {
    id: 'gal-ap-1',
    title: 'Tirumala Venkateswara Swamy Pilgrimage',
    location: 'Tirupati, Andhra Pradesh',
    category: 'Spiritual',
    image_url: 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=800&q=80',
    caption: 'Soulful darshan of Lord Balaji. Dedicated cab took us smoothly across the Tirumala ghat roads and back.',
    traveler_name: 'Kalyan & Sunitha Reddy, Hyderabad',
    rating: 5
  },
  // 8. Andhra Pradesh - Araku Valley
  {
    id: 'gal-ap-2',
    title: 'Misty Araku Valley & Eastern Ghats Drive',
    location: 'Araku Valley, Andhra Pradesh',
    category: 'Hill Station',
    image_url: 'https://images.unsplash.com/photo-1589182373726-e4f658ab50f0?auto=format&fit=crop&w=800&q=80',
    caption: 'Serene Eastern Ghats drive from Vizag to Araku Valley. Spectacular Million-year-old Borra caves and fresh coffee plantations.',
    traveler_name: 'Aditya, Rohit & Batchmates',
    rating: 5
  },
  // 9. Gujarat - Statue of Unity
  {
    id: 'gal-gj-1',
    title: 'Grand Statue of Unity & Valley of Flowers Tour',
    location: 'Kevadia, Gujarat',
    category: 'Heritage',
    image_url: 'https://images.unsplash.com/photo-1585130401366-fe05a8d813c4?auto=format&fit=crop&w=800&q=80',
    caption: 'Monumental 182-meter statue experience. Our Innova was prompt, AC was powerful, and laser light show was unforgettable.',
    traveler_name: 'Patel Family, Ahmedabad',
    rating: 5
  },
  // 10. Gujarat - Rann of Kutch
  {
    id: 'gal-gj-2',
    title: 'Enchanting White Rann Full-Moon Safari',
    location: 'Rann of Kutch, Gujarat',
    category: 'Heritage',
    image_url: 'https://images.unsplash.com/photo-1609840114035-3c981b782dfe?auto=format&fit=crop&w=800&q=80',
    caption: 'Full-moon glow across the vast white salt desert and colorful Kutchi handicraft shopping in Dhordo village.',
    traveler_name: 'Nitin & Bhavna Shah, Surat',
    rating: 5
  },
  // 11. Delhi - Qutub Minar
  {
    id: 'gal-dl-1',
    title: 'Capital Heritage: Qutub Minar & Mughal Monuments',
    location: 'New Delhi, Delhi',
    category: 'Heritage',
    image_url: 'https://images.unsplash.com/photo-1587474260584-136574528ed5?auto=format&fit=crop&w=800&q=80',
    caption: 'Full-day Delhi sightseeing covering India Gate, Qutub Minar, and Humayun Tomb. The chauffeur knew every shortcut avoiding traffic.',
    traveler_name: 'Sarah & Mark (UK Travelers)',
    rating: 5
  },
  // 12. Delhi - Red Fort & Old Delhi
  {
    id: 'gal-dl-2',
    title: 'Red Fort Splendor & Chandni Chowk Delights',
    location: 'Old Delhi, Delhi',
    category: 'Heritage',
    image_url: 'https://images.unsplash.com/photo-1598324789736-4861f89564a0?auto=format&fit=crop&w=800&q=80',
    caption: 'Iconic 17th-century Mughal red sandstone fort followed by legendary parathas in Chandni Chowk. Top notch cab service.',
    traveler_name: 'Kapoor Family, Gurgaon',
    rating: 5
  }
];

const INITIAL_INQUIRIES: Inquiry[] = [
  {
    id: 'inq-101',
    created_at: new Date(Date.now() - 3600000 * 4).toISOString(),
    user_id: 'usr-1',
    customer_name: 'Rajesh Verma',
    customer_phone: '9810123456',
    customer_email: 'rajesh.v@gmail.com',
    pickup_location: 'Delhi Aerocity',
    drop_location: 'Jaipur',
    travel_date: '2026-09-15',
    travel_time: '07:00 AM',
    travel_reason: 'Family Vacation',
    passengers_count: 4,
    car_type: 'Innova Crysta (Premium SUV)',
    notes: 'Need car with child seat and polite driver for 3 days sightseeing.',
    status: 'New'
  },
  {
    id: 'inq-102',
    created_at: new Date(Date.now() - 3600000 * 20).toISOString(),
    customer_name: 'Amitabh Joshi',
    customer_phone: '9822334455',
    customer_email: 'amitabh.j@tcs.com',
    pickup_location: 'Mumbai Airport T2',
    drop_location: 'Pune Hinjewadi',
    travel_date: '2026-09-12',
    travel_time: '11:30 AM',
    travel_reason: 'Business',
    passengers_count: 2,
    car_type: 'Sedan (Dzire / Etios)',
    notes: 'Urgent corporate travel, require GST invoice.',
    status: 'Contacted'
  }
];

const INITIAL_ACTIVITIES: ActivityLog[] = [
  {
    id: 'act-1',
    user_id: 'admin-1',
    user_identifier: 'admin',
    role: 'admin',
    action_type: 'USER_LOGIN',
    description: 'Admin logged in via credentials',
    timestamp: new Date(Date.now() - 3600000 * 5).toISOString()
  },
  {
    id: 'act-2',
    user_id: 'usr-1',
    user_identifier: 'customer@gmail.com',
    role: 'customer',
    action_type: 'TRIP_INQUIRY_SUBMITTED',
    description: 'Submitted inquiry for Delhi Aerocity to Jaipur (Innova Crysta)',
    timestamp: new Date(Date.now() - 3600000 * 4).toISOString()
  },
  {
    id: 'act-3',
    user_id: 'admin-1',
    user_identifier: 'admin',
    role: 'admin',
    action_type: 'STATUS_CHANGE',
    description: 'Changed trip status of Amitabh Joshi to Contacted',
    timestamp: new Date(Date.now() - 3600000 * 2).toISOString()
  }
];

// Helper to access LocalStorage safely
const getStorage = <T>(key: string, defaultVal: T): T => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultVal;
  } catch {
    return defaultVal;
  }
};

const setStorage = <T>(key: string, val: T): void => {
  try {
    localStorage.setItem(key, JSON.stringify(val));
  } catch (err) {
    console.warn('Storage write failed', err);
  }
};

export const dataService = {
  // -------------------------------------------------------------
  // ACTIVITY TRACKING (AUDIT LOGS FOR CUSTOMER & ADMIN)
  // -------------------------------------------------------------
  async logActivity(
    userId: string,
    userIdentifier: string,
    role: UserRole,
    actionType: ActivityLog['action_type'],
    description: string
  ): Promise<ActivityLog> {
    const newLog: ActivityLog = {
      id: 'act_' + Math.random().toString(36).substring(2, 9),
      user_id: userId,
      user_identifier: userIdentifier,
      role,
      action_type: actionType,
      description: securityService.sanitizeText(description),
      timestamp: new Date().toISOString()
    };

    if (isSupabaseConfigured && supabase) {
      await supabase.from('activity_logs').insert([newLog]);
    }

    const current = getStorage<ActivityLog[]>('yaatri_activities', INITIAL_ACTIVITIES);
    const updated = [newLog, ...current];
    setStorage('yaatri_activities', updated);
    return newLog;
  },

  async getActivityLogs(userId?: string): Promise<ActivityLog[]> {
    if (isSupabaseConfigured && supabase) {
      let query = supabase.from('activity_logs').select('*').order('timestamp', { ascending: false });
      if (userId) {
        query = query.eq('user_id', userId);
      }
      const { data, error } = await query;
      if (!error && data) return data as ActivityLog[];
    }
    const current = getStorage<ActivityLog[]>('yaatri_activities', INITIAL_ACTIVITIES);
    if (userId) {
      return current.filter(a => a.user_id === userId);
    }
    return current;
  },

  // -------------------------------------------------------------
  // INQUIRIES
  // -------------------------------------------------------------
  async getInquiries(): Promise<Inquiry[]> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('inquiries')
        .select('*')
        .order('created_at', { ascending: false });
      if (!error && data) return data as Inquiry[];
    }
    return getStorage<Inquiry[]>('yaatri_inquiries', INITIAL_INQUIRIES);
  },

  async getUserInquiries(userPhoneOrEmail: string): Promise<Inquiry[]> {
    const all = await this.getInquiries();
    const clean = userPhoneOrEmail.trim().toLowerCase();
    return all.filter(i => 
      i.customer_phone === clean || 
      (i.customer_email && i.customer_email.toLowerCase() === clean)
    );
  },

  async addInquiry(inquiryData: Omit<Inquiry, 'id' | 'created_at' | 'status'>, currentUserId?: string): Promise<Inquiry> {
    const sanitized: Inquiry = {
      id: 'inq_' + Math.random().toString(36).substring(2, 9),
      created_at: new Date().toISOString(),
      user_id: currentUserId || undefined,
      customer_name: securityService.sanitizeText(inquiryData.customer_name),
      customer_phone: securityService.sanitizeText(inquiryData.customer_phone),
      customer_email: securityService.sanitizeText(inquiryData.customer_email || ''),
      pickup_location: securityService.sanitizeText(inquiryData.pickup_location),
      drop_location: securityService.sanitizeText(inquiryData.drop_location),
      travel_date: securityService.sanitizeText(inquiryData.travel_date),
      travel_time: securityService.sanitizeText(inquiryData.travel_time || 'Morning'),
      travel_reason: inquiryData.travel_reason,
      passengers_count: Number(inquiryData.passengers_count) || 1,
      car_type: inquiryData.car_type,
      notes: securityService.sanitizeText(inquiryData.notes || ''),
      status: 'New'
    };

    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('inquiries')
        .insert([sanitized])
        .select()
        .single();
      if (!error && data) {
        this.logActivity(
          currentUserId || 'guest',
          sanitized.customer_phone,
          'customer',
          'TRIP_INQUIRY_SUBMITTED',
          `Booked route ${sanitized.pickup_location} to ${sanitized.drop_location} (${sanitized.car_type})`
        );
        return data as Inquiry;
      }
    }

    const current = getStorage<Inquiry[]>('yaatri_inquiries', INITIAL_INQUIRIES);
    const updated = [sanitized, ...current];
    setStorage('yaatri_inquiries', updated);

    // Record activity
    this.logActivity(
      currentUserId || 'guest',
      sanitized.customer_phone,
      'customer',
      'TRIP_INQUIRY_SUBMITTED',
      `Booked trip from ${sanitized.pickup_location} to ${sanitized.drop_location} (${sanitized.car_type})`
    );

    return sanitized;
  },

  async updateInquiryStatus(id: string, status: Inquiry['status'], adminIdentifier = 'admin'): Promise<void> {
    if (isSupabaseConfigured && supabase) {
      await supabase.from('inquiries').update({ status }).eq('id', id);
    }
    const current = getStorage<Inquiry[]>('yaatri_inquiries', INITIAL_INQUIRIES);
    const updated = current.map(item => item.id === id ? { ...item, status } : item);
    setStorage('yaatri_inquiries', updated);

    // Log admin activity
    this.logActivity(
      'admin',
      adminIdentifier,
      'admin',
      'STATUS_CHANGE',
      `Updated trip inquiry #${id.substring(0, 8)} status to ${status}`
    );
  },

  async deleteInquiry(id: string): Promise<void> {
    if (isSupabaseConfigured && supabase) {
      await supabase.from('inquiries').delete().eq('id', id);
    }
    const current = getStorage<Inquiry[]>('yaatri_inquiries', INITIAL_INQUIRIES);
    const updated = current.filter(item => item.id !== id);
    setStorage('yaatri_inquiries', updated);
  },

  // -------------------------------------------------------------
  // VISITING SITES & ATTRACTIONS
  // -------------------------------------------------------------
  async getVisitingSites(): Promise<VisitingSite[]> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.from('visiting_sites').select('*');
      if (!error && data) return data as VisitingSite[];
    }
    return getStorage<VisitingSite[]>('yaatri_sites', INITIAL_SITES);
  },

  async addVisitingSite(site: Omit<VisitingSite, 'id'>, adminIdentifier = 'admin'): Promise<VisitingSite> {
    const newSite: VisitingSite = {
      ...site,
      id: 'site_' + Math.random().toString(36).substring(2, 9),
      city: securityService.sanitizeText(site.city),
      place_name: securityService.sanitizeText(site.place_name),
      description: securityService.sanitizeText(site.description)
    };

    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.from('visiting_sites').insert([newSite]).select().single();
      if (!error && data) {
        this.logActivity('admin', adminIdentifier, 'admin', 'SITE_ADDED', `Added sight ${newSite.place_name} in ${newSite.city}`);
        return data as VisitingSite;
      }
    }

    const current = getStorage<VisitingSite[]>('yaatri_sites', INITIAL_SITES);
    const updated = [newSite, ...current];
    setStorage('yaatri_sites', updated);

    this.logActivity('admin', adminIdentifier, 'admin', 'SITE_ADDED', `Added sight ${newSite.place_name} in ${newSite.city}`);
    return newSite;
  },

  async deleteVisitingSite(id: string, adminIdentifier = 'admin'): Promise<void> {
    if (isSupabaseConfigured && supabase) {
      await supabase.from('visiting_sites').delete().eq('id', id);
    }
    const current = getStorage<VisitingSite[]>('yaatri_sites', INITIAL_SITES);
    const found = current.find(s => s.id === id);
    const updated = current.filter(item => item.id !== id);
    setStorage('yaatri_sites', updated);

    this.logActivity('admin', adminIdentifier, 'admin', 'SITE_DELETED', `Removed sight ${found?.place_name || id}`);
  },

  // -------------------------------------------------------------
  // TOUR PLANS & PACKAGES
  // -------------------------------------------------------------
  async getTourPlans(): Promise<TourPlan[]> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.from('tour_plans').select('*').order('price', { ascending: true });
      if (!error && data) return data as TourPlan[];
    }
    return getStorage<TourPlan[]>('yaatri_plans', INITIAL_TOUR_PLANS);
  },

  async addTourPlan(plan: Omit<TourPlan, 'id'>, adminIdentifier = 'admin'): Promise<TourPlan> {
    const newPlan: TourPlan = {
      ...plan,
      id: 'plan_' + Math.random().toString(36).substring(2, 9),
      title: securityService.sanitizeText(plan.title),
      starting_city: securityService.sanitizeText(plan.starting_city),
      destinations: securityService.sanitizeText(plan.destinations),
      description: securityService.sanitizeText(plan.description)
    };

    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.from('tour_plans').insert([newPlan]).select().single();
      if (!error && data) {
        this.logActivity('admin', adminIdentifier, 'admin', 'TOUR_PLAN_ADDED', `Published tour package ${newPlan.title}`);
        return data as TourPlan;
      }
    }

    const current = getStorage<TourPlan[]>('yaatri_plans', INITIAL_TOUR_PLANS);
    const updated = [newPlan, ...current];
    setStorage('yaatri_plans', updated);

    this.logActivity('admin', adminIdentifier, 'admin', 'TOUR_PLAN_ADDED', `Published tour package ${newPlan.title}`);
    return newPlan;
  },

  async deleteTourPlan(id: string, adminIdentifier = 'admin'): Promise<void> {
    if (isSupabaseConfigured && supabase) {
      await supabase.from('tour_plans').delete().eq('id', id);
    }
    const current = getStorage<TourPlan[]>('yaatri_plans', INITIAL_TOUR_PLANS);
    const found = current.find(p => p.id === id);
    const updated = current.filter(item => item.id !== id);
    setStorage('yaatri_plans', updated);

    this.logActivity('admin', adminIdentifier, 'admin', 'TOUR_PLAN_DELETED', `Deleted package ${found?.title || id}`);
  },

  // -------------------------------------------------------------
  // PAST VISITED GALLERY & TESTIMONIALS
  // -------------------------------------------------------------
  async getGalleryItems(): Promise<GalleryItem[]> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.from('gallery_items').select('*');
      if (!error && data && data.length > 0) return data as GalleryItem[];
    }
    return getStorage<GalleryItem[]>('yaatri_gallery', INITIAL_GALLERY);
  },

  async addGalleryItem(item: Omit<GalleryItem, 'id'>, adminIdentifier = 'admin'): Promise<GalleryItem> {
    const newItem: GalleryItem = {
      ...item,
      id: 'gal_' + Math.random().toString(36).substring(2, 9),
      title: securityService.sanitizeText(item.title),
      location: securityService.sanitizeText(item.location),
      caption: securityService.sanitizeText(item.caption),
      traveler_name: securityService.sanitizeText(item.traveler_name)
    };

    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.from('gallery_items').insert([newItem]).select().single();
      if (!error && data) {
        this.logActivity('admin', adminIdentifier, 'admin', 'GALLERY_ADDED', `Uploaded past tour photo for ${newItem.location}`);
        return data as GalleryItem;
      }
    }

    const current = getStorage<GalleryItem[]>('yaatri_gallery', INITIAL_GALLERY);
    const updated = [newItem, ...current];
    setStorage('yaatri_gallery', updated);

    this.logActivity('admin', adminIdentifier, 'admin', 'GALLERY_ADDED', `Uploaded past tour photo for ${newItem.location}`);
    return newItem;
  },

  async deleteGalleryItem(id: string, adminIdentifier = 'admin'): Promise<void> {
    if (isSupabaseConfigured && supabase) {
      await supabase.from('gallery_items').delete().eq('id', id);
    }
    const current = getStorage<GalleryItem[]>('yaatri_gallery', INITIAL_GALLERY);
    const found = current.find(g => g.id === id);
    const updated = current.filter(item => item.id !== id);
    setStorage('yaatri_gallery', updated);

    this.logActivity('admin', adminIdentifier, 'admin', 'GALLERY_DELETED', `Deleted gallery item ${found?.title || id}`);
  },

  // -------------------------------------------------------------
  // ADMIN USERS (ADD & REMOVE ADMIN SYSTEM)
  // -------------------------------------------------------------
  async getAdmins(): Promise<AdminUser[]> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.from('admins').select('*');
      if (!error && data && data.length > 0) return data as AdminUser[];
    }
    const admins = getStorage<AdminUser[]>('kuber_admins', DEFAULT_ADMINS);
    if (!admins.some(a => a.username.toLowerCase() === 'kuber@admin')) {
      admins.unshift(DEFAULT_ADMINS[0]);
      setStorage('kuber_admins', admins);
    }
    return admins;
  },

  async addAdmin(adminData: { username: string; password: string; name: string; role?: 'super_admin' | 'operator' }, currentAdmin = 'admin'): Promise<{ success: boolean; message?: string }> {
    const cleanUsername = securityService.sanitizeText(adminData.username).toLowerCase();
    const cleanName = securityService.sanitizeText(adminData.name);

    if (!cleanUsername || cleanUsername.length < 3) {
      return { success: false, message: 'Username must be at least 3 characters' };
    }
    if (!adminData.password || adminData.password.length < 5) {
      return { success: false, message: 'Password must be at least 5 characters' };
    }

    const currentAdmins = await this.getAdmins();
    if (currentAdmins.some(a => a.username.toLowerCase() === cleanUsername)) {
      return { success: false, message: 'Admin with this username already exists' };
    }

    const newAdmin: AdminUser = {
      id: 'adm_' + Math.random().toString(36).substring(2, 9),
      username: cleanUsername,
      password_hash: adminData.password,
      name: cleanName || cleanUsername,
      role: adminData.role || 'operator',
      created_at: new Date().toISOString()
    };

    if (isSupabaseConfigured && supabase) {
      await supabase.from('admins').insert([newAdmin]);
    }

    const updated = [...currentAdmins, newAdmin];
    setStorage('kuber_admins', updated);

    this.logActivity('admin', currentAdmin, 'admin', 'ADMIN_ADDED', `Created new administrator account: ${cleanUsername}`);
    return { success: true };
  },

  async removeAdmin(id: string, currentAdmin = 'admin'): Promise<{ success: boolean; message?: string }> {
    const currentAdmins = await this.getAdmins();
    if (currentAdmins.length <= 1) {
      return { success: false, message: 'Cannot remove the last remaining administrator account.' };
    }

    const found = currentAdmins.find(a => a.id === id);

    if (isSupabaseConfigured && supabase) {
      await supabase.from('admins').delete().eq('id', id);
    }

    const updated = currentAdmins.filter(a => a.id !== id);
    setStorage('kuber_admins', updated);

    this.logActivity('admin', currentAdmin, 'admin', 'ADMIN_REMOVED', `Removed administrator account: ${found?.username || id}`);
    return { success: true };
  },

  async verifyAdminLogin(username: string, password: string): Promise<AdminUser | null> {
    const admins = await this.getAdmins();
    const cleanUser = username.trim().toLowerCase();
    const found = admins.find(a => 
      (a.username.toLowerCase() === cleanUser || (a.email && a.email.toLowerCase() === cleanUser)) && 
      a.password_hash === password
    );
    if (found) {
      this.logActivity('admin', found.username, 'admin', 'USER_LOGIN', `Admin logged in successfully`);
    }
    return found || null;
  },

  // -------------------------------------------------------------
  // SITE SETTINGS
  // -------------------------------------------------------------
  async getSettings(): Promise<SiteSettings> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.from('site_settings').select('*');
      if (!error && data && data.length > 0) {
        const settingsMap = data.reduce((acc: any, curr: any) => {
          if (curr.key === 'contact_info') Object.assign(acc, curr.value);
          if (curr.key === 'trip_stats') Object.assign(acc, curr.value);
          if (curr.key === 'tour_corridors' && Array.isArray(curr.value)) acc.tour_corridors = curr.value;
          if (curr.key === 'popular_destinations' && Array.isArray(curr.value)) acc.popular_destinations = curr.value;
          return acc;
        }, { ...DEFAULT_SETTINGS });
        return settingsMap;
      }
    }
    const current = getStorage<SiteSettings>('kuber_settings', DEFAULT_SETTINGS);
    const merged = { ...DEFAULT_SETTINGS, ...current };
    if (!merged.tour_corridors || merged.tour_corridors.length === 0) {
      merged.tour_corridors = DEFAULT_CORRIDORS;
    }
    if (!merged.popular_destinations || merged.popular_destinations.length === 0) {
      merged.popular_destinations = DEFAULT_POPULAR_DESTINATIONS;
    }
    return merged;
  },

  async updateSettings(settings: Partial<SiteSettings>, adminIdentifier = 'admin'): Promise<void> {
    const current = await this.getSettings();
    const updated = { ...current, ...settings };
    setStorage('kuber_settings', updated);

    if (isSupabaseConfigured && supabase) {
      await supabase.from('site_settings').upsert([
        {
          key: 'contact_info',
          value: {
            whatsapp_number: updated.whatsapp_number,
            call_number: updated.call_number,
            email: updated.email,
            company_name: updated.company_name
          }
        },
        {
          key: 'trip_stats',
          value: {
            total_trips: updated.total_trips,
            destinations_covered: updated.destinations_covered,
            happy_travelers: updated.happy_travelers,
            rating: updated.rating
          }
        },
        {
          key: 'tour_corridors',
          value: updated.tour_corridors || []
        },
        {
          key: 'popular_destinations',
          value: updated.popular_destinations || []
        }
      ]);
    }

    this.logActivity('admin', adminIdentifier, 'admin', 'SETTINGS_UPDATED', `Updated company settings, corridors or popular destinations`);
  }
};
