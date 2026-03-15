import type { Metadata } from "next";
import "./globals.css";
import Sidebar from "@/components/Sidebar";

export const metadata: Metadata = {
  title: "Accountability Dashboard",
  description: "House of Power · Strength Collective · PowerSource · GrayRevenue",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          padding: 0,
          backgroundColor: "#2C2F33",
          color: "#B0E0E6",
          fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
          display: "flex",
          height: "100vh",
          overflow: "hidden",
        }}
      >
        <Sidebar />
        <main
          style={{
            flex: 1,
            overflowY: "auto",
            backgroundColor: "#2C2F33",
          }}
        >
          <div
            style={{
              maxWidth: "1000px",
              margin: "0 auto",
              padding: "60px 48px",
            }}
          >
            {children}
          </div>
        </main>
      </body>
    </html>
  );
}
