# Welcome to your Expo app 👋

This is an [Expo](https://expo.dev) project created with [`create-expo-app`](https://www.npmjs.com/package/create-expo-app).

## Get started

1. Install dependencies

   ```bash
   npm install
   ```

2. Start the app

   ```bash
   npx expo start
   ```

In the output, you'll find options to open the app in a

- [development build](https://docs.expo.dev/develop/development-builds/introduction/)
- [Android emulator](https://docs.expo.dev/workflow/android-studio-emulator/)
- [iOS simulator](https://docs.expo.dev/workflow/ios-simulator/)
- [Expo Go](https://expo.dev/go), a limited sandbox for trying out app development with Expo

You can start developing by editing the files inside the **app** directory. This project uses [file-based routing](https://docs.expo.dev/router/introduction).

## Get a fresh project

When you're ready, run:

```bash
npm run reset-project
```

This command will move the starter code to the **app-example** directory and create a blank **app** directory where you can start developing.

## Learn more

To learn more about developing your project with Expo, look at the following resources:

- [Expo documentation](https://docs.expo.dev/): Learn fundamentals, or go into advanced topics with our [guides](https://docs.expo.dev/guides).
- [Learn Expo tutorial](https://docs.expo.dev/tutorial/introduction/): Follow a step-by-step tutorial where you'll create a project that runs on Android, iOS, and the web.

## Join the community

Join our community of developers creating universal apps.

- [Expo on GitHub](https://github.com/expo/expo): View our open source platform and contribute.
- [Discord community](https://chat.expo.dev): Chat with Expo users and ask questions.

# SpeakUp Frontend

App React Native / Expo para registrar, listar, votar y gestionar denuncias.

## Variables de entorno (versión simple)
Se usa `.env` (expuesta en repo por simplicidad académica):
```
EXPO_PUBLIC_API_BASE=http://localhost:4000
```
Si se prueba en otra máquina o red, reemplazar `localhost` por la IP LAN del backend (ej: http://192.168.1.9:4000).

## Instalación
```
npm install
npx expo start
```

## Pantallas
Inicio (recientes), Ranking (Top), Crear denuncia, Mis denuncias, Perfil, Detalle.

## Autenticación
- Login guarda token y user en AsyncStorage.
- Perfil muestra “Sesión iniciada como” con username y email.

## Denuncias
Campos básicos: título, descripción, categoría, ubicación (mapeada a etiqueta), gravedad (1–5), estado, score.

Gravedad (mapeo UI):
- 5+: Crítica
- 4: Alta
- 3: Media
- 1–2: Baja

## Votos
Flechas a la derecha:
- Up: value=1
- Down: value=-1
- Repetir la misma flecha → value=0 (quita voto)
Score = upCount - downCount. Se actualiza optimista.

## Formulario “Crear denuncia”
- Categoría obliga selección (placeholder “Selecciona categoría”).
- Mensajes de error en cajas centradas.
- Placeholder de título estilizado.

## Archivos clave
```
src/context/AuthContext.tsx
src/services/authServices.js
src/screens/home.tsx
src/screens/ranking.tsx
src/screens/newReports.tsx
src/screens/myReports.tsx
src/screens/reportDetail.tsx
src/screens/profile.tsx
src/components/InlineVoteBar.tsx
src/components/ScreenHeader.tsx
src/constants/ui.ts
```

## constants/ui.ts
Centraliza:
- CATEGORY_COLOR
- getSeverityInfo
- LOCATION_LABELS / getLocationLabel

## Ejemplo votar (desde consola web)
```js
fetch(`${process.env.EXPO_PUBLIC_API_BASE}/denuncias/12/vote`, {
  method:'POST',
  headers:{
    'Content-Type':'application/json',
    'Authorization':'Bearer <TOKEN>'
  },
  body: JSON.stringify({ value:1 })
});
```

## Errores manejados
| Caso | Mensaje |
|------|---------|
| Usuario duplicado | El usuario ya existe / El correo ya está registrado |
| Credenciales inválidas | Correo o contraseña inválidos |
| Falta categoría | Selecciona una categoría |
| Red caída | No se pudo conectar al servidor. Verifica IP y red. |

## Comentarios recomendados
- En `authServices.js`: “Cambiar EXPO_PUBLIC_API_BASE si se ejecuta en otra PC”.
- En `InlineVoteBar`: referencia a README sección Votos.
Eliminar logs `[register]`, `[login]` al cerrar desarrollo.

## Ejecutar en otra PC
1. Clonar repo.
2. Ajustar `.env` con la IP LAN del backend.
3. `npm install`.
4. `npx expo start`.
5. Probar login.

## Mejoras futuras
- Layout responsive con barra superior web.
- Componente de alerta reutilizable.
- Paginación.
- Dark mode.
