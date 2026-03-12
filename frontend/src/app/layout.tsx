import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Geist } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";


const geist = Geist({subsets:['latin'],variable:'--font-sans'});

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "InPrep — AI Interview Platform",
  description:
    "Practice with AI interviewers that feel real. Multi-round interviews, coding sandbox, and personalized feedback to land your dream job.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`font-sans ${geist.variable}`}>
      <body
        className={`${jakarta.variable} antialiased`}
      >
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
