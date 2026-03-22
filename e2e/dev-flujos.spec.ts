import { test, expect } from '@playwright/test'

/**
 * /dev/flujos existe en desarrollo (200); en build de producción devuelve 404.
 */
test.describe('/dev/flujos', () => {
  test('guía en dev o 404 en prod — sin 5xx', async ({ page }) => {
    const res = await page.goto('/dev/flujos')
    expect(res?.status() ?? 0).toBeLessThan(500)
    if (res?.status() === 404) {
      return
    }
    await expect(page.getByRole('heading', { level: 1, name: /Flujos de prueba/i })).toBeVisible()
    await expect(page.getByRole('heading', { level: 2, name: /Caficultor/i })).toBeVisible()
    await expect(page.getByRole('heading', { level: 2, name: /Almacén/i })).toBeVisible()
  })
})
