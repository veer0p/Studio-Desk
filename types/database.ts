export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      studios: {
        Row: {
          id: string
          name: string
          slug: string
          logo_url: string | null
          tagline: string | null
          brand_color: string | null
          phone: string | null
          email: string | null
          website: string | null
          city: string | null
          state: string | null
          business_address: string | null
          gstin: string | null
          pan: string | null
          razorpay_connected: boolean
          whatsapp_connected: boolean
          onboarding_completed: boolean
          settings: Json
          created_at: string
          updated_at: string
          invoice_prefix: string | null
          default_advance_pct: number | null
        }
        Insert: any
        Update: any
      }
      studio_members: {
        Row: {
          id: string
          studio_id: string
          user_id: string
          role: string
          full_name: string | null
          is_active: boolean
          created_at: string
        }
        Insert: any
        Update: any
      }
      clients: {
        Row: {
          id: string
          studio_id: string
          full_name: string
          email: string | null
          phone: string | null
          whatsapp: string | null
          address: string | null
          city: string | null
          state: string | null
          pincode: string | null
          company_name: string | null
          gstin: string | null
          notes: string | null
          tags: string[] | null
          created_at: string
          updated_at: string
        }
        Insert: any
        Update: any
      }
      leads: {
        Row: {
          id: string
          studio_id: string
          client_id: string | null
          event_type: string | null
          event_date_approx: string | null
          venue: string | null
          guest_count_approx: number | null
          budget_min: number | null
          budget_max: number | null
          status: string
          source: string
          priority: number | null
          assigned_to: string | null
          follow_up_at: string | null
          last_contacted_at: string | null
          form_data: Json | null
          converted_to_booking: boolean
          booking_id: string | null
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: any
        Update: any
      }
      bookings: {
        Row: {
          id: string
          studio_id: string
          client_id: string
          lead_id: string | null
          title: string
          event_type: string
          event_date: string
          event_end_date: string | null
          event_time: string | null
          venue_name: string | null
          venue_address: string | null
          venue_city: string | null
          venue_state: string | null
          package_id: string | null
          total_amount: number
          advance_amount: number
          balance_amount: number
          amount_paid: number
          amount_pending: number
          gst_type: string
          status: string
          notes: string | null
          internal_notes: string | null
          expected_delivery_date: string | null
          delivered_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: any
        Update: any
      }
      inquiry_form_configs: {
        Row: {
          id: string
          studio_id: string
          form_title: string
          form_subtitle: string | null
          background_color: string | null
          button_text: string
          button_color: string | null
          success_message: string | null
          show_event_type: boolean
          show_event_date: boolean
          show_venue: boolean
          show_guest_count: boolean
          show_budget: boolean
          show_message: boolean
          require_email: boolean
          require_phone: boolean
          require_event_date: boolean
          created_at: string
          updated_at: string
        }
        Insert: any
        Update: any
      }
      booking_activity_feed: {
        Row: {
          id: string
          studio_id: string
          booking_id: string
          event_type: string
          actor_id: string | null
          actor_name: string | null
          actor_type: string
          metadata: Json
          note: string | null
          created_at: string
        }
        Insert: any
        Update: any
      }
      service_packages: {
        Row: {
          id: string
          studio_id: string
          name: string
          event_type: string
          description: string | null
          base_price: number
          hsn_sac_code: string | null
          is_gst_applicable: boolean
          deliverables: string[] | null
          turnaround_days: number | null
          created_at: string
          updated_at: string
        }
        Insert: any
        Update: any
      }
      security_events_log: {
        Row: {
          id: string
          user_id: string | null
          event_type: string
          metadata: Json
          ip_address: string | null
          user_agent: string | null
          created_at: string
        }
        Insert: any
        Update: any
      }
    }
  }
}
