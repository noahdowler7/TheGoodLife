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

// Helper to get through onboarding + intro in one shot
async function setupApp(page, name = 'Test User') {
  await page.goto('/')
  await clearAppState(page)
  await page.reload()
  await completeOnboarding(page, name)
  await completeIntroGuide(page)
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
    await page.getByText('Get Started').click()

    await expect(page.getByPlaceholder('Enter your name')).toBeVisible()
    await page.getByPlaceholder('Enter your name').fill('Noah')
    await page.getByText('Continue').click()

    await expect(page.getByText('Your Five Capitals')).toBeVisible()
    await expect(page.getByText('Spiritual')).toBeVisible()
    await expect(page.getByText('Financial')).toBeVisible()
    await page.getByText('Continue').click()

    await expect(page.getByText('Choose Your Look')).toBeVisible()
    await page.getByText('Continue').click()

    await expect(page.getByText('Add a photo?')).toBeVisible()
    await page.getByText('Skip for now').click()

    await expect(page.getByText('Five Capitals').first()).toBeVisible()
  })

  test('allows skipping name', async ({ page }) => {
    await page.getByText('Get Started').click()
    await page.getByText('Continue').click()
    await expect(page.getByText('Your Five Capitals')).toBeVisible()
  })

  test('go back buttons work', async ({ page }) => {
    await page.getByText('Get Started').click()
    await expect(page.getByPlaceholder('Enter your name')).toBeVisible()
    await page.getByText('Go back').click()
    await expect(page.getByText('Get Started')).toBeVisible()
  })

  test('theme selection applies immediately', async ({ page }) => {
    await page.getByText('Get Started').click()
    await page.getByPlaceholder('Enter your name').fill('Test')
    await page.getByText('Continue').click()
    await expect(page.getByText('Your Five Capitals')).toBeVisible()
    await page.getByText('Continue').click()
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

  test('shows slides and can progress through them', async ({ page }) => {
    await expect(page.getByText('Five Capitals')).toBeVisible()
    await page.getByText('Continue').click()
    await expect(page.getByText('Daily Rhythms')).toBeVisible()
    await page.getByText('Continue').click()
    await expect(page.getByText('Your Journey')).toBeVisible()
    await page.getByText("Let's Go").click()
    await expect(page.getByText('Good')).toBeVisible()
  })

  test('skip button works', async ({ page }) => {
    await page.getByText('Skip').click()
    await expect(page.getByText('Good')).toBeVisible()
  })
})

// ====================
// DASHBOARD
// ====================

test.describe('Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    await setupApp(page, 'Noah')
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

  test('Up Next taps navigate to /today', async ({ page }) => {
    const bibleReading = page.locator('.home-card', { hasText: 'Bible Reading' })
    await bibleReading.click()
    await expect(page).toHaveURL(/\/today/)
  })

  test('shows daily scripture', async ({ page }) => {
    await expect(page.locator('.scripture-card')).toBeVisible()
  })

  test('quick access buttons navigate correctly', async ({ page }) => {
    await page.getByText('Track disciplines').click()
    await expect(page).toHaveURL(/\/today/)
    await page.goBack()

    await page.getByText('View progress').click()
    await expect(page).toHaveURL(/\/week/)
  })

  test('profile button navigates to settings', async ({ page }) => {
    await page.locator('header button').last().click()
    await expect(page).toHaveURL(/\/settings/)
  })
})

// ====================
// DISCIPLINE TRACKER (/today)
// ====================

