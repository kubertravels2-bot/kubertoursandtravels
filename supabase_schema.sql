-- ==============================================================================
-- YAATRICAB & TOURS - COMPLETE SUPABASE DATABASE SCHEMA
-- Includes: Inquiries, Tour Plans, Sites, Gallery, Admins, Users, Activities, OTP
-- Compatible with Supabase PostgreSQL (Supports RLS, Auth, and Cloudflare)
-- ==============================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. TABLE: Users (Customers and Travelers)
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    phone TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role TEXT DEFAULT 'customer' NOT NULL
);

-- 3. TABLE: Inquiries (Customer leads & bookings)
CREATE TABLE IF NOT EXISTS public.inquiries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    user_id TEXT,
    customer_name TEXT NOT NULL,
    customer_phone TEXT NOT NULL,
    customer_email TEXT,
    pickup_location TEXT NOT NULL,
    drop_location TEXT NOT NULL,
    travel_date TEXT NOT NULL,
    travel_time TEXT,
    travel_reason TEXT NOT NULL,
    passengers_count INTEGER DEFAULT 1 NOT NULL,
    car_type TEXT NOT NULL,
    notes TEXT,
    status TEXT DEFAULT 'New' NOT NULL
);

-- 4. TABLE: Activity Logs (Audit Trail for Customer & Admin actions)
CREATE TABLE IF NOT EXISTS public.activity_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    user_id TEXT NOT NULL,
    user_identifier TEXT NOT NULL,
    role TEXT NOT NULL,
    action_type TEXT NOT NULL,
    description TEXT NOT NULL
);

-- 5. TABLE: OTP Codes (Temporary Phone / Email OTP store)
CREATE TABLE IF NOT EXISTS public.otp_codes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    identifier TEXT NOT NULL,
    code TEXT NOT NULL,
    purpose TEXT NOT NULL,
    expires_at BIGINT NOT NULL
);

-- 6. TABLE: Tour Plans (Packages editable by Admin)
CREATE TABLE IF NOT EXISTS public.tour_plans (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    title TEXT NOT NULL,
    duration TEXT NOT NULL,
    price NUMERIC NOT NULL,
    starting_city TEXT NOT NULL,
    destinations TEXT NOT NULL,
    image_url TEXT NOT NULL,
    highlights TEXT[] DEFAULT '{}',
    description TEXT,
    is_featured BOOLEAN DEFAULT true
);

-- 7. TABLE: Visiting Sites (Nearby attractions per destination)
CREATE TABLE IF NOT EXISTS public.visiting_sites (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    city TEXT NOT NULL,
    place_name TEXT NOT NULL,
    category TEXT NOT NULL,
    image_url TEXT NOT NULL,
    description TEXT NOT NULL,
    recommended_reasons TEXT[] DEFAULT '{}'
);

-- 8. TABLE: Gallery Items (Past Visited Tours & Photos)
CREATE TABLE IF NOT EXISTS public.gallery_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    title TEXT NOT NULL,
    location TEXT NOT NULL,
    category TEXT NOT NULL,
    image_url TEXT NOT NULL,
    caption TEXT,
    traveler_name TEXT,
    rating INTEGER DEFAULT 5
);

-- 9. TABLE: Admins (Multi-Admin management system)
CREATE TABLE IF NOT EXISTS public.admins (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    username TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role TEXT DEFAULT 'super_admin' NOT NULL,
    name TEXT NOT NULL,
    email TEXT,
    phone TEXT
);

-- 10. TABLE: Site Settings (Owner contact, counters, etc.)
CREATE TABLE IF NOT EXISTS public.site_settings (
    key TEXT PRIMARY KEY,
    value JSONB NOT NULL
);

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tour_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.visiting_sites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gallery_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admins ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public all inquiries" ON public.inquiries FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public all activity_logs" ON public.activity_logs FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public all tour_plans" ON public.tour_plans FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public all visiting_sites" ON public.visiting_sites FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public all gallery_items" ON public.gallery_items FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public all site_settings" ON public.site_settings FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public all admins" ON public.admins FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public all users" ON public.users FOR ALL USING (true) WITH CHECK (true);

