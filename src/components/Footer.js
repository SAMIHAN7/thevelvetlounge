'use client';
import React from 'react';
import { Clock, MapPin, Phone } from 'lucide-react';

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
            <div className="space-y-3 text-gray-400">
              <div className="flex justify-between">
                <span>Monday - Thursday</span>
                <span className="text-white">5:00 PM - 12:00 AM</span>
              </div>
              <div className="flex justify-between">
                <span>Friday - Saturday</span>
                <span className="text-white">5:00 PM - 2:00 AM</span>
              </div>
              <div className="flex justify-between">
                <span>Sunday</span>
                <span className="text-white">6:00 PM - 11:00 PM</span>
              </div>
            </div>
          </div>

          {/* Contact Info */}
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50 hover:border-red-400/50 transition-all duration-300">
            <h3 className="text-2xl font-bold text-red-400 mb-6">Contact Us</h3>
            <div className="space-y-4 text-gray-400">
              <div className="flex items-start">
                <MapPin className="w-5 h-5 mr-3 text-red-400 mt-1" />
                <div>
                  <div className="text-white font-semibold">123 Club Street</div>
                  <div>Downtown District, NY 10001</div>
                </div>
              </div>
              <div className="flex items-center">
                <Phone className="w-5 h-5 mr-3 text-red-400" />
                <span className="text-white">+1 (555) 123-4567</span>
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
            <p className="text-gray-300 mb-6">
              Where elegance meets excitement. Creating unforgettable luxurious experiences since 2020.
            </p>
          </div>
        </div>

        <div className="border-t border-amber-400/20 pt-8 mt-12 text-center">
          <div className="h-px bg-gradient-to-r from-transparent via-yellow-400 to-transparent opacity-30 mb-8"></div>
          <p className="text-gray-400">
            © 2025 The Velvet Lounge. All rights reserved. | Where elegance meets excitement in every moment.
          </p>
        </div>
      </div>
    </footer>
  );
}