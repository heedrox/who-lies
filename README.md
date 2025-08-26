# WHO LIES - Murder Mystery Game

Un juego de misterio tipo Cluedo donde debes triangular información para descubrir al asesino.

## 🎯 ¿Qué es WHO LIES?

**WHO LIES** es un juego de misterio y deducción donde los jugadores deben triangular información para descubrir quién es el asesino. El juego se desarrolla en un entorno de "murder mystery" similar a Cluedo, pero con un enfoque en la triangulación de pistas y la lógica deductiva.

### 🎮 Concepto del juego
- **Objetivo**: Descubrir al asesino mediante la triangulación de información
- **Mecánica**: Los jugadores reciben información parcial y deben conectarla para resolver el misterio
- **Ambiente**: Tema de "murder mystery" con estética de suspense
- **Plataforma**: Web optimizada para móviles en modo vertical

## 🏰 El mundo del juego

### 📍 Estancias (9 ubicaciones)
El juego se desarrolla en una mansión dividida en 9 estancias organizadas en una cuadrícula 3x3:

```
┌─────────────────┬─────────────────┬─────────────────────┐
│     COCINA      │  PASILLO NORTE  │  HABITACIÓN         │
│                 │                 │   PRINCIPAL         │
├─────────────────┼─────────────────┼─────────────────────┤
│    COMEDOR      │                 │  HABITACIÓN         │
│                 │                 │   INVITADOS         │
├─────────────────┼─────────────────┼─────────────────────┤
│  TORREÓN OESTE  │  PASILLO SUR    │   TORREÓN ESTE      │
└─────────────────┴─────────────────┴─────────────────────┘
```



### 👥 Sistema de jugadores
- Los jugadores se mueven entre estancias
- Pueden ver a otros jugadores en estancias específicas
- La información se comparte de forma parcial para fomentar la deducción
- **Selección de jugador**: URL con formato `?/g/CODIGO_JUEGO/p/x/TOTAL_JUGADORES` muestra pantalla de selección
- **Pantalla de selección**: Muestra opciones JUG. 1, JUG. 2, ..., JUG. N para elegir número de jugador
- **Redirección automática**: Al seleccionar jugador, redirige a `?/g/CODIGO_JUEGO/p/NUMERO_JUGADOR/TOTAL_JUGADORES`

## 🔍 Mecánicas de juego

### 📋 Información del jugador
Cada jugador recibe información como:
- **Ubicación actual**: "Estás en HABITACIÓN INVITADOS"
- **Jugadores visibles**: "Contigo ves a JUGADOR 2"
- **Vistas a distancia**: "Puedes ver en la HABITACIÓN PRINCIPAL a JUGADOR 4"

### 🧩 Triangulación de pistas
- Los jugadores deben combinar su información con la de otros
- Cada pieza de información es una pista que debe ser conectada
- La resolución del misterio requiere colaboración y deducción lógica

### 👁️ Sistema de visibilidad por habitación
- **Reglas de visibilidad**: Cada habitación solo puede ver a habitaciones contiguas específicas
- **Distribución de visibilidad**:
  - **Cocina**: Ve a Pasillo Norte y Comedor
  - **Pasillo Norte**: Ve a Cocina y Habitación Principal
  - **Habitación Principal**: Ve a Pasillo Norte y Habitación Invitados
  - **Comedor**: Ve a Cocina y Torreón Oeste
  - **Habitación Invitados**: Ve a Habitación Principal y Torreón Este
  - **Torreón Oeste**: Ve a Comedor y Pasillo Sur
  - **Pasillo Sur**: Ve a Torreón Oeste y Torreón Este
  - **Torreón Este**: Ve a Pasillo Sur y Habitación Invitados
- **Ventaja para roles especiales**: ASESINO y COMPLICE pueden ver a todos los jugadores en todas las habitaciones
- **Sistema de visibilidad centralizado**: Se genera un diccionario `{ 1: [3,4], 2: [1,5], ... }` al crear la distribución
- **Probabilidad del 60% para INVITADOS**: Se aplica una sola vez, no en cada actualización de la UI
- **Almacenamiento en Firebase**: La visibilidad se guarda junto con la distribución y roles para consistencia
- **Sin recálculo**: Cada jugador mantiene la misma visibilidad durante toda la partida

### 🎲 Estructura de rondas
- El juego se divide en rondas
- Cada ronda proporciona nueva información
- Los jugadores pueden "TERMINAR RONDA" para avanzar

### 👥 Distribución de jugadores
- **Inicialización automática**: Solo el jugador 1 (X=1) ejecuta la distribución
- **Distribución aleatoria**: Los jugadores se colocan aleatoriamente en las 9 estancias
- **Regla de validación**: Al menos una estancia debe tener 2 o más jugadores
- **Formato de datos**: Diccionario JSON listo para integración con base de datos NoSQL
- **Ejemplo de salida**: `{ 'cocina': [3,2], 'pasillo_norte': [1], ... }`

