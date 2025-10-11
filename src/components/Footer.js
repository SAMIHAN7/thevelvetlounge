'use client';
import React from 'react';
import { Clock, MapPin, Phone, ExternalLink } from 'lucide-react';

export default function Footer() {
  return (
    <footer id="contact" className="bg-black/40 backdrop-blur-lg border-t border-amber-400/20 py-16 px-6 lg:px-8 relative">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-amber-300 via-yellow-400 to-amber-500 bg-clip-text text-transparent">
            Visit Us
          </h2>
          <div className="w-32 h-1 bg-gradient-to-r from-amber-400 to-yellow-500 mx-auto rounded-full"></div>
        </div>

        <div className="grid md:grid-cols-3 gap-12">
          {/* Timings */}
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50 hover:border-yellow-400/50 transition-all duration-300">
            <h3 className="text-2xl font-bold text-yellow-400 mb-6 flex items-center">
              <Clock className="w-6 h-6 mr-2" />
              Opening Hours
            </h3>
            <div className="space-y-4 text-gray-400">
              <div className="bg-black/30 rounded-xl p-4 border border-yellow-400/20">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-semibold bg-gradient-to-r from-amber-300 to-yellow-400 bg-clip-text text-transparent">All Days</span>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-white bg-gradient-to-r from-yellow-400 to-amber-400 bg-clip-text text-transparent">
                      11:00 AM - Midnight
                    </div>
                    <div className="text-xs text-yellow-300/70 mt-1">Daily Service</div>
                  </div>
                </div>
                <div className="mt-3 h-1 bg-gradient-to-r from-yellow-400/20 via-amber-400/60 to-yellow-400/20 rounded-full"></div>
              </div>
              <div className="text-center text-sm text-yellow-300/60 italic">
                ✨ Open every day for your convenience ✨
              </div>
            </div>
          </div>

          {/* Contact Info */}
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50 hover:border-red-400/50 transition-all duration-300">
            <h3 className="text-2xl font-bold text-red-400 mb-6">Contact Us</h3>
            <div className="space-y-4 text-gray-400">
              <div className="flex items-start">
                <MapPin className="w-5 h-5 mr-3 text-red-400 mt-1" />
                <div className="flex-1">
                  <div className="text-white font-semibold mb-2">The Velvet Lounge, Millennia Building, Near Wood Store, Tarabai park, Kolhapur. 416003</div>
                  <a 
                    href="https://maps.app.goo.gl/dukC6d3mbBkMGGu26?g_st=iw" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-flex items-center text-red-300 hover:text-red-200 transition-colors duration-200 text-sm"
                  >
                    <ExternalLink className="w-4 h-4 mr-1" />
                    View on Google Maps
                  </a>
                </div>
              </div>
              <div className="flex items-center">
                <Phone className="w-5 h-5 mr-3 text-red-400" />
                <span className="text-white">+91  9699790696</span>
              </div>
            </div>
          </div>

          {/* Logo & Info */}
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50 hover:border-orange-400/50 transition-all duration-300">
            <div className="text-center mb-4">
              <img src="/logo.png" alt="The Velvet Lounge" className="w-24 h-24 object-contain mx-auto mb-4" />
              <div className="text-3xl font-bold bg-gradient-to-r from-amber-300 via-yellow-400 to-amber-500 bg-clip-text text-transparent">
                THE VELVET LOUNGE
              </div>
            </div>
            <p className="text-gray-300 mb-6 justify-center flex">
              Where elegance meets excitement. 
            </p>
          </div>
        </div>

        <div className="border-t border-amber-400/20 pt-8 mt-12 text-center">
          <div className="h-px bg-gradient-to-r from-transparent via-yellow-400 to-transparent opacity-30 mb-8"></div>
          <p className="text-gray-400">
            © 2025 The Velvet Lounge. All rights reserved. | Where elegance meets excitement. 
          </p>
        </div>
      </div>
    </footer>
  );
}