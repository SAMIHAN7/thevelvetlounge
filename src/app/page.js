'use client';
import React, { useState, useRef, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Calendar, Clock } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export default function ClubLandingPage() {
  const router = useRouter();
  const [activeCategory, setActiveCategory] = useState(0);
  const [activeGalleryTab, setActiveGalleryTab] = useState('ambience');
  const menuScrollRef = useRef(null);
  
  // State for API data
  const [menuCategories, setMenuCategories] = useState([]);
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [galleryImages, setGalleryImages] = useState({ ambience: [], food: [] });
  const [liveOffers, setLiveOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // API base URL from environment variable
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000';

  // Fetch data from APIs
  useEffect(() => {
    const fetchLandingPageData = async () => {
      try {
        setLoading(true);
        
        // Fetch all landing page data
        const response = await fetch(`${API_BASE_URL}/web/landing`);
        const result = await response.json();
        
        if (result?.success) {
          const { events, menu, gallery, offers } = result?.data || {};
          
          // Set events data
          setUpcomingEvents(events?.upcoming || []);
          
          // Set menu categories data
          setMenuCategories(menu?.categories || []);
          
          // Set gallery images data
          setGalleryImages({
            ambience: gallery?.ambience || [],
            food: gallery?.food || []
          });

          // Set offers data
          setLiveOffers(offers?.live || []);
        }
      } catch (error) {
        console.error('Error fetching landing page data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchLandingPageData();
  }, []);

  // Helper function to get gradient for menu categories
  const getGradientForCategory = (categoryName) => {
    const gradients = {
      'food': 'from-red-600/80 to-orange-600/80',
      'beverages': 'from-green-600/80 to-emerald-600/80',
      'drinks': 'from-blue-600/80 to-cyan-600/80',
      'dessert': 'from-purple-600/80 to-pink-600/80',
      'appetizers': 'from-yellow-600/80 to-amber-600/80'
    };
    return gradients[categoryName?.toLowerCase()] || 'from-amber-600/80 to-yellow-600/80';
  };

  // Helper function to format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  // Helper function to format time
  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });
  };

  const scrollMenu = (direction) => {
    const container = menuScrollRef?.current;
    const scrollAmount = 300;
    if (direction === 'left') {
      container?.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
    } else {
      container?.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  const CategoryCard = ({ category, onClick }) => (
    <div
      onClick={() => onClick && onClick(category)}
      className="group relative overflow-hidden rounded-2xl shadow-2xl transform transition-all duration-500 hover:scale-105 hover:shadow-3xl cursor-pointer"
    >
      <div 
        className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110 z-0"
        style={{ backgroundImage: `url(${category?.image})` }}
      />
      <div className={`absolute inset-0 bg-gradient-to-t ${category?.gradient} opacity-70 group-hover:opacity-80 transition-opacity duration-500 z-10`} />
      <div className="absolute inset-0 rounded-2xl border-2 border-transparent group-hover:border-yellow-400 transition-all duration-500 z-20" />
      <div className="relative h-64 flex flex-col items-center justify-center text-center p-6 z-20">
        <h3 className="text-2xl font-bold text-white mb-2 transform transition-all duration-500 group-hover:scale-110 group-hover:text-yellow-300">
          {category?.name}
        </h3>
        <div className="w-0 h-0.5 bg-yellow-400 transition-all duration-500 group-hover:w-full"></div>
      </div>
      <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-30" 
           style={{ boxShadow: 'inset 0 0 50px rgba(255, 215, 0, 0.3)' }} />
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 relative overflow-hidden">
      {/* Animated Background Particles */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-amber-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
        <div className="absolute top-1/3 right-1/4 w-72 h-72 bg-yellow-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse delay-1000"></div>
        <div className="absolute bottom-1/4 left-1/3 w-80 h-80 bg-amber-600 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse delay-2000"></div>
        <div className="absolute bottom-1/3 right-1/3 w-64 h-64 bg-yellow-600 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse delay-3000"></div>
      </div>

      {/* Navigation */}
      <Navbar />

      {/* Hero Section */}
      <section id="home" className="min-h-screen flex items-center justify-center px-6 lg:px-8 relative">
        <div className="relative text-center max-w-4xl mx-auto z-10">
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
            <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse delay-300"></div>
            <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse delay-600"></div>
          </div>
          <div className="flex flex-col items-center justify-center mb-6">
            <img src="/logo.png" alt="The Velvet Lounge" className="w-48 h-48 md:w-64 md:h-64 lg:w-80 lg:h-80 xl:w-96 xl:h-96 object-contain mb-8" />
            <h1 className="text-6xl md:text-8xl font-bold bg-gradient-to-r from-amber-300 via-yellow-400 via-amber-500 to-yellow-600 bg-clip-text text-transparent">
              THE VELVET LOUNGE
            </h1>
          </div>
          <div className="w-32 h-1 bg-gradient-to-r from-amber-400 to-yellow-500 mx-auto rounded-full mb-8"></div>
          <p className="text-xl md:text-2xl text-gray-300 mb-12 leading-relaxed max-w-3xl mx-auto">
            Where elegance meets excitement. Experience the ultimate lounge atmosphere with world-class entertainment, exquisite cuisine, and unforgettable moments in pure velvet luxury.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <button 
              onClick={() => router.push('/events')}
              className="px-10 py-4 bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-600 text-white font-bold rounded-lg hover:scale-105 transform transition-all duration-300 shadow-xl shadow-amber-500/25"
            >
              View Events
            </button>
            <button 
              onClick={() => router.push('/menu')}
              className="px-10 py-4 bg-transparent border-2 border-amber-400 text-amber-400 font-bold rounded-lg hover:bg-amber-400 hover:text-black transform hover:scale-105 transition-all duration-300"
            >
              View Menu
            </button>
          </div>
        </div>
        
        {/* Floating Particles Effect */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden z-5">
          {[...Array(15)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-yellow-400 rounded-full opacity-30 animate-pulse"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 3}s`,
                animationDuration: `${2 + Math.random() * 2}s`
              }}
            />
          ))}
        </div>
      </section>

      {/* Happy Hours Section */}
      <section id="happyhours" className="py-20 px-6 lg:px-8 bg-gradient-to-r from-amber-900/20 to-yellow-900/20 relative">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-5xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-amber-300 via-yellow-400 to-amber-500 bg-clip-text text-transparent">
              Happy Hours
            </h2>
            <div className="w-32 h-1 bg-gradient-to-r from-amber-400 to-yellow-500 mx-auto rounded-full mb-4"></div>
            <p className="text-gray-300 text-lg">Special prices, exceptional moments</p>
          </div>

          <div className="max-w-4xl mx-auto">
            <div className="bg-gradient-to-r from-amber-600/10 via-yellow-600/10 to-amber-600/10 backdrop-blur-sm border border-amber-400/30 rounded-3xl p-8 md:p-12 text-center">
              <div className="flex items-center justify-center mb-6">
                <Clock className="w-12 h-12 text-amber-400 mr-4" />
                <div className="text-left">
                  <h3 className="text-3xl font-bold text-white mb-2">Daily 7:00 PM - 8:00 PM</h3>
                  <p className="text-amber-300 text-lg">Exclusive offers on premium drinks & appetizers</p>
                </div>
              </div>

              <div className="grid md:grid-cols-3 gap-8 mb-8">
                <div className="text-center">
                  <div className="text-4xl mb-2">🍸</div>
                  <h4 className="text-xl font-semibold text-white mb-2">Premium Cocktails</h4>
                  <p className="text-gray-300">Signature cocktails, now twice as tempting.</p>
                </div>
                <div className="text-center">
                  <div className="text-4xl mb-2">🍷</div>
                  <h4 className="text-xl font-semibold text-white mb-2">Fine Wine</h4>
                  <p className="text-gray-300">Special pricing on wine selection</p>
                </div>
                <div className="text-center">
                  <div className="text-4xl mb-2">🥨</div>
                  <h4 className="text-xl font-semibold text-white mb-2">Appetizers</h4>
                  <p className="text-gray-300">Discounted starters & snacks</p>
                </div>
              </div>

              <button
                onClick={() => router.push('/menu/happyhours')}
                className="px-10 py-4 bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-600 text-white font-bold rounded-lg hover:scale-105 transform transition-all duration-300 shadow-xl shadow-amber-500/25"
              >
                View Happy Hours Menu
              </button>
            </div>
          </div>
        </div>

        {/* Background Elements */}
        <div className="absolute top-10 left-10 w-64 h-64 bg-amber-400 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-pulse"></div>
        <div className="absolute bottom-10 right-10 w-64 h-64 bg-yellow-400 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-pulse delay-1000"></div>
      </section>

      {/* Menu Section */}
      <section id="menu" className="py-20 px-6 lg:px-8 relative">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-5xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-amber-300 via-yellow-400 to-amber-500 bg-clip-text text-transparent">
              Our Menu
            </h2>
            <div className="w-32 h-1 bg-gradient-to-r from-amber-400 to-yellow-500 mx-auto rounded-full mb-4"></div>
            <p className="text-gray-300 text-lg">Curated dishes that define excellence</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {loading ? (
              // Loading skeleton
              [...Array(4)].map((_, index) => (
                <div key={index} className="animate-pulse">
                  <div className="h-64 bg-gray-800 rounded-2xl"></div>
                </div>
              ))
            ) : (
              menuCategories.map((category, index) => (
                <CategoryCard 
                  key={category?._id || index} 
                  category={{
                    name: category?.category,
                    image: category?.image || 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=500&h=300&fit=crop',
                    gradient: getGradientForCategory(category?.category)
                  }}
                  onClick={(cat) => {
                    const categoryUrl = cat?.name?.toLowerCase().replace(/\s+/g, '');
                    router.push(`/menu/${categoryUrl}`);
                  }}
                />
              ))
            )}
          </div>

          {/* View Full Menu Button */}
          <div className="text-center mt-12">
            <button
              onClick={() => router.push('/menu')}
              className="px-8 py-4 bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-600 text-white font-bold rounded-lg hover:scale-105 transform transition-all duration-300 shadow-xl shadow-amber-500/25"
            >
              View Full Menu
            </button>
          </div>
        </div>
        
        {/* Floating Particles Effect */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {[...Array(10)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-yellow-400 rounded-full opacity-20 animate-pulse"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 3}s`,
                animationDuration: `${2 + Math.random() * 2}s`
              }}
            />
          ))}
        </div>
      </section>

      {/* Events Section */}
      <section id="events" className="py-20 px-6 lg:px-8 bg-black/20 relative">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-5xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-amber-300 via-yellow-400 to-amber-500 bg-clip-text text-transparent">
              Events
            </h2>
            <div className="w-32 h-1 bg-gradient-to-r from-amber-400 to-yellow-500 mx-auto rounded-full mb-4"></div>
            <p className="text-gray-300 text-lg">Experience the rhythm of the night</p>
          </div>

          {loading ? (
            // Loading skeleton for events
            <div className="grid lg:grid-cols-2 gap-12 mb-16">
              <div className="space-y-6">
                <div className="animate-pulse">
                  <div className="h-80 bg-gray-800 rounded-2xl"></div>
                </div>
                <div className="animate-pulse">
                  <div className="h-48 bg-gray-800 rounded-2xl"></div>
                </div>
              </div>
              <div className="space-y-4">
                {[...Array(3)].map((_, index) => (
                  <div key={index} className="animate-pulse">
                    <div className="h-24 bg-gray-800 rounded-xl"></div>
                  </div>
                ))}
              </div>
            </div>
          ) : upcomingEvents.length > 0 ? (
            /* Featured Event */
            <div className="grid lg:grid-cols-2 gap-12 mb-16">
              {/* Featured Event Details */}
              <div className="space-y-6">
                <div 
                  onClick={() => router.push(`/events/${upcomingEvents?.[0]?._id}`)}
                  className="relative h-80 rounded-2xl overflow-hidden group cursor-pointer"
                >
                  <img
                    src={upcomingEvents?.[0]?.images?.[0] || 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&h=600&fit=crop'}
                    alt="Featured Event"
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  {upcomingEvents?.[0]?.images && upcomingEvents?.[0]?.images?.length > 1 && (
                    <div className="absolute bottom-4 left-4 right-4 flex space-x-2">
                      {upcomingEvents?.[0]?.images?.map((_, i) => (
                        <div
                          key={i}
                          className={`w-3 h-3 rounded-full transition-colors ${
                            i === 0 ? 'bg-yellow-400' : 'bg-white/50'
                          }`}
                        />
                      ))}
                    </div>
                  )}
                  {/* Click indicator */}
                  <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="bg-yellow-400 text-black px-3 py-1 rounded-full text-sm font-semibold">
                      Register
                    </div>
                  </div>
                </div>

                {/* Event Info */}
                <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                    <h3 className="text-2xl font-bold text-white">{upcomingEvents?.[0]?.name}</h3>
                  </div>
                  <p className="text-gray-300 mb-6 leading-relaxed">{upcomingEvents?.[0]?.description}</p>

                  {/* Date & Time */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <Calendar className="text-yellow-400 w-5 h-5" />
                      <span className="text-gray-300">Event Date:</span>
                      <span className="text-white font-semibold">{formatDate(upcomingEvents?.[0]?.startTime)}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Clock className="text-orange-400 w-5 h-5" />
                      <span className="text-gray-300">Time:</span>
                      <span className="text-white font-semibold">
                        {formatTime(upcomingEvents?.[0]?.startTime)} - {formatTime(upcomingEvents?.[0]?.endTime)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Upcoming Events List */}
              <div>
                <div className="flex items-center justify-between mb-8">
                  {/* <h3 className="text-3xl font-bold text-yellow-400">More Events</h3> */}
                  <button 
                    onClick={() => window.location.href = '/events'}
                    className="px-6 py-2 bg-transparent border-2 border-yellow-400 text-yellow-400 font-semibold rounded-lg hover:bg-yellow-400 hover:text-black transform hover:scale-105 transition-all duration-300"
                  >
                    View All
                  </button>
                </div>
                <div className="space-y-4">
                  {upcomingEvents.slice(1, 4).map((event, index) => (
                    <div 
                      key={event?._id || index} 
                      onClick={() => router.push(`/events/${event?._id}`)}
                      className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-4 border border-gray-700/50 hover:border-yellow-400/50 transition-all duration-300 hover:scale-105 cursor-pointer group"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="text-lg font-bold text-white mb-2 group-hover:text-yellow-300 transition-colors">{event?.name}</h4>
                          <div className="text-yellow-400 text-sm mb-2">
                            {formatDate(event?.startTime)} • {formatTime(event?.startTime)} - {formatTime(event?.endTime)}
                          </div>
                          <p className="text-gray-400 text-sm">{event?.description}</p>
                        </div>
                        <div className="ml-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          <div className="bg-yellow-400 text-black px-2 py-1 rounded text-xs font-semibold">
                            Register
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            // No events message
            <div className="text-center py-16">
              <div className="text-gray-400 text-lg">No upcoming events at the moment</div>
              <div className="text-gray-500 text-sm mt-2">Check back soon for exciting events!</div>
            </div>
          )}
        </div>
      </section>

      

      {/* Gallery Section */}
      <section id="gallery" className="py-20 px-6 lg:px-8 relative">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-5xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-amber-300 via-yellow-400 to-amber-500 bg-clip-text text-transparent">
              Gallery
            </h2>
            <div className="w-32 h-1 bg-gradient-to-r from-amber-400 to-yellow-500 mx-auto rounded-full mb-4"></div>
            <p className="text-gray-300 text-lg">Moments that define our essence</p>
          </div>

          <div className="flex justify-center mb-8">
            <div className="flex bg-gray-800/50 rounded-full p-1 backdrop-blur-sm border border-gray-700/50">
              <button 
                onClick={() => setActiveGalleryTab('ambience')}
                className={`px-6 py-3 rounded-full font-semibold transition-all duration-300 ${
                  activeGalleryTab === 'ambience' 
                    ? 'bg-yellow-600 text-white shadow-lg' 
                    : 'text-gray-400 hover:text-yellow-400'
                }`}
              >
                Ambience
              </button>
              <button 
                onClick={() => setActiveGalleryTab('food')}
                className={`px-6 py-3 rounded-full font-semibold transition-all duration-300 ${
                  activeGalleryTab === 'food' 
                    ? 'bg-yellow-600 text-white shadow-lg' 
                    : 'text-gray-400 hover:text-yellow-400'
                }`}
              >
                Food
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
            {loading ? (
              // Loading skeleton for gallery
              [...Array(6)].map((_, index) => (
                <div key={index} className="animate-pulse">
                  <div className="aspect-square bg-gray-800 rounded-2xl"></div>
                </div>
              ))
            ) : galleryImages?.[activeGalleryTab] && galleryImages?.[activeGalleryTab]?.length > 0 ? (
              galleryImages?.[activeGalleryTab]?.map((image, index) => (
                <div 
                  key={index}
                  className="relative overflow-hidden rounded-2xl group cursor-pointer aspect-square border border-gray-700/50 shadow-xl hover:shadow-3xl hover:border-yellow-400/50 transition-all duration-500 hover:scale-105"
                >
                  <img 
                    src={image?.imageUrl || image} 
                    alt={`${activeGalleryTab} ${index + 1}`}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  <div className="absolute bottom-4 left-4 right-4 opacity-0 group-hover:opacity-100 transition-all duration-500 transform translate-y-4 group-hover:translate-y-0">
                    <div className="text-yellow-400 font-bold text-sm capitalize">{activeGalleryTab}</div>
                    <div className="text-white text-xs">Image {index + 1}</div>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full text-center py-16">
                <div className="text-gray-400 text-lg">No {activeGalleryTab} images available</div>
                <div className="text-gray-500 text-sm mt-2">Check back soon for more photos!</div>
              </div>
            )}
          </div>

          {/* View More Gallery Button */}
          <div className="text-center mt-12">
            <button
              onClick={() => router.push('/gallery')}
              className="px-8 py-4 bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-600 text-white font-bold rounded-lg hover:scale-105 transform transition-all duration-300 shadow-xl shadow-amber-500/25"
            >
              View More Gallery
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
}