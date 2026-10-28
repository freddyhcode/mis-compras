function value(input: string | undefined, fallback: string): string {
  return input?.trim() || fallback;
}

export const branding = {
  appName: value(process.env.EXPO_PUBLIC_APP_NAME, 'Mis Compras'),
  website: value(process.env.EXPO_PUBLIC_APP_WEBSITE, 'No definido'),
  github: value(process.env.EXPO_PUBLIC_APP_GITHUB, 'No definido'),
  creator: value(process.env.EXPO_PUBLIC_APP_CREATOR, 'No definido'),
  contact: value(process.env.EXPO_PUBLIC_APP_CONTACT, 'No definido'),
} as const;