### 🎭 Sistema de roles
- **Asignación automática**: Los roles se asignan automáticamente al crear la distribución
- **ASESINO**: Siempre se asigna 1 jugador aleatorio
- **COMPLICE**: 
  - **4 jugadores**: 0 complices (array vacío)
  - **5+ jugadores**: 1 complice (array con 1 elemento)
- **Validación**: El COMPLICE siempre es diferente al ASESINO
- **Formato de roles**: `{ "ASESINO": 3, "COMPLICE": [1] }`

### 🎯 Sistema de acusaciones colectivas
- **Director de juego**: Solo el jugador 1 puede ejecutar acusaciones
- **Acusaciones grupales**: El jugador 1 representa la decisión colectiva del grupo
- **Interfaz visual**: Celdas de estado de jugadores clickeables en la parte superior
- **Modal de confirmación**: "¿ACUSAR AL JUG. X?" con botones SÍ/NO
- **Resultados de acusación**:
  - **Éxito**: "¡FELICIDADES! ¡HABÉIS MATADO AL ASESINO!" si el acusado es el ASESINO
  - **Fracaso**: El jugador acusado se marca como muerto y la partida continúa
- **Integración con Firebase**: Los jugadores muertos se sincronizan en tiempo real
- **Prevención de auto-acusación**: El jugador 1 puede acusar a cualquier jugador, incluyendo J1

### ❓ Sistema de anotación de preguntas
- **Botón de anotación**: Botón "ANOTAR PREGUNTA" visible en el footer durante el turno de juego
- **Contadores visuales**: Palos "I" (i mayúscula) se muestran debajo de cada avatar de jugador
- **Acumulación ilimitada**: No hay límite en el número de preguntas que puede anotar cada jugador
- **Sincronización en tiempo real**: Los contadores se actualizan automáticamente para todos los jugadores
- **Almacenamiento en Firebase**: Los contadores se guardan en el campo `numberQuestionsMade` a nivel de `gameCode`
- **Estructura de datos**: Diccionario `{ 1: 2, 2: 1, 3: 0, ... }` donde cada número representa las preguntas del jugador
- **Persistencia**: Los contadores se mantienen al recargar la página
- **Reset automático**: Al reiniciar el juego, todos los contadores se ponen a cero
- **Visibilidad condicional**: El botón solo aparece durante el turno de juego, no durante el turno de movimiento

### 🎮 Sistema de configuración de partida optimizado
- **Acceso directo con código de juego**: URLs del formato `?/g/{CODIGO_JUEGO}` para iniciar partidas
- **Selección de número de jugadores**: Pantalla para elegir entre 4 y 15 jugadores
- **Flujo secuencial de configuración**: Sistema de pantallas paso a paso para configurar la partida
- **Redirección automática**: Navegación fluida entre pantallas de configuración
- **Integración con autenticación**: Flujo de login antes de la configuración de la partida
- **Interfaz consistente**: Diseño uniforme con el resto del juego
- **Validación de parámetros**: Solo acepta números de jugadores válidos (4-15)

## 💻 Contexto de desarrollo

### 🚀 Origen del proyecto
Este proyecto nació de una conversación de desarrollo donde se conceptualizó un juego web de misterio para dispositivos móviles. La idea era crear una interfaz intuitiva que permitiera a los jugadores enfocarse en la lógica del juego sin distracciones.

### 🎨 Decisiones de diseño
- **Tema visual**: Colores oscuros con acentos rojos para crear atmósfera de misterio
- **Layout**: Cuadrícula 3x3 para las estancias, fácil de entender en móvil
- **Responsive**: Optimizado para pantallas verticales de dispositivos móviles
- **Tipografía**: Fuente Georgia para dar un toque clásico y elegante

### 🔧 Evolución técnica
1. **Interfaz básica**: HTML simple con estancias
2. **Guía de elementos**: Sistema de categorías (venenos, herramientas, armas)
3. **Optimización**: Reducción de espaciado y tamaños para mejor ajuste móvil
4. **Entorno de desarrollo**: Configuración completa con Node.js 20 y npm scripts
5. **Sistema de jugadores**: Distribución aleatoria en estancias con parámetros de URL
6. **Preparación para BD**: Estructura de datos lista para integración con NoSQL
7. **Sistema de autenticación**: Firebase con login anónimo para gestión de sesiones
8. **Interfaz de usuario**: Sistema de login/logout con transiciones suaves
9. **Sistema de roles**: Asignación automática de ASESINO y COMPLICE con validaciones

## 🚀 Requisitos del sistema

- **Node.js**: Versión 20.x (recomendado 20.18.3+)
- **npm**: Versión 10.x (recomendado 10.8.2+)
- **Firebase**: Proyecto configurado con Authentication habilitado

## 📦 Instalación

### 1. Clonar el repositorio
```bash
git clone <tu-repositorio>
cd who-lies
```

