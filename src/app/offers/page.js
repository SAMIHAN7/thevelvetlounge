'use client';
import React, { useState, useEffect } from 'react';
import { Clock, Sparkles, Gift, Zap, Calendar, CheckCircle, X } from 'lucide-react';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';

const OffersPage = () => {
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('live'); // Only show live offers
  const [selectedOffer, setSelectedOffer] = useState(null);

  // API base URL from environment variable
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

  // Fetch offers data
  useEffect(() => {
    const fetchOffers = async () => {
      try {
        setLoading(true);
        // Only fetch live offers
        const response = await fetch(`${API_BASE_URL}/web/landing/offers`);
        const result = await response.json();
        
        if (result.success) {
          setOffers(result.data.offers || []);
        } else {
          setOffers([]);
        }
      } catch (error) {
        console.error('Error fetching offers:', error);
        setOffers([]);
      } finally {
        setLoading(false);
      }
    };

    fetchOffers();
  }, []);

  // All offers are live since we only fetch live offers

  const OfferCard = ({ offer, onClick }) => (
    <div 
      className="group relative overflow-hidden rounded-3xl shadow-2xl cursor-pointer transform transition-all duration-500 hover:scale-105 hover:shadow-3xl bg-gradient-to-br from-amber-600/20 via-yellow-600/20 to-amber-600/20 border-2 border-amber-400/50"
      onClick={() => onClick(offer)}
    >
      {/* Live Badge */}
      <div className="absolute top-4 right-4 z-20">
        <div className="bg-green-500 text-white text-xs px-3 py-1 rounded-full animate-pulse font-bold">
          LIVE
        </div>
      </div>

      {/* Content */}
      <div className="relative p-8 h-full flex flex-col justify-center min-h-[200px]">
        <div className="text-center">
          {/* Offer Title */}
          <h3 className="text-2xl font-bold text-white mb-4 group-hover:text-yellow-400 transition-colors duration-300">
            {offer.offer}
          </h3>

          {/* Description */}
          <p className="text-gray-200 leading-relaxed group-hover:text-gray-100 transition-colors duration-300">
            {offer.description}
          </p>
        </div>

        {/* Hover Effect */}
        <div className="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" 
             style={{ boxShadow: 'inset 0 0 100px rgba(255, 215, 0, 0.1)' }} />
      </div>
    </div>
  );

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 pt-24 py-12 px-4">
        
        {/* Logo Section */}
        <div className="max-w-6xl mx-auto text-center mb-16">
          <div className="flex flex-col items-center justify-center mb-8">
            <img 
              src="/logo.png" 
              alt="The Velvet Lounge" 
              className="w-32 h-32 md:w-40 md:h-40 object-contain mb-6 hover:scale-110 transition-transform duration-500"
            />
          </div>
        </div>
        
        {/* Header */}
        <div className="max-w-6xl mx-auto mb-12 text-center">
          <h1 className="text-5xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-yellow-400 via-red-500 to-orange-500 bg-clip-text text-transparent">
            Exclusive Offers
          </h1>
          <div className="w-32 h-1 bg-gradient-to-r from-yellow-400 to-red-500 mx-auto rounded-full mb-6"></div>
          <p className="text-gray-300 text-lg max-w-2xl mx-auto">
            Discover amazing deals and special promotions crafted exclusively for our valued guests
          </p>
        </div>


        {/* Offers Grid */}
        <div className="max-w-7xl mx-auto">
          {loading ? (
            // Loading skeleton
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[...Array(6)].map((_, index) => (
                <div key={index} className="animate-pulse">
                  <div className="h-80 bg-gray-800/50 rounded-3xl"></div>
                </div>
              ))}
            </div>
          ) : offers.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {offers.map((offer) => (
                <OfferCard 
                  key={offer._id} 
                  offer={offer} 
                  onClick={setSelectedOffer}
                />
              ))}
            </div>
          ) : (
            // No offers state
            <div className="text-center py-20">
              <div className="bg-gray-800/50 rounded-2xl p-12 border border-gray-700/50 max-w-md mx-auto">
                <Gift className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-2xl font-bold text-white mb-4">No Offers Found</h3>
                <p className="text-gray-400">
                  {filter === 'live' 
                    ? 'No live offers available at the moment. Check back soon for exciting deals!' 
                    : 'No offers available. Stay tuned for amazing deals!'
                  }
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Floating Particles Effect */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden z-40">
          {[...Array(25)].map((_, i) => (
            <div
              key={i}
              className="absolute w-2 h-2 bg-yellow-400 rounded-full opacity-20 animate-pulse"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 3}s`,
                animationDuration: `${2 + Math.random() * 2}s`
              }}
            />
          ))}
        </div>

        {/* Bottom Decorative Element */}
        <div className="max-w-6xl mx-auto mt-16">
          <div className="h-px bg-gradient-to-r from-transparent via-yellow-400 to-transparent opacity-30"></div>
        </div>
      </div>

      {/* Offer Details Modal */}
      {selectedOffer && (
        <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4">
          <div className="relative max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className={`rounded-3xl p-8 ${
              selectedOffer.isLive 
                ? 'bg-gradient-to-br from-amber-900/30 via-yellow-900/30 to-amber-900/30 border-2 border-amber-400/50' 
                : 'bg-gradient-to-br from-gray-800/80 via-gray-700/80 to-gray-800/80 border border-gray-600/50'
            }`}>
              
              {/* Close Button */}
              <button
                onClick={() => setSelectedOffer(null)}
                className="absolute top-4 right-4 bg-black/50 hover:bg-black/70 text-white rounded-full p-2 transition-colors duration-300"
              >
                <X className="w-6 h-6" />
              </button>

              {/* Content */}
              <div className="pr-12">
                {/* Live Badge */}
                {selectedOffer.isLive && (
                  <div className="flex items-center gap-2 mb-6">
                    <div className="bg-green-500 text-white text-sm px-4 py-2 rounded-full animate-pulse font-bold flex items-center gap-2">
                      <Zap className="w-4 h-4" />
                      LIVE OFFER
                    </div>
                  </div>
                )}

                {/* Title */}
                <div className="flex items-start gap-4 mb-6">
                  <Gift className={`w-12 h-12 flex-shrink-0 mt-2 ${
                    selectedOffer.isLive ? 'text-amber-400' : 'text-gray-400'
                  }`} />
                  <h2 className="text-4xl font-bold text-white leading-tight">
                    {selectedOffer.offer}
                  </h2>
                </div>

                {/* Description */}
                <div className="mb-8">
                  <h3 className="text-xl font-semibold text-yellow-400 mb-4">Offer Details</h3>
                  <p className="text-gray-200 text-lg leading-relaxed">
                    {selectedOffer.description}
                  </p>
                </div>

                {/* Metadata */}
                <div className="space-y-4 border-t border-gray-700/50 pt-6">
                  <div className="flex items-center gap-3">
                    <Calendar className="w-5 h-5 text-gray-400" />
                    <div>
                      <span className="text-gray-400 text-sm">Created:</span>
                      <span className="text-white ml-2">{formatDate(selectedOffer.createdAt)}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Clock className="w-5 h-5 text-gray-400" />
                    <div>
                      <span className="text-gray-400 text-sm">Last Updated:</span>
                      <span className="text-white ml-2">{formatDate(selectedOffer.updatedAt)}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    {selectedOffer.isLive ? (
                      <CheckCircle className="w-5 h-5 text-green-400" />
                    ) : (
                      <X className="w-5 h-5 text-red-400" />
                    )}
                    <div>
                      <span className="text-gray-400 text-sm">Status:</span>
                      <span className={`ml-2 font-semibold ${
                        selectedOffer.isLive ? 'text-green-400' : 'text-red-400'
                      }`}>
                        {selectedOffer.isLive ? 'Active & Available' : 'Currently Inactive'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* CTA */}
                {selectedOffer.isLive && (
                  <div className="mt-8 text-center">
                    <p className="text-amber-300 font-medium mb-4">
                      This offer is currently available! Visit us to enjoy this exclusive deal.
                    </p>
                    <div className="inline-flex items-center gap-2 bg-amber-400 text-black px-6 py-3 rounded-lg font-bold">
                      <Gift className="w-5 h-5" />
                      Available Now
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </>
  );
};

export default OffersPage;