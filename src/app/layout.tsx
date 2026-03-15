import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Accountability Dashboard",
  description: "House of Power · Strength Collective · PowerSource · GrayRevenue · Health Monitor",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body style={{ margin: 0, padding: 0, backgroundColor: "#2C2F33", color: "#B0E0E6" }}>
        {children}
      </body>
    </html>
  );
}