### 2. Usar Node.js 20 (con nvm)
```bash
# Si usas nvm
nvm use 20

# O instalar Node.js 20 si no lo tienes
nvm install 20
nvm use 20
```

### 3. Instalar dependencias
```bash
npm install
```

### 4. Configurar Firebase
```bash
# Crear proyecto en Firebase Console
# Habilitar Authentication → Anonymous
# Copiar configuración a web/firebase-config.js
```

**Ver archivo `FIREBASE_SETUP.md` para instrucciones detalladas.**

## 🛠️ Desarrollo

### Iniciar servidor
Para iniciar el servidor de desarrollo:

```bash
npm run dev
```

Esto abrirá automáticamente tu navegador en `http://localhost:3000`

### Tests automatizados
El proyecto incluye tests automatizados generados con Playwright:

```bash
# Ejecutar todos los tests
npm run test:e2e

# Ejecutar tests específicos
npm run test:e2e -- test/generated/5-test-annotate-making-questions.spec.js

# Ejecutar tests en modo visible
npm run test:e2e -- --headed
```

**Tests implementados:**
- ✅ **Funcionalidad "ANOTAR PREGUNTA"** - 5 tests que validan botón, contadores, sincronización y persistencia
- ✅ **Patrón Page Object** - Tests refactorizados usando clases y métodos reutilizables
- ✅ **Cobertura completa** - Todos los casos de uso documentados en `test/5-test-annotate-making-questions.md`

### Funcionalidad de distribución de jugadores
La nueva funcionalidad se ejecuta automáticamente cuando:
1. **URL contiene parámetros**: `?X/Y` (ej: `?1/6`)
2. **X = 1**: Solo el jugador 1 ejecuta la distribución
3. **Evento onload**: Se ejecuta al cargar la página

**Funciones implementadas:**
- `getUrlParams()`: Extrae parámetros X/Y de la URL
- `distributePlayers(totalPlayers)`: Distribuye jugadores aleatoriamente
- `assignPlayerRoles(totalPlayers)`: Asigna roles ASESINO y COMPLICE automáticamente
- `initializeGame()`: Función principal que coordina la inicialización

**Validaciones implementadas:**
- Garantiza que al menos una estancia tenga 2+ jugadores
- Distribuye el resto de jugadores aleatoriamente (0, 1, 2 o 3 por estancia)
- Asigna roles según el número de jugadores (4 jugadores: solo ASESINO, 5+: ASESINO + COMPLICE)
- Garantiza que ASESINO y COMPLICE sean jugadores diferentes
- Genera diccionario JSON en consola para fácil copia

### Servidor de desarrollo
- **Puerto**: 3000
- **Hot-reload**: Automático al cambiar archivos
- **Directorio servido**: `web/`
- **URL**: `http://127.0.0.1:3000`

## 📜 Scripts disponibles

- **`npm run dev`** - Inicia el servidor de desarrollo y abre el navegador
- **`npm start`** - Inicia el servidor de desarrollo sin abrir el navegador
- **`npm run build`** - Comando de build (placeholder para futuras funcionalidades)
- **`npm test`** - Comando de tests (placeholder para futuras funcionalidades)

## 🏗️ Tecnologías

- **Frontend**: HTML5, CSS3 (con gradientes y efectos visuales), JavaScript vanilla
- **Servidor de desarrollo**: Live Server
- **Gestión de paquetes**: npm
- **Entorno**: Node.js 20
- **Lógica de juego**: Algoritmos de distribución aleatoria y validación de reglas
- **Backend**: Firebase 12.1.0 (Authentication, Firestore) - **ACTUALIZADO**
- **Autenticación**: Sistema de login anónimo con gestión de sesiones
- **Arquitectura Firebase**: Patrón modular con singleton, caché persistente y soporte multi-tab

## 📁 Estructura del proyecto

```
who-lies/
├── web/
│   ├── index.html                    # Interfaz principal del juego
│   ├── firebase-modular.js           # Sistema Firebase modular (NUEVO)
│   └── firebase-config.js            # Configuración de Firebase (DEPRECADO)
├── test/
│   ├── 5-test-annotate-making-questions.md    # Especificaciones de tests (NUEVO)
│   └── generated/
│       └── 5-test-annotate-making-questions.spec.js  # Tests automatizados (NUEVO)
├── package.json                       # Dependencias y scripts
├── firebase.json                      # Configuración de Firebase
├── FIREBASE_SETUP.md                  # Guía de configuración de Firebase
├── README.md                          # Este archivo
└── node_modules/                      # Dependencias (generado automáticamente)
```

## 🎮 Características del juego

