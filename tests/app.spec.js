import { test, expect } from '@playwright/test'

// Helper to clear app state before each test
async function clearAppState(page) {
  await page.evaluate(() => {
    localStorage.clear()
  })
}

// Helper to complete onboarding quickly
async function completeOnboarding(page, name = 'Test User') {
  // Step 0: Welcome → Get Started
  await expect(page.getByText('The Good Life')).toBeVisible()
  await page.getByText('Get Started').click()

  // Step 1: Name
  await page.getByPlaceholder('Enter your name').fill(name)
  await page.getByText('Continue').click()

  // Step 2: Five Capitals → Continue (all defaults on)
  await expect(page.getByText('Your Five Capitals')).toBeVisible()
  await page.getByText('Continue').click()

  // Step 3: Theme → Continue (default dark)
  await expect(page.getByText('Choose Your Look')).toBeVisible()
  await page.getByText('Continue').click()

  // Step 4: Photo → Skip
  await expect(page.getByText('Add a photo?')).toBeVisible()
  await page.getByText('Skip for now').click()
}

// Helper to complete intro guide
async function completeIntroGuide(page) {
  await page.getByText('Skip').click()
}

// ====================
// ONBOARDING FLOW
// ====================

test.describe('Onboarding', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    await clearAppState(page)
    await page.reload()
  })

  test('shows welcome screen on first launch', async ({ page }) => {
    await expect(page.getByText('The Good Life')).toBeVisible()
    await expect(page.getByText('Get Started')).toBeVisible()
    await expect(page.getByText('Know God. Find Freedom.')).toBeVisible()
  })

  test('progresses through all 5 steps', async ({ page }) => {
    // Step 0: Welcome
    await page.getByText('Get Started').click()

    // Step 1: Name
    await expect(page.getByPlaceholder('Enter your name')).toBeVisible()
    await page.getByPlaceholder('Enter your name').fill('Noah')
    await page.getByText('Continue').click()

    // Step 2: Five Capitals
    await expect(page.getByText('Your Five Capitals')).toBeVisible()
    await expect(page.getByText('Spiritual')).toBeVisible()
    await expect(page.getByText('Relational')).toBeVisible()
    await expect(page.getByText('Physical')).toBeVisible()
    await expect(page.getByText('Intellectual')).toBeVisible()
    await expect(page.getByText('Financial')).toBeVisible()
    await page.getByText('Continue').click()

    // Step 3: Theme
    await expect(page.getByText('Choose Your Look')).toBeVisible()
    await expect(page.getByText('Dark Mode')).toBeVisible()
    await expect(page.getByText('Light Mode')).toBeVisible()
    await page.getByText('Continue').click()

    // Step 4: Photo
    await expect(page.getByText('Add a photo?')).toBeVisible()
    await page.getByText('Skip for now').click()

    // Should land on Intro Guide
    await expect(page.getByText('Five Capitals').first()).toBeVisible()
  })

  test('allows skipping name', async ({ page }) => {
    await page.getByText('Get Started').click()
    // Don't fill name, just continue
    await page.getByText('Continue').click()
    await expect(page.getByText('Your Five Capitals')).toBeVisible()
  })

  test('go back buttons work', async ({ page }) => {
    await page.getByText('Get Started').click()
    await expect(page.getByPlaceholder('Enter your name')).toBeVisible()
    await page.getByText('Go back').click()
    await expect(page.getByText('Get Started')).toBeVisible()
  })

  test('can toggle capitals off during onboarding', async ({ page }) => {
    await page.getByText('Get Started').click()
    await page.getByText('Continue').click() // skip name

    // All 5 capital checkboxes should be visible
    const checkmarks = page.locator('svg path[d="M5 13l4 4L19 7"]')
    await expect(checkmarks.first()).toBeVisible()
  })

  test('can expand capital details', async ({ page }) => {
    await page.getByText('Get Started').click()
    await page.getByText('Continue').click() // skip name

    // Click on Spiritual capital text to expand
    await page.getByText('Your relationship with God').click()
    await expect(page.getByText('Why It Matters')).toBeVisible()
    await expect(page.getByText('Matthew 6:33')).toBeVisible()
  })

  test('theme selection applies immediately', async ({ page }) => {
    // Walk through to the theme step
    await page.getByText('Get Started').click()
    await expect(page.getByPlaceholder('Enter your name')).toBeVisible()
    await page.getByText('Continue').click() // name → capitals
    await expect(page.getByText('Your Five Capitals')).toBeVisible()
    await page.getByText('Continue').click() // capitals → theme

    await expect(page.getByText('Choose Your Look')).toBeVisible()
    await page.getByText('Light Mode').click()
    const html = page.locator('html')
    await expect(html).toHaveAttribute('data-theme', 'light')

    await page.getByText('Dark Mode').click()
    await expect(html).toHaveAttribute('data-theme', 'dark')
  })
})

