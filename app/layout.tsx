import type { Metadata } from 'next';
import './globals.css';
import { AppProviders } from '@/src/presentation/providers/AppProviders';

export const metadata: Metadata = {
  title: 'Remisiones | Generador de remisiones',
  description:
    'Genera remisiones con precio e IVA, o solo por cantidad. Administra empresas, clientes y conductores.',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es" suppressHydrationWarning className="h-full antialiased">
      <body className="min-h-full bg-background font-sans text-foreground">
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
