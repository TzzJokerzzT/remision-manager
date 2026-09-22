export const appConfig = {
  apiUrl: process.env.CONFIG_API_URL ?? 'http://localhost:3002/api',
  // apiUrl: 'http://localhost:3002/api',
} as const;
