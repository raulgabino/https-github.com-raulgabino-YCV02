"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, Heart } from "lucide-react"
import { copy } from "../lib/i18n"

export default function NavBar() {
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-gray-800/80 backdrop-blur-lg border-t border-spotify-green/20">
      <div className="flex items-center justify-around py-3">
        <Link
          href="/"
          className={`flex flex-col items-center gap-1 px-4 py-2 rounded-xl transition-all duration-200 ${
            pathname === "/"
              ? "bg-spotify-green/20 text-spotify-green"
              : "text-gray-400 hover:text-spotify-green hover:bg-spotify-green/10"
          }`}
        >
          <Home size={20} />
          <span className="text-xs font-medium">{copy.navigation.home}</span>
        </Link>

        <Link
          href="/favorites"
          className={`flex flex-col items-center gap-1 px-4 py-2 rounded-xl transition-all duration-200 ${
            pathname === "/favorites"
              ? "bg-spotify-green/20 text-spotify-green"
              : "text-gray-400 hover:text-spotify-green hover:bg-spotify-green/10"
          }`}
        >
          <Heart size={20} />
          <span className="text-xs font-medium">{copy.navigation.favorites}</span>
        </Link>
      </div>
    </nav>
  )
}