-- ==============================================================================
-- INITIAL SEED DATA
-- ==============================================================================
-- Default Admin Account: id - Kuber@admin | password - Kuber@8080
INSERT INTO public.admins (username, password_hash, role, name, email, phone)
VALUES 
    ('Kuber@admin', 'Kuber@8080', 'super_admin', 'Kuber Administrator', 'tours@kubertours.in', '9168741540')
ON CONFLICT (username) DO NOTHING;

-- Site Settings
INSERT INTO public.site_settings (key, value)
VALUES 
    ('contact_info', '{"whatsapp_number": "919168741540", "call_number": "+91 91687 41540", "email": "tours@kubertours.in", "company_name": "Kuber Tours and Travels"}'),
    ('trip_stats', '{"total_trips": 1850, "destinations_covered": 420, "happy_travelers": "25,000+", "rating": 4.9}')
ON CONFLICT (key) DO NOTHING;

-- Initial Popular Tour Plans
INSERT INTO public.tour_plans (title, duration, price, starting_city, destinations, image_url, highlights, description, is_featured)
VALUES
    (
        'Golden Triangle Heritage Express', 
        '4 Days / 3 Nights', 
        14999, 
        'Delhi', 
        'Delhi - Agra - Jaipur - Delhi', 
        'https://images.unsplash.com/photo-1564507592333-c60657eea523?auto=format&fit=crop&w=1000&q=80', 
        ARRAY['Taj Mahal & Agra Fort with sunrise guide', 'Amber Fort, Jal Mahal & Hawa Mahal in Jaipur', 'Dedicated AC Sedan / SUV with Chauffeur', 'All Tolls, State Taxes & Driver Allowance included'], 
        'Experience India''s most iconic cultural route connecting Delhi, Agra, and the pink city of Jaipur in comfort.',
        true
    ),
    (
        'Devbhoomi Haridwar & Rishikesh Retreat', 
        '3 Days / 2 Nights', 
        9499, 
        'Delhi', 
        'Haridwar - Rishikesh', 
        'https://images.unsplash.com/photo-1588096344356-9b5774a3f3b9?auto=format&fit=crop&w=1000&q=80', 
        ARRAY['VIP Ganga Aarti darshan at Har Ki Pauri', 'Ram Jhula & Lakshman Jhula', 'River Rafting & Camping', 'Comfortable private cab with polite hill-driver'], 
        'A rejuvenating spiritual getaway to the holy banks of River Ganga with peaceful temple visits.',
        true
    );

-- Initial Inquiries
INSERT INTO public.inquiries (customer_name, customer_phone, customer_email, pickup_location, drop_location, travel_date, travel_time, travel_reason, passengers_count, car_type, notes, status)
VALUES
    ('Rajesh Verma', '9810123456', 'rajesh.v@gmail.com', 'Delhi Aerocity', 'Jaipur', '2026-09-20', '07:00 AM', 'Family Vacation', 4, 'Innova Crysta (Premium SUV)', 'Need car with child seat and polite driver for 3 days sightseeing.', 'New'),
    ('Amitabh Joshi', '9822334455', 'amitabh.j@tcs.com', 'Mumbai Airport T2', 'Pune Hinjewadi', '2026-09-22', '11:30 AM', 'Business', 2, 'Sedan (Dzire / Etios)', 'Urgent corporate travel, require GST invoice.', 'Contacted'),
    ('Sunita Deshmukh', '9168741540', 'sunita.d@gmail.com', 'Pune Station', 'Shirdi', '2026-09-25', '06:00 AM', 'Pilgrimage', 5, 'Ertiga (Family MPV)', 'Shirdi Darshan same day return.', 'New');

-- Initial Activity Logs
INSERT INTO public.activity_logs (user_id, user_identifier, role, action_type, description)
VALUES
    ('admin-1', 'admin', 'admin', 'SYSTEM_INIT', 'System initialized and connected to Supabase database'),
    ('admin-1', 'admin', 'admin', 'USER_LOGIN', 'Admin logged in via credentials'),
    ('usr-1', '9810123456', 'customer', 'TRIP_INQUIRY_SUBMITTED', 'Submitted inquiry for Delhi Aerocity to Jaipur (Innova Crysta)');

