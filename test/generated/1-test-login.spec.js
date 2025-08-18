import { test, expect } from '@playwright/test';

test('1-test-login: muestra NÚMERO DE JUGADORES y enlaces 4-12 tras login anónimo', async ({ page }) => {
  // Agregar logging para debugging
  page.on('console', msg => console.log('Browser console:', msg.text()));
  page.on('pageerror', error => console.log('Browser error:', error.message));
  
  await page.goto('http://localhost:3000/index.html?g/galerna', { waitUntil: 'load' });
  
  // Esperar a que la página esté completamente cargada
  await page.waitForLoadState('networkidle');
  
  console.log('Página cargada, verificando elementos...');
  
  // Esperar un poco más para que se ejecute initializeGame
  await page.waitForTimeout(3000);
  
  // Debug: verificar si hay errores de JavaScript
  const errors = await page.evaluate(() => {
    console.log('🔍 Verificando estado del DOM...');
    console.log('🔍 document.readyState:', document.readyState);
    console.log('🔍 window.location.href:', window.location.href);
    console.log('🔍 window.location.search:', window.location.search);
    console.log('🔍 window.gameParams:', window.gameParams);
    console.log('🔍 typeof initializeGame:', typeof initializeGame);
    console.log('🔍 typeof getUrlParams:', typeof getUrlParams);
    
    // Intentar ejecutar getUrlParams manualmente
    try {
      if (typeof getUrlParams === 'function') {
        const params = getUrlParams();
        console.log('🔍 getUrlParams() ejecutado manualmente:', params);
        return { params, error: null };
      } else {
        return { params: null, error: 'getUrlParams no es una función' };
      }
    } catch (error) {
      return { params: null, error: error.message };
    }
  });
  
  console.log('🔍 Resultado de evaluación:', errors);
  
  // Verificar que el botón de login esté visible
  const loginButton = page.locator('#login-btn');
  await expect(loginButton).toBeVisible();
  console.log('Botón de login encontrado y visible');
  
  // Hacer clic en el botón de login anónimo
  await loginButton.click();
  console.log('Clic en botón de login realizado');
  
  // Esperar más tiempo para que se procese el clic y la autenticación
  await page.waitForTimeout(5000);
  
  // Verificar el estado actual de las secciones
  const loginSection = page.locator('#login-section');
  const playerCountSection = page.locator('#player-count-selection-section');
  
  console.log('Estado de las secciones después del clic:');
  console.log('Login section visible:', await loginSection.isVisible());
  console.log('Player count section visible:', await playerCountSection.isVisible());
  
  // Debug: ver qué elementos están presentes en el DOM
  const allSections = await page.locator('.login-section').all();
  console.log('Número de secciones .login-section encontradas:', allSections.length);
  
  for (let i = 0; i < allSections.length; i++) {
    const section = allSections[i];
    const id = await section.getAttribute('id');
    const isVisible = await section.isVisible();
    console.log(`Sección ${i}: id="${id}", visible=${isVisible}`);
  }
  
  // Debug: verificar si window.gameParams está configurado
  const gameParams = await page.evaluate(() => {
    console.log('🔍 window.gameParams:', window.gameParams);
    console.log('🔍 window.location.href:', window.location.href);
    console.log('🔍 window.location.search:', window.location.search);
    return window.gameParams;
  });
  
  console.log('🔍 gameParams desde el navegador:', gameParams);
  
  // Assert: Título NÚMERO DE JUGADORES visible
  await expect(playerCountSection).toBeVisible();
  await expect(page.getByRole('heading', { name: 'NÚMERO DE JUGADORES' })).toBeVisible();

  // Assert: Opciones 4 al 12 visibles
  const optionsContainer = page.locator('#player-count-options');
  await expect(optionsContainer).toBeVisible();

  for (let num = 4; num <= 12; num++) {
    const option = optionsContainer.locator(`text=${num}`);
    await expect(option, `La opción ${num} debe ser visible`).toBeVisible();
  }
});


