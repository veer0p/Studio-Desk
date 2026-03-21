import * as DB from './database'

export type Database = {
  public: {
    Tables: {
      admin_audit_logs: {
        Row: DB.AdminAuditLogs & Record<string, unknown>
        Insert: DB.AdminAuditLogsInput & Record<string, unknown>
        Update: Partial<DB.AdminAuditLogsInput> & Record<string, unknown>
        Relationships: []
      }
      admin_sessions: {
        Row: DB.AdminSessions & Record<string, unknown>
        Insert: DB.AdminSessionsInput & Record<string, unknown>
        Update: Partial<DB.AdminSessionsInput> & Record<string, unknown>
        Relationships: []
      }
      album_photos: {
        Row: DB.AlbumPhotos & Record<string, unknown>
        Insert: DB.AlbumPhotosInput & Record<string, unknown>
        Update: Partial<DB.AlbumPhotosInput> & Record<string, unknown>
        Relationships: []
      }
      albums: {
        Row: DB.Albums & Record<string, unknown>
        Insert: DB.AlbumsInput & Record<string, unknown>
        Update: Partial<DB.AlbumsInput> & Record<string, unknown>
        Relationships: []
      }
      api_keys: {
        Row: DB.ApiKeys & Record<string, unknown>
        Insert: DB.ApiKeysInput & Record<string, unknown>
        Update: Partial<DB.ApiKeysInput> & Record<string, unknown>
        Relationships: []
      }
      audit_logs: {
        Row: DB.AuditLogs & Record<string, unknown>
        Insert: DB.AuditLogsInput & Record<string, unknown>
        Update: Partial<DB.AuditLogsInput> & Record<string, unknown>
        Relationships: []
      }
      auth_sessions: {
        Row: DB.AuthSessions & Record<string, unknown>
        Insert: DB.AuthSessionsInput & Record<string, unknown>
        Update: Partial<DB.AuthSessionsInput> & Record<string, unknown>
        Relationships: []
      }
      automation_log: {
        Row: DB.AutomationLog & Record<string, unknown>
        Insert: DB.AutomationLogInput & Record<string, unknown>
        Update: Partial<DB.AutomationLogInput> & Record<string, unknown>
        Relationships: []
      }
      automation_settings: {
        Row: DB.AutomationSettings & Record<string, unknown>
        Insert: DB.AutomationSettingsInput & Record<string, unknown>
        Update: Partial<DB.AutomationSettingsInput> & Record<string, unknown>
        Relationships: []
      }
      background_job_logs: {
        Row: DB.BackgroundJobLogs & Record<string, unknown>
        Insert: DB.BackgroundJobLogsInput & Record<string, unknown>
        Update: Partial<DB.BackgroundJobLogsInput> & Record<string, unknown>
        Relationships: []
      }
      billing_history: {
        Row: DB.BillingHistory & Record<string, unknown>
        Insert: DB.BillingHistoryInput & Record<string, unknown>
        Update: Partial<DB.BillingHistoryInput> & Record<string, unknown>
        Relationships: []
      }
      booking_activity_feed: {
        Row: DB.BookingActivityFeed & Record<string, unknown>
        Insert: DB.BookingActivityFeedInput & Record<string, unknown>
        Update: Partial<DB.BookingActivityFeedInput> & Record<string, unknown>
        Relationships: []
      }
      bookings: {
        Row: DB.Bookings & Record<string, unknown>
        Insert: DB.BookingsInput & Record<string, unknown>
        Update: Partial<DB.BookingsInput> & Record<string, unknown>
        Relationships: []
      }
      client_messages: {
        Row: DB.ClientMessages & Record<string, unknown>
        Insert: DB.ClientMessagesInput & Record<string, unknown>
        Update: Partial<DB.ClientMessagesInput> & Record<string, unknown>
        Relationships: []
      }
      client_portal_sessions: {
        Row: DB.ClientPortalSessions & Record<string, unknown>
        Insert: DB.ClientPortalSessionsInput & Record<string, unknown>
        Update: Partial<DB.ClientPortalSessionsInput> & Record<string, unknown>
        Relationships: []
      }
      clients: {
        Row: DB.Clients & Record<string, unknown>
        Insert: DB.ClientsInput & Record<string, unknown>
        Update: Partial<DB.ClientsInput> & Record<string, unknown>
        Relationships: []
      }
      cluster_jobs: {
        Row: DB.ClusterJobs & Record<string, unknown>
        Insert: DB.ClusterJobsInput & Record<string, unknown>
        Update: Partial<DB.ClusterJobsInput> & Record<string, unknown>
        Relationships: []
      }
      contract_clause_library: {
        Row: DB.ContractClauseLibrary & Record<string, unknown>
        Insert: DB.ContractClauseLibraryInput & Record<string, unknown>
        Update: Partial<DB.ContractClauseLibraryInput> & Record<string, unknown>
        Relationships: []
      }
      contract_revisions: {
        Row: DB.ContractRevisions & Record<string, unknown>
        Insert: DB.ContractRevisionsInput & Record<string, unknown>
        Update: Partial<DB.ContractRevisionsInput> & Record<string, unknown>
        Relationships: []
      }
      contract_templates: {
        Row: DB.ContractTemplates & Record<string, unknown>
        Insert: DB.ContractTemplatesInput & Record<string, unknown>
        Update: Partial<DB.ContractTemplatesInput> & Record<string, unknown>
        Relationships: []
      }
      contracts: {
        Row: DB.Contracts & Record<string, unknown>
        Insert: DB.ContractsInput & Record<string, unknown>
        Update: Partial<DB.ContractsInput> & Record<string, unknown>
        Relationships: []
      }
      data_change_logs: {
        Row: DB.DataChangeLogs & Record<string, unknown>
        Insert: DB.DataChangeLogsInput & Record<string, unknown>
        Update: Partial<DB.DataChangeLogsInput> & Record<string, unknown>
        Relationships: []
      }
      data_export_requests: {
        Row: DB.DataExportRequests & Record<string, unknown>
        Insert: DB.DataExportRequestsInput & Record<string, unknown>
        Update: Partial<DB.DataExportRequestsInput> & Record<string, unknown>
        Relationships: []
      }
      detected_faces: {
        Row: DB.DetectedFaces & Record<string, unknown>
        Insert: DB.DetectedFacesInput & Record<string, unknown>
        Update: Partial<DB.DetectedFacesInput> & Record<string, unknown>
        Relationships: []
      }
      email_delivery_logs: {
        Row: DB.EmailDeliveryLogs & Record<string, unknown>
        Insert: DB.EmailDeliveryLogsInput & Record<string, unknown>
        Update: Partial<DB.EmailDeliveryLogsInput> & Record<string, unknown>
        Relationships: []
      }
      email_templates: {
        Row: DB.EmailTemplates & Record<string, unknown>
        Insert: DB.EmailTemplatesInput & Record<string, unknown>
        Update: Partial<DB.EmailTemplatesInput> & Record<string, unknown>
        Relationships: []
      }
      error_logs: {
        Row: DB.ErrorLogs & Record<string, unknown>
        Insert: DB.ErrorLogsInput & Record<string, unknown>
        Update: Partial<DB.ErrorLogsInput> & Record<string, unknown>
        Relationships: []
      }
      expense_tracking: {
        Row: DB.ExpenseTracking & Record<string, unknown>
        Insert: DB.ExpenseTrackingInput & Record<string, unknown>
        Update: Partial<DB.ExpenseTrackingInput> & Record<string, unknown>
        Relationships: []
      }
      face_clusters: {
        Row: DB.FaceClusters & Record<string, unknown>
        Insert: DB.FaceClustersInput & Record<string, unknown>
        Update: Partial<DB.FaceClustersInput> & Record<string, unknown>
        Relationships: []
      }
      failed_login_attempts: {
        Row: DB.FailedLoginAttempts & Record<string, unknown>
        Insert: DB.FailedLoginAttemptsInput & Record<string, unknown>
        Update: Partial<DB.FailedLoginAttemptsInput> & Record<string, unknown>
        Relationships: []
      }
      feature_flags: {
        Row: DB.FeatureFlags & Record<string, unknown>
        Insert: DB.FeatureFlagsInput & Record<string, unknown>
        Update: Partial<DB.FeatureFlagsInput> & Record<string, unknown>
        Relationships: []
      }
      file_upload_jobs: {
        Row: DB.FileUploadJobs & Record<string, unknown>
        Insert: DB.FileUploadJobsInput & Record<string, unknown>
        Update: Partial<DB.FileUploadJobsInput> & Record<string, unknown>
        Relationships: []
      }
      freelancer_payments: {
        Row: DB.FreelancerPayments & Record<string, unknown>
        Insert: DB.FreelancerPaymentsInput & Record<string, unknown>
        Update: Partial<DB.FreelancerPaymentsInput> & Record<string, unknown>
        Relationships: []
      }
      galleries: {
        Row: DB.Galleries & Record<string, unknown>
        Insert: DB.GalleriesInput & Record<string, unknown>
        Update: Partial<DB.GalleriesInput> & Record<string, unknown>
        Relationships: []
      }
      gallery_photos: {
        Row: DB.GalleryPhotos & Record<string, unknown>
        Insert: DB.GalleryPhotosInput & Record<string, unknown>
        Update: Partial<DB.GalleryPhotosInput> & Record<string, unknown>
        Relationships: []
      }
      gallery_share_logs: {
        Row: DB.GalleryShareLogs & Record<string, unknown>
        Insert: DB.GalleryShareLogsInput & Record<string, unknown>
        Update: Partial<DB.GalleryShareLogsInput> & Record<string, unknown>
        Relationships: []
      }
      gallery_videos: {
        Row: DB.GalleryVideos & Record<string, unknown>
        Insert: DB.GalleryVideosInput & Record<string, unknown>
        Update: Partial<DB.GalleryVideosInput> & Record<string, unknown>
        Relationships: []
      }
      google_auth: {
        Row: DB.GoogleAuth & Record<string, unknown>
        Insert: DB.GoogleAuthInput & Record<string, unknown>
        Update: Partial<DB.GoogleAuthInput> & Record<string, unknown>
        Relationships: []
      }
      gst_rates: {
        Row: DB.GstRates & Record<string, unknown>
        Insert: DB.GstRatesInput & Record<string, unknown>
        Update: Partial<DB.GstRatesInput> & Record<string, unknown>
        Relationships: []
      }
      guest_selfie_lookups: {
        Row: DB.GuestSelfieLookups & Record<string, unknown>
        Insert: DB.GuestSelfieLookupsInput & Record<string, unknown>
        Update: Partial<DB.GuestSelfieLookupsInput> & Record<string, unknown>
        Relationships: []
      }
      hsn_sac_codes: {
        Row: DB.HsnSacCodes & Record<string, unknown>
        Insert: DB.HsnSacCodesInput & Record<string, unknown>
        Update: Partial<DB.HsnSacCodesInput> & Record<string, unknown>
        Relationships: []
      }
      immich_sync_jobs: {
        Row: DB.ImmichSyncJobs & Record<string, unknown>
        Insert: DB.ImmichSyncJobsInput & Record<string, unknown>
        Update: Partial<DB.ImmichSyncJobsInput> & Record<string, unknown>
        Relationships: []
      }
      indian_states: {
        Row: DB.IndianStates & Record<string, unknown>
        Insert: DB.IndianStatesInput & Record<string, unknown>
        Update: Partial<DB.IndianStatesInput> & Record<string, unknown>
        Relationships: []
      }
      inquiry_form_configs: {
        Row: DB.InquiryFormConfigs & Record<string, unknown>
        Insert: DB.InquiryFormConfigsInput & Record<string, unknown>
        Update: Partial<DB.InquiryFormConfigsInput> & Record<string, unknown>
        Relationships: []
      }
      invoice_line_items: {
        Row: DB.InvoiceLineItems & Record<string, unknown>
        Insert: DB.InvoiceLineItemsInput & Record<string, unknown>
        Update: Partial<DB.InvoiceLineItemsInput> & Record<string, unknown>
        Relationships: []
      }
      invoices: {
        Row: DB.Invoices & Record<string, unknown>
        Insert: DB.InvoicesInput & Record<string, unknown>
        Update: Partial<DB.InvoicesInput> & Record<string, unknown>
        Relationships: []
      }
      job_images: {
        Row: DB.JobImages & Record<string, unknown>
        Insert: DB.JobImagesInput & Record<string, unknown>
        Update: Partial<DB.JobImagesInput> & Record<string, unknown>
        Relationships: []
      }
      leads: {
        Row: DB.Leads & Record<string, unknown>
        Insert: DB.LeadsInput & Record<string, unknown>
        Update: Partial<DB.LeadsInput> & Record<string, unknown>
        Relationships: []
      }
      media_files: {
        Row: DB.MediaFiles & Record<string, unknown>
        Insert: DB.MediaFilesInput & Record<string, unknown>
        Update: Partial<DB.MediaFilesInput> & Record<string, unknown>
        Relationships: []
      }
      member_permission_overrides: {
        Row: DB.MemberPermissionOverrides & Record<string, unknown>
        Insert: DB.MemberPermissionOverridesInput & Record<string, unknown>
        Update: Partial<DB.MemberPermissionOverridesInput> & Record<string, unknown>
        Relationships: []
      }
      member_unavailability: {
        Row: DB.MemberUnavailability & Record<string, unknown>
        Insert: DB.MemberUnavailabilityInput & Record<string, unknown>
        Update: Partial<DB.MemberUnavailabilityInput> & Record<string, unknown>
        Relationships: []
      }
      notifications: {
        Row: DB.Notifications & Record<string, unknown>
        Insert: DB.NotificationsInput & Record<string, unknown>
        Update: Partial<DB.NotificationsInput> & Record<string, unknown>
        Relationships: []
      }
      nps_responses: {
        Row: DB.NpsResponses & Record<string, unknown>
        Insert: DB.NpsResponsesInput & Record<string, unknown>
        Update: Partial<DB.NpsResponsesInput> & Record<string, unknown>
        Relationships: []
      }
      package_addons: {
        Row: DB.PackageAddons & Record<string, unknown>
        Insert: DB.PackageAddonsInput & Record<string, unknown>
        Update: Partial<DB.PackageAddonsInput> & Record<string, unknown>
        Relationships: []
      }
      payment_disputes: {
        Row: DB.PaymentDisputes & Record<string, unknown>
        Insert: DB.PaymentDisputesInput & Record<string, unknown>
        Update: Partial<DB.PaymentDisputesInput> & Record<string, unknown>
        Relationships: []
      }
      payment_gateway_logs: {
        Row: DB.PaymentGatewayLogs & Record<string, unknown>
        Insert: DB.PaymentGatewayLogsInput & Record<string, unknown>
        Update: Partial<DB.PaymentGatewayLogsInput> & Record<string, unknown>
        Relationships: []
      }
      payments: {
        Row: DB.Payments & Record<string, unknown>
        Insert: DB.PaymentsInput & Record<string, unknown>
        Update: Partial<DB.PaymentsInput> & Record<string, unknown>
        Relationships: []
      }
      permissions: {
        Row: DB.Permissions & Record<string, unknown>
        Insert: DB.PermissionsInput & Record<string, unknown>
        Update: Partial<DB.PermissionsInput> & Record<string, unknown>
        Relationships: []
      }
      person_clusters: {
        Row: DB.PersonClusters & Record<string, unknown>
        Insert: DB.PersonClustersInput & Record<string, unknown>
        Update: Partial<DB.PersonClustersInput> & Record<string, unknown>
        Relationships: []
      }
      photo_comments: {
        Row: DB.PhotoComments & Record<string, unknown>
        Insert: DB.PhotoCommentsInput & Record<string, unknown>
        Update: Partial<DB.PhotoCommentsInput> & Record<string, unknown>
        Relationships: []
      }
      photo_favorites: {
        Row: DB.PhotoFavorites & Record<string, unknown>
        Insert: DB.PhotoFavoritesInput & Record<string, unknown>
        Update: Partial<DB.PhotoFavoritesInput> & Record<string, unknown>
        Relationships: []
      }
      photos: {
        Row: DB.Photos & Record<string, unknown>
        Insert: DB.PhotosInput & Record<string, unknown>
        Update: Partial<DB.PhotosInput> & Record<string, unknown>
        Relationships: []
      }
      photos_with_display_date: {
        Row: DB.PhotosWithDisplayDate & Record<string, unknown>
        Insert: DB.PhotosWithDisplayDateInput & Record<string, unknown>
        Update: Partial<DB.PhotosWithDisplayDateInput> & Record<string, unknown>
        Relationships: []
      }
      platform_admins: {
        Row: DB.PlatformAdmins & Record<string, unknown>
        Insert: DB.PlatformAdminsInput & Record<string, unknown>
        Update: Partial<DB.PlatformAdminsInput> & Record<string, unknown>
        Relationships: []
      }
      platform_settings: {
        Row: DB.PlatformSettings & Record<string, unknown>
        Insert: DB.PlatformSettingsInput & Record<string, unknown>
        Update: Partial<DB.PlatformSettingsInput> & Record<string, unknown>
        Relationships: []
      }
      platform_subscription_invoices: {
        Row: DB.PlatformSubscriptionInvoices & Record<string, unknown>
        Insert: DB.PlatformSubscriptionInvoicesInput & Record<string, unknown>
        Update: Partial<DB.PlatformSubscriptionInvoicesInput> & Record<string, unknown>
        Relationships: []
      }
      promo_codes: {
        Row: DB.PromoCodes & Record<string, unknown>
        Insert: DB.PromoCodesInput & Record<string, unknown>
        Update: Partial<DB.PromoCodesInput> & Record<string, unknown>
        Relationships: []
      }
      proposal_line_items: {
        Row: DB.ProposalLineItems & Record<string, unknown>
        Insert: DB.ProposalLineItemsInput & Record<string, unknown>
        Update: Partial<DB.ProposalLineItemsInput> & Record<string, unknown>
        Relationships: []
      }
      proposals: {
        Row: DB.Proposals & Record<string, unknown>
        Insert: DB.ProposalsInput & Record<string, unknown>
        Update: Partial<DB.ProposalsInput> & Record<string, unknown>
        Relationships: []
      }
      questionnaire_responses: {
        Row: DB.QuestionnaireResponses & Record<string, unknown>
        Insert: DB.QuestionnaireResponsesInput & Record<string, unknown>
        Update: Partial<DB.QuestionnaireResponsesInput> & Record<string, unknown>
        Relationships: []
      }
      rate_limits: {
        Row: DB.RateLimits & Record<string, unknown>
        Insert: DB.RateLimitsInput & Record<string, unknown>
        Update: Partial<DB.RateLimitsInput> & Record<string, unknown>
        Relationships: []
      }
      referral_codes: {
        Row: DB.ReferralCodes & Record<string, unknown>
        Insert: DB.ReferralCodesInput & Record<string, unknown>
        Update: Partial<DB.ReferralCodesInput> & Record<string, unknown>
        Relationships: []
      }
      referral_redemptions: {
        Row: DB.ReferralRedemptions & Record<string, unknown>
        Insert: DB.ReferralRedemptionsInput & Record<string, unknown>
        Update: Partial<DB.ReferralRedemptionsInput> & Record<string, unknown>
        Relationships: []
      }
      refunds: {
        Row: DB.Refunds & Record<string, unknown>
        Insert: DB.RefundsInput & Record<string, unknown>
        Update: Partial<DB.RefundsInput> & Record<string, unknown>
        Relationships: []
      }
      revenue_snapshots: {
        Row: DB.RevenueSnapshots & Record<string, unknown>
        Insert: DB.RevenueSnapshotsInput & Record<string, unknown>
        Update: Partial<DB.RevenueSnapshotsInput> & Record<string, unknown>
        Relationships: []
      }
      role_permissions: {
        Row: DB.RolePermissions & Record<string, unknown>
        Insert: DB.RolePermissionsInput & Record<string, unknown>
        Update: Partial<DB.RolePermissionsInput> & Record<string, unknown>
        Relationships: []
      }
      security_events_log: {
        Row: DB.SecurityEventsLog & Record<string, unknown>
        Insert: DB.SecurityEventsLogInput & Record<string, unknown>
        Update: Partial<DB.SecurityEventsLogInput> & Record<string, unknown>
        Relationships: []
      }
      service_packages: {
        Row: DB.ServicePackages & Record<string, unknown>
        Insert: DB.ServicePackagesInput & Record<string, unknown>
        Update: Partial<DB.ServicePackagesInput> & Record<string, unknown>
        Relationships: []
      }
      sessions: {
        Row: DB.Sessions & Record<string, unknown>
        Insert: DB.SessionsInput & Record<string, unknown>
        Update: Partial<DB.SessionsInput> & Record<string, unknown>
        Relationships: []
      }
      shoot_assignments: {
        Row: DB.ShootAssignments & Record<string, unknown>
        Insert: DB.ShootAssignmentsInput & Record<string, unknown>
        Update: Partial<DB.ShootAssignmentsInput> & Record<string, unknown>
        Relationships: []
      }
      shoot_briefs: {
        Row: DB.ShootBriefs & Record<string, unknown>
        Insert: DB.ShootBriefsInput & Record<string, unknown>
        Update: Partial<DB.ShootBriefsInput> & Record<string, unknown>
        Relationships: []
      }
      studio_impersonation_log: {
        Row: DB.StudioImpersonationLog & Record<string, unknown>
        Insert: DB.StudioImpersonationLogInput & Record<string, unknown>
        Update: Partial<DB.StudioImpersonationLogInput> & Record<string, unknown>
        Relationships: []
      }
      studio_invitations: {
        Row: DB.StudioInvitations & Record<string, unknown>
        Insert: DB.StudioInvitationsInput & Record<string, unknown>
        Update: Partial<DB.StudioInvitationsInput> & Record<string, unknown>
        Relationships: []
      }
      studio_members: {
        Row: DB.StudioMembers & Record<string, unknown>
        Insert: DB.StudioMembersInput & Record<string, unknown>
        Update: Partial<DB.StudioMembersInput> & Record<string, unknown>
        Relationships: []
      }
      studio_onboarding_events: {
        Row: DB.StudioOnboardingEvents & Record<string, unknown>
        Insert: DB.StudioOnboardingEventsInput & Record<string, unknown>
        Update: Partial<DB.StudioOnboardingEventsInput> & Record<string, unknown>
        Relationships: []
      }
      studio_settings: {
        Row: DB.StudioSettings & Record<string, unknown>
        Insert: DB.StudioSettingsInput & Record<string, unknown>
        Update: Partial<DB.StudioSettingsInput> & Record<string, unknown>
        Relationships: []
      }
      studios: {
        Row: DB.Studios & Record<string, unknown>
        Insert: DB.StudiosInput & Record<string, unknown>
        Update: Partial<DB.StudiosInput> & Record<string, unknown>
        Relationships: []
      }
      subscription_events: {
        Row: DB.SubscriptionEvents & Record<string, unknown>
        Insert: DB.SubscriptionEventsInput & Record<string, unknown>
        Update: Partial<DB.SubscriptionEventsInput> & Record<string, unknown>
        Relationships: []
      }
      subscription_plans: {
        Row: DB.SubscriptionPlans & Record<string, unknown>
        Insert: DB.SubscriptionPlansInput & Record<string, unknown>
        Update: Partial<DB.SubscriptionPlansInput> & Record<string, unknown>
        Relationships: []
      }
      support_notes: {
        Row: DB.SupportNotes & Record<string, unknown>
        Insert: DB.SupportNotesInput & Record<string, unknown>
        Update: Partial<DB.SupportNotesInput> & Record<string, unknown>
        Relationships: []
      }
      users: {
        Row: DB.Users & Record<string, unknown>
        Insert: DB.UsersInput & Record<string, unknown>
        Update: Partial<DB.UsersInput> & Record<string, unknown>
        Relationships: []
      }
      v_bookings_overview: {
        Row: DB.VBookingsOverview & Record<string, unknown>
        Insert: DB.VBookingsOverviewInput & Record<string, unknown>
        Update: Partial<DB.VBookingsOverviewInput> & Record<string, unknown>
        Relationships: []
      }
      v_outstanding_invoices: {
        Row: DB.VOutstandingInvoices & Record<string, unknown>
        Insert: DB.VOutstandingInvoicesInput & Record<string, unknown>
        Update: Partial<DB.VOutstandingInvoicesInput> & Record<string, unknown>
        Relationships: []
      }
      v_pending_automations: {
        Row: DB.VPendingAutomations & Record<string, unknown>
        Insert: DB.VPendingAutomationsInput & Record<string, unknown>
        Update: Partial<DB.VPendingAutomationsInput> & Record<string, unknown>
        Relationships: []
      }
      v_platform_studio_health: {
        Row: DB.VPlatformStudioHealth & Record<string, unknown>
        Insert: DB.VPlatformStudioHealthInput & Record<string, unknown>
        Update: Partial<DB.VPlatformStudioHealthInput> & Record<string, unknown>
        Relationships: []
      }
      v_studio_storage: {
        Row: DB.VStudioStorage & Record<string, unknown>
        Insert: DB.VStudioStorageInput & Record<string, unknown>
        Update: Partial<DB.VStudioStorageInput> & Record<string, unknown>
        Relationships: []
      }
      v_todays_shoots: {
        Row: DB.VTodaysShoots & Record<string, unknown>
        Insert: DB.VTodaysShootsInput & Record<string, unknown>
        Update: Partial<DB.VTodaysShootsInput> & Record<string, unknown>
        Relationships: []
      }
      v_unresolved_errors: {
        Row: DB.VUnresolvedErrors & Record<string, unknown>
        Insert: DB.VUnresolvedErrorsInput & Record<string, unknown>
        Update: Partial<DB.VUnresolvedErrorsInput> & Record<string, unknown>
        Relationships: []
      }
      webhook_logs: {
        Row: DB.WebhookLogs & Record<string, unknown>
        Insert: DB.WebhookLogsInput & Record<string, unknown>
        Update: Partial<DB.WebhookLogsInput> & Record<string, unknown>
        Relationships: []
      }
      whatsapp_delivery_logs: {
        Row: DB.WhatsappDeliveryLogs & Record<string, unknown>
        Insert: DB.WhatsappDeliveryLogsInput & Record<string, unknown>
        Update: Partial<DB.WhatsappDeliveryLogsInput> & Record<string, unknown>
        Relationships: []
      }
      whatsapp_templates: {
        Row: DB.WhatsappTemplates & Record<string, unknown>
        Insert: DB.WhatsappTemplatesInput & Record<string, unknown>
        Update: Partial<DB.WhatsappTemplatesInput> & Record<string, unknown>
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
