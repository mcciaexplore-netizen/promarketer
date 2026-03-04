import { Inter } from "next/font/google";
import { Toaster } from "react-hot-toast";
import Sidebar from "@/components/layout/Sidebar";
import Navbar from "@/components/layout/Navbar";
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
        {/* Sidebar */}
        <Sidebar className="hidden lg:flex" />

        {/* Main Wrapper */}
        <div className="flex flex-col flex-1 min-w-0">
          <Navbar />

          <main className="flex-1 overflow-y-auto w-full">
            <div className="w-full max-w-[1200px] mx-auto px-4 py-8 lg:px-8">
              {children}
            </div>
          </main>
        </div>

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
