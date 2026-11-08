import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Userly | Gestão de usuários',
  description: 'Sistema de cadastro e gerenciamento de usuários',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="pt-BR"><body>{children}</body></html>;
}
