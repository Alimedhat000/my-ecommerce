import './globals.css';
import localFont from 'next/font/local';
import Footer from '@/components/layout/footer';
import HeaderWrapper from '@/components/layout/headerWrapper';

const oswald = localFont({
  src: '../fonts/Oswald-VariableFont_wght.ttf',
  variable: '--font-heading',
  display: 'swap',
});

const robotoCondensed = localFont({
  src: '../fonts/RobotoCondensed-VariableFont_wght.ttf',
  variable: '--font-body',
  display: 'swap',
});

const firaCode = localFont({
  src: '../fonts/FiraCode-VariableFont_wght.ttf',
  variable: '--font-mono',
  display: 'swap',
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${oswald.variable} ${robotoCondensed.variable} ${firaCode.variable} bg-muted antialiased`}
      >
        <HeaderWrapper />
        {children}
        <Footer />
      </body>
    </html>
  );
}