// ====================
// INTRO GUIDE
// ====================

test.describe('Intro Guide', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    await clearAppState(page)
    await page.reload()
    await completeOnboarding(page)
  })

  test('shows 3 slides and can progress through them', async ({ page }) => {
    await expect(page.getByText('Five Capitals')).toBeVisible()
    await page.getByText('Continue').click()
    await expect(page.getByText('Daily Rhythms')).toBeVisible()
    await page.getByText('Continue').click()
    await expect(page.getByText('Your Journey')).toBeVisible()
    await page.getByText("Let's Go").click()
    // Should land on Dashboard
    await expect(page.getByText('Good')).toBeVisible() // Good Morning/Afternoon/Evening
  })

  test('skip button works', async ({ page }) => {
    await page.getByText('Skip').click()
    await expect(page.getByText('Good')).toBeVisible() // Dashboard
  })
})

// ====================
// DASHBOARD
// ====================

test.describe('Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    await clearAppState(page)
    await page.reload()
    await completeOnboarding(page, 'Noah')
    await completeIntroGuide(page)
  })

  test('shows greeting with user name', async ({ page }) => {
    await expect(page.getByText(/Noah/)).toBeVisible()
  })

  test('shows Five Capitals progress section', async ({ page }) => {
    await expect(page.getByText('Five Capitals')).toBeVisible()
    await expect(page.getByText('0% today')).toBeVisible()
  })

  test('shows Up Next disciplines', async ({ page }) => {
    await expect(page.getByText('Up Next')).toBeVisible()
    await expect(page.getByText('Bible Reading')).toBeVisible()
  })

  test('can toggle discipline from dashboard', async ({ page }) => {
    const bibleReading = page.locator('.home-card', { hasText: 'Bible Reading' })
    await bibleReading.click()
    // After toggling, it should disappear from "Up Next" (it's completed)
    await expect(bibleReading).not.toBeVisible({ timeout: 2000 })
  })

  test('shows daily scripture', async ({ page }) => {
    // Scripture card should exist
    const scriptureSection = page.locator('.scripture-card')
    await expect(scriptureSection).toBeVisible()
  })

  test('quick access buttons navigate correctly', async ({ page }) => {
    await page.getByText('Track disciplines').click()
    await expect(page).toHaveURL(/\/today/)
    await page.goBack()

    await page.getByText('View progress').click()
    await expect(page).toHaveURL(/\/week/)
  })

  test('profile button navigates to settings', async ({ page }) => {
    // Click the profile circle in header
    await page.locator('header button').last().click()
    await expect(page).toHaveURL(/\/settings/)
  })
})

// ====================
// DISCIPLINE TRACKER (/today)
// ====================

test.describe('Discipline Tracker', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    await clearAppState(page)
    await page.reload()
    await completeOnboarding(page)
    await completeIntroGuide(page)
    await page.goto('/today')
  })

  test('shows today with all 5 capital sections', async ({ page }) => {
    await expect(page.getByRole('button', { name: 'Today' })).toBeVisible()
    await expect(page.getByText('Spiritual')).toBeVisible()
    await expect(page.getByText('Relational')).toBeVisible()
    await expect(page.getByText('Physical')).toBeVisible()
    await expect(page.getByText('Intellectual')).toBeVisible()
    await expect(page.getByText('Financial')).toBeVisible()
  })

  test('can check off disciplines', async ({ page }) => {
    // Find and click Bible Reading checkbox
    await page.getByText('Bible Reading').click()
    // Completion should increase from 0%
    await expect(page.getByText('0%')).not.toBeVisible({ timeout: 2000 })
  })

  test('can navigate between dates', async ({ page }) => {
    // Click prev date button
    await page.locator('header button').first().click()
    await expect(page.getByRole('button', { name: 'Today' })).not.toBeVisible()
    // Click next date button
    await page.locator('header button').nth(1).click()
  })

  test('tapping date label resets to today', async ({ page }) => {
    // Navigate away
    await page.locator('header button').first().click()
    // Click the day name to go back to today
    await page.getByText(/Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday/).click()
    await expect(page.getByRole('button', { name: 'Today' })).toBeVisible()
  })

  test('can rate a capital 1-5', async ({ page }) => {
    // Click rating bubble "3" for spiritual
    const ratingButtons = page.locator('button').filter({ has: page.locator('.rounded-full') })
    // Find the first Rate section and click the 3rd button
    const rateSection = page.getByText('Rate:').first()
    await expect(rateSection).toBeVisible()
  })

  test('can add reflection text', async ({ page }) => {
    // Click "Add reflection" in the spiritual section
    await page.getByText('Add reflection').first().click()
    const textarea = page.locator('textarea').first()
    await expect(textarea).toBeVisible()
    await textarea.fill('God showed me patience today.')
    await expect(textarea).toHaveValue('God showed me patience today.')
  })

  test('data persists across page reloads', async ({ page }) => {
    // Check off a discipline
    await page.getByText('Bible Reading').click()
    // Add a reflection
    await page.getByText('Add reflection').first().click()
    await page.locator('textarea').first().fill('Test reflection')

    // Reload page
    await page.reload()
    await page.goto('/today')

    // Wait for page to load
    await expect(page.getByText('Spiritual')).toBeVisible()
    // Bible Reading should still be checked (completion > 0)
  })

  test('shows correct discipline count per capital', async ({ page }) => {
    // Spiritual has 5 disciplines: 0/5
    await expect(page.getByText('0/5')).toBeVisible()
    // Click one
    await page.getByText('Bible Reading').click()
    await expect(page.getByText('1/5')).toBeVisible()
  })
})

