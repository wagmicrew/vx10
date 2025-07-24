import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "VX10 - Inloggning",
  description: "VX10 plattform för inloggning och administration",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="sv">
      <body className="antialiased font-sans">
        {children}
      </body>
    </html>
  );
}
