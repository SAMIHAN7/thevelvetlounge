'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import { Menu, X } from 'lucide-react';

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <nav className="fixed top-0 w-full z-50 bg-black/95 backdrop-blur-xl border-b border-amber-400/20">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          {/* Desktop: Show logo + text */}
          <div className="hidden md:flex items-center gap-4">
            <img src="/logo.png" alt="The Velvet Lounge" className="w-16 h-16 object-contain" />
            <div className="text-2xl font-bold bg-gradient-to-r from-amber-400 via-yellow-500 to-amber-600 bg-clip-text text-transparent">
              THE VELVET LOUNGE
            </div>
          </div>
          
          <div className="hidden md:flex space-x-8">
            <Link href="/" className="text-gray-300 hover:text-amber-400 transition-colors duration-300">Home</Link>
            <Link href="/menu" className="text-gray-300 hover:text-amber-400 transition-colors duration-300">Menu</Link>
            <Link href="/events" className="text-gray-300 hover:text-amber-400 transition-colors duration-300">Events</Link>
            <Link href="/offers" className="text-gray-300 hover:text-amber-400 transition-colors duration-300">Offers</Link>
            <Link href="/gallery" className="text-gray-300 hover:text-amber-400 transition-colors duration-300">Gallery</Link>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-gray-300 hover:text-amber-400 transition-colors p-2"
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-black/95 backdrop-blur-sm border-t border-amber-400/20">
          <div className="px-2 pt-2 pb-3 space-y-1">
            <Link 
              href="/" 
              className="block px-3 py-2 text-gray-300 hover:text-amber-400 hover:bg-amber-400/10 rounded-lg transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              Home
            </Link>
            <Link 
              href="/menu" 
              className="block px-3 py-2 text-gray-300 hover:text-amber-400 hover:bg-amber-400/10 rounded-lg transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              Menu
            </Link>
            <Link 
              href="/events" 
              className="block px-3 py-2 text-gray-300 hover:text-amber-400 hover:bg-amber-400/10 rounded-lg transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              Events
            </Link>
            <Link 
              href="/offers" 
              className="block px-3 py-2 text-gray-300 hover:text-amber-400 hover:bg-amber-400/10 rounded-lg transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              Offers
            </Link>
            <Link 
              href="/gallery" 
              className="block px-3 py-2 text-gray-300 hover:text-amber-400 hover:bg-amber-400/10 rounded-lg transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              Gallery
            </Link>
            <a 
              href="#contact" 
              className="block px-3 py-2 text-gray-300 hover:text-amber-400 hover:bg-amber-400/10 rounded-lg transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              Contact
            </a>
          </div>
        </div>
      )}
    </nav>
  );
}