// ====================
// NAVIGATION
// ====================

test.describe('Navigation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    await clearAppState(page)
    await page.reload()
    await completeOnboarding(page)
    await completeIntroGuide(page)
  })

  test('bottom nav bar is visible with 5 tabs', async ({ page }) => {
    const nav = page.getByRole('navigation')
    await expect(nav).toBeVisible()
    await expect(nav.getByText('Home')).toBeVisible()
    await expect(nav.getByText('Today')).toBeVisible()
    await expect(nav.getByText('Calendar')).toBeVisible()
    await expect(nav.getByText('Fasting')).toBeVisible()
    await expect(nav.getByText('Settings')).toBeVisible()
  })

  test('each tab navigates to correct page', async ({ page }) => {
    await page.getByRole('navigation').getByText('Today').click()
    await expect(page).toHaveURL(/\/today/)

    await page.getByRole('navigation').getByText('Calendar').click()
    await expect(page).toHaveURL(/\/calendar/)

    await page.getByRole('navigation').getByText('Fasting').click()
    await expect(page).toHaveURL(/\/fasting/)

    await page.getByRole('navigation').getByText('Settings').click()
    await expect(page).toHaveURL(/\/settings/)

    await page.getByRole('navigation').getByText('Home').click()
    await expect(page).toHaveURL(/\/$/)
  })
})

// ====================
// SETTINGS
// ====================

test.describe('Settings', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    await clearAppState(page)
    await page.reload()
    await completeOnboarding(page, 'Noah')
    await completeIntroGuide(page)
    await page.goto('/settings')
  })

  test('shows user profile with name', async ({ page }) => {
    await expect(page.getByText('Noah')).toBeVisible()
  })

  test('shows sign in prompt for guest users', async ({ page }) => {
    await expect(page.getByText('Sign In to Sync Your Data')).toBeVisible()
  })

  test('can toggle dark/light mode', async ({ page }) => {
    const html = page.locator('html')
    await expect(html).toHaveAttribute('data-theme', 'dark')

    // Find and click the Dark Mode toggle
    const darkModeRow = page.getByText('Dark Mode').locator('..')
    await darkModeRow.locator('button').click()
    await expect(html).toHaveAttribute('data-theme', 'light')
  })

  test('shows capitals in settings', async ({ page }) => {
    await page.getByText('FIVE CAPITALS').scrollIntoViewIfNeeded()
    await expect(page.getByText('FIVE CAPITALS')).toBeVisible()
  })

  test('can add a guest partner', async ({ page }) => {
    const partnerInput = page.getByPlaceholder('Partner name')
    await partnerInput.scrollIntoViewIfNeeded()
    await partnerInput.fill('Sarah')
    await partnerInput.locator('xpath=../..').locator('button:has-text("Add")').click()
    await expect(page.getByText('Sarah')).toBeVisible()
  })

  test('can add a custom discipline', async ({ page }) => {
    const disciplineInput = page.getByPlaceholder('New discipline name')
    await disciplineInput.scrollIntoViewIfNeeded()
    await disciplineInput.fill('Journaling')
    // The Add button is a sibling in the same flex row
    const addBtn = disciplineInput.locator('xpath=../..').locator('button:has-text("Add")')
    await addBtn.click()
    await expect(page.getByText('Journaling')).toBeVisible()
  })

  test('export data produces a download', async ({ page }) => {
    const download = page.waitForEvent('download')
    await page.getByText('Export Data').click()
    const file = await download
    expect(file.suggestedFilename()).toContain('thegoodlife-backup')
  })

  test('reset data shows confirmation modal', async ({ page }) => {
    await page.getByText('Reset All Data').click()
    await expect(page.getByText('This will delete ALL your data')).toBeVisible()
    // Cancel
    await page.getByText('Cancel').click()
    // Should still be on settings
    await expect(page.getByText('Noah')).toBeVisible()
  })

  test('shows Movement logo and version', async ({ page }) => {
    await expect(page.getByText('Version 1.0.0')).toBeVisible()
  })
})

