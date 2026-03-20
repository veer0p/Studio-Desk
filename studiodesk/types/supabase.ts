import * as DB from './database'

export interface Database {
  public: {
    Tables: {
      bookings: {
        Row: DB.Bookings
        Insert: DB.BookingsInput
        Update: DB.BookingsInput
      }
      studios: {
        Row: DB.Studios
        Insert: DB.StudiosInput
        Update: DB.StudiosInput
      }
      studio_members: {
        Row: DB.StudioMembers
        Insert: DB.StudioMembersInput
        Update: DB.StudioMembersInput
      }
      clients: {
        Row: DB.Clients
        Insert: DB.ClientsInput
        Update: DB.ClientsInput
      }
      leads: {
        Row: DB.Leads
        Insert: DB.LeadsInput
        Update: DB.LeadsInput
      }
      service_packages: {
        Row: DB.ServicePackages
        Insert: DB.ServicePackagesInput
        Update: DB.ServicePackagesInput
      }
      booking_activity_feed: {
        Row: DB.BookingActivityFeed
        Insert: DB.BookingActivityFeedInput
        Update: DB.BookingActivityFeedInput
      }
      inquiry_form_configs: {
        Row: DB.InquiryFormConfigs
        Insert: DB.InquiryFormConfigsInput
        Update: DB.InquiryFormConfigsInput
      }
      studio_onboarding_events: {
        Row: DB.StudioOnboardingEvents
        Insert: DB.StudioOnboardingEventsInput
        Update: DB.StudioOnboardingEventsInput
      }
    }
    Views: {
      [key: string]: {
        Row: any
      }
    }
    Functions: {
      [key: string]: {
        Args: any
        Returns: any
      }
    }
  }
}