- **9 estancias** organizadas en cuadrícula 3x3
- **Sistema de información** para triangular pistas
- **Interfaz responsive** optimizada para móvil
- **Tema visual** de misterio y suspense
- **Modo vertical** para dispositivos móviles
- **Guía de elementos** (venenos, herramientas, armas)
- **Sistema de rondas** con botón "TERMINAR RONDA"
- **Distribución aleatoria de jugadores** en estancias
- **Sistema de parámetros de URL** para identificación de jugadores
- **Autenticación anónima** con Firebase para gestión de sesiones
- **Sistema de login/logout** con interfaz moderna y transiciones suaves
- **Gestión de estado** de autenticación automática
- **Sistema de roles automático** con asignación de ASESINO y COMPLICE
- **Sistema de asesinatos del ASESINO** con interfaz de selección de víctima
- **Sincronización en tiempo real** con Firebase para actualizaciones instantáneas
- **Indicador de estado de conexión** visual para monitorear la conectividad
- **Notificaciones automáticas** cuando hay cambios en el juego
- **Actualización automática de la UI** sin necesidad de recargar la página
- **Gestión inteligente de recursos** con limpieza automática de suscripciones
- **Resaltado visual de ubicación** - La habitación del jugador actual se resalta en rojo con animaciones
- **Sistema de visibilidad entre habitaciones** - Los jugadores solo ven a otros jugadores en habitaciones contiguas
- **Ventaja táctica para roles especiales** - ASESINO y COMPLICE pueden ver a todos los jugadores en todas las habitaciones
- **Sistema de visibilidad centralizado** - Diccionario de visibilidad generado una sola vez y almacenado en Firebase
- **Probabilidad del 60% para INVITADOS** - Se aplica una sola vez al generar la distribución, garantizando consistencia
- **Sistema de rondas completo** - Control de fases del juego con modo de movimiento
- **Interfaz de movimiento inteligente** - Selección de habitaciones con restricciones por rol
- **Seguimiento de movimientos en tiempo real** - Lista visual del estado de cada jugador
- **Botón de control inteligente** - Cambia automáticamente según el estado de la ronda
- **Finalización automática de rondas** - Sistema que detecta cuando todos han movido
- **Botón de recarga rápida** - Botón circular con emoji 🔄 para recargar la página desde la esquina superior izquierda
- **Sistema de acusaciones colectivas** - El jugador 1 actúa como director de juego para ejecutar acusaciones grupales
- **Sistema de configuración de partida optimizado** - Acceso directo con código de juego y selección secuencial de número de jugadores (4-15)
- **Sistema de anotación de preguntas** - Botón "ANOTAR PREGUNTA" en el footer para contabilizar preguntas de cada jugador
- **Visualización de contadores** - Palos "I" (i mayúscula) debajo de avatares que muestran el número de preguntas realizadas
- **Sincronización en tiempo real** - Los contadores se actualizan automáticamente entre todos los jugadores
- **Persistencia de datos** - Los contadores se mantienen al recargar la página y se almacenan en Firebase
- **Reset automático** - Los contadores se reinician a cero al reiniciar el juego

## 🔧 Configuración del entorno

### Usar Node.js 20 por defecto
```bash
nvm alias default 20
```

### Verificar versiones
```bash
node --version  # Debe mostrar v20.x.x
npm --version   # Debe mostrar 10.x.x
```

## 🚨 Solución de problemas

### Si tienes problemas con versiones de Node.js
```bash
# Limpiar instalación anterior
rm -rf node_modules package-lock.json

# Cambiar a Node.js 20
nvm use 20

# Reinstalar dependencias
npm install
```

### Si el puerto 3000 está ocupado
El servidor automáticamente buscará un puerto disponible, pero puedes especificar uno:
```bash
npx live-server web --port=3001
```

### 🔥 **Problemas de Firebase (RESUELTOS)**

#### ❌ **Error: "FIRESTORE INTERNAL ASSERTION FAILED: Unexpected state"**
- **Causa**: Firebase 10.7.1 con compat mode y problemas de reconexión
- **Solución**: ✅ **IMPLEMENTADA** - Migración completa a Firebase 12.1.0 modular
- **Estado**: Resuelto completamente

#### ❌ **Error: "auth is not defined"**
- **Causa**: Observer de autenticación ejecutándose antes de que Firebase esté disponible
- **Solución**: ✅ **IMPLEMENTADA** - Sistema de inicialización robusto con timing correcto
- **Estado**: Resuelto completamente

#### ❌ **Error: "db is not defined"**
- **Causa**: Referencias directas a `db` sin obtenerla de Firebase Modular
- **Solución**: ✅ **IMPLEMENTADA** - Todas las funciones ahora usan `window.FirebaseModular.getFirebaseServices()`
- **Estado**: Resuelto completamente

#### ❌ **Problema: Usuario autenticado pero juego no se muestra**
- **Causa**: Conflictos entre observers de autenticación
- **Solución**: ✅ **IMPLEMENTADA** - Sistema unificado de observers con lógica del juego integrada
- **Estado**: Resuelto completamente

