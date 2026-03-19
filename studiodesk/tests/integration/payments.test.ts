import { beforeAll, beforeEach, describe, expect, it } from 'vitest'
import { makeRequest } from '../helpers/request'
import { getOwnerToken, type AuthToken } from '../helpers/auth'
import { PAYMENT_MANUAL_ID } from '../../supabase/seed'
import { resetInvoiceFixtures } from './helpers/invoice-fixtures'

describe('Payments API Integration', () => {
  let owner: AuthToken

  beforeAll(async () => {
    owner = await getOwnerToken()
  })

  beforeEach(async () => {
    await resetInvoiceFixtures()
  })

  it('GET /payments requires auth and returns paginated rows', async () => {
    expect((await makeRequest('GET', '/api/v1/payments')).status).toBe(401)
    const res = await makeRequest('GET', '/api/v1/payments?page=0&pageSize=10&status=captured', { token: owner.access_token })
    expect(res.status).toBe(200)
    expect((res.body as any).meta.pageSize).toBe(10)
    expect(((res.body as any).data as any[]).length).toBeGreaterThan(0)
  })

  it('GET /payments/:id returns the payment detail', async () => {
    const res = await makeRequest('GET', `/api/v1/payments/${PAYMENT_MANUAL_ID}`, { token: owner.access_token })
    expect(res.status).toBe(200)
    expect((res.body as any).data.id).toBe(PAYMENT_MANUAL_ID)
    expect((res.body as any).data.amount).toBe('25500.00')
  })
})
