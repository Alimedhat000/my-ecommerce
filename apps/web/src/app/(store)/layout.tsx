import Footer from '@/components/layout/footer';
import HeaderWrapper from '@/components/layout/headerWrapper';
import { Providers } from './providers';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <Providers>
      <HeaderWrapper />
      {children}
      <Footer />
    </Providers>
  );
}
