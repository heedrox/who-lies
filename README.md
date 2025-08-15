# WHO LIES - Murder Mystery Game

Un juego de misterio tipo Cluedo donde debes triangular información para descubrir al asesino.

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

## 🔮 Próximas funcionalidades

- [ ] Sistema de rondas del juego
- [ ] Base de datos de pistas
- [ ] Autenticación de jugadores
- [ ] Modo multijugador
- [ ] Sistema de puntuación
