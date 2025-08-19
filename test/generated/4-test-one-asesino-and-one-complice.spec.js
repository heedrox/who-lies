require('dotenv').config();

const { test, expect } = require('@playwright/test');

// Page Object para la pantalla de login
class LoginPage {
    constructor(page) {
        this.page = page;
        this.loginButton = 'text=JUGAR ANÓNIMAMENTE';
    }

    async navigateToGame(gameCode, playerNumber, totalPlayers) {
        const baseUrl = process.env.BASE_URL || 'http://127.0.0.1:3000';
        await this.page.goto(`${baseUrl}/?/g/${gameCode}/p/${playerNumber}/${totalPlayers}`);
    }

    async clickAnonymousLogin() {
        // Verificar si el botón de login está presente antes de intentar hacer clic
        const loginButtonExists = await this.page.locator(this.loginButton).isVisible();
        
        if (loginButtonExists) {
            console.log('🔐 Botón de login encontrado, haciendo clic...');
            await this.page.waitForSelector(this.loginButton, { state: 'visible', timeout: 10000 });
            await this.page.click(this.loginButton);
            
            // Esperar a que se procese la autenticación
            await this.page.waitForTimeout(2000);
        } else {
            console.log('ℹ️ El botón de login no está presente, probablemente ya está autenticado');
        }
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
    }
}

// Page Object para la pantalla de selección de jugador
class PlayerSelectionPage {
    constructor(page) {
        this.page = page;
    }

    async selectPlayer(playerNumber) {
        // Buscar el selector correcto para el jugador
        const playerOption = this.page.locator(`text=JUG. ${playerNumber}`);
        await expect(playerOption).toBeVisible();
        await playerOption.click();
    }

    async verifyUrlRedirect(gameCode, playerNumber, totalPlayers) {
        const baseUrl = process.env.BASE_URL || 'http://127.0.0.1:3000';
        const expectedUrl = `${baseUrl}/?/g/${gameCode}/p/${playerNumber}/${totalPlayers}`;
        await expect(this.page).toHaveURL(expectedUrl);
    }
}

// Page Object para el juego principal
class GamePage {
    constructor(page) {
        this.page = page;
        this.resetButton = 'button:has-text("Reiniciar")';
        this.playerRoleElement = '.player-role, [data-player-role]'; // Selector para el rol del jugador
        this.gameContainer = '#game-content'; // Selector para el contenedor del juego
    }

    async waitForGameToLoad() {
        // Esperar a que el juego se cargue completamente
        await this.page.waitForSelector(this.gameContainer, { state: 'visible', timeout: 15000 });
        await this.page.waitForTimeout(2000); // Tiempo adicional para que se complete la inicialización
    }

    async clickResetButton() {
        await this.page.waitForSelector(this.resetButton, { state: 'visible' });
        await this.page.click(this.resetButton);
    }

    async confirmResetAlert() {
        // Esperar y confirmar la alerta de reinicio
        this.page.on('dialog', dialog => dialog.accept());
    }

    async getPlayerRole() {
        // Intentar obtener el rol del jugador desde diferentes ubicaciones posibles
        const roleSelectors = [
            '.player-role',
            '[data-player-role]',
            '.player-info .role',
            '.profile .role',
            'h2:contains("ROL")',
            '.player-profile .role'
        ];

        for (const selector of roleSelectors) {
            try {
                const element = this.page.locator(selector);
                if (await element.isVisible()) {
                    const text = await element.textContent();
                    if (text && (text.includes('INVITADO') || text.includes('ASESINO') || text.includes('COMPLICE'))) {
                        return text.trim();
                    }
                }
            } catch (e) {
                // Continuar con el siguiente selector
            }
        }

        // Si no se encuentra con selectores específicos, buscar en el texto de la página
        const pageText = await this.page.textContent('body');
        if (pageText.includes('INVITADO') || pageText.includes('ASESINO') || pageText.includes('COMPLICE')) {
            // Extraer el rol del texto de la página
            const roleMatch = pageText.match(/(INVITADO\/A|ASESINO\/A|COMPLICE)/);
            if (roleMatch) {
                return roleMatch[1];
            }
        }

        return null;
    }

