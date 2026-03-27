import { test, expect } from '@playwright/test'
import path from 'path'

const fixturePath = path.join(process.cwd(), 'e2e', 'fixtures', 'soil-upload-placeholder.txt')

test.describe('Fase 2.1 — Análisis de suelo (E2E)', () => {
  test('flujo: foto -> OCR -> interpretar -> deep-link a catálogo', async ({ page }) => {
    const mockOcr = {
      values: {
        ph: 6.5,
        materia_organica: 3.2,
        fosforo: 10,
        potasio: 0.5,
        calcio: 1,
        magnesio: 0.2,
        aluminio: 0.1,
        azufre: 12,
        hierro: 50,
        cobre: 1,
        manganeso: 10,
        zinc: 5,
        boro: 0.5,
        cice: 10,
      },
      image_url: null,
    }

    const mockInterpret = {
      interpretation: [
        { nutriente: 'pH', valor: 6.5, nivel: 'medio' },
        { nutriente: 'Fósforo', valor: 10, nivel: 'bajo' },
        { nutriente: 'Potasio', valor: 0.5, nivel: 'alto' },
      ],
      recommendation: {
        grade: '23-4-20-3-4',
        doseKgHaYear: 26,
        splitPerYear: 2,
        suggestedProductSearch: '23-4-20-3-4',
      },
      recommendation_text: 'Ejemplo de recomendación Cenicafé basada en tu análisis.',
    }

    await page.route('**/api/suelo/ocr', async (route) => {
      // Delay intencional para que en `--headed` se vea el estado "Analizando tu suelo..."
      const delayMs = process.env.E2E_DEBUG === '1' ? 6000 : 1500
      await new Promise((r) => setTimeout(r, delayMs))
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(mockOcr),
      })
    })

    await page.route('**/api/suelo/interpretar', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(mockInterpret),
      })
    })

    await page.goto('/dev/e2e/soil-analysis')
    if (process.env.E2E_DEBUG === '1') {
      // Para observación humana: deja el navegador quieto antes del OCR.
      await new Promise((r) => setTimeout(r, 8000))
    }

    // Botón visible con texto exacto requerido por la especificación.
    const uploadButtonInitial = page.getByRole('button', { name: 'Subir foto del análisis' })
    await expect(uploadButtonInitial).toBeVisible()

    const [fileChooser] = await Promise.all([
      page.waitForEvent('filechooser'),
      uploadButtonInitial.click(),
    ])

    await fileChooser.setFiles(fixturePath)

    // Durante el OCR mock debe aparecer el estado de carga.
    await expect(page.getByRole('button', { name: /Analizando tu suelo\.\.\./i })).toBeVisible()

    // Tras el OCR mock, el botón cambia de texto y se prellenan campos.
    const uploadButtonAfter = page.getByRole('button', { name: /Foto cargada/i })
    const uploadAfterTimeout = process.env.E2E_DEBUG === '1' ? 12_000 : 5_000
    await expect(uploadButtonAfter).toBeVisible({ timeout: uploadAfterTimeout })
    await expect(page.getByLabel('pH')).toHaveValue('6.5')

    await page.getByPlaceholder('UUID de la finca').fill('11111111-1111-4111-8111-111111111111')
    const interpretarButton = page.getByRole('button', { name: 'Interpretar análisis' })
    await expect(interpretarButton).toBeEnabled()
    await interpretarButton.click()

    // Resultado: botón deep-link usa role=link y texto exacto.
    const deepLink = page.getByRole('link', { name: 'Ver precios de 23-4-20-3-4' })
    await expect(deepLink).toBeVisible()
    await expect(deepLink).toHaveAttribute('href', '/catalogo?q=23-4-20-3-4')

    // Semáforo: para al menos un nutriente, la clase CSS debe incluir el color asociado.
    await expect(page.locator('td.text-amber-500', { hasText: 'medio' })).toBeVisible()
  })
})

