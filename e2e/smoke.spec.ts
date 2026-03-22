import { test, expect } from '@playwright/test'

test.describe('Páginas públicas', () => {
  test('home muestra GranoVivo y enlaces', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByRole('heading', { name: /GranoVivo/i })).toBeVisible()
    await expect(page.getByRole('link', { name: /Iniciar sesión/i })).toBeVisible()
    // Enlace al catálogo (texto UI puede cambiar; el href es estable)
    await expect(page.locator('a[href="/catalogo"]').first()).toBeVisible()
  })

  test('login muestra formulario de celular', async ({ page }) => {
    await page.goto('/login')
    await expect(page.getByRole('heading', { name: /GranoVivo/i })).toBeVisible()
    await expect(page.getByLabel(/Celular/i)).toBeVisible()
    await expect(page.getByRole('button', { name: /Enviar código/i })).toBeVisible()
  })
})
