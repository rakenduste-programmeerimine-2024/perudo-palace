import { GeistSans } from "geist/font/sans";
import "./globals.css";

const defaultUrl = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : "http://localhost:8080";

export const metadata = {
  metadataBase: new URL(defaultUrl),
  title: "Perudo Palace",
  description: "The fastest way to build apps with Next.js and Supabase",
};

export default function RootLayout({
  children, }: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={GeistSans.className} suppressHydrationWarning>
      <body>
        <main>
          { children }
        </main>
      </body>
    </html>
  );
}
