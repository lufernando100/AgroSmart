import { test, expect } from '@playwright/test'

/**
 * Sin sesión: rutas protegidas redirigen a /login con ?next=
 * (comportamiento del middleware).
 */
test.describe('Redirecciones sin sesión', () => {
  test('/inicio sin sesión redirige a la landing /', async ({ page }) => {
    await page.goto('/inicio')
    await expect(page).toHaveURL('/')
  })

  test('catálogo redirige a login', async ({ page }) => {
    await page.goto('/catalogo')
    await expect(page).toHaveURL(/\/login\?next=%2Fcatalogo/)
  })

  test('detalle de producto redirige a login', async ({ page }) => {
    await page.goto(
      '/catalogo/30000000-0000-4000-8000-000000000001'
    )
    await expect(page).toHaveURL(
      /\/login\?next=%2Fcatalogo%2F30000000-0000-4000-8000-000000000001/
    )
  })

  test('panel almacén redirige a login', async ({ page }) => {
    await page.goto('/almacen/dashboard')
    await expect(page).toHaveURL(/\/login\?next=%2Falmacen%2Fdashboard/)
  })
})
