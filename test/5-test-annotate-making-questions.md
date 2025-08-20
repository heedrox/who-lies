# Scenario: Existe un botón para anotar que has hecho una pregunta

## ARRANGE: Un juego iniciado de cero
- Abrir navegador {BASE_URL}?/g/galerna/p/1/5
- Pulsar "JUGAR ANONIMAMENTE".
- Pulsar "Reiniciar" en la zona superiro derecha: #restart-game-btn
- Y confirmar en la alerta "¿REALMENTE QUIERES REINICIAR EL JUEGO?"

## ACT
- Si soy el jugador 2: abrir navegador {BASE_URL}?/g/galerna/p/2/5

## ASSERT
- En el footer #game-footer
- A la derecha del botón "TERMINAR RONDA" class=end-round-btn
- Existe un botón "ANOTAR PREGUNTA": class=add-question

## ACT
- Pulso el botón "ANOTAR PREGUNTA": class=add-question

## ASSERT
- Se añade en class=player-status-cell del jugador 2, bajo el emoji, un palo vertical (i mayúscula) "I"

## ACT
- Pulso el botón "ANOTAR PREGUNTA": class=add-question

## ASSERT
- Existen 2 palos verticales: II bajo el jugador 2.

## ACT
- Navego como jugador 3: {BASE_URL}?g/galerna/p/3/5
- Pulso el botón "ANOTAR PREGUNTA": class=add-question

## ASSERT
- Existen 2 palos verticales: "II" bajo el jugador 2.
- Existe 1 palo vertical: "I" bajo el jugador 3.

## ACT
- Navego como director de juego, jugador 1: {BASE_URL}?g/galerna/p/1/5
- Pulso "REINICIAR JUEGO".

## ASSERT 
- No existen palos verticales ("I") en ningún jugador

## ACT
- Recargo la página como jugador 2

## ASSERT
- Los contadores de preguntas siguen visibles (persistencia)

## ACT
- Abro otra pestaña como jugador 2 y anoto una pregunta

## ASSERT
- En la primera pestaña se actualiza automáticamente el contador

