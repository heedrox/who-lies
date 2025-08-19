# Scenario: Al iniciar una partida, hay un asesino y un complice

## ARRANGE
- Abrir navegador {BASE_URL}?g/galerna/p/1/5
- Pulsar "JUGAR ANONIMAMENTE".

## ACT
- Al pulsar "Reiniciar"
- Y confirmar en la alerta

## ASSERT
- Al navegar a {BASE_URL}?/g/galerna/p/1/5, el player-role es INVITADO/A, ASESINO/a o COMPLICE
- Al navegar a {BASE_URL}?/g/galerna/p/2/5, el player-role es INVITADO/A, ASESINO/a o COMPLICE
- Al navegar a {BASE_URL}?/g/galerna/p/3/5, el player-role es INVITADO/A, ASESINO/a o COMPLICE
- Al navegar a {BASE_URL}?/g/galerna/p/4/5, el player-role es INVITADO/A, ASESINO/a o COMPLICE
- Al navegar a {BASE_URL}?/g/galerna/p/5/5, el player-role es INVITADO/A, ASESINO/a o COMPLICE
- Solo uno de los 5 player roles es ASESINO/A
- Solo uno de los 5 player roles es COMPLICE