    async verifyValidPlayerRole() {
        const role = await this.getPlayerRole();
        expect(role).not.toBeNull();
        
        // Verificar que el rol sea uno de los válidos
        const validRoles = ['INVITADO/A', 'ASESINO/A', 'COMPLICE'];
        const isValidRole = validRoles.some(validRole => 
            role.includes(validRole.replace('/A', '')) || 
            role.includes(validRole.replace('/A', 'A')) ||
            role.includes(validRole.replace('/A', 'O'))
        );
        
        expect(isValidRole).toBeTruthy();
        return role;
    }

    async navigateToPlayerPosition(gameCode, playerNumber, totalPlayers) {
        const baseUrl = process.env.BASE_URL || 'http://127.0.0.1:3000';
        await this.page.goto(`${baseUrl}/?/g/${gameCode}/p/${playerNumber}/${totalPlayers}`);
        await this.waitForGameToLoad();
    }
}

// Test principal
test.describe('Escenario: Al iniciar una partida, hay un asesino y un complice', () => {
    let loginPage;
    let playerCountSelectionPage;
    let playerSelectionPage;
    let gamePage;
    const gameCode = 'galerna';
    const totalPlayers = 5;

    test.beforeEach(async ({ page }) => {
        loginPage = new LoginPage(page);
        playerCountSelectionPage = new PlayerCountSelectionPage(page);
        playerSelectionPage = new PlayerSelectionPage(page);
        gamePage = new GamePage(page);
    });

    test('debe asignar correctamente un asesino y un complice después de reiniciar', async ({ page }) => {
        // ARRANGE: Navegar como jugador 1 y hacer login
        await loginPage.navigateToGame(gameCode, 1, totalPlayers);
        await loginPage.clickAnonymousLogin();

        // Esperar a que el juego se cargue
        await gamePage.waitForGameToLoad();

        // ACT: Pulsar "Reiniciar" y confirmar en la alerta
        await gamePage.clickResetButton();
        await gamePage.confirmResetAlert();

        // Esperar a que se complete el reinicio
        await page.waitForTimeout(3000);

        // ASSERT: Verificar que cada posición de jugador tenga un rol válido después del reinicio
        const playerRoles = [];

        //Primero nos logeamos la primera vez.
        await loginPage.navigateToGame(gameCode, 1, totalPlayers);            
        await loginPage.clickAnonymousLogin();

        // Esperar a que el juego se cargue
        await gamePage.waitForGameToLoad();
            

        for (let playerNumber = 1; playerNumber <= totalPlayers; playerNumber++) {
            // Navegar directamente a la URL del jugador específico
            await loginPage.navigateToGame(gameCode, playerNumber, totalPlayers);
            
            // Esperar a que el juego se cargue
            await gamePage.waitForGameToLoad();
            
            // Verificar que el rol sea válido
            const role = await gamePage.verifyValidPlayerRole();
            playerRoles.push({ player: playerNumber, role: role });
        }

        // Verificar que solo uno sea ASESINO
        const asesinos = playerRoles.filter(p => 
            p.role.includes('ASESINO') || p.role.includes('ASESINO/A') || p.role.includes('ASESINO/O')
        );
        expect(asesinos).toHaveLength(1);
        console.log(`ASESINO encontrado: Jugador ${asesinos[0].player}`);

        // Verificar que solo uno sea COMPLICE
        const complices = playerRoles.filter(p => 
            p.role.includes('COMPLICE')
        );
        expect(complices).toHaveLength(1);
        console.log(`COMPLICE encontrado: Jugador ${complices[0].player}`);

        // Verificar que el resto sean INVITADOS
        const invitados = playerRoles.filter(p => 
            p.role.includes('INVITADO') || p.role.includes('INVITADO/A') || p.role.includes('INVITADO/O')
        );
        expect(invitados).toHaveLength(3);
        console.log(`INVITADOS encontrados: Jugadores ${invitados.map(p => p.player).join(', ')}`);

        // Verificar que ASESINO y COMPLICE sean diferentes
        expect(asesinos[0].player).not.toBe(complices[0].player);

        // Log completo de roles para verificación
        console.log('Distribución completa de roles:');
        playerRoles.forEach(p => {
            console.log(`Jugador ${p.player}: ${p.role}`);
        });
        
        console.log('✅ Test completado: El juego se reinició correctamente y asignó roles válidos a todos los jugadores');
    });
});
