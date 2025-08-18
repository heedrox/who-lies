# Scenario: Login anónimo

## ARRANGE
- Iniciar servidor de desarrollo con `nvm use 20 && npm run dev`
- Abrir navegador
- Navegar a: {BASE_URL}?g/galerna

## ACT
- Pulsa botón "JUGAR ANONIMAMENTE".

## ASSERT
- Se muestra el título NUMERO DE JUGADORES
- Se muestran enlaces de 4 al 12.

