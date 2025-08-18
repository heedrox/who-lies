const { test, expect } = require('@playwright/test');
require('dotenv').config();

/**
 * Test para la selección del número de jugadores en WHO LIES
 * Escenario: Selección de número de jugadores
 * 
 * ARRANGE:
 * - Abrir navegador {BASE_URL}?g/galerna
 * - Pulsar "JUGAR ANONIMAMENTE"
 * 
 * ACT:
 * - Seleccionar el número 5
 * 
 * ASSERT:
 * - Se redirige a ?g/galerna/p/x/5
 */

// Page Object para la pantalla de login y selección de jugadores
class PlayerSelectionPage {
    constructor(page) {
        this.page = page;
        this.baseUrl = process.env.BASE_URL || 'http://127.0.0.1:3000';
    }

    /**
     * Navega a la URL del juego con código específico
     * @param {string} gameCode - Código del juego
     */
    async navigateToGame(gameCode) {
        const url = `${this.baseUrl}?g/${gameCode}`;
        console.log(`🎮 Navegando a: ${url}`);
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
     * Selecciona el número de jugadores
     * @param {number} playerCount - Número de jugadores a seleccionar
     */
    async selectPlayerCount(playerCount) {
        console.log(`👥 Seleccionando ${playerCount} jugadores`);
        await this.page.click(`text=${playerCount}`);
        
        // Esperar a que se procese la redirección
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
     * @param {number} playerCount - Número de jugadores esperado
     */
    async verifyRedirect(gameCode, playerCount) {
        const currentUrl = await this.getCurrentUrl();
        const expectedUrl = `${this.baseUrl}?g/${gameCode}/p/x/${playerCount}`;
        
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
}

// Test principal
test.describe('WHO LIES - Selección de Número de Jugadores', () => {
    let playerSelectionPage;

    test.beforeEach(async ({ page }) => {
        playerSelectionPage = new PlayerSelectionPage(page);
        console.log('🚀 Iniciando test de selección de número de jugadores');
    });

    test('debe redirigir correctamente al seleccionar 5 jugadores', async ({ page }) => {
        // ARRANGE
        console.log('📋 ARRANGE: Configurando el test');
        await playerSelectionPage.takeScreenshot('01-inicio-pagina');
        
        // Navegar a la URL del juego
        await playerSelectionPage.navigateToGame('galerna');
        await playerSelectionPage.takeScreenshot('02-pagina-inicial');
        
        // Pulsar "JUGAR ANÓNIMAMENTE"
        await playerSelectionPage.clickPlayAnonymously();
        await playerSelectionPage.takeScreenshot('03-despues-login');

        // ACT
        console.log('🎯 ACT: Ejecutando la acción del test');
        
        // Seleccionar el número 5
        await playerSelectionPage.selectPlayerCount(5);
        await playerSelectionPage.takeScreenshot('04-despues-seleccion');

        // ASSERT
        console.log('✅ ASSERT: Verificando el resultado esperado');
        
        // Verificar que se redirige correctamente
        await playerSelectionPage.verifyRedirect('galerna', 5);
        
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
