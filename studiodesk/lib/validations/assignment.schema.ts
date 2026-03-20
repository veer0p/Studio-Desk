import { z } from 'zod'
import { dateSchema, phoneSchema, uuidSchema } from '@/lib/validations/common.schema'

export const assignmentRoleSchema = z.enum([
  'photographer',
  'videographer',
  'assistant',
  'editor',
  'drone_operator',
  'other',
])

export const assignmentStatusSchema = z.enum(['pending', 'confirmed', 'declined'])

export const assignmentInputSchema = z.object({
  member_id: uuidSchema,
  role: assignmentRoleSchema,
  notes: z.string().max(500).optional(),
})

export const createAssignmentsSchema = z.object({
  assignments: z.array(assignmentInputSchema).min(1).max(10),
})

export const updateAssignmentSchema = z
  .object({
    role: assignmentRoleSchema.optional(),
    status: assignmentStatusSchema.optional(),
    notes: z.string().max(500).optional(),
    decline_reason: z.string().max(500).optional(),
  })
  .refine((obj) => Object.keys(obj).length > 0, {
    message: 'At least one field required',
  })
  .refine((data) => {
    if (data.status === 'declined' && !data.decline_reason) return false
    return true
  }, { message: 'Decline reason required when declining' })

export const teamScheduleQuerySchema = z.object({
  from_date: dateSchema.optional(),
  to_date: dateSchema.optional(),
  member_id: uuidSchema.optional(),
})

export const memberAssignmentsQuerySchema = z.object({
  from_date: dateSchema.optional(),
  to_date: dateSchema.optional(),
  status: assignmentStatusSchema.optional(),
})

export const shootBriefSchema = z
  .object({
    call_time: z.string().regex(/^\d{2}:\d{2}$/).optional(),
    shoot_start_time: z.string().regex(/^\d{2}:\d{2}$/).optional(),
    shoot_end_time: z.string().regex(/^\d{2}:\d{2}$/).optional(),
    venue_address: z.string().max(500).optional(),
    venue_map_link: z.string().url().optional(),
    client_name: z.string().max(200).optional(),
    client_phone: phoneSchema.optional(),
    client_whatsapp: phoneSchema.optional(),
    special_instructions: z.string().max(2000).optional(),
    shot_list: z.array(z.string().max(200)).max(100).optional(),
    reference_images: z.array(z.string().url()).max(20).optional(),
    equipment_notes: z.string().max(1000).optional(),
    outfit_notes: z.string().max(1000).optional(),
  })
  .refine((obj) => Object.keys(obj).length > 0, {
    message: 'At least one field required',
  })

export type AssignmentInput = z.infer<typeof assignmentInputSchema>
export type UpdateAssignmentInput = z.infer<typeof updateAssignmentSchema>
export type TeamScheduleQueryInput = z.infer<typeof teamScheduleQuerySchema>
export type MemberAssignmentsQueryInput = z.infer<typeof memberAssignmentsQuerySchema>
export type ShootBriefInput = z.infer<typeof shootBriefSchema>
