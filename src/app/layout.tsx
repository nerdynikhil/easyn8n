import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import AuthSessionProvider from "@/components/auth/session-provider";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "EasyN8N - AI-Powered Workflow Generation",
  description: "Transform natural language descriptions into ready-to-use n8n workflows. Democratize workflow automation with AI-powered generation.",
  keywords: ["n8n", "workflow", "automation", "AI", "no-code", "productivity"],
  authors: [{ name: "EasyN8N Team" }],
  creator: "EasyN8N",
  publisher: "EasyN8N",
  openGraph: {
    title: "EasyN8N - AI-Powered Workflow Generation",
    description: "Transform natural language descriptions into ready-to-use n8n workflows.",
    url: "https://easyn8n.com",
    siteName: "EasyN8N",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "EasyN8N - AI-Powered Workflow Generation",
    description: "Transform natural language descriptions into ready-to-use n8n workflows.",
    creator: "@easyn8n",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="font-sans antialiased bg-gray-50">
        <AuthSessionProvider>
          {children}
        </AuthSessionProvider>
      </body>
    </html>
  );
}
