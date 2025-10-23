import type { Metadata } from "next"
import "./globals.css"

export const metadata: Metadata = {
  title: "EcoLearn Daily",
  description:
    "A calm space to explore sustainability research, one paper at a time.",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
