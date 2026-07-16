import type { Metadata } from "next";
import "./globals.css";
import GradientBlobs from "@/components/GradientBlobs";
import ThemeAccent from "@/components/ThemeAccent";
import CatPet from "@/components/CatPet";
import CursorTrail from "@/components/CursorTrail";

export const metadata: Metadata = {
  title: "Aaleeyah.net",
  description:
    "Portfolio of Aaleeyah Ivy-Kilgore — software developer, maker, and cat parent. Search my projects, art, and more.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <ThemeAccent />
        <GradientBlobs />
        {children}
        <CatPet />
        <CursorTrail />
      </body>
    </html>
  );
}
