import { Inter } from "next/font/google";
import { Toaster } from "react-hot-toast";
import ConditionalShell from "@/components/layout/ConditionalShell";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "ProMarketer - AI Marketing Assistant",
  description: "AI-powered marketing assistant for small businesses, B2B companies, and startups.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-background text-text-primary antialiased flex h-screen overflow-hidden`}>
        <ConditionalShell>{children}</ConditionalShell>

        {/* Global Toaster */}
        <Toaster
          position="bottom-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#FFFFFF',
              color: '#181818',
              border: '1px solid #E5E5E5',
              boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
            },
            success: {
              iconTheme: {
                primary: '#2E844A',
                secondary: 'white',
              },
            },
            error: {
              iconTheme: {
                primary: '#BA0517',
                secondary: 'white',
              },
            },
          }}
        />
      </body>
    </html>
  );
}
