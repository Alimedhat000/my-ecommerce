import "./globals.css";
import localFont from "next/font/local";

const oswald = localFont({
  src: "../../public/fonts/Oswald-VariableFont_wght.ttf",
  variable: "--font-heading",
  display: "swap",
});

const robotoCondensed = localFont({
  src: "../../public/fonts/RobotoCondensed-VariableFont_wght.ttf",
  variable: "--font-body",
  display: "swap",
});

const firaCode = localFont({
  src: "../../public/fonts/FiraCode-VariableFont_wght.ttf",
  variable: "--font-mono",
  display: "swap",
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${oswald.variable} ${robotoCondensed.variable} ${firaCode.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