### 🎯 **Verificación de Funcionamiento**
Para verificar que Firebase funciona correctamente, busca estos logs en la consola:
```javascript
✅ Firebase 12.x inicializado con caché persistente y soporte multi-tab
📦 Firebase Modular configurado y listo para usar
🚀 Sistema Firebase completamente inicializado
🎮 Usuario autenticado en el juego: [UID]
✅ Listener de conexión de Firestore configurado
```

## 📱 Acceso al juego

### URLs de acceso
Una vez iniciado el servidor:
- **URL local**: `http://localhost:3000`
- **URL de red**: `http://127.0.0.1:3000`
- **Acceso móvil**: Usa la IP de tu máquina en la misma red WiFi

### Sistema de parámetros de jugadores
El juego utiliza parámetros de URL para identificar jugadores:

#### Formato nuevo (recomendado)
- **Formato**: `http://127.0.0.1:3000/?/g/{CODIGO_JUEGO}/p/{NUM_JUGADOR}/{TOTAL_JUGADORES}`
- **Ejemplos**:
  - `http://127.0.0.1:3000/?/g/ABC123/p/1/6` - Jugador 1 de 6 en partida ABC123
  - `http://127.0.0.1:3000/?/g/ABC123/p/3/8` - Jugador 3 de 8 en partida ABC123
  - `http://127.0.0.1:3000/?/g/ABC123/p/x/6` - Selección de jugador para partida ABC123 con 6 jugadores

#### Formato de acceso directo
- **Formato**: `http://127.0.0.1:3000/?/g/{CODIGO_JUEGO}`
- **Ejemplo**: `http://127.0.0.1:3000/?/g/ABC123` - Acceso directo a partida ABC123 (selección automática de número de jugadores)

#### Formato anterior (legacy)
- **Formato**: `http://127.0.0.1:3000/?X/Y`
- **X**: Número de jugador (1, 2, 3, ...)
- **Y**: Total de jugadores en la partida
- **Ejemplos**:
  - `http://127.0.0.1:3000/?1/6` - Jugador 1 de 6
  - `http://127.0.0.1:3000/?3/8` - Jugador 3 de 8
  - `http://127.0.0.1:3000/?2/4` - Jugador 2 de 4

## 🎯 Cómo jugar

### 0. **Configurar la partida (nuevo)**
- **Acceso directo**: Usa `?/g/{CODIGO_JUEGO}` para acceder directamente a una partida
- **Selección de jugadores**: Elige el número de jugadores (4-15) para la partida
- **Selección de jugador**: Elige tu número de jugador específico
- **Autenticación**: El sistema te pedirá autenticación antes de la configuración

### 1. **Entender tu posición**
- Lee tu ubicación actual en la información del juego
- Identifica qué jugadores están contigo

### 2. **Observar el mapa**
- Familiarízate con las 9 estancias
- Identifica las ubicaciones mencionadas en tu información

### 3. **Conectar pistas**
- Comparte tu información con otros jugadores
- Busca patrones y conexiones entre las pistas
- Usa la lógica para triangular la información

### 4. **Avanzar en rondas**
- Cuando hayas procesado toda la información de una ronda
- Haz clic en "TERMINAR RONDA" para continuar

### 5. **Resolver el misterio**
- Combina todas las pistas para identificar al asesino
- El juego se resuelve mediante la colaboración y deducción

## 🔐 Sistema de Autenticación

### 🚀 Características implementadas
- **Login anónimo**: Conexión sin información personal
- **Gestión de sesiones**: Estado persistente durante la navegación
- **Interfaz moderna**: Diseño limpio con transiciones suaves
- **Logout funcional**: Cierre de sesión con botón dedicado
- **Estado automático**: Cambio automático entre login y juego

### 🎯 Cómo funciona
1. **Al cargar la página**: Se muestra la pantalla de login
2. **Al hacer clic en "JUGAR ANÓNIMAMENTE"**: Se crea una sesión anónima
3. **Se genera un ID único**: Identificador único para la sesión
4. **Se desbloquea el juego**: La interfaz cambia al modo de juego
5. **Persistencia**: La sesión se mantiene hasta cerrar sesión o cerrar el navegador

### 🔧 Configuración técnica
- **Firebase SDK**: Integrado con CDN para máxima compatibilidad
- **Authentication**: Configurado para autenticación anónima
- **Estado reactivo**: Observer que maneja cambios de autenticación
- **Manejo de errores**: Alertas informativas para problemas de conexión
- **Firestore en tiempo real**: Suscripciones automáticas con `onSnapshot()`
- **Gestión de estado**: Manejo automático de suscripciones y limpieza de recursos
- **UI reactiva**: Actualización automática de la interfaz basada en cambios de Firebase

### 🎭 Sistema de Roles y Almacenamiento
- **Asignación automática**: Los roles se asignan al crear la distribución
- **Almacenamiento en Firebase**: Distribución + roles se guardan en Firestore
- **Estructura de datos**: `{ playerDistribution: {...}, roles: { ASESINO: X, COMPLICE: [Y] } }`
- **Sincronización**: Todos los jugadores pueden acceder a la información de roles
- **Sistema de asesinatos**: El ASESINO puede matar a otros jugadores durante el modo de movimiento

