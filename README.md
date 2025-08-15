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

### 🛠️ Elementos del juego
- **VENENOS**: Arsénico, Cianuro
- **HERRAMIENTAS**: Llave inglesa, Destornillador  
- **ARMAS**: Pistola, Escopeta

### 👥 Sistema de jugadores
- Los jugadores se mueven entre estancias
- Pueden ver a otros jugadores en estancias específicas
- La información se comparte de forma parcial para fomentar la deducción

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

### 🎲 Estructura de rondas
- El juego se divide en rondas
- Cada ronda proporciona nueva información
- Los jugadores pueden "TERMINAR RONDA" para avanzar

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

## 🚀 Requisitos del sistema

- **Node.js**: Versión 20.x (recomendado 20.18.3+)
- **npm**: Versión 10.x (recomendado 10.8.2+)

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

## 🛠️ Desarrollo

Para iniciar el servidor de desarrollo:

```bash
npm run dev
```

Esto abrirá automáticamente tu navegador en `http://localhost:3000`

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

## 📁 Estructura del proyecto

```
who-lies/
├── web/
│   └── index.html      # Interfaz principal del juego
├── package.json         # Dependencias y scripts
├── firebase.json        # Configuración de Firebase
├── README.md           # Este archivo
└── node_modules/       # Dependencias (generado automáticamente)
```

## 🎮 Características del juego

- **9 estancias** organizadas en cuadrícula 3x3
- **Sistema de información** para triangular pistas
- **Interfaz responsive** optimizada para móvil
- **Tema visual** de misterio y suspense
- **Modo vertical** para dispositivos móviles
- **Guía de elementos** (venenos, herramientas, armas)
- **Sistema de rondas** con botón "TERMINAR RONDA"

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

## 📱 Acceso al juego

Una vez iniciado el servidor:
- **URL local**: `http://localhost:3000`
- **URL de red**: `http://127.0.0.1:3000`
- **Acceso móvil**: Usa la IP de tu máquina en la misma red WiFi

## 🎯 Cómo jugar

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

## 🔮 Próximas funcionalidades

- [ ] **Sistema de rondas del juego** - Gestión completa de fases del juego
- [ ] **Base de datos de pistas** - Sistema de pistas dinámicas y aleatorias
- [ ] **Autenticación de jugadores** - Sistema de usuarios y sesiones
- [ ] **Modo multijugador** - Sincronización en tiempo real entre jugadores
- [ ] **Sistema de puntuación** - Métricas de resolución y tiempo
- [ ] **Historial de partidas** - Seguimiento de juegos anteriores
- [ ] **Diferentes escenarios** - Múltiples casos de misterio
- [ ] **Sistema de pistas** - Pistas físicas y digitales integradas

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

## 📚 Recursos adicionales

### 🎮 Inspiración del juego
- **Cluedo/Clue**: Juego de mesa clásico de misterio
- **Among Us**: Mecánicas de deducción social
- **Mafia/Werewolf**: Juegos de roles y deducción

### 🛠️ Tecnologías relacionadas
- **Live Server**: Para desarrollo web con hot-reload
- **CSS Grid**: Para el layout de estancias
- **Responsive Design**: Para optimización móvil

## 📄 Licencia

Este proyecto está bajo la licencia MIT. Puedes usar, modificar y distribuir libremente.

---

**WHO LIES** - Donde la verdad se esconde entre las pistas, y solo la lógica puede revelar al asesino. 🕵️‍♂️🔍
