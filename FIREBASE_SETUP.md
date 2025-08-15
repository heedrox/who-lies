# Configuración de Firebase para WHO LIES

## Pasos para configurar Firebase

### 1. Crear un proyecto en Firebase Console
1. Ve a [Firebase Console](https://console.firebase.google.com/)
2. Haz clic en "Crear un proyecto"
3. Dale un nombre a tu proyecto (ej: "who-lies-game")
4. Sigue los pasos de configuración

### 2. Habilitar Authentication
1. En el panel izquierdo, haz clic en "Authentication"
2. Haz clic en "Comenzar"
3. En la pestaña "Sign-in method", habilita:
   - **Anonymous** (para usuarios anónimos)
4. Haz clic en "Guardar"

### 3. Obtener la configuración
1. En el panel izquierdo, haz clic en el ícono de configuración (⚙️)
2. Selecciona "Configuración del proyecto"
3. En la pestaña "General", desplázate hacia abajo hasta "Tus apps"
4. Haz clic en el ícono de web (</>)
5. Dale un nombre a tu app (ej: "who-lies-web")
6. Copia la configuración que aparece

### 4. Actualizar el archivo de configuración
1. Abre `web/firebase-config.js`
2. Reemplaza la configuración de ejemplo con la tuya:

```javascript
const firebaseConfig = {
  apiKey: "TU_API_KEY_REAL",
  authDomain: "tu-proyecto.firebaseapp.com",
  projectId: "tu-proyecto-id",
  storageBucket: "tu-proyecto.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef123456"
};
```

### 5. Probar la aplicación
1. Ejecuta `npm run dev` para iniciar el servidor
2. Abre tu navegador en `http://localhost:3000`
3. Deberías ver la pantalla de login
4. Haz clic en "JUGAR ANÓNIMAMENTE"
5. Deberías ser redirigido al juego con un ID de usuario único

## Características implementadas

- ✅ Autenticación anónima automática
- ✅ Interfaz de usuario para login/logout
- ✅ Manejo de estado de autenticación
- ✅ ID de usuario único para cada sesión
- ✅ Transición suave entre estados de login y juego

## Notas importantes

- **Autenticación anónima**: No requiere información personal, genera ID único
- Cada sesión genera un ID único que se puede usar para identificar al jugador
- El estado de autenticación se mantiene durante la sesión del navegador
- Se puede cerrar sesión en cualquier momento con el botón "Cerrar Sesión"

## Solución de problemas

### Error "Firebase is not defined"
- Asegúrate de que los scripts de Firebase estén cargando correctamente
- Verifica que no haya errores en la consola del navegador

### Error de configuración
- Verifica que la configuración en `firebase-config.js` sea correcta
- Asegúrate de que el proyecto tenga habilitada la autenticación anónima

### Problemas de CORS
- Si tienes problemas, considera usar Firebase Hosting para el desarrollo
- O configura un proxy en tu servidor de desarrollo
