import type { Metadata } from "next";
import { Mona_Sans } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";

const monaSans = Mona_Sans({
  variable: "--font-mona-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Ai Interviewer",
  description:
    "App which takes your interview from your job discription and resume",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark ">
      <body className={`${monaSans.className} antialiased relative`}>
        <div className="pattern">{children}</div>
        <Toaster position="top-right" />
      </body>
    </html>
  );
}