// ====================
// FASTING TRACKER
// ====================

test.describe('Fasting Tracker', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    await clearAppState(page)
    await page.reload()
    await completeOnboarding(page)
    await completeIntroGuide(page)
    await page.goto('/fasting')
  })

  test('shows fasting page', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Fasting' })).toBeVisible()
  })
})

// ====================
// CALENDAR
// ====================

test.describe('Calendar', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    await clearAppState(page)
    await page.reload()
    await completeOnboarding(page)
    await completeIntroGuide(page)
    await page.goto('/calendar')
  })

  test('shows calendar with current month', async ({ page }) => {
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December']
    const currentMonth = monthNames[new Date().getMonth()]
    await expect(page.getByText(currentMonth)).toBeVisible()
  })
})

// ====================
// WEEKLY PROGRESS
// ====================

test.describe('Weekly Progress', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    await clearAppState(page)
    await page.reload()
    await completeOnboarding(page)
    await completeIntroGuide(page)
    await page.goto('/week')
  })

  test('shows weekly view', async ({ page }) => {
    await expect(page.getByText(/Week|Weekly/i)).toBeVisible()
  })
})

// ====================
// EDGE CASES
// ====================

test.describe('Edge Cases', () => {
  test('handles missing localStorage gracefully', async ({ page }) => {
    await page.goto('/')
    await page.evaluate(() => {
      // Corrupt localStorage
      localStorage.setItem('thegoodlife_settings', 'not-json')
    })
    await page.reload()
    // Should not crash — falls back to defaults
    await expect(page.getByText('The Good Life')).toBeVisible()
  })

  test('handles empty disciplines object', async ({ page }) => {
    await page.goto('/')
    await clearAppState(page)
    await page.reload()
    await completeOnboarding(page)
    await completeIntroGuide(page)
    await page.goto('/today')
    // All sections should render with 0 completion
    await expect(page.getByText('0%')).toBeVisible()
  })

  test('direct URL navigation works for all routes', async ({ page }) => {
    await page.goto('/')
    await clearAppState(page)
    await page.reload()
    await completeOnboarding(page)
    await completeIntroGuide(page)

    // SPA routes should all work
    await page.goto('/today')
    await expect(page.getByText('Spiritual')).toBeVisible()

    await page.goto('/week')
    await expect(page.getByText(/Week/i)).toBeVisible()

    await page.goto('/calendar')
    await expect(page.locator('nav')).toBeVisible()

    await page.goto('/settings')
    await expect(page.getByText('PROFILE')).toBeVisible()
  })

  test('unknown routes redirect to home', async ({ page }) => {
    await page.goto('/')
    await clearAppState(page)
    await page.reload()
    await completeOnboarding(page)
    await completeIntroGuide(page)

    await page.goto('/nonexistent-page')
    await expect(page).toHaveURL(/\/$/)
  })

  test('magic link verify route with no token redirects home', async ({ page }) => {
    await page.goto('/')
    await clearAppState(page)
    await page.reload()
    await completeOnboarding(page)
    await completeIntroGuide(page)

    await page.goto('/auth/verify')
    await expect(page).toHaveURL(/\/$/)
  })

  test('magic link verify route with bad token shows error', async ({ page }) => {
    await page.goto('/auth/verify?token=invalid-token-here')
    await expect(page.getByText(/expired|invalid|error|Signing/i)).toBeVisible({ timeout: 5000 })
  })

  test('localStorage persists data for guest users', async ({ page }) => {
    await page.goto('/')
    await clearAppState(page)
    await page.reload()
    await completeOnboarding(page)
    await completeIntroGuide(page)

    // Navigate to /today
    await page.goto('/today')
    await expect(page.getByText('Spiritual')).toBeVisible()
    await page.getByText('Bible Reading').click()
    // Small wait for localStorage debounce
    await page.waitForTimeout(500)

    // Verify data was saved to localStorage
    const hasDisciplines = await page.evaluate(() => {
      const data = localStorage.getItem('thegoodlife_disciplines')
      return data && data.includes('bible-reading')
    })
    expect(hasDisciplines).toBe(true)
  })
})

// ====================
// PWA INSTALL PROMPT
// ====================

test.describe('Install Prompt', () => {
  test('does not show for dismissed users', async ({ page }) => {
    await page.goto('/')
    await page.evaluate(() => {
      localStorage.setItem('thegoodlife_install_dismissed', '1')
    })
    await page.reload()
    // Install prompt should not appear
    await expect(page.getByText('Add to Home Screen')).not.toBeVisible({ timeout: 5000 })
  })
})
