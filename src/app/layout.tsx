import type { Metadata } from "next";
import { Inter, Fira_Code, Poppins } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";
import Navbar from "@/components/custom/Navbar";
import { AppProvider } from "@/context/AppContext";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const firaCode = Fira_Code({ subsets: ["latin"], variable: "--font-fira-code" });
const poppins = Poppins({ subsets: ["latin"], weight: ["500", "600", "700"], variable: "--font-poppins" });

export const metadata: Metadata = {
  title: "Horizon AI",
  description: "Multi-Agent Glassbox Refactoring Studio",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} ${firaCode.variable} ${poppins.variable} font-sans antialiased text-slate-900 dark:text-gray-200 transition-colors duration-700 ease-in-out`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <AppProvider>
            <div className="flex flex-col h-screen overflow-hidden">
              <Navbar />
              {children}
            </div>
          </AppProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
