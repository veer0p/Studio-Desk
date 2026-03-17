import swaggerJsdoc from 'swagger-jsdoc';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'StudioDesk API Documentation',
      version: '1.0.0',
      description: 'API for StudioDesk — India-native SaaS for event photography studios.',
    },
    servers: [
      {
        url: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
        description: 'Development server',
      },
    ],
    components: {
      securitySchemes: {
        BearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
      schemas: {
        // --- Common Errors ---
        ApiError: {
          type: 'object',
          properties: {
            error: { type: 'string', example: 'Unauthorized' },
            code: { type: 'string', example: 'UNAUTHORIZED' },
          },
        },
        StorageQuotaError: {
          type: 'object',
          properties: {
            error: { type: 'string', example: 'Storage limit exceeded' },
            limit_gb: { type: 'number', example: 50.0 },
            used_gb: { type: 'number', example: 50.1 },
          },
        },
        ConflictWarning: {
          type: 'object',
          properties: {
            warning: { type: 'string', example: 'Member already booked for this date' },
            conflicts: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  type: { type: 'string', example: 'double_booking' },
                  detail: { type: 'string', example: 'Priya Sharma is already assigned to "Rohan & Sneha Wedding"' },
                },
              },
            },
          },
        },

        // --- Leads & Inquiry ---
        InquiryFormSubmission: {
          type: 'object',
          required: ['full_name', 'phone'],
          properties: {
            full_name: { type: 'string', example: 'Rahul Patel' },
            phone: { type: 'string', description: '10-digit Indian mobile number', example: '9876543210' },
            email: { type: 'string', format: 'email', example: 'rahul.patel@gmail.com' },
            event_type: { type: 'string', example: 'wedding' },
            event_date: { type: 'string', format: 'date', example: '2025-12-25' },
            venue: { type: 'string', example: 'The Leela, Mumbai' },
            budget_min: { type: 'number', example: 100000 },
            budget_max: { type: 'number', example: 250000 },
            message: { type: 'string', example: 'Interested in wedding photography.' },
          },
        },
        InquiryFormConfig: {
          type: 'object',
          properties: {
            form_title: { type: 'string', example: 'Book Your Session' },
            show_event_date: { type: 'boolean', example: true },
            require_email: { type: 'boolean', example: false },
            button_color: { type: 'string', example: '#1A3C5E' },
          },
        },
        Lead: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            full_name: { type: 'string', example: 'Priya Sharma' },
            phone: { type: 'string', example: '9822098220' },
            email: { type: 'string', example: 'priya@example.com' },
            status: { type: 'string', example: 'new_lead' },
            source: { type: 'string', example: 'instagram' },
            created_at: { type: 'string', format: 'date-time' },
          },
        },
        LeadCreate: {
          type: 'object',
          required: ['full_name', 'phone'],
          properties: {
            full_name: { type: 'string', example: 'Priya Sharma' },
            phone: { type: 'string', example: '9822098220' },
            email: { type: 'string', example: 'priya@example.com' },
            source: { type: 'string', example: 'referral' },
          },
        },
        LeadUpdate: {
          type: 'object',
          properties: {
            status: { type: 'string', enum: ['new_lead', 'contacted', 'lost'] },
            assigned_to: { type: 'string', format: 'uuid' },
            notes: { type: 'string' },
          },
        },
        LeadConvert: {
          type: 'object',
          required: ['event_date', 'venue_name', 'total_amount'],
          properties: {
            event_date: { type: 'string', format: 'date', example: '2025-11-15' },
            venue_name: { type: 'string', example: 'Grand Hyatt, Goa' },
            venue_city: { type: 'string', example: 'Goa' },
            total_amount: { type: 'number', description: 'Rupees', example: 150000 },
            advance_amount: { type: 'number', example: 50000 },
          },
        },

        // --- Clients ---
        Client: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            full_name: { type: 'string', example: 'Rahul Patel' },
            phone: { type: 'string', example: '9876543210' },
            email: { type: 'string', example: 'rahul@gmail.com' },
            gstin: { type: 'string', description: '15-digit GSTIN', example: '24AAAAA0000A1Z5' },
            city: { type: 'string', example: 'Surat' },
          },
        },
        ClientCreate: {
          type: 'object',
          required: ['full_name', 'phone'],
          properties: {
            full_name: { type: 'string', example: 'Rahul Patel' },
            phone: { type: 'string', example: '9876543210' },
            email: { type: 'string', example: 'rahul@gmail.com' },
          },
        },
        ClientUpdate: { $ref: '#/components/schemas/ClientCreate' },

        // --- Bookings ---
        Booking: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            client_id: { type: 'string', format: 'uuid' },
            event_name: { type: 'string', example: 'Priya & Rahul Wedding' },
            event_date: { type: 'string', format: 'date' },
            total_amount: { type: 'number' },
            status: { type: 'string', example: 'confirmed' },
          },
        },

        // --- Proposals & Contracts ---
        Proposal: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            booking_id: { type: 'string', format: 'uuid' },
            total_amount: { type: 'number', example: 150000 },
            status: { type: 'string', example: 'sent' },
          },
        },
        ProposalCreate: {
          type: 'object',
          required: ['booking_id', 'line_items'],
          properties: {
            booking_id: { type: 'string', format: 'uuid' },
            line_items: { type: 'array', items: { $ref: '#/components/schemas/ProposalLineItem' } },
            valid_until: { type: 'string', format: 'date' },
          },
        },
        ProposalLineItem: {
          type: 'object',
          required: ['name', 'quantity', 'unit_price'],
          properties: {
            name: { type: 'string', example: 'Full Wedding Photography' },
            quantity: { type: 'number', example: 1 },
            unit_price: { type: 'number', example: 120000 },
            gst_rate: { type: 'number', example: 18 },
          },
        },
        Contract: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            status: { type: 'string', example: 'signed' },
            signed_at: { type: 'string', format: 'date-time' },
          },
        },
        ContractCreate: {
          type: 'object',
          required: ['booking_id'],
          properties: {
            booking_id: { type: 'string', format: 'uuid' },
            template_id: { type: 'string', format: 'uuid' },
          },
        },
        ContractSign: {
          type: 'object',
          required: ['signature_data', 'signer_name'],
          properties: {
            signature_data: { type: 'string', description: 'Base64 image or SVG path' },
            signer_name: { type: 'string', example: 'Rahul Patel' },
          },
        },

        // --- Invoices & Payments ---
        Invoice: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            invoice_number: { type: 'string', example: 'INV-FY2425-0012' },
            total_amount: { type: 'number', example: 50000 },
            cgst: { type: 'number', example: 4500 },
            sgst: { type: 'number', example: 4500 },
            igst: { type: 'number', example: 0 },
            status: { type: 'string', example: 'paid' },
          },
        },
        Payment: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            amount: { type: 'number', example: 25000 },
            method: { type: 'string', example: 'upi' },
            status: { type: 'string', example: 'captured' },
          },
        },
        RazorpayWebhookEvent: {
          type: 'object',
          properties: {
            event: { type: 'string', example: 'payment.captured' },
            payload: { type: 'object' },
          },
        },
        // --- Gallery ---
        Gallery: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            studio_id: { type: 'string', format: 'uuid' },
            booking_id: { type: 'string', format: 'uuid' },
            slug: { type: 'string', example: 'priya-rahul-wedding' },
            event_type: { type: 'string', example: 'wedding' },
            event_date: { type: 'string', format: 'date' },
            status: { type: 'string', example: 'ready' },
            total_photos: { type: 'integer', example: 450 },
            is_published: { type: 'boolean' },
            published_at: { type: 'string', format: 'date-time' },
            password: { type: 'string' },
            universal_qr_url: { type: 'string', format: 'uri' },
            is_download_enabled: { type: 'boolean' },
            expires_at: { type: 'string', format: 'date-time' },
          },
        },
        GalleryPublic: {
            type: 'object',
            properties: {
                studio_name: { type: 'string' },
                studio_logo: { type: 'string', format: 'uri' },
                event_type: { type: 'string' },
                event_date: { type: 'string', format: 'date' },
                total_photos: { type: 'integer' },
                labeled_clusters: { type: 'array', items: { 
                    type: 'object',
                    properties: { label: { type: 'string' }, photo_count: { type: 'integer' } }
                } },
                is_download_enabled: { type: 'boolean' },
                has_universal_qr: { type: 'boolean' }
            }
        },
        GalleryPhoto: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            thumbnail_url: { type: 'string', format: 'uri' },
            download_url: { type: 'string', format: 'uri', nullable: true },
            taken_at: { type: 'string', format: 'date-time' },
            dimensions: { 
                type: 'object',
                properties: { width: { type: 'integer' }, height: { type: 'integer' } }
            }
          },
        },
        FaceCluster: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            gallery_id: { type: 'string', format: 'uuid' },
            label: { type: 'string', example: 'Grandmother', nullable: true },
            is_labeled: { type: 'boolean' },
            photo_count: { type: 'integer', example: 15 },
            qr_code_url: { type: 'string', format: 'uri', nullable: true },
            qr_access_token: { type: 'string' },
            representative_thumbnail_url: { type: 'string', format: 'uri' },
          },
        },
        LabelCluster: {
          type: 'object',
          required: ['label'],
          properties: {
            label: { type: 'string', example: 'Groom Father' },
          },
        },

        // --- Team ---
        TeamMember: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            auth_user_id: { type: 'string', format: 'uuid' },
            display_name: { type: 'string', example: 'Rahul Sharma' },
            email_at_invite: { type: 'string', format: 'email' },
            phone: { type: 'string', example: '919800098000' },
            role: { type: 'string', enum: ['owner', 'admin', 'photographer', 'assistant', 'editor', 'manager'] },
            is_active: { type: 'boolean' },
            specialization: { type: 'array', items: { type: 'string' } },
            joined_at: { type: 'string', format: 'date-time' },
            user: {
                type: 'object',
                properties: {
                    email: { type: 'string' },
                    last_sign_in_at: { type: 'string', format: 'date-time' }
                }
            }
          },
        },
        TeamInvitation: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            email: { type: 'string', format: 'email' },
            role: { type: 'string' },
            token: { type: 'string' },
            expires_at: { type: 'string', format: 'date-time' },
            invited_at: { type: 'string', format: 'date-time' },
          },
        },
        TeamInvite: {
          type: 'object',
          required: ['email', 'role'],
          properties: {
            email: { type: 'string', format: 'email', example: 'rahul@studiodesk.in' },
            role: { type: 'string', enum: ['admin', 'photographer', 'assistant', 'editor', 'manager'] },
          },
        },
        TeamUpdate: {
          type: 'object',
          properties: {
            display_name: { type: 'string' },
            role: { type: 'string' },
            is_active: { type: 'boolean' },
            phone: { type: 'string' },
            specialization: { type: 'array', items: { type: 'string' } }
          },
        },
        TeamAccept: {
            type: 'object',
            required: ['user_id'],
            properties: {
                user_id: { type: 'string', format: 'uuid', description: 'Supabase Auth User ID' }
            }
        },
        ShootAssignment: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            booking_id: { type: 'string', format: 'uuid' },
            member_id: { type: 'string', format: 'uuid' },
            role: { type: 'string', example: 'lead_photographer' },
            call_time: { type: 'string', format: 'date-time' },
            call_location: { type: 'string' },
            is_confirmed: { type: 'boolean' },
            booking: { $ref: '#/components/schemas/Booking' },
            member: { $ref: '#/components/schemas/TeamMember' }
          },
        },
        ShootAssignmentCreate: {
          type: 'object',
          required: ['booking_id', 'member_id', 'role', 'call_time'],
          properties: {
            booking_id: { type: 'string', format: 'uuid' },
            member_id: { type: 'string', format: 'uuid' },
            role: { type: 'string', example: 'lead_photographer' },
            call_time: { type: 'string', format: 'date-time' },
            call_location: { type: 'string' },
            day_rate: { type: 'number', example: 5000 },
            notes: { type: 'string' },
            force: { type: 'boolean', default: false, description: 'Bypass conflict warnings' },
          },
        },
        MemberUnavailability: {
            type: 'object',
            properties: {
                id: { type: 'string', format: 'uuid' },
                unavailable_date: { type: 'string', format: 'date' },
                reason: { type: 'string' },
                created_at: { type: 'string', format: 'date-time' }
            }
        },
        UnavailabilityCreate: {
            type: 'object',
            required: ['unavailable_date'],
            properties: {
                unavailable_date: { type: 'string', format: 'date' },
                reason: { type: 'string' }
            }
        },

        // --- Automations ---
        AutomationSettings: {
          type: 'object',
          properties: {
            automation_type: { type: 'string', example: 'shoot_reminder_team' },
            is_enabled: { type: 'boolean' },
            send_email: { type: 'boolean' },
            send_whatsapp: { type: 'boolean' },
            days_before: { type: 'integer' },
            hour_of_day: { type: 'integer' }
          },
        },
        AutomationSettingsUpdate: {
            type: 'object',
            required: ['automations'],
            properties: {
                automations: { type: 'array', items: { $ref: '#/components/schemas/AutomationSettings' } }
            }
        },
        AutomationLog: {
            type: 'object',
            properties: {
                id: { type: 'string', format: 'uuid' },
                automation_type: { type: 'string' },
                status: { type: 'string', enum: ['pending', 'sent', 'failed', 'cancelled'] },
                scheduled_for: { type: 'string', format: 'date-time' },
                sent_at: { type: 'string', format: 'date-time' },
                error_message: { type: 'string' }
            }
        },
        AutomationTemplate: {
            type: 'object',
            properties: {
                id: { type: 'string' },
                name: { type: 'string' },
                category: { type: 'string' },
                type: { type: 'string', enum: ['email', 'whatsapp'] },
                status: { type: 'string' },
                content: { type: 'string' },
                updated_at: { type: 'string', format: 'date-time' }
            }
        },
        Notification: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            type: { type: 'string', example: 'team_member_joined' },
            title: { type: 'string', example: 'New Member Joined' },
            body: { type: 'string', example: 'Rahul Sharma accepted the invite.' },
            is_read: { type: 'boolean', example: false },
            read_at: { type: 'string', format: 'date-time' },
            created_at: { type: 'string', format: 'date-time' },
          },
        },

        // --- Client Portal ---
        ClientPortalBooking: {
          type: 'object',
          properties: {
            booking_title: { type: 'string' },
            event_type: { type: 'string' },
            event_date: { type: 'string', format: 'date' },
            venue_name: { type: 'string' },
            venue_city: { type: 'string' },
            status: { type: 'string' },
            studio: {
              type: 'object',
              properties: {
                name: { type: 'string' },
                logo_url: { type: 'string', format: 'uri' },
                phone: { type: 'string' },
                email: { type: 'string' },
              },
            },
            contract: {
              type: 'object',
              properties: {
                status: { type: 'string' },
                signed_at: { type: 'string', format: 'date-time' },
                signed_pdf_url: { type: 'string', format: 'uri' },
              },
            },
            invoices: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  invoice_number: { type: 'string' },
                  type: { type: 'string' },
                  status: { type: 'string' },
                  amount_due: { type: 'number' },
                  payment_link_url: { type: 'string', format: 'uri' },
                  due_date: { type: 'string', format: 'date' },
                },
              },
            },
            gallery: {
              type: 'object',
              properties: {
                is_published: { type: 'boolean' },
                gallery_url: { type: 'string', format: 'uri' },
                total_photos: { type: 'integer' },
              },
            },
            questionnaire_submitted: { type: 'boolean' },
          },
        },
        ClientPortalMessage: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            sender_type: { type: 'string', enum: ['studio', 'client'] },
            message: { type: 'string' },
            attachment_urls: { type: 'array', items: { type: 'string', format: 'uri' } },
            is_read: { type: 'boolean' },
            created_at: { type: 'string', format: 'date-time' },
          },
        },
        QuestionnaireResponse: {
          type: 'object',
          properties: {
            must_have_shots: { type: 'string' },
            people_to_photograph: { type: 'string' },
            highlight_song: { type: 'string' },
            venue_access_notes: { type: 'string' },
            vendor_contacts: { type: 'string' },
            submitted_at: { type: 'string', format: 'date-time' },
          },
        },

        // --- Dashboard ---
        DashboardSummary: {
          type: 'object',
          properties: {
            bookings_this_month: { type: 'integer' },
            revenue_this_month: { type: 'number' },
            new_leads_this_month: { type: 'integer' },
            photos_delivered_this_month: { type: 'integer' },
            pending: {
              type: 'object',
              properties: {
                unsigned_contracts: { type: 'integer' },
                overdue_invoices: { type: 'integer' },
                advance_due_invoices: { type: 'integer' },
                unread_messages: { type: 'integer' },
                unconfirmed_assignments: { type: 'integer' },
              },
            },
            upcoming_shoots: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  booking_id: { type: 'string', format: 'uuid' },
                  title: { type: 'string' },
                  event_date: { type: 'string', format: 'date' },
                  event_type: { type: 'string' },
                  venue_city: { type: 'string' },
                  client_name: { type: 'string' },
                  assigned_count: { type: 'integer' },
                },
              },
            },
            storage: {
              type: 'object',
              properties: {
                used_gb: { type: 'number' },
                limit_gb: { type: 'number' },
                usage_pct: { type: 'number' },
              },
            },
            recent_activity: {
              type: 'array',
              items: { $ref: '#/components/schemas/ActivityFeedItem' },
            },
          },
        },
        RevenueChartData: {
          type: 'object',
          properties: {
            labels: { type: 'array', items: { type: 'string' } },
            collected: { type: 'array', items: { type: 'number' } },
            pending: { type: 'array', items: { type: 'number' } },
            total_collected: { type: 'number' },
            total_pending: { type: 'number' },
            growth_pct: { type: 'number' },
          },
        },
        BookingPipelineStats: {
          type: 'object',
          properties: {
            stages: {
              type: 'object',
              properties: {
                new_lead: { type: 'integer' },
                contacted: { type: 'integer' },
                proposal_sent: { type: 'integer' },
                contract_signed: { type: 'integer' },
                advance_paid: { type: 'integer' },
                shoot_scheduled: { type: 'integer' },
                delivered: { type: 'integer' },
                closed: { type: 'integer' },
              },
            },
            event_types: { type: 'object', additionalProperties: { type: 'integer' } },
            conversion_rate: { type: 'number' },
          },
        },
        ActivityFeedItem: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            event_type: { type: 'string' },
            booking_title: { type: 'string' },
            actor_name: { type: 'string' },
            actor_type: { type: 'string' },
            metadata: { type: 'object' },
            created_at: { type: 'string', format: 'date-time' },
          },
        },

        // --- Settings ---
        StudioProfile: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            name: { type: 'string' },
            tagline: { type: 'string' },
            logo_url: { type: 'string', format: 'uri' },
            brand_color: { type: 'string' },
            gstin: { type: 'string' },
            pan: { type: 'string' },
            business_address: { type: 'string' },
            phone: { type: 'string' },
            email: { type: 'string' },
            website: { type: 'string' },
            invoice_prefix: { type: 'string' },
            default_advance_pct: { type: 'number' },
            settings: {
              type: 'object',
              properties: {
                email_from_name: { type: 'string' },
                timezone: { type: 'string' },
                notification_prefs: { type: 'object' },
                gallery_defaults: { type: 'object' },
              },
            },
          },
        },
        APIKey: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            name: { type: 'string' },
            key_prefix: { type: 'string' },
            scopes: { type: 'array', items: { type: 'string' } },
            created_at: { type: 'string', format: 'date-time' },
            last_used_at: { type: 'string', format: 'date-time' },
            expires_at: { type: 'string', format: 'date-time' },
            is_active: { type: 'boolean' },
          },
        },
        ExportRequest: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            request_type: { type: 'string' },
            status: { type: 'string', enum: ['processing', 'ready', 'expired', 'failed'] },
            download_url: { type: 'string', format: 'uri' },
            created_at: { type: 'string', format: 'date-time' },
            expires_at: { type: 'string', format: 'date-time' },
          },
        },
      },
    },
  },
  apis: ['./app/api/**/*.ts'], // Path to the API routes
};

const swaggerSpec = swaggerJsdoc(options);

export const getApiDocs = () => {
  return swaggerSpec;
};
