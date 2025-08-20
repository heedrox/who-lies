const { test, expect } = require('@playwright/test');
require('dotenv').config();

/**
 * Test para la selección del número de jugador específico en WHO LIES
 * Escenario: Selección de qué número de jugador soy
 * 
 * ARRANGE:
 * - Abrir navegador {BASE_URL}?g/galerna/p/x/5
 * - Pulsar "JUGAR ANONIMAMENTE"
 * 
 * ACT:
 * - Seleccionar el número 2
 * 
 * ASSERT:
 * - Se redirige a ?g/galerna/p/2/5
 */

// Page Object para la pantalla de selección de jugador específico
class PlayerSpecificSelectionPage {
    constructor(page) {
        this.page = page;
        this.baseUrl = process.env.BASE_URL || 'http://127.0.0.1:3000';
    }

    /**
     * Navega a la URL del juego con código específico y selección de jugador pendiente
     * @param {string} gameCode - Código del juego
     * @param {number} totalPlayers - Total de jugadores en la partida
     */
    async navigateToPlayerSelection(gameCode, totalPlayers) {
        const url = `${this.baseUrl}?g/${gameCode}/p/x/${totalPlayers}`;
        console.log(`🎮 Navegando a selección de jugador: ${url}`);
        await this.page.goto(url);
    }

    /**
     * Hace clic en el botón "JUGAR ANÓNIMAMENTE"
     */
    async clickPlayAnonymously() {
        console.log('🔐 Haciendo clic en JUGAR ANÓNIMAMENTE');
        await this.page.click('#login-btn');
        
        // Esperar a que se procese la autenticación
        await this.page.waitForTimeout(2000);
    }

    /**
     * Selecciona el número de jugador específico
     * @param {number} playerNumber - Número de jugador a seleccionar
     */
    async selectPlayerNumber(playerNumber) {
        console.log(`👤 Seleccionando jugador número ${playerNumber}`);
        
        // Buscar y hacer clic en la opción del jugador
        const playerOption = this.page.locator(`text=JUG. ${playerNumber}`);
        await playerOption.click();
        
        // Esperar a que se procese la selección
        await this.page.waitForTimeout(2000);
    }

    /**
     * Obtiene la URL actual para verificar la redirección
     * @returns {string} URL actual
     */
    async getCurrentUrl() {
        const url = this.page.url();
        console.log(`🔗 URL actual: ${url}`);
        return url;
    }

    /**
     * Verifica que la redirección sea correcta
     * @param {string} gameCode - Código del juego esperado
     * @param {number} playerNumber - Número de jugador esperado
     * @param {number} totalPlayers - Total de jugadores esperado
     */
    async verifyRedirect(gameCode, playerNumber, totalPlayers) {
        const currentUrl = await this.getCurrentUrl();
        const expectedUrl = `${this.baseUrl}?/g/${gameCode}/p/${playerNumber}/${totalPlayers}`;
        
        console.log(`✅ Verificando redirección:`);
        console.log(`   Esperado: ${expectedUrl}`);
        console.log(`   Actual:   ${currentUrl}`);
        
        expect(currentUrl).toBe(expectedUrl);
    }

    /**
     * Toma una captura de pantalla con nombre descriptivo
     * @param {string} name - Nombre de la captura
     */
    async takeScreenshot(name) {
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const filename = `${name}_${timestamp}.png`;
        console.log(`📸 Tomando captura: ${filename}`);
        await this.page.screenshot({ 
            path: `test-results/${filename}`, 
            fullPage: true 
        });
    }

    /**
     * Verifica que se muestre la pantalla de selección de jugador
     */
    async verifyPlayerSelectionScreen() {
        console.log('🔍 Verificando que se muestre la pantalla de selección de jugador');
        
        // Esperar a que aparezca el título de selección de jugador
        const title = this.page.locator('h2:has-text("SELECCIONE JUGADOR")');
        await expect(title).toBeVisible();
        
        // Verificar que hay opciones de jugadores disponibles
        const playerOptions = this.page.locator('.player-option, .player-selection-option');
        await expect(playerOptions.first()).toBeVisible();
        
        console.log('✅ Pantalla de selección de jugador visible');
    }
}

// Test principal
test.describe('WHO LIES - Selección de Número de Jugador Específico', () => {
    let playerSelectionPage;

    test.beforeEach(async ({ page }) => {
        playerSelectionPage = new PlayerSpecificSelectionPage(page);
        console.log('🚀 Iniciando test de selección de número de jugador específico');
    });

    test('debe redirigir correctamente al seleccionar jugador número 2', async ({ page }) => {
        // ARRANGE
        console.log('📋 ARRANGE: Configurando el test');
        await playerSelectionPage.takeScreenshot('01-inicio-seleccion-jugador');
        
        // Navegar a la URL de selección de jugador
        await playerSelectionPage.navigateToPlayerSelection('galerna', 5);
        await playerSelectionPage.takeScreenshot('02-pagina-seleccion-jugador');
        
        // Pulsar "JUGAR ANÓNIMAMENTE"
        await playerSelectionPage.clickPlayAnonymously();
        await playerSelectionPage.takeScreenshot('03-despues-login');

        // Verificar que se muestre la pantalla de selección de jugador
        await playerSelectionPage.verifyPlayerSelectionScreen();
        await playerSelectionPage.takeScreenshot('04-pantalla-seleccion-jugador');

        // ACT
        console.log('🎯 ACT: Ejecutando la acción del test');
        
        // Seleccionar el jugador número 2
        await playerSelectionPage.selectPlayerNumber(2);
        await playerSelectionPage.takeScreenshot('05-despues-seleccion-jugador');

        // ASSERT
        console.log('✅ ASSERT: Verificando el resultado esperado');
        
        // Verificar que se redirige correctamente
        await playerSelectionPage.verifyRedirect('galerna', 2, 5);
        
        console.log('🎉 Test completado exitosamente');
    });

    test.afterEach(async () => {
        console.log('🧹 Limpiando después del test');
    });
});

// Configuración adicional del test
test.describe.configure({ 
    mode: 'serial',
    retries: 1,
    timeout: 30000 
});
