import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Bible — KJV",
  description: "Read the King James Bible offline in your browser.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
