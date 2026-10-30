<h1 align="center">Mis Compras</h1>

<p align="center">
  <img alt="Expo SDK 57" src="https://img.shields.io/badge/Expo_SDK-57-000020?logo=expo&logoColor=white" />
  <img alt="React Native 0.86" src="https://img.shields.io/badge/React_Native-0.86-61DAFB?logo=react&logoColor=black" />
  <img alt="TypeScript strict" src="https://img.shields.io/badge/TypeScript-strict-3178C6?logo=typescript&logoColor=white" />
  <img alt="Android e iOS" src="https://img.shields.io/badge/platforms-Android%20%7C%20iOS-3DDC84" />
  <img alt="Licencia MIT" src="https://img.shields.io/badge/licencia-MIT-blue" />
</p>

<p align="center">
  Registro local de compras y gastos en pesos chilenos (CLP), para Android e iOS.
</p>

## Descargar

Última versión: **v0.1.1** · Android 7.0 o superior · 120 MB

**[Descargar el APK](https://github.com/freddyhcode/mis-compras/releases/latest)**

Versiones anteriores en [Releases](https://github.com/freddyhcode/mis-compras/releases).

## La idea

La app permite crear compras, agregar productos con cantidad, unidad y precio, calcular el total, consultar el historial, ver estadísticas y exportar a Excel. Todo queda en el dispositivo: no hay cuentas, nube, publicidad ni analítica.

- Registrar compras de supermercado, online o de cualquier tienda.
- Guardar qué se compró, cuánto se pagó y cuándo.
- Tener un historial consultable y un resumen de gastos.
- Exportar los datos a Excel cuando el usuario lo pida.

## Requisitos

- Node.js 22.13 o superior.
- npm.
- Expo Go para revisar en el teléfono.
- Para Android: JDK 21, Android SDK y NDK.
- Para iOS: macOS con Xcode.

## Cómo correr el proyecto

```bash
git clone https://github.com/freddyhcode/mis-compras.git
cd mis-compras/app
npm ci
npm run start
```

Web y Expo Go usan datos sin cifrar y sirven para desarrollo. La validación de seguridad se hace en un dev build o APK.

## Cómo compilar

### Android

En Windows:

```powershell
npx expo prebuild --platform android --clean
cd android
.\gradlew.bat assembleRelease
```

En macOS o Linux:

```bash
npx expo prebuild --platform android --clean
cd android
./gradlew assembleRelease
```

El APK queda en `android/app/build/outputs/apk/release/`.

La build de release usa la firma de debug del proyecto. Para publicar en Play Store hay que configurar un keystore propio.

### iOS

```bash
npx expo prebuild --platform ios --clean
npx expo run:ios
```

## Variables de entorno

Copia `app/.env.example` a `app/.env`:

```env
APP_MODE=development
EXPO_PUBLIC_APP_NAME=Mis Compras
EXPO_PUBLIC_APP_CREATOR=Tu nombre
EXPO_PUBLIC_APP_CONTACT=tu@correo.cl
EXPO_PUBLIC_APP_WEBSITE=https://tu-sitio.cl
EXPO_PUBLIC_APP_GITHUB=https://github.com/tu-usuario
EXPO_PUBLIC_APP_SUPPORT=https://tu-enlace-de-cafe
```

Si falta un valor, la app usa `Mis Compras` para el nombre y `No definido` para los datos del creador.

`APP_MODE` puede ser `development`, `demo` o `production`:

- `development`: permite Metro y muestra las herramientas de desarrollo.
- `demo`: bloquea la red y muestra el aviso de demo.
- `production`: bloquea la red y oculta las herramientas de desarrollo.

No pongas secretos en variables `EXPO_PUBLIC_*`: quedan dentro del bundle.

## Verificación

```bash
npm run typecheck
npm run lint
npm test
npx expo-doctor
```

## Estructura

```text
app/
├── src/
│   ├── app/                    # rutas de Expo Router
│   ├── components/ui/          # componentes visuales
│   ├── features/purchases/     # compras, productos, estadísticas, Excel y compartir
│   ├── shared/                 # base de datos, cifrado, provider y utilidades
│   ├── theme/                  # temas claro/oscuro y colores pastel
│   ├── i18n/                   # español e inglés
│   └── constants/              # espaciado, radios y tipografía
├── app.json
├── app.config.js
└── package.json
```

## Licencia

MIT.
