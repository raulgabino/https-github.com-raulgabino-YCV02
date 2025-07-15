import type React from "react"

const NavBar: React.FC = () => {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-gray-900 border-t border-gray-700">
      <div className="container mx-auto">
        <div className="flex justify-between items-center py-2">
          <div className="text-white">
            {/* Add your logo or brand name here */}
            <span>My App</span>
          </div>
          <div className="space-x-4">
            {/* Add your navigation links here */}
            <a href="#" className="text-gray-300 hover:text-white">
              Home
            </a>
            <a href="#" className="text-gray-300 hover:text-white">
              About
            </a>
            <a href="#" className="text-gray-300 hover:text-white">
              Services
            </a>
            <a href="#" className="text-gray-300 hover:text-white">
              Contact
            </a>
          </div>
        </div>
      </div>
    </nav>
  )
}

export default NavBar
