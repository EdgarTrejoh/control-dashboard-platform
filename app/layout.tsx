import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Control Dashboard Platform",
  description: "Plataforma reusable de reportería económica y tableros analíticos."
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
