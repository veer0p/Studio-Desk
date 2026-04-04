-- Run this in the Supabase SQL Editor to populate the dashboard 
-- for the most recently created studio (the one you just made during onboarding).

DO $$
DECLARE
  v_studio_id UUID;
  v_client1_id UUID := gen_random_uuid();
  v_client2_id UUID := gen_random_uuid();
  v_client3_id UUID := gen_random_uuid();
  v_lead1_id UUID := gen_random_uuid();
  v_lead2_id UUID := gen_random_uuid();
  v_booking1_id UUID := gen_random_uuid();
  v_booking2_id UUID := gen_random_uuid();
  v_booking3_id UUID := gen_random_uuid();
BEGIN
  -- 1. Find your newly created Studio ID
  SELECT id INTO v_studio_id 
  FROM public.studios 
  ORDER BY created_at DESC 
  LIMIT 1;
  
  IF v_studio_id IS NULL THEN
    RAISE EXCEPTION 'No studio found. Please complete onboarding first.';
  END IF;

  RAISE NOTICE 'Populating Dashboard Data for Studio: %', v_studio_id;

  -- 2. Insert Mock Clients
  INSERT INTO public.clients (id, studio_id, full_name, phone, email, city, state, tags)
  VALUES
    (v_client1_id, v_studio_id, 'Aarav Patel', '9876500011', 'aarav@example.com', 'Mumbai', 'Maharashtra', ARRAY['vip', 'wedding']),
    (v_client2_id, v_studio_id, 'Sneha Rao', '9876500012', 'sneha@example.com', 'Bangalore', 'Karnataka', ARRAY['portrait']),
    (v_client3_id, v_studio_id, 'Karan Singh', '9876500013', 'karan@example.com', 'Delhi', 'Delhi', NULL)
  ON CONFLICT DO NOTHING;

  -- 3. Insert Mock Leads (Populates Funnel & Lead Sources on Dashboard)
  INSERT INTO public.leads (id, studio_id, client_id, event_type, status, source, converted_to_booking, follow_up_at, created_at)
  VALUES
    (v_lead1_id, v_studio_id, v_client1_id, 'wedding', 'contract_signed', 'instagram', true, NULL, NOW() - INTERVAL '10 days'),
    (v_lead2_id, v_studio_id, v_client2_id, 'portrait', 'new_lead', 'inquiry_form', false, NOW() - INTERVAL '1 day', NOW() - INTERVAL '2 days'),
    (gen_random_uuid(), v_studio_id, v_client3_id, 'corporate', 'contacted', 'referral', false, NOW() + INTERVAL '1 day', NOW() - INTERVAL '5 days')
  ON CONFLICT DO NOTHING;

  -- 4. Insert Mock Bookings (Populates "Today's Shoots" and "Upcoming Week")
  
  -- Shoot for TODAY
  INSERT INTO public.bookings (id, studio_id, client_id, lead_id, title, event_type, event_date, total_amount, amount_paid, status, venue_name, venue_address, venue_city)
  VALUES
    (v_booking1_id, v_studio_id, v_client1_id, v_lead1_id, 'Aarav & Maya Wedding', 'wedding', CURRENT_DATE, 150000, 50000, 'contract_signed', 'Taj Lands End', 'Bandstand, Bandra', 'Mumbai')
  ON CONFLICT DO NOTHING;

  -- Shoot for UPCOMING WEEK
  INSERT INTO public.bookings (id, studio_id, client_id, lead_id, title, event_type, event_date, total_amount, amount_paid, status, venue_name, venue_address, venue_city)
  VALUES
    (v_booking2_id, v_studio_id, v_client2_id, v_lead2_id, 'Sneha Pre-Wedding', 'pre_wedding', (CURRENT_DATE + INTERVAL '3 days')::date, 40000, 10000, 'contract_signed', 'Cubbon Park', 'Bangalore', 'Bangalore')
  ON CONFLICT DO NOTHING;

  -- Future Shoot
  INSERT INTO public.bookings (id, studio_id, client_id, lead_id, title, event_type, event_date, total_amount, amount_paid, status, venue_name, venue_address, venue_city)
  VALUES
    (v_booking3_id, v_studio_id, v_client3_id, NULL, 'Karan Corporate Event', 'corporate', (CURRENT_DATE + INTERVAL '15 days')::date, 80000, 0, 'proposal_sent', 'ITC Maurya', 'New Delhi', 'Delhi')
  ON CONFLICT DO NOTHING;

  -- 5. Insert Revenue Snapshots (Populates the Revenue Line Chart)
  -- Data is spread over the last few months to show a trend graph
  INSERT INTO public.revenue_snapshots (studio_id, snapshot_date, total_bookings, new_leads, invoices_sent, revenue_collected, photos_delivered, storage_used_gb)
  VALUES
    (v_studio_id, (CURRENT_DATE - INTERVAL '120 days')::date, 5, 10, 5, 200000, 800, 35.5),
    (v_studio_id, (CURRENT_DATE - INTERVAL '90 days')::date, 8, 15, 8, 350000, 1200, 50.2),
    (v_studio_id, (CURRENT_DATE - INTERVAL '60 days')::date, 12, 22, 11, 420000, 2000, 75.8),
    (v_studio_id, (CURRENT_DATE - INTERVAL '30 days')::date, 18, 30, 16, 580000, 3500, 110.4),
    (v_studio_id, CURRENT_DATE, 20, 35, 19, 650000, 4200, 130.0)
  ON CONFLICT DO NOTHING;

  RAISE NOTICE 'Successfully populated dashboard data!';
END $$;
