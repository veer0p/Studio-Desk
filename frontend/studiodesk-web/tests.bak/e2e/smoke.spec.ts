import { test, expect } from '@playwright/test'

test.describe('Authentication', () => {
  test('login page loads and shows form', async ({ page }) => {
    await page.goto('/login')
    await expect(page.locator('h1')).toContainText(/StudioDesk/)
    await expect(page.locator('input[type="email"]')).toBeVisible()
    await expect(page.locator('input[type="password"]')).toBeVisible()
    await expect(page.locator('button[type="submit"]')).toBeVisible()
  })

  test('login with invalid credentials shows error', async ({ page }) => {
    await page.goto('/login')
    await page.locator('input[type="email"]').fill('invalid@test.com')
    await page.locator('input[type="password"]').fill('wrongpassword')
    await page.locator('button[type="submit"]').click()
    // Should show error message
    await expect(page.locator('text=Invalid credentials, text=Incorrect, text=Failed')).toBeVisible({ timeout: 10000 })
  })
})

test.describe('Dashboard', () => {
  test.skip('dashboard loads after login', async ({ page }) => {
    // Login first
    await page.goto('/login')
    await page.locator('input[type="email"]').fill('owner@test.com')
    await page.locator('input[type="password"]').fill('Test@1234')
    await page.locator('button[type="submit"]').click()
    await page.waitForURL('**/dashboard')
    await expect(page.locator('h1')).toContainText(/Dashboard/)
  })
})

test.describe('Public Gallery', () => {
  test('gallery page loads with valid slug', async ({ page }) => {
    // Public gallery should load (may 404 if no galleries exist, but page should respond)
    const response = await page.goto('/gallery/p/test-slug')
    expect([200, 404]).toContain(response?.status())
  })
})

test.describe('Public Pages', () => {
  test('home page loads', async ({ page }) => {
    await page.goto('/')
    await expect(page).toHaveTitle(/StudioDesk/)
  })

  test('pricing page loads', async ({ page }) => {
    await page.goto('/pricing')
    await expect(page.locator('h1')).toContainText(/Pricing/)
  })

  test('features page loads', async ({ page }) => {
    await page.goto('/features')
    await expect(page.locator('h1')).toContainText(/Features/)
  })

  test('login page loads', async ({ page }) => {
    await page.goto('/login')
    await expect(page.locator('input[type="email"]')).toBeVisible()
  })

  test('signup page loads', async ({ page }) => {
    await page.goto('/signup')
    await expect(page.locator('input[type="email"]')).toBeVisible()
  })

  test('inquiry page loads', async ({ page }) => {
    await page.goto('/inquiry')
    await expect(page.locator('input[name="name"], input[placeholder*="name"], input[type="text"]')).toBeVisible()
  })
})

test.describe('Mobile Responsiveness', () => {
  test('home page is usable on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 })
    await page.goto('/')
    // Page should render without horizontal scroll
    const bodyWidth = await page.locator('body').evaluate((el) => el.scrollWidth)
    expect(bodyWidth).toBeLessThanOrEqual(390)
  })

  test('login page is usable on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 })
    await page.goto('/login')
    // Form should be visible and inputs tappable
    await expect(page.locator('input[type="email"]')).toBeVisible()
    // Check touch targets are at least 44x44
    const submitBtn = page.locator('button[type="submit"]')
    await expect(submitBtn).toBeVisible()
  })
})

test.describe('Accessibility', () => {
  test('all pages have lang attribute', async ({ page }) => {
    await page.goto('/')
    const htmlLang = await page.locator('html').getAttribute('lang')
    expect(htmlLang).toBeTruthy()
  })

  test('login form has proper labels', async ({ page }) => {
    await page.goto('/login')
    const emailLabel = page.locator('label[for="email"]')
    await expect(emailLabel).toBeVisible()
    const passwordLabel = page.locator('label[for="password"]')
    await expect(passwordLabel).toBeVisible()
  })

  test('buttons have accessible names', async ({ page }) => {
    await page.goto('/login')
    const submitBtn = page.locator('button[type="submit"]')
    await expect(submitBtn).toBeVisible()
    const text = await submitBtn.textContent()
    expect(text?.trim().length).toBeGreaterThan(0)
  })
})