### 🔪 Sistema de Asesinatos del ASESINO
- **Activación automática**: Solo se activa en el turno de MOVIMIENTO
- **Selección de víctima**: Interfaz especial para que el ASESINO seleccione a quién matar
- **Restricciones de víctimas**: Solo puede matar a jugadores en su misma habitación
- **Opciones de acción**: Puede elegir matar a UNO y SOLO UNO, o decidir no matar a nadie
- **Flujo optimizado**: Selección de víctima y movimiento se ejecutan en un solo paso
- **Interfaz compacta**: Modal de selección que aparece solo cuando es necesario
- **Ejecución automática**: Al seleccionar víctima, el movimiento se ejecuta automáticamente
- **Base de datos**: Campo `nextDeath: X` se actualiza al seleccionar víctima
- **Procesamiento automático**: Al avanzar ronda, se actualiza el array `deads: []`
- **Reset automático**: Array de muertos se vacía al reiniciar el juego
- **Visualización de muertos**: Los jugadores muertos se muestran con emoji 💀 y estilo tachado
- **Interfaz intuitiva**: Selección visual con opciones claras y ejecución automática

### 🔄 Sincronización en Tiempo Real
- **Suscripciones automáticas**: Los jugadores se suscriben automáticamente a cambios en Firebase
- **Actualizaciones instantáneas**: La UI se actualiza automáticamente sin recargar la página
- **Estado de conexión**: Indicador visual del estado de conexión con Firebase
- **Notificaciones**: Alertas automáticas cuando hay actualizaciones del juego
- **Gestión de recursos**: Limpieza automática de suscripciones al cerrar sesión
- **Efectos visuales**: Animaciones y transiciones suaves en las actualizaciones

### 🎯 Resaltado Visual de Ubicación
- **Habitación resaltada**: La habitación donde está el jugador actual se muestra con fondo rojo
- **Animaciones**: Efectos de pulso y sombras para destacar la ubicación actual
- **Indicador visual**: Emoji de ubicación (📍) en la esquina superior derecha de la habitación
- **Tag del jugador**: El número del jugador actual se resalta con animaciones especiales
- **Información dinámica**: La UI se actualiza automáticamente mostrando la ubicación actual
- **Perfil actualizado**: El perfil del jugador muestra su ubicación actual en tiempo real

### 👤 Perfil de Jugador Personalizado
- **Identificación automática**: El perfil muestra automáticamente "JUG. X" donde X es el número del jugador
- **Actualización dinámica**: El título del perfil se actualiza automáticamente al cargar el juego
- **Integración con parámetros URL**: Utiliza los parámetros de la URL (?X/Y) para identificar al jugador
- **Formato conciso**: Utiliza la abreviatura "JUG." para mantener la interfaz limpia y legible
- **Persistencia de identidad**: El número de jugador se mantiene visible durante toda la sesión
- **Información de roles para ASESINO y COMPLICE**: Los jugadores con roles especiales pueden ver información adicional sobre otros roles en su perfil
- **Información del COMPLICE para ASESINO**: Si eres el ASESINO, verás "COMPLICE: JUG. X" en letra pequeña
- **Información del ASESINO para COMPLICE**: Si eres el COMPLICE, verás "ASESINO/A: JUG. X" en letra pequeña
- **Seguridad para INVITADOS**: Los jugadores normales no ven información adicional de roles, manteniendo el misterio

### 👁️ Sistema de Visibilidad entre Habitaciones
- **Visibilidad limitada**: Los jugadores solo pueden ver a otros jugadores en habitaciones contiguas
- **Reglas de visibilidad**: Cada habitación tiene acceso visual a habitaciones específicas según su ubicación
- **Ventaja táctica para roles especiales**: ASESINO y COMPLICE pueden ver a TODOS los jugadores en TODAS las habitaciones
- **Información parcial**: Los INVITADOS solo ven jugadores en habitaciones visibles, fomentando la deducción
- **Habitaciones ocultas**: Las habitaciones no visibles se muestran como vacías (sin spoilers)
- **Diccionario de visibilidad**: Sistema configurable que define qué habitaciones puede ver cada estancia
- **Sistema centralizado**: La visibilidad se genera una sola vez al crear la distribución y se almacena en Firebase
- **Probabilidad del 60%**: Para INVITADOS, se aplica una sola vez al generar la distribución, no en cada actualización
- **Consistencia garantizada**: La visibilidad de cada jugador se mantiene constante durante toda la partida