-- Initial Gallery Items (12 places across Maharashtra, UP, MP, AP, Gujarat, Delhi)
INSERT INTO public.gallery_items (title, location, category, image_url, caption, traveler_name, rating)
VALUES
    ('Mahabaleshwar & Western Ghats Valley Retreat', 'Mahabaleshwar, Maharashtra', 'Hill Station', '/gallery/mahabaleshwar.jpg', 'Family holiday booked from Pune. Clean Ertiga, smooth drive through Pasarni Ghat and fresh strawberry farm tour.', 'Pawar Family, Pune', 5),
    ('Divine Shirdi Sai Baba & Historic Forts Tour', 'Shirdi & Pune, Maharashtra', 'Spiritual', '/gallery/shirdi.jpg', 'Same-day return yatra from Pune. On-time 5 AM pickup, VIP darshan assistance, and comfortable AC sedan drive.', 'Suresh & Meena Deshmukh, Kothrud', 5),
    ('Sunrise Marvel at the Taj Mahal', 'Agra, Uttar Pradesh', 'Heritage', '/gallery/taj-mahal.jpg', 'Chauffeur picked us up early morning. Fast Yamuna Expressway drive, seamless guide arrangement and royal monument tour.', 'Vikram & Ananya Malhotra, Delhi', 5),
    ('Sacred Ganga Aarti & Kashi Vishwanath Yatra', 'Varanasi, Uttar Pradesh', 'Spiritual', '/gallery/varanasi.jpg', 'Magnificent evening Dashashwamedh Ghat aarti with boat ride. The chauffeur escorted our senior parents patiently.', 'Rameshwar Kulkarni, Pune', 5),
    ('Majestic Gwalior Fort & Scindia Palace Circuit', 'Gwalior, Madhya Pradesh', 'Heritage', '/gallery/gwalior-fort.jpg', 'Imposing hill fortress known as the Pearl among fortresses in India. Super comfortable Innova Crysta for our Madhya Pradesh heritage circuit.', 'Dr. Arvind & Neha Saxena, Bhopal', 5),
    ('Holy Mahakaleshwar & Shipra River Yatra', 'Ujjain, Madhya Pradesh', 'Spiritual', '/gallery/mahakaleshwar-ujjain.jpg', 'Peaceful pilgrimage covering Mahakal temple and Ram Ghat. Chauffeur ensured timely reporting for the sacred Bhasma Aarti.', 'Gupta Family, Indore', 5),
    ('Tirumala Venkateswara Swamy Pilgrimage', 'Tirupati, Andhra Pradesh', 'Spiritual', '/gallery/tirupati-balaji.jpg', 'Soulful darshan of Lord Balaji. Dedicated cab took us smoothly across the Tirumala ghat roads and back.', 'Kalyan & Sunitha Reddy, Hyderabad', 5),
    ('Misty Araku Valley & Eastern Ghats Drive', 'Araku Valley, Andhra Pradesh', 'Hill Station', '/gallery/araku-valley.jpg', 'Serene Eastern Ghats drive from Vizag to Araku Valley. Spectacular Million-year-old Borra caves and fresh coffee plantations.', 'Aditya, Rohit & Batchmates', 5),
    ('Grand Statue of Unity & Valley of Flowers Tour', 'Kevadia, Gujarat', 'Heritage', '/gallery/statue-of-unity.jpg', 'Monumental 182-meter statue experience. Our Innova was prompt, AC was powerful, and laser light show was unforgettable.', 'Patel Family, Ahmedabad', 5),
    ('Enchanting White Rann Full-Moon Safari', 'Rann of Kutch, Gujarat', 'Heritage', '/gallery/rann-of-kutch.jpg', 'Full-moon glow across the vast white salt desert and colorful Kutchi handicraft shopping in Dhordo village.', 'Nitin & Bhavna Shah, Surat', 5),
    ('Capital Heritage: Qutub Minar & Mughal Monuments', 'New Delhi, Delhi', 'Heritage', '/gallery/qutub-minar.jpg', 'Full-day Delhi sightseeing covering India Gate, Qutub Minar, and Humayun Tomb. The chauffeur knew every shortcut avoiding traffic.', 'Sarah & Mark (UK Travelers)', 5),
    ('Red Fort Splendor & Chandni Chowk Delights', 'Old Delhi, Delhi', 'Heritage', '/gallery/red-fort-delhi.jpg', 'Iconic 17th-century Mughal red sandstone fort followed by legendary parathas in Chandni Chowk. Top notch cab service.', 'Kapoor Family, Gurgaon', 5);
