import type React from "react"
import type { Metadata } from "next"
import "./globals.css"
import NavBar from "./components/NavBar"

export const metadata: Metadata = {
  title: "YourCityVibes - Descubre lugares que conecten con tu mood",
  description:
    "Encuentra los lugares perfectos según tu vibra del momento. Bellakeo, chill, productivo... ¿qué vibra traes?",
  keywords: "lugares, mood, vibra, ciudad, restaurantes, bares, cafés",
  authors: [{ name: "YourCityVibes" }],
  openGraph: {
    title: "YourCityVibes - Descubre lugares que conecten con tu mood",
    description: "Encuentra los lugares perfectos según tu vibra del momento",
    type: "website",
  },
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <body className="bg-gradient-to-br from-gray-900 via-gray-800 to-spotify-black min-h-screen font-sans">
        {children}
        <NavBar />
      </body>
    </html>
  )
}
