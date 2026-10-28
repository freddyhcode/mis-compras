const { expo } = require('./app.json');

// El modo se define en `.env` con APP_MODE:
//   development -> permite INTERNET para Metro (web y dev build)
//   demo        -> APK de prueba sin red
//   production  -> app final sin red
const MODES = ['development', 'demo', 'production'];

// La app no usa biometría. expo-secure-store declara estos permisos por defecto.
const UNUSED_PERMISSIONS = [
  'android.permission.USE_BIOMETRIC',
  'android.permission.USE_FINGERPRINT',
];

// Release (demo y producción): 100 % local, sin red ni almacenamiento externo.
const RELEASE_PERMISSIONS = [
  'android.permission.INTERNET',
  'android.permission.ACCESS_NETWORK_STATE',
  'android.permission.READ_EXTERNAL_STORAGE',
  'android.permission.WRITE_EXTERNAL_STORAGE',
  'android.permission.SYSTEM_ALERT_WINDOW',
  'android.permission.VIBRATE',
];

module.exports = ({ config }) => {
  const raw = process.env.APP_MODE;
  const isValid = typeof raw === 'string' && MODES.includes(raw);
  const mode = isValid ? raw : 'production';

  if (raw && !isValid) {
    console.warn(
      `[config] APP_MODE="${raw}" no es válido. Modos: ${MODES.join(' | ')}. Usando production.`,
    );
  }
  console.log(
    `[config] APP_MODE = ${mode}${isValid ? '' : ' (por defecto: production)'}`,
  );

  const blockedPermissions =
    mode === 'development'
      ? UNUSED_PERMISSIONS
      : [...UNUSED_PERMISSIONS, ...RELEASE_PERMISSIONS];

  return {
    ...config,
    ...expo,
    extra: {
      ...(expo.extra ?? {}),
      appMode: mode,
    },
    android: {
      ...expo.android,
      blockedPermissions,
    },
  };
};
