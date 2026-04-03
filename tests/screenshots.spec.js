import { test } from '@playwright/test'

const SHOT_DIR = 'video/public/screenshots'

async function setupApp(page) {
  await page.goto('/')
  await page.evaluate(() => localStorage.clear())
  await page.reload()
  await page.getByText('Get Started').click()
  await page.getByPlaceholder('Enter your name').fill('Noah')
  await page.getByText('Continue').click()
  await page.getByText('Your Five Capitals').waitFor()
  await page.getByText('Continue').click()
  await page.getByText('Choose Your Look').waitFor()
  await page.getByText('Continue').click()
  await page.getByText('Add a photo?').waitFor()
  await page.getByText('Skip for now').click()
  await page.getByText('Skip').click()
  await page.waitForTimeout(1000)
}

test('capture all promo screenshots', async ({ page }) => {
  await setupApp(page)

  // Dashboard
  await page.screenshot({ path: `${SHOT_DIR}/dashboard.png` })

  // Today page
  await page.goto('/today')
  await page.waitForTimeout(500)
  await page.screenshot({ path: `${SHOT_DIR}/today.png` })

  // Prayer ACTS
  await page.getByText('Prayer').click()
  await page.waitForTimeout(300)
  await page.screenshot({ path: `${SHOT_DIR}/prayer-acts.png` })
  await page.getByText('Close').click()

  // Scroll to show more disciplines
  const exercise = page.getByText('Exercise')
  await exercise.scrollIntoViewIfNeeded()
  await page.waitForTimeout(300)
  await page.screenshot({ path: `${SHOT_DIR}/exercise.png` })

  // Financial stewardship
  const financial = page.getByText('Financial')
  await financial.scrollIntoViewIfNeeded()
  await page.waitForTimeout(300)
  await page.screenshot({ path: `${SHOT_DIR}/financial.png` })

  // Word tab - Today
  await page.goto('/devotional')
  await page.waitForTimeout(500)
  await page.screenshot({ path: `${SHOT_DIR}/word-today.png` })

  // Word tab - Bible
  await page.goto('/devotional?tab=bible')
  await page.waitForTimeout(1500)
  await page.screenshot({ path: `${SHOT_DIR}/bible-reader.png` })

  // Fasting
  await page.goto('/fasting')
  await page.waitForTimeout(500)
  await page.screenshot({ path: `${SHOT_DIR}/fasting.png` })
})
