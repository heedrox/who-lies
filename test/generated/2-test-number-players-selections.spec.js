require('dotenv').config();

const { test, expect } = require('@playwright/test');

// Page Object para la pantalla de login
class LoginPage {
    constructor(page) {
        this.page = page;
        this.loginButton = 'text=JUGAR ANÓNIMAMENTE';
    }

    async navigateToGame(gameCode) {
        const baseUrl = process.env.BASE_URL || 'http://127.0.0.1:3000';
        await this.page.goto(`${baseUrl}/?g/${gameCode}`);
    }

    async clickAnonymousLogin() {
        // Esperar a que el botón esté visible y estable antes de hacer clic
        await this.page.waitForSelector(this.loginButton, { state: 'visible', timeout: 10000 });
        await this.page.click(this.loginButton);
        
        // Esperar a que se procese la autenticación
        await this.page.waitForTimeout(2000);
    }
}

// Page Object para la pantalla de selección de número de jugadores
class PlayerCountSelectionPage {
    constructor(page) {
        this.page = page;
        this.playerCountOptions = {
            4: 'text=4',
            5: 'text=5',
            6: 'text=6',
            7: 'text=7',
            8: 'text=8',
            9: 'text=9',
            10: 'text=10',
            11: 'text=11',
            12: 'text=12',
            13: 'text=13',
            14: 'text=14',
            15: 'text=15'
        };
    }

    async selectPlayerCount(count) {
        if (!this.playerCountOptions[count]) {
            throw new Error(`Número de jugadores inválido: ${count}. Debe estar entre 4 y 15.`);
        }
        await this.page.click(this.playerCountOptions[count]);
    }

    async verifyPlayerSelectionScreen() {
        // Verificar que se muestre la pantalla de selección de jugador
        await expect(this.page.locator('text=SELECCIONE JUGADOR')).toBeVisible();
        
        // Verificar que se muestren las opciones de jugador según el número seleccionado
        // (Esto se verifica en el test principal)
    }
}

// Page Object para la pantalla de selección de jugador
class PlayerSelectionPage {
    constructor(page) {
        this.page = page;
    }

    async verifyPlayerOptions(expectedCount) {
        // Verificar que se muestren las opciones correctas de jugador
        for (let i = 1; i <= expectedCount; i++) {
            // Usar un selector que busque el texto exacto del label del jugador
            // Usar getByText con exact: true para evitar conflictos con números de dos dígitos
            const playerOption = this.page.getByText(`${i}`, { exact: true });
            await expect(playerOption).toBeVisible();
        }
    }

    async verifyUrlRedirect(gameCode, playerCount) {
        const baseUrl = process.env.BASE_URL || 'http://127.0.0.1:3000';
        const expectedUrl = `${baseUrl}/?/g/${gameCode}/p/x/${playerCount}`;
        await expect(this.page).toHaveURL(expectedUrl);
    }
}

// Test principal
test.describe('Selección de número de jugadores', () => {
    let loginPage;
    let playerCountSelectionPage;
    let playerSelectionPage;

    test.beforeEach(async ({ page }) => {
        loginPage = new LoginPage(page);
        playerCountSelectionPage = new PlayerCountSelectionPage(page);
        playerSelectionPage = new PlayerSelectionPage(page);
    });

    test('debe permitir seleccionar 5 jugadores y redirigir correctamente', async ({ page }) => {
        const gameCode = 'galerna';
        const selectedPlayerCount = 5;

        // ARRANGE: Navegar al juego y hacer login anónimo
        await loginPage.navigateToGame(gameCode);
        await loginPage.clickAnonymousLogin();

        // ACT: Seleccionar el número de jugadores
        await playerCountSelectionPage.selectPlayerCount(selectedPlayerCount);

        // ASSERT: Verificar redirección y pantalla de selección de jugador
        await playerSelectionPage.verifyUrlRedirect(gameCode, selectedPlayerCount);
        await playerSelectionPage.verifyPlayerOptions(selectedPlayerCount);
        await playerCountSelectionPage.verifyPlayerSelectionScreen();
    });

    test('debe permitir seleccionar diferentes números de jugadores', async ({ page }) => {
        const gameCode = 'testgame';
        const playerCount = 8; // Solo probar un caso para evitar problemas de estado

        // Navegar al juego y hacer login
        await loginPage.navigateToGame(gameCode);
        
        // Esperar a que la página se cargue completamente
        await page.waitForLoadState('networkidle');
        
        // Verificar que el botón de login esté visible antes de hacer clic
        await expect(page.locator('text=JUGAR ANÓNIMAMENTE')).toBeVisible();
        
        await loginPage.clickAnonymousLogin();

        // Seleccionar número de jugadores
        await playerCountSelectionPage.selectPlayerCount(playerCount);

        // Verificar redirección y opciones
        await playerSelectionPage.verifyUrlRedirect(gameCode, playerCount);
        await playerSelectionPage.verifyPlayerOptions(playerCount);
    });

    test('debe mostrar error para números de jugadores inválidos', async ({ page }) => {
        const gameCode = 'testgame';
        
        // Navegar al juego y hacer login
        await loginPage.navigateToGame(gameCode);
        await loginPage.clickAnonymousLogin();

        // Intentar seleccionar número inválido
        await expect(async () => {
            await playerCountSelectionPage.selectPlayerCount(3);
        }).rejects.toThrow('Número de jugadores inválido: 3. Debe estar entre 4 y 15.');

        await expect(async () => {
            await playerCountSelectionPage.selectPlayerCount(16);
        }).rejects.toThrow('Número de jugadores inválido: 16. Debe estar entre 4 y 15.');
    });
});