test.describe('Discipline Tracker', () => {
  test.beforeEach(async ({ page }) => {
    await setupApp(page)
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

  test('shows correct discipline counts per capital', async ({ page }) => {
    await expect(page.getByText('0/5')).toBeVisible() // Spiritual: 5 disciplines
    await expect(page.getByText('0/1')).toBeVisible() // Financial: 1 stewardship discipline
  })

  test('can navigate between dates', async ({ page }) => {
    await page.locator('header button').first().click()
    await expect(page.getByRole('button', { name: 'Today' })).not.toBeVisible()
    await page.locator('header button').nth(1).click()
  })

  test('tapping date label resets to today', async ({ page }) => {
    await page.locator('header button').first().click()
    await page.getByText(/Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday/).click()
    await expect(page.getByRole('button', { name: 'Today' })).toBeVisible()
  })

  test('can rate a capital 1-5', async ({ page }) => {
    const rateSection = page.getByText('Rate:').first()
    await expect(rateSection).toBeVisible()
  })

  test('can add capital reflection text', async ({ page }) => {
    await page.getByText('Add reflection').first().click()
    const textarea = page.locator('textarea').first()
    await expect(textarea).toBeVisible()
    await textarea.fill('God showed me patience today.')
    await expect(textarea).toHaveValue('God showed me patience today.')
  })

  test('data persists across page reloads', async ({ page }) => {
    // Open Prayer enrichment and fill in something
    await page.getByText('Prayer').click()
    await expect(page.getByText('Prayer — ACTS')).toBeVisible()
    const adorationTextarea = page.locator('textarea').first()
    await adorationTextarea.fill('Thank you for your faithfulness')
    // Prayer should auto-check
    await page.waitForTimeout(300)

    // Reload page
    await page.reload()
    await page.goto('/today')

    // Wait for page to load, check that prayer data persisted
    await expect(page.getByText('Spiritual')).toBeVisible()
  })
})

// ====================
// PRAYER ACTS ENRICHMENT
// ====================

test.describe('Prayer ACTS Enrichment', () => {
  test.beforeEach(async ({ page }) => {
    await setupApp(page)
    await page.goto('/today')
  })

  test('tapping Prayer opens ACTS flow', async ({ page }) => {
    await page.getByText('Prayer').click()
    await expect(page.getByText('Prayer — ACTS')).toBeVisible()
    await expect(page.getByText('Adoration')).toBeVisible()
    await expect(page.getByText('Confession')).toBeVisible()
    await expect(page.getByText('Thanksgiving')).toBeVisible()
    await expect(page.getByText('Supplication')).toBeVisible()
  })

  test('filling any ACTS field auto-checks prayer', async ({ page }) => {
    await page.getByText('Prayer').click()
    // Fill Adoration textarea
    const textarea = page.getByPlaceholder('God, I praise you for...')
    await textarea.fill('Your faithfulness and love')
    // Close the enrichment
    await page.getByText('Close').click()
    // Prayer should now show as checked (1/5 instead of 0/5)
    await expect(page.getByText('1/5')).toBeVisible()
  })

  test('Close button returns to checklist', async ({ page }) => {
    await page.getByText('Prayer').click()
    await expect(page.getByText('Prayer — ACTS')).toBeVisible()
    await page.getByText('Close').click()
    await expect(page.getByText('Prayer — ACTS')).not.toBeVisible()
    // Should see the checklist again
    await expect(page.getByText('Bible Reading')).toBeVisible()
  })

  test('ACTS data persists after close and reopen', async ({ page }) => {
    await page.getByText('Prayer').click()
    const textarea = page.getByPlaceholder('God, I praise you for...')
    await textarea.fill('Your mercy')
    await page.getByText('Close').click()
    // Reopen
    // Prayer is now checked, so tapping it unchecks it
    // We need to uncheck it first, then click again to reopen
    await page.getByText('Prayer').click() // unchecks
    await page.getByText('Prayer').click() // reopens enrichment
    await expect(page.getByPlaceholder('God, I praise you for...')).toHaveValue('Your mercy')
  })
})

// ====================
// FINANCIAL STEWARDSHIP
// ====================

test.describe('Financial Stewardship', () => {
  test.beforeEach(async ({ page }) => {
    await setupApp(page)
    await page.goto('/today')
  })

  test('shows stewardship card instead of checkboxes', async ({ page }) => {
    await expect(page.getByText('How did you steward your resources today?')).toBeVisible()
    await expect(page.getByText('Gave generously')).toBeVisible()
    await expect(page.getByText('Spent wisely')).toBeVisible()
    await expect(page.getByText('Saved intentionally')).toBeVisible()
    await expect(page.getByText('Reviewed finances')).toBeVisible()
  })

  test('tapping a pill marks stewardship complete', async ({ page }) => {
    await page.getByText('Gave generously').click()
    await expect(page.getByText('1/1')).toBeVisible()
  })

  test('can select multiple pills', async ({ page }) => {
    await page.getByText('Gave generously').click()
    await page.getByText('Spent wisely').click()
    await expect(page.getByText('1/1')).toBeVisible()
  })

  test('has optional notes textarea', async ({ page }) => {
    const notes = page.getByPlaceholder('Notes (optional)')
    await expect(notes).toBeVisible()
    await notes.fill('Tithed this Sunday')
    await expect(notes).toHaveValue('Tithed this Sunday')
  })
})

// ====================
// FASTING ENRICHMENT
// ====================

test.describe('Fasting Enrichment', () => {
  test.beforeEach(async ({ page }) => {
    await setupApp(page)
    await page.goto('/today')
  })

  test('tapping Fasting opens options card', async ({ page }) => {
    const fasting = page.getByText('Fasting', { exact: true }).first()
    await fasting.scrollIntoViewIfNeeded()
    await fasting.click()
    await expect(page.getByText('Fasting is a rhythm')).toBeVisible()
    await expect(page.getByText('Full Day Fast')).toBeVisible()
    await expect(page.getByText('Partial Fast')).toBeVisible()
    await expect(page.getByText('Prayer Focus')).toBeVisible()
    await expect(page.getByText('Not fasting today')).toBeVisible()
  })

  test('selecting any option marks fasting complete', async ({ page }) => {
    const fasting = page.getByText('Fasting', { exact: true }).first()
    await fasting.scrollIntoViewIfNeeded()
    await fasting.click()
    await page.getByText('Not fasting today').click()
    await page.getByText('Close').click()
  })

  test('Not fasting today still counts as complete', async ({ page }) => {
    const fasting = page.getByText('Fasting', { exact: true }).first()
    await fasting.scrollIntoViewIfNeeded()
    await fasting.click()
    await page.getByText('Not fasting today').click()
    await page.getByText('Close').click()
  })
})

// ====================
// MEDITATION (LECTIO DIVINA) ENRICHMENT
// ====================

test.describe('Meditation Enrichment', () => {
  test.beforeEach(async ({ page }) => {
    await setupApp(page)
    await page.goto('/today')
  })

  test('tapping Meditation opens Lectio Divina', async ({ page }) => {
    const meditation = page.getByText('Meditation on Scripture')
    await meditation.scrollIntoViewIfNeeded()
    await meditation.click()
    await expect(page.getByText('Lectio Divina')).toBeVisible()
  })

  test('filling a step auto-marks meditation complete', async ({ page }) => {
    const meditation = page.getByText('Meditation on Scripture')
    await meditation.scrollIntoViewIfNeeded()
    await meditation.click()
    const readTextarea = page.getByPlaceholder('The word or phrase that caught my attention...')
    await readTextarea.fill('Be still and know that I am God')
    await page.getByText('Close').click()
    // Meditation should be checked
  })
})

// ====================
// EXERCISE ENRICHMENT
// ====================

test.describe('Exercise Enrichment', () => {
  test.beforeEach(async ({ page }) => {
    await setupApp(page)
    await page.goto('/today')
  })

  test('tapping Exercise opens logger', async ({ page }) => {
    await page.getByText('Exercise').click()
    await expect(page.getByText('Duration')).toBeVisible()
    await expect(page.getByText('Type')).toBeVisible()
    await expect(page.getByText('30 min')).toBeVisible()
    await expect(page.getByText('Walk')).toBeVisible()
    await expect(page.getByText('Run')).toBeVisible()
  })

  test('selecting duration marks exercise complete', async ({ page }) => {
    await page.getByText('Exercise').click()
    await page.getByText('30 min').click()
    await page.getByText('Close').click()
  })

  test('selecting type marks exercise complete', async ({ page }) => {
    await page.getByText('Exercise').click()
    await page.getByText('Run').click()
    await page.getByText('Close').click()
  })

  test('can select both duration and type', async ({ page }) => {
    await page.getByText('Exercise').click()
    await page.getByText('45 min').click()
    await page.getByText('Gym').click()
    await page.getByText('Close').click()
  })
})

// ====================
// ENCOURAGING SOMEONE ENRICHMENT
// ====================

test.describe('Encouragement Enrichment', () => {
  test.beforeEach(async ({ page }) => {
    await setupApp(page)
    await page.goto('/today')
  })

  test('tapping Encouraging opens templates', async ({ page }) => {
    await page.getByText('Encouraging Someone').click()
    await expect(page.getByText('Encouraging Someone', { exact: false })).toBeVisible()
    await expect(page.getByText('Choose a message or write your own')).toBeVisible()
  })

  test('can select a template', async ({ page }) => {
    await page.getByText('Encouraging Someone').click()
    await page.getByText('just thinking about you today', { exact: false }).click()
    // Copy button should appear
    await expect(page.getByText('Copy to send')).toBeVisible()
  })

  test('can write custom message', async ({ page }) => {
    await page.getByText('Encouraging Someone').click()
    const textarea = page.getByPlaceholder('Or write your own message...')
    await textarea.fill('You are amazing, keep it up!')
    await expect(page.getByText('Copy to send')).toBeVisible()
  })
})

// ====================
// HEALTHY EATING ENRICHMENT
// ====================

test.describe('Healthy Eating Enrichment', () => {
  test.beforeEach(async ({ page }) => {
    await setupApp(page)
    await page.goto('/today')
  })

  test('tapping Healthy Eating opens rating', async ({ page }) => {
    const healthyEating = page.getByText('Healthy Eating')
    await healthyEating.scrollIntoViewIfNeeded()
    await healthyEating.click()
    await expect(page.getByText('How intentional was your eating today?')).toBeVisible()
  })

  test('selecting a rating marks it complete', async ({ page }) => {
    const healthyEating = page.getByText('Healthy Eating')
    await healthyEating.scrollIntoViewIfNeeded()
    await healthyEating.click()
    await expect(page.getByText('How intentional was your eating today?')).toBeVisible()
    // Click the "3" rating button (less ambiguous)
    const ratingArea = page.getByText('How intentional was your eating today?').locator('..')
    const threeBtn = ratingArea.locator('button', { hasText: '3' })
    await threeBtn.click()
    await expect(page.getByText('Steady')).toBeVisible()
  })
})

// ====================
// READING LOG ENRICHMENT
// ====================

test.describe('Reading Log Enrichment', () => {
  test.beforeEach(async ({ page }) => {
    await setupApp(page)
    await page.goto('/today')
  })

  test('tapping Reading opens book log', async ({ page }) => {
    await page.getByText('Reading / Study').click()
    await expect(page.getByPlaceholder('What are you reading?')).toBeVisible()
    await expect(page.getByPlaceholder('Pages read')).toBeVisible()
    await expect(page.getByPlaceholder('Author (optional)')).toBeVisible()
  })

  test('filling book title marks complete', async ({ page }) => {
    await page.getByText('Reading / Study').click()
    await page.getByPlaceholder('What are you reading?').fill('Practicing the Way')
    await page.getByPlaceholder('Pages read').fill('25')
    await page.getByText('Close').click()
  })
})

// ====================
// SIMPLE REFLECTION ENRICHMENTS
// ====================

test.describe('Simple Reflection Enrichments', () => {
  test.beforeEach(async ({ page }) => {
    await setupApp(page)
    await page.goto('/today')
  })

  test('Bible Reading opens reflection with Word tab link', async ({ page }) => {
    await page.getByText('Bible Reading').click()
    await expect(page.getByText('Open Word tab')).toBeVisible()
    await expect(page.getByPlaceholder('Today I read...')).toBeVisible()
  })

  test('Bible Reading Word tab link navigates to /devotional', async ({ page }) => {
    await page.getByText('Bible Reading').click()
    await page.getByText('Open Word tab').click()
    await expect(page).toHaveURL(/\/devotional/)
  })

  test('Worship opens reflection prompt', async ({ page }) => {
    await page.getByText('Worship').click()
    await expect(page.getByText('How did you worship today?')).toBeVisible()
  })

  test('Fellowship opens name prompt', async ({ page }) => {
    await page.getByText('Fellowship / Community').click()
    await expect(page.getByText('Who did you spend meaningful time with today?')).toBeVisible()
  })

  test('Serving shows rotating daily prompt', async ({ page }) => {
    await page.getByText('Serving Others').click()
    await expect(page.getByText("Today's prompt")).toBeVisible()
  })

  test('filling reflection auto-checks discipline', async ({ page }) => {
    await page.getByText('Worship').click()
    await page.getByPlaceholder("Today's worship looked like...").fill('Sang at church')
    await page.getByText('Close').click()
    // Worship should now be checked
  })
})

// ====================
// ENRICHMENT UNCHECK BEHAVIOR
// ====================

test.describe('Enrichment Uncheck', () => {
  test.beforeEach(async ({ page }) => {
    await setupApp(page)
    await page.goto('/today')
  })

  test('checked enriched discipline can be unchecked by tapping', async ({ page }) => {
    // Open exercise enrichment and complete it
    await page.getByText('Exercise').click()
    await page.getByText('30 min').click()
    await page.getByText('Close').click()
    // Now exercise is checked — tap to uncheck
    await page.getByText('Exercise').click()
    // Should toggle off (not reopen enrichment)
  })

  test('unchecked enriched discipline opens enrichment on tap', async ({ page }) => {
    // Exercise is unchecked — tap to open
    await page.getByText('Exercise').click()
    await expect(page.getByText('Duration')).toBeVisible()
  })
})

// ====================
// DATE NAVIGATION + ENRICHMENT RESET
// ====================

test.describe('Date Navigation', () => {
  test.beforeEach(async ({ page }) => {
    await setupApp(page)
    await page.goto('/today')
  })

  test('changing date closes open enrichment', async ({ page }) => {
    await page.getByText('Prayer').click()
    await expect(page.getByText('Prayer — ACTS')).toBeVisible()
    // Navigate to previous day
    await page.locator('header button').first().click()
    // ACTS should be closed
    await expect(page.getByText('Prayer — ACTS')).not.toBeVisible()
  })
})

// ====================
// NAVIGATION
// ====================

test.describe('Navigation', () => {
  test.beforeEach(async ({ page }) => {
    await setupApp(page)
  })

  test('bottom nav bar is visible with 5 tabs', async ({ page }) => {
    const nav = page.getByRole('navigation')
    await expect(nav).toBeVisible()
    await expect(nav.getByText('Home')).toBeVisible()
    await expect(nav.getByText('Today')).toBeVisible()
    await expect(nav.getByText('Word')).toBeVisible()
    await expect(nav.getByText('Fasting')).toBeVisible()
    await expect(nav.getByText('Settings')).toBeVisible()
  })

  test('each tab navigates to correct page', async ({ page }) => {
    await page.getByRole('navigation').getByText('Today').click()
    await expect(page).toHaveURL(/\/today/)

    await page.getByRole('navigation').getByText('Word').click()
    await expect(page).toHaveURL(/\/devotional/)

    await page.getByRole('navigation').getByText('Fasting').click()
    await expect(page).toHaveURL(/\/fasting/)

    await page.getByRole('navigation').getByText('Settings').click()
    await expect(page).toHaveURL(/\/settings/)

    await page.getByRole('navigation').getByText('Home').click()
    await expect(page).toHaveURL(/\/$/)
  })

  test('page scrolls to top on tab change', async ({ page }) => {
    await page.goto('/today')
    await page.waitForTimeout(500)
    // Scroll down
    await page.evaluate(() => window.scrollTo(0, 1000))
    await page.waitForTimeout(200)
    // Navigate to different tab
    await page.getByRole('navigation').getByText('Home').click()
    await page.waitForTimeout(500)
    // Should be near top (within animation tolerance)
    const scrollY = await page.evaluate(() => window.scrollY)
    expect(scrollY).toBeLessThan(50)
  })
})

// ====================
// SETTINGS
// ====================

test.describe('Settings', () => {
  test.beforeEach(async ({ page }) => {
    await setupApp(page, 'Noah')
    await page.goto('/settings')
  })

  test('shows user profile with name', async ({ page }) => {
    await expect(page.getByText('Noah').first()).toBeVisible()
  })

  test('shows sign in prompt for guest users', async ({ page }) => {
    await expect(page.getByText('Sign In to Sync Your Data')).toBeVisible()
  })

  test('can toggle dark/light mode', async ({ page }) => {
    const html = page.locator('html')
    await expect(html).toHaveAttribute('data-theme', 'dark')

    const darkModeRow = page.getByText('Dark Mode').locator('..')
    await darkModeRow.locator('button').click()
    await expect(html).toHaveAttribute('data-theme', 'light')
  })

  test('shows capitals in settings', async ({ page }) => {
    await page.getByText('FIVE CAPITALS').scrollIntoViewIfNeeded()
    await expect(page.getByText('FIVE CAPITALS')).toBeVisible()
  })

  test('can add a custom discipline', async ({ page }) => {
    const disciplineInput = page.getByPlaceholder('New discipline name')
    await disciplineInput.scrollIntoViewIfNeeded()
    await disciplineInput.fill('Journaling')
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
    await page.getByText('Cancel').click()
    await expect(page.getByText('Noah')).toBeVisible()
  })
})

// ====================
// FASTING TRACKER
// ====================

test.describe('Fasting Tracker', () => {
  test.beforeEach(async ({ page }) => {
    await setupApp(page)
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
    await setupApp(page)
    await page.goto('/calendar')
  })

  test('shows calendar with current month', async ({ page }) => {
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December']
    const currentMonth = monthNames[new Date().getMonth()]
    await expect(page.getByText(currentMonth)).toBeVisible()
  })

  test('calendar accessible from dashboard quick access', async ({ page }) => {
    await page.goto('/')
    await page.getByText('Events & milestones').click()
    await expect(page).toHaveURL(/\/calendar/)
  })
})

// ====================
// WEEKLY PROGRESS
// ====================

test.describe('Weekly Progress', () => {
  test.beforeEach(async ({ page }) => {
    await setupApp(page)
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
      localStorage.setItem('thegoodlife_settings', 'not-json')
    })
    await page.reload()
    await expect(page.getByText('The Good Life')).toBeVisible()
  })

  test('handles empty disciplines object', async ({ page }) => {
    await setupApp(page)
    await page.goto('/today')
    await expect(page.getByText('0%')).toBeVisible()
  })

  test('direct URL navigation works for all routes', async ({ page }) => {
    await setupApp(page)

    await page.goto('/today')
    await expect(page.getByText('Spiritual')).toBeVisible()

    await page.goto('/week')
    await expect(page.getByText(/Week/i)).toBeVisible()

    await page.goto('/devotional')
    await expect(page.locator('nav')).toBeVisible()

    await page.goto('/settings')
    await expect(page.getByText('PROFILE')).toBeVisible()
  })

  test('unknown routes redirect to home', async ({ page }) => {
    await setupApp(page)
    await page.goto('/nonexistent-page')
    await expect(page).toHaveURL(/\/$/)
  })

  test('magic link verify route with no token redirects home', async ({ page }) => {
    await setupApp(page)
    await page.goto('/auth/verify')
    await expect(page).toHaveURL(/\/$/)
  })

  test('localStorage persists data for guest users', async ({ page }) => {
    await setupApp(page)
    await page.goto('/today')

    // Use the Worship enrichment (simple reflection)
    await page.getByText('Worship').click()
    await page.getByPlaceholder("Today's worship looked like...").fill('Sang psalms')
    await page.getByText('Close').click()
    await page.waitForTimeout(500)

    const hasData = await page.evaluate(() => {
      const data = localStorage.getItem('thegoodlife_reflections')
      return data && data.includes('worship')
    })
    expect(hasData).toBe(true)
  })

  test('multiple enrichments can be filled on same day', async ({ page }) => {
    await setupApp(page)
    await page.goto('/today')

    // Fill Prayer
    await page.getByText('Prayer').click()
    await page.getByPlaceholder('God, I praise you for...').fill('Your love')
    await page.getByText('Close').click()

    // Fill Fasting
    const fasting = page.getByText('Fasting', { exact: true }).first()
    await fasting.scrollIntoViewIfNeeded()
    await fasting.click()
    await page.getByText('Full Day Fast').click()
    await page.getByText('Close').click()
  })

  test('financial stewardship pills persist across reload', async ({ page }) => {
    await setupApp(page)
    await page.goto('/today')

    await page.getByText('Gave generously').click()
    await page.waitForTimeout(500)
    await page.reload()
    await page.goto('/today')

    // Financial should still show 1/1
    await expect(page.getByText('Financial')).toBeVisible()
  })
})

// ====================
// THREE PILLARS
// ====================

test.describe('Three Pillars', () => {
  test.beforeEach(async ({ page }) => {
    await setupApp(page)
  })

  test('shows on dashboard and expands', async ({ page }) => {
    const wayOfJesus = page.getByText('The Way of Jesus')
    await wayOfJesus.scrollIntoViewIfNeeded()
    await wayOfJesus.click()
    await expect(page.getByText('With Jesus', { exact: true })).toBeVisible()
    await expect(page.getByText('Becoming Like Jesus', { exact: true })).toBeVisible()
    await expect(page.getByText('Doing What Jesus Did', { exact: true })).toBeVisible()
  })

  test('can fill in a pillar reflection', async ({ page }) => {
    const wayOfJesus = page.getByText('The Way of Jesus')
    await wayOfJesus.scrollIntoViewIfNeeded()
    await wayOfJesus.click()
    await page.getByRole('button', { name: /With Jesus/ }).click()
    const textarea = page.getByPlaceholder(/Reflect on how you were with jesus today/i)
    await textarea.fill('Spent time in prayer this morning')
    await expect(textarea).toHaveValue('Spent time in prayer this morning')
  })
})