### 🎯 Sistema de Rondas y Movimiento
- **Control de rondas**: Solo el jugador 1 puede activar el modo de movimiento
- **Modo de movimiento**: Interfaz especial que permite a los jugadores seleccionar su próxima ubicación
- **Restricciones de movimiento**: Los jugadores normales pueden moverse a habitaciones contiguas o quedarse en la misma ubicación
- **Movimiento libre del ASESINO**: El ASESINO puede moverse a cualquier habitación sin restricciones
- **Confirmación de movimiento**: Alerta de confirmación antes de procesar cada movimiento
- **Seguimiento en tiempo real**: El jugador 1 ve el estado de movimientos de todos los jugadores
- **Lista de movimientos pendientes**: Visualización clara de quién se ha movido y quién está pendiente
- **Protección de roles**: Solo se muestra el rol del jugador 1, los demás aparecen como "❓" para evitar trampas
- **Botón inteligente**: Cambia de "TERMINAR RONDA" a "SIGUIENTE RONDA" según el estado
- **Finalización automática**: La ronda se finaliza automáticamente cuando todos han movido
- **Recálculo de visibilidad**: Nueva distribución y visibilidad se calculan automáticamente al finalizar

### 🔪 Mecánica de Asesinato Optimizada
- **Flujo unificado**: Selección de víctima y movimiento se ejecutan en un solo paso
- **Interfaz compacta**: Modal de selección que aparece solo cuando el ASESINO intenta moverse
- **Ejecución automática**: Al seleccionar víctima, el movimiento se ejecuta inmediatamente
- **Sin confirmaciones adicionales**: Elimina la necesidad de botones separados de confirmación
- **Mejor experiencia de usuario**: Interfaz más fluida y menos interruptiva
- **Mantenimiento de funcionalidad**: Todas las opciones de asesinato siguen disponibles
- **Integración perfecta**: El sistema de asesinato se integra naturalmente con el sistema de movimiento
- **Filtro inteligente de víctimas**: Solo se muestran jugadores vivos como opciones de asesinato
- **Modal adaptativo**: Interfaz simplificada cuando no hay víctimas disponibles
- **Actualización garantizada de BD**: Siempre se registra la decisión del ASESINO en Firebase
- **Sistema robusto**: Maneja casos edge como habitaciones sin víctimas vivas
- **Prevención de movimiento de víctimas**: Los jugadores marcados en `nextDeath` no se mueven antes de ser procesados como muertos

### 🎨 Interfaz de Usuario y Experiencia
- **Botón centrado**: Botón "TERMINAR RONDA" perfectamente centrado en el footer
- **Estados visuales del botón**: Cambios automáticos de color y estado según la fase del juego
- **Sistema de clases CSS**: Gestión de estados del botón sin estilos hardcodeados
- **Transiciones suaves**: Animaciones fluidas entre diferentes estados del juego
- **Indicadores visuales**: Colores diferenciados para cada estado del botón
- **Responsive design**: Interfaz optimizada para dispositivos móviles en modo vertical
- **Botón de recarga**: Botón circular con emoji 🔄 en la esquina superior izquierda para recargar la página
- **Navegación intuitiva**: Acceso rápido a funcionalidad de recarga sin interferir con el diseño principal

### 🔧 Mejoras Técnicas y Arquitectura
- **Probabilidad de visibilidad ajustada**: Cambio del 50% al 60% para mejor balance del juego
- **Gestión de estados sin hardcoding**: Sistema de clases CSS para manejo de estados del botón
- **Limpieza automática de estilos**: Eliminación de estilos inline para mejor mantenibilidad
- **Sistema de probabilidad centralizado**: Aplicación única durante la generación de distribución
- **Consistencia de datos**: Visibilidad mantenida constante durante toda la partida
- **Optimización de rendimiento**: Sin recálculos innecesarios de visibilidad
- **Eliminación de código obsoleto**: Remoción completa de interfaz antigua de asesinato
- **Funciones modulares**: Separación clara entre modal completo y simplificado
- **Logs de depuración**: Sistema de logging para facilitar el desarrollo y debugging
- **Manejo de casos edge**: Validaciones robustas para situaciones especiales
- **Información de roles para ASESINO y COMPLICE**: Los jugadores con roles especiales pueden ver información adicional sobre otros roles en su perfil
- **Fix de distribución de víctimas**: La función `calculateNewDistribution` ahora ignora los movimientos de jugadores marcados en `nextDeath` para evitar inconsistencias en la ubicación antes de procesar la muerte

### 🚀 **Migración a Firebase 12.x Modular (NUEVO)**
- **Actualización completa**: Migración de Firebase 10.7.1 (compat) a Firebase 12.1.0 (modular)
- **Patrón Singleton**: Una sola instancia de Firebase por sesión, evitando re-inicialización
- **Caché persistente**: `persistentLocalCache` con `persistentMultipleTabManager` para soporte multi-tab
- **Arquitectura "a prueba de bombas"**: Implementación del patrón recomendado por GPT5 para evitar errores de reconexión
- **Sistema de inicialización robusto**: Verificación automática de disponibilidad de servicios con timeout de seguridad
- **Observer de autenticación integrado**: Sistema unificado de manejo de estado de autenticación
- **Manejo de errores mejorado**: Try-catch en todas las operaciones críticas con fallbacks robustos
- **Limpieza automática de suscripciones**: Prevención de memory leaks y estados inconsistentes
- **Compatibilidad con HMR**: Sistema resistente a hot-reload y cambios de ruta
- **Logs de depuración avanzados**: Sistema completo de logging para diagnóstico de problemas

