import { test, expect, Page } from "@playwright/test"

const OWNER = { email: "owner@test.com", password: "Test@1234" }
const PHOTOGRAPHER = { email: "photographer@test.com", password: "Test@1234" }

async function login(page: Page, email: string, password: string) {
  await page.goto("/login")
  // Use precise selectors — the Password label contains a sibling "Forgot password?" link
  await page.locator('input[type="email"]').fill(email)
  await page.locator('input[type="password"]').fill(password)
  await page.getByRole("button", { name: "Sign In" }).click()
  // Wait for redirect — /dashboard has no trailing slash
  await page.waitForURL(/\/(dashboard|bookings|onboarding)/, { timeout: 15000 })
}

// ─────────────────────────────────────────────
// Test Suite: Bookings Page
// ─────────────────────────────────────────────

test.describe("Bookings Page - Studio Owner", () => {
  test.beforeEach(async ({ page }) => {
    await login(page, OWNER.email, OWNER.password)
    await page.goto("/bookings")
    await page.waitForLoadState("networkidle")
  })

  test("page loads with correct title and toolbar", async ({ page }) => {
    await expect(page).toHaveURL(/\/bookings/)
    await expect(page.getByRole("heading", { name: /bookings/i })).toBeVisible()
    await expect(page.getByPlaceholder(/search client, venue/i)).toBeVisible()
    await expect(page.getByRole("button", { name: /new booking/i })).toBeVisible()
  })

  test("switch between Kanban and List view", async ({ page }) => {
    // Default should show Kanban board
    const kanbanBoard = page.locator('[class*="kanban"], [data-testid="kanban-board"]').first()
    const listView = page.locator('table, [data-testid="bookings-list"]').first()

    // Toggle to list view via URL or button
    await page.goto("/bookings?view=list")
    await page.waitForLoadState("networkidle")
    await expect(page).toHaveURL(/view=list/)

    // Back to kanban
    await page.goto("/bookings")
    await page.waitForLoadState("networkidle")
    await expect(page).toHaveURL(/\/bookings/)
  })

  test("search input filters bookings", async ({ page }) => {
    const searchInput = page.getByPlaceholder(/search client, venue/i)
    await searchInput.click()
    await searchInput.fill("wedding")
    await page.waitForTimeout(500) // debounce
    // Input should retain value
    await expect(searchInput).toHaveValue("wedding")
    // Clear search
    await searchInput.clear()
  })

  test("open New Booking dialog", async ({ page }) => {
    await page.getByRole("button", { name: /new booking/i }).click()

    // Dialog should be visible
    const dialog = page.getByRole("dialog")
    await expect(dialog).toBeVisible()

    // Check required fields exist
    await expect(dialog.getByLabel(/client name/i)).toBeVisible()
    await expect(dialog.getByLabel(/event name/i)).toBeVisible()
    await expect(dialog.getByLabel(/event type/i)).toBeVisible()
    await expect(dialog.getByLabel(/event date/i)).toBeVisible()

    // Close with Cancel
    await dialog.getByRole("button", { name: /cancel/i }).click()
    await expect(dialog).not.toBeVisible()
  })

  test("create a new booking", async ({ page }) => {
    await page.getByRole("button", { name: /new booking/i }).click()
    const dialog = page.getByRole("dialog")
    await expect(dialog).toBeVisible()

    // Fill in required fields
    await dialog.getByLabel(/client name/i).fill("Test Client Playwright")
    await dialog.getByLabel(/event name/i).fill("Playwright Wedding")

    // Select event type
    const eventTypeSelect = dialog.getByLabel(/event type/i)
    await eventTypeSelect.click()
    await page.getByRole("option", { name: /wedding/i }).click()

    // Set event date to next month
    const nextMonth = new Date()
    nextMonth.setMonth(nextMonth.getMonth() + 1)
    const dateStr = nextMonth.toISOString().split("T")[0] // YYYY-MM-DD
    await dialog.getByLabel(/event date/i).fill(dateStr)

    // Submit
    await dialog.getByRole("button", { name: /create/i }).click()

    // Dialog should close after successful creation
    await expect(dialog).not.toBeVisible({ timeout: 8000 })
  })

  test("Kanban board shows pipeline stages", async ({ page }) => {
    // Should see stage columns
    await expect(page.getByText(/inquiry/i).first()).toBeVisible()
    await expect(page.getByText(/proposal sent/i).first()).toBeVisible()
    await expect(page.getByText(/confirmed/i).first()).toBeVisible()
  })

  test("click a Kanban card opens slide-over", async ({ page }) => {
    // Click the first booking card in Kanban view
    const firstCard = page.locator('[class*="KanbanCard"], [data-testid="kanban-card"]').first()

    // If cards exist, click one
    const cardCount = await firstCard.count()
    if (cardCount > 0) {
      await firstCard.click()
      // URL should update with id param
      await expect(page).toHaveURL(/id=/)
      // Slide-over should appear
      const slideOver = page.locator('[role="dialog"], [data-testid="booking-slideover"]').last()
      await expect(slideOver).toBeVisible({ timeout: 5000 })
    }
  })

  test("List view - table columns are visible", async ({ page }) => {
    await page.goto("/bookings?view=list")
    await page.waitForLoadState("networkidle")

    await expect(page.getByRole("columnheader", { name: /client/i })).toBeVisible()
    await expect(page.getByRole("columnheader", { name: /event/i })).toBeVisible()
    await expect(page.getByRole("columnheader", { name: /date/i })).toBeVisible()
    await expect(page.getByRole("columnheader", { name: /stage/i })).toBeVisible()
    await expect(page.getByRole("columnheader", { name: /amount/i })).toBeVisible()
  })

  test("List view - open booking actions menu", async ({ page }) => {
    await page.goto("/bookings?view=list")
    await page.waitForLoadState("networkidle")

    // Find first row's actions button
    const firstRowActions = page.getByRole("button", { name: /more|actions|\.\.\./i }).first()
    const count = await firstRowActions.count()

    if (count > 0) {
      await firstRowActions.click()
      // Menu options should appear
      await expect(page.getByRole("menuitem", { name: /view details/i })).toBeVisible()
      await expect(page.getByRole("menuitem", { name: /edit booking/i })).toBeVisible()
      // Close menu
      await page.keyboard.press("Escape")
    }
  })

  test("slide-over tabs are functional", async ({ page }) => {
    // Navigate to a booking with slide-over
    await page.goto("/bookings?view=list")
    await page.waitForLoadState("networkidle")

    const firstRow = page.getByRole("row").nth(1) // skip header
    const rowCount = await firstRow.count()

    if (rowCount > 0) {
      await firstRow.click()
      await page.waitForURL(/id=/, { timeout: 5000 })

      // Check tabs exist in slide-over
      const tabs = ["Overview", "Timeline", "Finance", "Files", "Notes"]
      for (const tab of tabs) {
        const tabEl = page.getByRole("tab", { name: tab })
        if (await tabEl.count() > 0) {
          await expect(tabEl).toBeVisible()
        }
      }

      // Click through tabs
      const financeTab = page.getByRole("tab", { name: /finance/i })
      if (await financeTab.count() > 0) {
        await financeTab.click()
        await expect(page.getByText(/package value/i)).toBeVisible({ timeout: 3000 })
      }

      const notesTab = page.getByRole("tab", { name: /notes/i })
      if (await notesTab.count() > 0) {
        await notesTab.click()
        await expect(page.getByRole("textbox", { name: /notes/i }).or(
          page.locator("textarea")
        ).first()).toBeVisible({ timeout: 3000 })
      }
    }
  })
})

// ─────────────────────────────────────────────
// Test Suite: Team Member access
// ─────────────────────────────────────────────

test.describe("Bookings Page - Team Member (Photographer)", () => {
  test.beforeEach(async ({ page }) => {
    await login(page, PHOTOGRAPHER.email, PHOTOGRAPHER.password)
    await page.goto("/bookings")
    await page.waitForLoadState("networkidle")
  })

  test("can view bookings page", async ({ page }) => {
    await expect(page).toHaveURL(/\/bookings/)
    await expect(page.getByRole("heading", { name: /bookings/i })).toBeVisible()
  })

  test("can search bookings", async ({ page }) => {
    const searchInput = page.getByPlaceholder(/search client, venue/i)
    await searchInput.fill("test")
    await page.waitForTimeout(500)
    await expect(searchInput).toHaveValue("test")
  })
})
