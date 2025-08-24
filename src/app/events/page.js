'use client';
import React, { useState, useEffect } from 'react';
import { Calendar, Clock, MapPin, Users, ChevronRight } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';

export default function EventsPage() {
  const router = useRouter();
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [ongoingEvents, setOngoingEvents] = useState([]);
  const [pastEvents, setPastEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Pagination states
  const [upcomingPage, setUpcomingPage] = useState(1);
  const [ongoingPage, setOngoingPage] = useState(1);
  const [pastPage, setPastPage] = useState(1);
  const [upcomingHasMore, setUpcomingHasMore] = useState(true);
  const [ongoingHasMore, setOngoingHasMore] = useState(true);
  const [pastHasMore, setPastHasMore] = useState(true);
  
  const EVENTS_PER_PAGE = 6;
  
  // API base URL from environment variable
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

  // Helper functions
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });
  };

  const categorizeEvents = (events) => {
    const now = new Date();
    const upcoming = [];
    const ongoing = [];
    const past = [];

    events.forEach(event => {
      const startTime = new Date(event?.startTime);
      const endTime = new Date(event?.endTime);

      if (now < startTime) {
        upcoming.push(event);
      } else if (now >= startTime && now <= endTime) {
        ongoing.push(event);
      } else {
        past.push(event);
      }
    });

    return { upcoming, ongoing, past };
  };

  // Fetch all events
  useEffect(() => {
    const fetchAllEvents = async () => {
      try {
        setLoading(true);
        // Fetch from the web landing events endpoint
        const response = await fetch(`${API_BASE_URL}/web/landing/events/all`);
        const result = await response.json();
        
        if (result?.success && result?.data) {
          setUpcomingEvents(result?.data?.upcoming || []);
          setOngoingEvents(result?.data?.ongoing || []);
          setPastEvents(result?.data?.past || []);
          
          // Set pagination states
          setUpcomingHasMore((result?.data?.upcoming?.length || 0) > EVENTS_PER_PAGE);
          setOngoingHasMore((result?.data?.ongoing?.length || 0) > EVENTS_PER_PAGE);
          setPastHasMore((result?.data?.past?.length || 0) > EVENTS_PER_PAGE);
        }
      } catch (error) {
        console.error('Error fetching events:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAllEvents();
  }, []);

  // Load more functions
  const loadMoreUpcoming = () => {
    const nextPage = upcomingPage + 1;
    const maxItems = nextPage * EVENTS_PER_PAGE;
    if (maxItems >= upcomingEvents.length) {
      setUpcomingHasMore(false);
    }
    setUpcomingPage(nextPage);
  };

  const loadMoreOngoing = () => {
    const nextPage = ongoingPage + 1;
    const maxItems = nextPage * EVENTS_PER_PAGE;
    if (maxItems >= ongoingEvents.length) {
      setOngoingHasMore(false);
    }
    setOngoingPage(nextPage);
  };

  const loadMorePast = () => {
    const nextPage = pastPage + 1;
    const maxItems = nextPage * EVENTS_PER_PAGE;
    if (maxItems >= pastEvents.length) {
      setPastHasMore(false);
    }
    setPastPage(nextPage);
  };

  // Event Card Component
  const EventCard = ({ event, status = 'upcoming' }) => {
    const getStatusColor = () => {
      switch (status) {
        case 'upcoming': return 'border-yellow-400/50 hover:border-yellow-400';
        case 'ongoing': return 'border-green-400/50 hover:border-green-400';
        case 'past': return 'border-gray-500/50 hover:border-gray-400';
        default: return 'border-yellow-400/50 hover:border-yellow-400';
      }
    };

    const getStatusBadge = () => {
      switch (status) {
        case 'upcoming': return (
          <span className="px-3 py-1 bg-yellow-400/20 text-yellow-400 text-xs font-semibold rounded-full border border-yellow-400/30">
            Upcoming
          </span>
        );
        case 'ongoing': return (
          <span className="px-3 py-1 bg-green-400/20 text-green-400 text-xs font-semibold rounded-full border border-green-400/30 animate-pulse">
            Live Now
          </span>
        );
        case 'past': return (
          <span className="px-3 py-1 bg-gray-400/20 text-gray-400 text-xs font-semibold rounded-full border border-gray-400/30">
            Completed
          </span>
        );
        default: return null;
      }
    };

    return (
      <div 
        onClick={() => router.push(`/events/${event?._id}`)}
        className={`group relative overflow-hidden rounded-2xl shadow-2xl transform transition-all duration-500 hover:scale-105 hover:shadow-3xl cursor-pointer border ${getStatusColor()} bg-gray-800/50 backdrop-blur-sm`}
      >
        <div className="relative h-64 overflow-hidden">
          <img
            src={event.images?.[0] || 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&h=600&fit=crop'}
            alt={event?.name}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
          
          {/* Status Badge */}
          <div className="absolute top-4 right-4">
            {getStatusBadge()}
          </div>

          {/* Event Title Overlay */}
          <div className="absolute bottom-4 left-4 right-4">
            <h3 className="text-xl font-bold text-white mb-2 line-clamp-2 group-hover:text-yellow-300 transition-colors duration-300">
              {event?.name}
            </h3>
          </div>
          
          {/* Register/View indicator */}
          <div className="absolute top-4 left-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <div className={`px-3 py-1 rounded-full text-xs font-semibold ${
              status === 'upcoming' ? 'bg-yellow-400 text-black' :
              status === 'ongoing' ? 'bg-green-400 text-black' :
              'bg-gray-400 text-black'
            }`}>
              {status === 'upcoming' ? 'Register' : status === 'ongoing' ? 'View Live' : 'View Details'}
            </div>
          </div>
        </div>

        <div className="p-6">
          <p className="text-gray-300 text-sm mb-4 line-clamp-3">
            {event?.description}
          </p>

          <div className="space-y-2 mb-4">
            <div className="flex items-center gap-3 text-sm">
              <Calendar className="text-yellow-400 w-4 h-4" />
              <span className="text-gray-300">{formatDate(event?.startTime)}</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <Clock className="text-orange-400 w-4 h-4" />
              <span className="text-gray-300">
                {formatTime(event?.startTime)} - {formatTime(event?.endTime)}
              </span>
            </div>
            {event?.attendees && (
              <div className="flex items-center gap-3 text-sm">
                <Users className="text-green-400 w-4 h-4" />
                <span className="text-gray-300">
                  {event?.attendees?.length || 0} / {event?.capacity} registered
                </span>
              </div>
            )}
          </div>

          <div className="flex items-center justify-between">
            <div className="text-xs text-gray-500">
              Registration: {formatDate(event?.registrationStart)} - {formatDate(event?.registrationEnd)}
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-yellow-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                {status === 'upcoming' ? 'Click to Register' : 'Click to View'}
              </span>
              <ChevronRight className="text-yellow-400 w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Section Component
  const EventSection = ({ title, events, page, hasMore, onLoadMore, status, gradientColors }) => {
    const displayEvents = events.slice(0, page * EVENTS_PER_PAGE);

    if (events.length === 0 && status !== 'ongoing') {
      return null; // Don't show section if no events (except ongoing which we hide entirely)
    }

    if (events.length === 0 && status === 'ongoing') {
      return null; // Hide ongoing section entirely if no ongoing events
    }

    return (
      <div className="mb-16">
        <div className="text-center mb-12">
          <h2 className={`text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r ${gradientColors} bg-clip-text text-transparent`}>
            {title}
          </h2>
          <div className="w-24 h-1 bg-gradient-to-r from-amber-400 to-yellow-500 mx-auto rounded-full"></div>
          <p className="text-gray-400 mt-4">{events.length} event{events.length !== 1 ? 's' : ''}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-8">
          {displayEvents.map((event, index) => (
            <EventCard key={event?._id || index} event={event} status={status} />
          ))}
        </div>

        {hasMore && displayEvents.length < events.length && (
          <div className="text-center">
            <button
              onClick={onLoadMore}
              className="px-8 py-3 bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-600 text-white font-semibold rounded-lg hover:scale-105 transform transition-all duration-300 shadow-xl shadow-amber-500/25"
            >
              Load More Events
            </button>
          </div>
        )}
      </div>
    );
  };

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

      {/* Main Content */}
      <section className="relative z-10 pt-24 pb-20 px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Page Header */}
          <div className="text-center mb-16">
            <h1 className="text-6xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-amber-300 via-yellow-400 via-amber-500 to-yellow-600 bg-clip-text text-transparent">
              Events
            </h1>
            <div className="w-32 h-1 bg-gradient-to-r from-amber-400 to-yellow-500 mx-auto rounded-full mb-6"></div>
            <p className="text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto">
              Discover amazing events at The Velvet Lounge. From intimate gatherings to grand celebrations.
            </p>
          </div>

          {loading ? (
            // Loading skeleton
            <div className="space-y-16">
              {[...Array(3)].map((_, sectionIndex) => (
                <div key={sectionIndex}>
                  <div className="text-center mb-12">
                    <div className="h-12 w-64 bg-gray-800 rounded-lg mx-auto mb-4 animate-pulse"></div>
                    <div className="w-24 h-1 bg-gray-800 mx-auto rounded-full animate-pulse"></div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {[...Array(6)].map((_, cardIndex) => (
                      <div key={cardIndex} className="animate-pulse">
                        <div className="h-64 bg-gray-800 rounded-2xl mb-4"></div>
                        <div className="h-32 bg-gray-800 rounded-2xl"></div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <>
              {/* Upcoming Events */}
              <EventSection
                title="Upcoming Events"
                events={upcomingEvents}
                page={upcomingPage}
                hasMore={upcomingHasMore}
                onLoadMore={loadMoreUpcoming}
                status="upcoming"
                gradientColors="from-amber-300 via-yellow-400 to-amber-500"
              />

              {/* Ongoing Events - Only show if there are ongoing events */}
              {ongoingEvents.length > 0 && (
                <EventSection
                  title="Live Now"
                  events={ongoingEvents}
                  page={ongoingPage}
                  hasMore={ongoingHasMore}
                  onLoadMore={loadMoreOngoing}
                  status="ongoing"
                  gradientColors="from-green-300 via-emerald-400 to-green-500"
                />
              )}

              {/* Past Events */}
              <EventSection
                title="Past Events"
                events={pastEvents}
                page={pastPage}
                hasMore={pastHasMore}
                onLoadMore={loadMorePast}
                status="past"
                gradientColors="from-gray-300 via-gray-400 to-gray-500"
              />

              {/* No Events Message */}
              {upcomingEvents.length === 0 && ongoingEvents.length === 0 && pastEvents.length === 0 && (
                <div className="text-center py-20">
                  <div className="text-gray-400 text-xl mb-4">No events available at the moment</div>
                  <div className="text-gray-500">Check back soon for exciting upcoming events!</div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Floating Particles Effect */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
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

      {/* Footer */}
      <Footer />
    </div>
  );
}