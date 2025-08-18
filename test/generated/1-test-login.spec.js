// Test E2E en JavaScript (Playwright)
// Verifica que la página muestre el botón rojo de login anónimo

const { test, expect } = require('@playwright/test');

const GAME_URL = 'https://who-lies.web.app/?g/galerna';

test.describe('Login anónimo - WHO LIES', () => {
  test('debería mostrar el botón rojo «JUGAR ANÓNIMAMENTE»', async ({ page }) => {
    await page.goto(GAME_URL, { waitUntil: 'load' });

    // Aserción de texto introductorio de login
    await expect(page.getByText(/conéctate anónimamente|conectate anonimamente/i)).toBeVisible();

    // Localizadores robustos para el botón (con y sin tilde)
    const byRole = page.getByRole('button', { name: /JUGAR AN(Ó|O)NIMAMENTE/i });
    const bySelector = page.locator('#login-btn, .login-btn, button', { hasText: /JUGAR AN(Ó|O)NIMAMENTE/i });

    // Debe ser visible por accesibilidad o por selector
    await expect(byRole.or(bySelector)).toBeVisible();

    const loginBtn = byRole.or(bySelector).first();

    // Verificar estilo rojo (gradiente)
    const { backgroundImage, color } = await loginBtn.evaluate((el) => {
      const cs = getComputedStyle(el);
      return { backgroundImage: cs.backgroundImage, color: cs.color };
    });

    expect(backgroundImage).toContain('linear-gradient');
    // Verificamos presencia de componentes rojos típicos del gradiente
    expect(backgroundImage).toMatch(/(255,\s*68,\s*68)|(204,\s*0,\s*0)/);
    // Contraste: texto blanco sobre fondo rojo
    expect(color).toMatch(/rgb\(255,\s*255,\s*255\)/);

    // Evidencia (adjuntar captura al reporte de Playwright)
    const screenshot = await page.screenshot({ fullPage: true });
    await test.info().attach('pantalla-inicial', { body: screenshot, contentType: 'image/png' });
  });
});


