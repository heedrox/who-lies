require('dotenv').config();
const { test, expect } = require('@playwright/test');

class WhoLiesGamePage {
  constructor(page) {
    this.page = page;
    this.baseUrl = process.env.BASE_URL || 'http://127.0.0.1:62184';
    
    // Selectors
    this.loginBtn = '#login-btn';
    this.restartGameBtn = '#restart-game-btn';
    this.addQuestionBtn = '.add-question-btn';
    this.endRoundBtn = '.end-round-btn';
    this.gameFooter = '#game-footer';
    this.playerStatusCells = '.player-status-cell';
  }

  async navigateToPlayer(gameCode, playerNumber, totalPlayers) {
    const url = `${this.baseUrl}/?/g/${gameCode}/p/${playerNumber}/${totalPlayers}`;
    await this.page.goto(url);
    
    // Wait for page load
    await this.page.waitForTimeout(2000);
    
    // Try to click login if needed
    try {
      const loginBtn = await this.page.locator(this.loginBtn);
      if (await loginBtn.isVisible()) {
        await loginBtn.click();
        await this.page.waitForTimeout(2000);
      }
    } catch (error) {
      // Login might already be completed
    }
    
    // Wait for game content to become visible
    await this.page.waitForSelector('#game-content', { timeout: 15000 });
    await this.page.waitForSelector(this.gameFooter, { timeout: 10000 });
    await this.page.waitForTimeout(2000); // Additional time for Firebase sync
  }

  async clickLoginAnonymously() {
    try {
      await this.page.click(this.loginBtn, { timeout: 5000 });
      await this.page.waitForTimeout(2000);
    } catch (error) {
      // Login might already be completed automatically
      console.log('Login button not visible - user likely already authenticated');
    }
  }

  async clickRestartGame() {
    // Handle the confirmation alert before clicking
    this.page.on('dialog', async dialog => {
      await dialog.accept();
    });
    
    // Wait for restart button to be visible (only for player 1)
    await this.page.waitForSelector(this.restartGameBtn, { timeout: 10000 });
    await this.page.click(this.restartGameBtn);
    await this.page.waitForTimeout(2000);
  }

  async clickAddQuestion() {
    // Wait for button to be visible first
    await this.page.waitForSelector(this.addQuestionBtn, { timeout: 10000 });
    await this.page.click(this.addQuestionBtn);
    await this.page.waitForTimeout(1000); // Wait for Firebase sync
  }

  async getVisibleText() {
    return await this.page.textContent('body');
  }

  async getPlayerQuestionCount(playerNumber) {
    const text = await this.getVisibleText();
    const lines = text.split('\n');
    
    // Find the player number line and get the next line which should contain question marks
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].trim() === playerNumber.toString()) {
        // Check if next lines contain question marks (I characters)
        for (let j = i + 1; j < Math.min(i + 4, lines.length); j++) {
          const line = lines[j].trim();
          if (/^I+$/.test(line)) {
            return line.length; // Count of 'I' characters
          }
        }
        return 0; // No question marks found
      }
    }
    return 0;
  }

  async verifyButtonExists() {
    // Wait for the game to load completely
    await this.page.waitForTimeout(2000);
    
    // Verify the "ANOTAR PREGUNTA" button exists
    await expect(this.page.locator(this.addQuestionBtn)).toBeVisible();
    
    // Verify it's in the footer
    await expect(this.page.locator(this.gameFooter)).toBeVisible();
    
    // The "TERMINAR RONDA" button is only visible for player 1, 
    // so we just verify the add question button exists
    const buttonText = await this.page.locator(this.addQuestionBtn).textContent();
    expect(buttonText.trim()).toBe('ANOTAR PREGUNTA');
  }
}

test.describe('Annotate Questions Functionality', () => {
  let gamePage;

  test.beforeEach(async ({ page }) => {
    gamePage = new WhoLiesGamePage(page);
  });

  test('Should have ANOTAR PREGUNTA button in footer', async () => {
    // ARRANGE & ACT: Navegar como jugador 2
    await gamePage.navigateToPlayer('galerna', 2, 5);
    
    // ASSERT: Verificar que existe el botón "ANOTAR PREGUNTA"
    await gamePage.verifyButtonExists();
  });

  test('Should add question mark when clicking ANOTAR PREGUNTA', async () => {
    // ARRANGE: Navegar como jugador 2
    await gamePage.navigateToPlayer('galerna', 2, 5);
    
    // ACT: Pulso el botón "ANOTAR PREGUNTA"
    await gamePage.clickAddQuestion();
    
    // ASSERT: Se añade un palo vertical "I" bajo el jugador 2
    const questionCount = await gamePage.getPlayerQuestionCount(2);
    expect(questionCount).toBeGreaterThanOrEqual(1);
  });

  test('Should accumulate question marks when clicking multiple times', async () => {
    // ARRANGE: Navegar como jugador 2
    await gamePage.navigateToPlayer('galerna', 2, 5);
    
    // ACT: Pulso el botón "ANOTAR PREGUNTA" dos veces
    await gamePage.clickAddQuestion();
    await gamePage.clickAddQuestion();
    
    // ASSERT: Verificar que se incrementaron las preguntas
    const questionCount = await gamePage.getPlayerQuestionCount(2);
    expect(questionCount).toBeGreaterThanOrEqual(2);
  });

  test('Should synchronize question counts across different players', async () => {
    // ARRANGE & ACT: Jugador 2 anota una pregunta
    await gamePage.navigateToPlayer('galerna', 2, 5);
    await gamePage.clickAddQuestion();
    
    // ACT: Jugador 3 anota una pregunta
    await gamePage.navigateToPlayer('galerna', 3, 5);
    await gamePage.clickAddQuestion();
    
    // ASSERT: Verificar que ambos jugadores tienen contadores
    const player2Count = await gamePage.getPlayerQuestionCount(2);
    const player3Count = await gamePage.getPlayerQuestionCount(3);
    
    expect(player2Count).toBeGreaterThanOrEqual(1);
    expect(player3Count).toBeGreaterThanOrEqual(1);
  });

  test('Should persist question counts when reloading page', async () => {
    // ARRANGE: Navegar como jugador 2 y anotar pregunta
    await gamePage.navigateToPlayer('galerna', 2, 5);
    await gamePage.clickAddQuestion();
    
    const initialCount = await gamePage.getPlayerQuestionCount(2);
    
    // ACT: Recargo la página como jugador 2
    await gamePage.navigateToPlayer('galerna', 2, 5);
    
    // ASSERT: Los contadores persisten
    const persistedCount = await gamePage.getPlayerQuestionCount(2);
    expect(persistedCount).toBeGreaterThanOrEqual(initialCount);
  });
});
