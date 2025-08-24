'use client';
import { useState, useEffect } from 'react';
import { Calendar, Clock, Sparkles, Lock, Music, Phone, User, Mail } from 'lucide-react';
import { useParams } from 'next/navigation';
import Navbar from '../../../components/Navbar';
import Footer from '../../../components/Footer';

export default function EventRegistrationPage() {
  const params = useParams();
  const eventId = params.id;
  
  const [step, setStep] = useState(1);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [userExists, setUserExists] = useState(false);
  const [userData, setUserData] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: ''
  });
  const [eventData, setEventData] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [countdown, setCountdown] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [showBlast, setShowBlast] = useState(false);
  const [showStampAnimation, setShowStampAnimation] = useState(false);
  const [eventStatus, setEventStatus] = useState('checking');

  // Fetch event data
  useEffect(() => {
    const fetchEventData = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/web/landing/registration/event/${eventId}`);
        const result = await response.json();
        
        if (result?.success) {
          const event = result?.data;
          const eventWithDates = {
            ...event,
            startTime: new Date(event?.startTime),
            endTime: new Date(event?.endTime),
            registrationStart: new Date(event?.registrationStart),
            registrationEnd: new Date(event?.registrationEnd)
          };
          setEventData(eventWithDates);
          
          const now = new Date();
          if (now > eventWithDates.endTime) {
            setEventStatus('past');
          } else if (now >= eventWithDates.startTime && now <= eventWithDates.endTime) {
            setEventStatus('ongoing');
          } else if (now < eventWithDates.startTime) {
            if (now >= eventWithDates.registrationStart && now <= eventWithDates.registrationEnd) {
              setEventStatus('upcoming');
            } else if (now < eventWithDates.registrationStart) {
              setEventStatus('registration_not_started');
            } else {
              setEventStatus('registration_closed');
            }
          }
        } else {
          setError('Failed to load event details');
        }
      } catch (err) {
        setError('Failed to connect to server');
      }
    };

    if (eventId) {
      fetchEventData();
    }
  }, [eventId]);

  // Simple phone submit - only validate length when button clicked
  const handleRegister = async () => {
    setError('');
    setLoading(true);
    
    // Get phone number from input field
    const inputElement = document.querySelector('input[type="tel"]');
    const phoneValue = inputElement?.value?.replace(/\D/g, '') || '';
    
    // Simple validation
    if (phoneValue.length !== 10) {
      setError('Please enter a valid 10-digit phone number');
      setLoading(false);
      return;
    }

    try {
      // Check if user exists
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/web/landing/registration/verify-phone`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: phoneValue })
      });
      
      const result = await response.json();
      
      if (result?.success) {
        if (result?.userExists) {
          // Existing user - show stamp animation then register
          setUserData(result?.data);
          setPhoneNumber(phoneValue);
          setShowStampAnimation(true);
          
          // After stamp animation, complete registration
          setTimeout(async () => {
            await registerForEvent(phoneValue, result?.data);
          }, 2500); // Wait for stamp animation to complete
        } else {
          // New user - go to details step
          setPhoneNumber(phoneValue);
          setStep(2);
          setLoading(false);
        }
      } else {
        setError(result?.message || 'Phone verification failed');
        setLoading(false);
      }
    } catch (err) {
      setError('Cannot connect to server');
      setLoading(false);
    }
  };

  const registerForEvent = async (phone, existingUser = null) => {
    try {
      const registrationData = { phone, eventId };
      
      if (!existingUser) {
        registrationData.name = formData.name;
        registrationData.email = formData.email;
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/web/landing/registration/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(registrationData)
      });

      const result = await response.json();
      
      if (result?.success) {
        setSuccessMessage(result?.message);
        setShowStampAnimation(false); // Hide stamp animation
        setStep(3); // Go to success step
        setShowBlast(true); // Show blast animation
      } else {
        setShowStampAnimation(false); // Hide stamp animation on error
        setError(result?.message || 'Registration failed');
      }
    } catch (err) {
      setError('Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const handleDetailsSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    // Show stamp animation for new user registration too
    setShowStampAnimation(true);
    
    // Wait for stamp animation then complete registration
    setTimeout(async () => {
      await registerForEvent(phoneNumber);
    }, 2500);
  };

  const formatDateTime = (date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Countdown logic
  useEffect(() => {
    if (!eventData) return;
    
    const updateCountdown = () => {
      const now = new Date();
      const distance = eventData?.registrationEnd - now;

      if (distance <= 0) {
        setCountdown("Registration closed");
        return;
      }

      const days = Math.floor(distance / (1000 * 60 * 60 * 24));
      const hours = Math.floor((distance / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((distance / (1000 * 60)) % 60);
      const seconds = Math.floor((distance / 1000) % 60);

      setCountdown(`${days}d ${hours}h ${minutes}m ${seconds}s`);
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [eventData]);

  // Logo stamp animation component
  const LogoStampAnimation = () => {
    if (!showStampAnimation) return null;
    
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
        <div className="text-center">
          {/* Stamp Animation */}
          <div className="relative">
            {/* Logo */}
            <div className="w-48 h-48 mx-auto mb-6 relative">
              <img 
                src="/logo.png" 
                alt="Club Paradise" 
                className="w-full h-full object-contain animate-bounce"
              />
              {/* Stamp Effect Rings */}
              <div className="absolute inset-0 border-8 border-green-400 rounded-full opacity-0 animate-ping" 
                   style={{ animationDelay: '0.5s', animationDuration: '1s' }} />
              <div className="absolute inset-4 border-4 border-yellow-400 rounded-full opacity-0 animate-ping" 
                   style={{ animationDelay: '0.8s', animationDuration: '1s' }} />
              <div className="absolute inset-8 border-2 border-white rounded-full opacity-0 animate-ping" 
                   style={{ animationDelay: '1.1s', animationDuration: '1s' }} />
              
              {/* Sparkle Effects */}
              <div className="absolute -top-4 -left-4 text-yellow-400 text-2xl animate-spin" style={{ animationDuration: '2s' }}>✨</div>
              <div className="absolute -top-4 -right-4 text-green-400 text-xl animate-bounce" style={{ animationDelay: '0.5s' }}>✓</div>
              <div className="absolute -bottom-4 -left-4 text-red-400 text-lg animate-pulse" style={{ animationDelay: '1s' }}>🎉</div>
              <div className="absolute -bottom-4 -right-4 text-purple-400 text-xl animate-bounce" style={{ animationDelay: '1.5s' }}>🎆</div>
            </div>
            
            {/* Welcome Message */}
            <div className="space-y-3">
              <h2 className="text-3xl font-bold text-green-400 animate-pulse">
                Welcome Back!
              </h2>
              <p className="text-xl text-white">
                {userData?.name || 'Valued Member'}
              </p>
              <p className="text-gray-300">
                {userExists ? 'Verifying your registration...' : 'Processing your registration...'}
              </p>
            </div>
            
            {/* Stamp Text */}
            <div className="mt-8 relative">
              {/* Background stamp text */}
              <div className="text-6xl font-bold text-green-400 opacity-20 transform rotate-12 animate-pulse">
                REGISTERED
              </div>
              
              {/* Main stamp */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="relative">
                  <div className="text-2xl font-bold text-green-400 border-4 border-green-400 px-8 py-2 transform -rotate-12 animate-bounce bg-black/50 backdrop-blur-sm rounded-lg">
                    ✓ VERIFIED
                  </div>
                  {/* Club name on stamp */}
                  <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 text-xs text-yellow-400 font-semibold whitespace-nowrap">
                    CLUB PARADISE
                  </div>
                </div>
              </div>
              
              {/* Additional decorative elements */}
              <div className="absolute top-0 left-0 text-yellow-400 text-sm animate-pulse" style={{ animationDelay: '2s' }}>🌟</div>
              <div className="absolute top-0 right-0 text-green-400 text-sm animate-pulse" style={{ animationDelay: '2.2s' }}>🌟</div>
              <div className="absolute bottom-0 left-0 text-red-400 text-sm animate-pulse" style={{ animationDelay: '2.4s' }}>🌟</div>
              <div className="absolute bottom-0 right-0 text-purple-400 text-sm animate-pulse" style={{ animationDelay: '2.6s' }}>🌟</div>
            </div>
          </div>
        </div>
        
        {/* Animation Styles */}
        <style jsx>{`
          @keyframes stamp-bounce {
            0%, 20%, 53%, 80%, 100% {
              transform: translate3d(0,0,0) rotate(-12deg);
            }
            40%, 43% {
              transform: translate3d(0, -30px, 0) rotate(-12deg);
            }
            70% {
              transform: translate3d(0, -15px, 0) rotate(-12deg);
            }
            90% {
              transform: translate3d(0, -4px, 0) rotate(-12deg);
            }
          }
        `}</style>
      </div>
    );
  };

  // Blast animation component
  const BlastAnimation = () => {
    const [particles, setParticles] = useState([]);
    
    useEffect(() => {
      if (showBlast) {
        const newParticles = Array.from({ length: 50 }, (_, i) => ({
          id: i,
          x: Math.random() * (typeof window !== 'undefined' ? window?.innerWidth : 800),
          y: Math.random() * (typeof window !== 'undefined' ? window?.innerHeight : 600),
          color: ['#ff6b35', '#f7931e', '#ffd700', '#ff1744', '#9c27b0'][Math.floor(Math.random() * 5)],
          size: Math.random() * 10 + 5,
        }));
        setParticles(newParticles);
        
        setTimeout(() => setShowBlast(false), 3000);
      }
    }, [showBlast]);
    
    if (!showBlast) return null;
    
    return (
      <div className="fixed inset-0 z-50 pointer-events-none">
        {particles.map((particle) => (
          <div
            key={particle.id}
            className="absolute animate-ping"
            style={{
              left: particle.x,
              top: particle.y,
              width: particle.size,
              height: particle.size,
              backgroundColor: particle.color,
              borderRadius: '50%',
              animation: 'blast 3s ease-out forwards'
            }}
          />
        ))}
        <style jsx>{`
          @keyframes blast {
            0% { opacity: 1; transform: scale(0); }
            50% { opacity: 1; transform: scale(1); }
            100% { opacity: 0; transform: scale(1.5); }
          }
        `}</style>
      </div>
    );
  };

  if (!eventData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-yellow-400 mx-auto"></div>
          <p className="mt-4 text-gray-300">Loading event details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white relative overflow-hidden">
      <Navbar />
      <LogoStampAnimation />
      <BlastAnimation />
      
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-red-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
        <div className="absolute top-1/3 right-1/4 w-72 h-72 bg-yellow-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse delay-1000"></div>
        <div className="absolute bottom-1/4 left-1/3 w-80 h-80 bg-green-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse delay-2000"></div>
        <div className="absolute bottom-1/3 right-1/3 w-64 h-64 bg-orange-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse delay-3000"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 py-8 pt-24">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <img src="/logo.png" alt="The Velvet Lounge" className="w-48 h-48 md:w-64 md:h-64 lg:w-80 lg:h-80 xl:w-96 xl:h-96 object-contain" />
          </div>
          <p className="text-gray-300 text-lg">Where Music Meets Magic</p>
        </div>

        {/* Main */}
        <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-8">
          {/* Event Details */}
          <div className="space-y-6">
            <div className="relative h-80 rounded-2xl overflow-hidden group">
              <img
                src={eventData?.images?.[currentImageIndex]}
                alt="Event"
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              <div className="absolute bottom-4 left-4 right-4 flex space-x-2">
                {(eventData?.images || []).map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentImageIndex(i)}
                    className={`w-3 h-3 rounded-full transition-colors ${
                      i === currentImageIndex ? 'bg-yellow-400' : 'bg-white/50'
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* Event Info */}
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700">
              <div className="flex items-center gap-3 mb-4">
                <Music className="text-red-400 w-8 h-8" />
                <h2 className="text-3xl font-bold text-white">{eventData?.name}</h2>
              </div>
              <p className="text-gray-300 mb-6 leading-relaxed">{eventData?.description}</p>

              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Calendar className="text-yellow-400 w-5 h-5" />
                  <span className="text-gray-300">Event Date:</span>
                  <span className="text-white font-semibold">{formatDateTime(eventData?.startTime)}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Clock className="text-orange-400 w-5 h-5" />
                  <span className="text-gray-300">Time:</span>
                  <span className="text-white font-semibold">
                    {eventData?.startTime?.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })} - 
                    {eventData?.endTime?.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <Lock className="text-green-400 w-5 h-5" />
                  <span className="text-gray-300">Registration Ends In:</span>
                  <span className="text-yellow-400 font-bold bg-yellow-400/10 px-3 py-1 rounded-full animate-pulse text-lg shadow-md">
                    {countdown}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <Sparkles className="text-purple-400 w-5 h-5" />
                  <span className="text-gray-300">Available Spots:</span>
                  <span className="text-white font-semibold">
                    {eventData?.availableSpots} / {eventData?.capacity}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Registration Form */}
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-8 border border-gray-700 h-fit">
            {error && (
              <div className="mb-4 p-4 bg-red-500/20 border border-red-500 rounded-lg text-red-300">
                {error}
              </div>
            )}

            {eventStatus === 'upcoming' && (
              <>
                {/* Step 1: Phone Number Input */}
                {step === 1 && (
                  <div className="text-center">
                    <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full mx-auto mb-4 flex items-center justify-center">
                      <Sparkles className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent mb-2">
                      Register Now
                    </h3>
                    <p className="text-gray-300 mb-6">Enter your phone number to secure your spot</p>

                    <div className="space-y-4">
                      <input
                        type="tel"
                        placeholder="Enter 10-digit phone number"
                        onChange={(e) => {
                          const value = e?.target?.value?.replace(/\D/g, '')?.slice(0, 10);
                          setPhoneNumber(value);
                          setError('');
                        }}
                        className="w-full px-4 py-3 bg-gray-900/50 border border-gray-600 rounded-lg text-white text-center text-lg"
                        maxLength={10}
                      />
                      
                      <button
                        type="button"
                        onClick={handleRegister}
                        disabled={loading}
                        className="w-full py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white font-semibold rounded-lg hover:scale-105 transition-all disabled:opacity-50"
                      >
                        {loading ? 'Processing...' : 'Register'}
                      </button>
                    </div>
                  </div>
                )}

                {/* Step 2: User Details */}
                {step === 2 && (
                  <div>
                    <div className="text-center mb-6">
                      <h3 className="text-2xl font-bold bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent mb-2">
                        Complete Your Profile
                      </h3>
                      <p className="text-gray-300">Phone: {phoneNumber}</p>
                    </div>

                    <form onSubmit={handleDetailsSubmit} className="space-y-4">
                      <input
                        type="text"
                        placeholder="Full Name"
                        value={formData?.name || ''}
                        onChange={(e) => setFormData({...formData, name: e?.target?.value})}
                        className="w-full px-4 py-3 bg-gray-900/50 border border-gray-600 rounded-lg text-white"
                        required
                      />
                      <input
                        type="email"
                        placeholder="Email Address"
                        value={formData?.email || ''}
                        onChange={(e) => setFormData({...formData, email: e?.target?.value})}
                        className="w-full px-4 py-3 bg-gray-900/50 border border-gray-600 rounded-lg text-white"
                        required
                      />
                      <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white font-semibold rounded-lg hover:scale-105 transition-all disabled:opacity-50"
                      >
                        {loading ? 'Registering...' : 'Complete Registration'}
                      </button>
                    </form>
                  </div>
                )}

                {/* Step 3: Success */}
                {step === 3 && (
                  <div className="text-center py-8">
                    <div className="w-20 h-20 bg-gradient-to-r from-green-400 via-emerald-500 to-teal-500 rounded-full mx-auto flex items-center justify-center mb-4 animate-bounce">
                      <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <h3 className="text-3xl font-bold bg-gradient-to-r from-green-400 to-emerald-500 bg-clip-text text-transparent mb-4">
                      Registration Successful!
                    </h3>
                    <div className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-500/50 rounded-lg p-4 mb-6">
                      <p className="text-green-300 text-lg font-semibold">{successMessage}</p>
                    </div>
                  </div>
                )}
              </>
            )}

            {/* Other event statuses */}
            {eventStatus !== 'upcoming' && (
              <div className="text-center py-8">
                <h3 className="text-2xl font-bold text-gray-400 mb-4">
                  {eventStatus === 'past' && 'Event Has Ended'}
                  {eventStatus === 'ongoing' && 'Event is Live Now!'}
                  {eventStatus === 'registration_closed' && 'Registration Closed'}
                  {eventStatus === 'registration_not_started' && 'Registration Opens Soon'}
                </h3>
              </div>
            )}
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
}