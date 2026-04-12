import { SupabaseClient } from '@supabase/supabase-js'
import { Database } from '@/types/supabase'
import { Errors } from '@/lib/errors'

type Db = SupabaseClient<Database>

export const NotificationService = {
  async create(
    supabase: Db,
    studioId: string,
    userId: string,
    type: string,
    title: string,
    body: string | null,
    link: string | null = null,
    entityType: string | null = null,
    entityId: string | null = null
  ) {
    const { data, error } = await supabase
      .from('notifications')
      .insert({
        studio_id: studioId,
        user_id: userId,
        type,
        title,
        body,
        link,
        entity_type: entityType,
        entity_id: entityId,
      })
      .select('*')
      .single()

    if (error) throw Errors.validation('Failed to create notification')
    return data
  },

  async getUserNotifications(
    supabase: Db,
    userId: string,
    page = 0,
    pageSize = 20,
    isRead?: boolean
  ) {
    let query = supabase
      .from('notifications')
      .select('*', { count: 'exact' })
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (isRead !== undefined) {
      query = query.eq('is_read', isRead)
    }

    const offset = page * pageSize
    const { data, count, error } = await query.range(offset, offset + pageSize - 1)

    if (error) throw Errors.validation('Failed to fetch notifications')
    return { notifications: data || [], count: count || 0, page, pageSize }
  },

  async markAsRead(supabase: Db, notificationId: string, userId: string) {
    const { data, error } = await supabase
      .from('notifications')
      .update({ is_read: true, read_at: new Date().toISOString() })
      .eq('id', notificationId)
      .eq('user_id', userId)
      .select('*')
      .single()

    if (error || !data) throw Errors.validation('Failed to update notification')
    return data
  },

  async markAllAsRead(supabase: Db, userId: string) {
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true, read_at: new Date().toISOString() })
      .eq('user_id', userId)
      .eq('is_read', false)

    if (error) throw Errors.validation('Failed to mark all as read')
  },

  async getUnreadCount(supabase: Db, userId: string): Promise<number> {
    const { count, error } = await supabase
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('is_read', false)

    if (error) throw Errors.validation('Failed to get unread count')
    return count || 0
  },

  async deleteNotification(supabase: Db, notificationId: string, userId: string) {
    const { error } = await supabase
      .from('notifications')
      .delete()
      .eq('id', notificationId)
      .eq('user_id', userId)

    if (error) throw Errors.validation('Failed to delete notification')
  },
}
