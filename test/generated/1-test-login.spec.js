import { test, expect } from '@playwright/test';

// Page Object para la página de login
class LoginPage {
  constructor(page) {
    this.page = page;
    this.loginButton = 'button:has-text("JUGAR ANÓNIMAMENTE")';
    this.playerCountTitle = 'h2:has-text("NÚMERO DE JUGADORES")';
    this.playerCountOptions = '#player-count-options';
  }

  async navigateToGame(gameCode) {
    await this.page.goto(`http://127.0.0.1:3000/?g/${gameCode}`);
  }

  async clickAnonymousLogin() {
    await this.page.click(this.loginButton);
  }

  async waitForPlayerCountSelection() {
    await this.page.waitForSelector(this.playerCountTitle, { state: 'visible' });
  }

  async verifyPlayerCountTitle() {
    const title = await this.page.locator(this.playerCountTitle);
    await expect(title).toBeVisible();
    await expect(title).toHaveText('NÚMERO DE JUGADORES');
  }

  async verifyPlayerCountOptions() {
    const optionsContainer = await this.page.locator(this.playerCountOptions);
    await expect(optionsContainer).toBeVisible();
    
    // Verificar que hay opciones del 4 al 12
    for (let i = 4; i <= 12; i++) {
      const option = this.page.locator('div').filter({ hasText: `${i}` }).first()
      await expect(option).toBeVisible();
    }
  }
}

// Test principal
test.describe('Login Anónimo', () => {
  let loginPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
  });

  test('debe mostrar pantalla de selección de número de jugadores después del login anónimo', async ({ page }) => {
    // ARRANGE: Navegar a la página del juego
    await loginPage.navigateToGame('galerna');

    // ACT: Hacer clic en el botón de login anónimo
    await loginPage.clickAnonymousLogin();

    // ASSERT: Verificar que se muestra la pantalla de selección
    await loginPage.waitForPlayerCountSelection();
    await loginPage.verifyPlayerCountTitle();
    await loginPage.verifyPlayerCountOptions();
  });
});


