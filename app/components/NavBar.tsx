"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, Heart } from "lucide-react"
import { copy } from "../lib/i18n"

export default function NavBar() {
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white/10 backdrop-blur-lg border-t border-white/20">
      <div className="flex items-center justify-around py-3">
        <Link
          href="/"
          className={`flex flex-col items-center gap-1 px-4 py-2 rounded-xl transition-all duration-200 ${
            pathname === "/" ? "bg-white/20 text-white" : "text-white/70 hover:text-white hover:bg-white/10"
          }`}
        >
          <Home size={20} />
          <span className="text-xs font-medium">{copy.navigation.home}</span>
        </Link>

        <Link
          href="/favorites"
          className={`flex flex-col items-center gap-1 px-4 py-2 rounded-xl transition-all duration-200 ${
            pathname === "/favorites" ? "bg-white/20 text-white" : "text-white/70 hover:text-white hover:bg-white/10"
          }`}
        >
          <Heart size={20} />
          <span className="text-xs font-medium">{copy.navigation.favorites}</span>
        </Link>
      </div>
    </nav>
  )
}