### 🛡️ Seguridad y Balance del Juego
- **Protección contra trampas**: Roles de otros jugadores ocultos para el jugador 1
- **Balance de información**: ASESINO y COMPLICE mantienen ventajas tácticas justificadas
- **Visibilidad controlada**: Sistema de probabilidad que mantiene el misterio sin ser frustrante
- **Movimiento equilibrado**: Restricciones apropiadas según el rol del jugador
- **Consistencia de reglas**: Todas las mecánicas se aplican uniformemente
- **Prevención de exploits**: Sistema robusto que evita abusos de información

## 🔮 Próximas funcionalidades

- [x] **Autenticación de jugadores** - Sistema de usuarios y sesiones con Firebase
- [x] **Sistema de roles automático** - Asignación automática de ASESINO y COMPLICE
- [x] **Sincronización en tiempo real** - Suscripciones automáticas a Firebase para actualizaciones instantáneas
- [x] **Sistema de rondas del juego** - Gestión completa de fases del juego con modo de movimiento
- [x] **Sistema de asesinatos del ASESINO** - Interfaz de selección de víctima y gestión de muertes (optimizado)
- [x] **Mecánica de asesinato unificada** - Ejecución automática de kill + movimiento en un paso
- [x] **Información de roles para ASESINO y COMPLICE** - Los jugadores con roles especiales pueden ver información adicional sobre otros roles en su perfil
- [x] **Sistema de acusaciones colectivas** - El jugador 1 actúa como director de juego para ejecutar acusaciones grupales
- [x] **Fix de distribución de víctimas** - Los jugadores marcados para morir no se mueven antes de ser procesados como muertos
- [x] **Sistema de configuración de partida optimizado** - Acceso directo con código de juego y selección secuencial de número de jugadores (4-15)
- [x] **Migración a Firebase 12.x Modular** - Actualización completa del sistema Firebase con patrón modular y singleton
- [x] **Sistema de caché persistente y multi-tab** - Soporte para múltiples pestañas con sincronización automática
- [x] **Arquitectura Firebase "a prueba de bombas"** - Implementación del patrón recomendado por GPT5 para evitar errores de reconexión
- [x] **Sistema de anotación de preguntas** - Botón "ANOTAR PREGUNTA" para contabilizar preguntas de cada jugador con visualización de palos "I" debajo de avatares
- [ ] **Base de datos de pistas** - Sistema de pistas dinámicas y aleatorias
- [x] **Modo multijugador** - Sincronización en tiempo real entre jugadores
- [ ] **Sistema de puntuación** - Métricas de resolución y tiempo
- [ ] **Historial de partidas** - Seguimiento de juegos anteriores
- [ ] **Diferentes escenarios** - Múltiples casos de misterio
- [ ] **Sistema de pistas** - Pistas físicas y digitales integradas
- [x] **Integración con BD NoSQL** - Almacenamiento de distribuciones de jugadores y roles
- [ ] **Sistema de partidas** - Gestión de múltiples sesiones de juego
- [x] **Persistencia de datos** - Almacenamiento de progreso y estado del juego

## 🤝 Contribuir al proyecto

### 🐛 Reportar bugs
- Usa los issues de GitHub para reportar problemas
- Incluye detalles del dispositivo y navegador
- Describe los pasos para reproducir el error

### 💡 Sugerir mejoras
- Las ideas para nuevas funcionalidades son bienvenidas
- Considera la experiencia móvil en tus sugerencias
- Mantén el enfoque en la mecánica de triangulación

### 🔧 Desarrollo técnico
- Fork el repositorio
- Crea una rama para tu feature
- Mantén el código limpio y documentado
- Prueba en dispositivos móviles
- Configura Firebase para funcionalidades de autenticación
- Sigue las convenciones de commit del proyecto

## 📚 Recursos adicionales

### 🎮 Inspiración del juego
- **Cluedo/Clue**: Juego de mesa clásico de misterio
- **Among Us**: Mecánicas de deducción social
- **Mafia/Werewolf**: Juegos de roles y deducción

### 🛠️ Tecnologías relacionadas
- **Live Server**: Para desarrollo web con hot-reload
- **CSS Grid**: Para el layout de estancias
- **Responsive Design**: Para optimización móvil
- **Firebase**: Para autenticación y base de datos en tiempo real
- **Firebase Authentication**: Para gestión de sesiones de usuario

## 📄 Licencia

Este proyecto está bajo la licencia MIT. Puedes usar, modificar y distribuir libremente.

---

**WHO LIES** - Donde la verdad se esconde entre las pistas, y solo la lógica puede revelar al asesino. 🕵️‍♂️🔍
