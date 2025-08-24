'use client';
import { useState, useEffect } from 'react';
import { Calendar, Clock, Sparkles, Lock, Music, Phone, User, Mail } from 'lucide-react';
import { useParams } from 'next/navigation';

export default function EventRegistrationPage() {
  const params = useParams();
  const eventId = params.id;
  
  const [step, setStep] = useState(1); // 1: phone, 2: details (if new user), 3: success
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
  const [eventStatus, setEventStatus] = useState('checking'); // 'upcoming', 'ongoing', 'past', 'checking'

  // Fetch event data on component mount
  useEffect(() => {
    const fetchEventData = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000'}/web/landing/registration/event/${eventId}`);
        const result = await response.json();
        
        if (result.success) {
          const event = result.data;
          const eventWithDates = {
            ...event,
            startTime: new Date(event.startTime),
            endTime: new Date(event.endTime),
            registrationStart: new Date(event.registrationStart),
            registrationEnd: new Date(event.registrationEnd)
          };
          setEventData(eventWithDates);
          
          // Determine event status
          const now = new Date();
          if (now > eventWithDates.endTime) {
            setEventStatus('past');
          } else if (now >= eventWithDates.startTime && now <= eventWithDates.endTime) {
            setEventStatus('ongoing');
          } else if (now < eventWithDates.startTime) {
            // Check if registration is still open for upcoming events
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
        console.error('Error fetching event:', err);
        setError('Failed to connect to server');
      }
    };

    if (eventId) {
      fetchEventData();
    }
  }, [eventId]);


  const handlePhoneSubmit = async (e) => {
    if (e && e.preventDefault) {
      e.preventDefault();
    }
    
    console.log('=== PHONE SUBMIT START ===');
    console.log('Current error state:', error);
    console.log('Phone submit called with:', phoneNumber, 'Length:', phoneNumber.length, 'Type:', typeof phoneNumber);
    
    // Clear error state first
    setError('');
    console.log('\u2705 Error state cleared');
    
    console.log('Validation check 1: phoneNumber exists?', !!phoneNumber);
    console.log('Validation check 2: phoneNumber value:', JSON.stringify(phoneNumber));
    console.log('Validation check 3: phoneNumber.toString():', phoneNumber.toString());
    console.log('Validation check 4: phoneNumber.toString().length:', phoneNumber.toString().length);
    console.log('Validation check 5: length === 10?', phoneNumber.toString().length === 10);
    
    if (!phoneNumber) {
      const errorMsg = 'VALIDATION: Phone number is empty';
      console.log('\u274c Validation failed - phoneNumber is falsy:', phoneNumber);
      setError(errorMsg);
      return;
    }
    
    const phoneStr = phoneNumber.toString();
    if (phoneStr.length !== 10) {
      const errorMsg = `VALIDATION: Phone length is ${phoneStr.length}, not 10`;
      console.log('\u274c Validation failed - length:', phoneStr.length, 'value:', phoneStr);
      setError(errorMsg);
      return;
    }
    
    // Additional validation - check if it's all digits
    console.log('Format validation: testing', phoneStr, 'against /^[0-9]{10}$/');
    const isValidFormat = /^[0-9]{10}$/.test(phoneStr);
    console.log('Format validation result:', isValidFormat);
    
    if (!isValidFormat) {
      const errorMsg = `FORMAT: Invalid format - contains non-digits: '${phoneStr}'`;
      console.log('\u274c Validation failed - not all digits:', phoneStr);
      setError(errorMsg);
      return;
    }
    
    console.log('\u2705 Phone validation passed, proceeding with API call');

    if (loading) {
      console.log('Already loading, skipping...');
      return;
    }

    setLoading(true);

    try {
      console.log('📡 Making API call to verify phone:', phoneNumber);
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000'}/web/landing/registration/verify-phone`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ phone: phoneNumber })
      });

      console.log('📡 API response status:', response.status);
      
      if (!response.ok) {
        console.log('❌ API response not ok:', response.status, response.statusText);
        setError(`Server error: ${response.status}`);
        return;
      }
      
      const result = await response.json();
      console.log('📡 API response data:', result);
      
      if (result.success) {
        if (result.userExists) {
          setUserExists(true);
          setUserData(result.data);
          console.log('User exists, proceeding to final registration');
          // Skip to registration step for existing users
          handleFinalRegistration(result.data);
        } else {
          setUserExists(false);
          console.log('New user, going to step 2');
          setStep(2); // Go to details collection step
        }
      } else {
        console.error('API error:', result);
        setError(result.message || 'Phone verification failed');
      }
    } catch (err) {
      console.error('❌ Phone verification error:', err);
      if (err.name === 'TypeError' && err.message.includes('fetch')) {
        setError('❌ Cannot connect to server. Please make sure the backend server is running on port 5000.');
      } else {
        setError(`❌ Error: ${err.message}`);
      }
    } finally {
      console.log('🔄 Setting loading to false');
      setLoading(false);
    }
  };

  const handleDetailsSubmit = async (e) => {
    e.preventDefault();
    handleFinalRegistration();
  };

  const handleFinalRegistration = async (existingUser = null) => {
    setLoading(true);
    setError('');

    const registrationData = {
      phone: phoneNumber,
      eventId: eventId
    };

    if (!existingUser) {
      registrationData.name = formData.name;
      registrationData.email = formData.email;
    }

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000'}/web/landing/registration/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(registrationData)
      });

      const result = await response.json();
      
      if (result.success) {
        setSuccessMessage(result.message);
        setStep(3);
        setShowBlast(true);
      } else {
        setError(result.message || 'Registration failed');
      }
    } catch (err) {
      console.error('Registration error:', err);
      setError('Failed to register for event');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
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
      const distance = eventData.registrationEnd - now;

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

  // Blast animation component
  const BlastAnimation = () => {
    const [particles, setParticles] = useState([]);
    
    useEffect(() => {
      if (showBlast) {
        const newParticles = Array.from({ length: 50 }, (_, i) => ({
          id: i,
          x: Math.random() * window.innerWidth,
          y: Math.random() * window.innerHeight,
          color: ['#ff6b35', '#f7931e', '#ffd700', '#ff1744', '#9c27b0'][Math.floor(Math.random() * 5)],
          size: Math.random() * 10 + 5,
          velocity: {
            x: (Math.random() - 0.5) * 10,
            y: (Math.random() - 0.5) * 10
          }
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
            0% {
              opacity: 1;
              transform: scale(0);
            }
            50% {
              opacity: 1;
              transform: scale(1);
            }
            100% {
              opacity: 0;
              transform: scale(1.5);
            }
          }
          @keyframes fadeInUp {
            0% {
              opacity: 0;
              transform: translateY(20px);
            }
            100% {
              opacity: 1;
              transform: translateY(0);
            }
          }
          .animate-fadeInUp {
            animation: fadeInUp 0.5s ease-out forwards;
          }
        `}</style>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white relative overflow-hidden">
      {/* Blast Animation */}
      <BlastAnimation />
      
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-red-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
        <div className="absolute top-1/3 right-1/4 w-72 h-72 bg-yellow-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse delay-1000"></div>
        <div className="absolute bottom-1/4 left-1/3 w-80 h-80 bg-green-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse delay-2000"></div>
        <div className="absolute bottom-1/3 right-1/3 w-64 h-64 bg-orange-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse delay-3000"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Sparkles className="text-yellow-400 w-8 h-8" />
            <h1 className="text-5xl font-bold bg-gradient-to-r from-red-400 via-yellow-400 to-orange-400 bg-clip-text text-transparent">
              CLUB PARADISE
            </h1>
            <Sparkles className="text-yellow-400 w-8 h-8" />
          </div>
          <p className="text-gray-300 text-lg">Where Music Meets Magic</p>
        </div>

        {/* Main */}
        <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-8">
          {/* Event Details */}
          <div className="space-y-6">
            <div className="relative h-80 rounded-2xl overflow-hidden group">
              <img
                src={eventData.images[currentImageIndex]}
                alt="Event"
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              <div className="absolute bottom-4 left-4 right-4 flex space-x-2">
                {eventData.images.map((_, i) => (
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
                <h2 className="text-3xl font-bold text-white">{eventData.name}</h2>
              </div>
              <p className="text-gray-300 mb-6 leading-relaxed">{eventData.description}</p>

              {/* Date & Time */}
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Calendar className="text-yellow-400 w-5 h-5" />
                  <span className="text-gray-300">Event Date:</span>
                  <span className="text-white font-semibold">{formatDateTime(eventData.startTime)}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Clock className="text-orange-400 w-5 h-5" />
                  <span className="text-gray-300">Time:</span>
                  <span className="text-white font-semibold">
                    {eventData.startTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })} - 
                    {eventData.endTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <Lock className="text-green-400 w-5 h-5" />
                  <span className="text-gray-300">Registration Ends In:</span>
                  <span className="text-yellow-400 font-bold bg-yellow-400/10 px-3 py-1 rounded-full animate-pulse text-lg shadow-md">
                    {countdown}
                  </span>
                </div>
                
              </div>
            </div>
          </div>

          {/* Registration Form */}
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-8 border border-gray-700 h-fit">
            {/* Error Message */}
            {error && (
              <div className="mb-4 p-4 bg-red-500/20 border border-red-500 rounded-lg text-red-300">
                <div className="text-sm text-red-200 mb-1">Error Debug:</div>
                <div>{error}</div>
                <button 
                  onClick={() => setError('')} 
                  className="text-xs text-red-200 underline mt-2"
                >
                  Clear Error
                </button>
              </div>
            )}

            {/* Past Event Message */}
            {eventStatus === 'past' && (
              <div className="text-center py-8">
                <div className="w-20 h-20 bg-gradient-to-r from-gray-500 to-gray-600 rounded-full mx-auto flex items-center justify-center mb-4">
                  <Clock className="w-10 h-10 text-gray-300" />
                </div>
                <h3 className="text-2xl font-bold text-gray-400 mb-4">Event Has Ended</h3>
                <div className="bg-gray-700/50 border border-gray-600 rounded-lg p-4 mb-6">
                  <p className="text-gray-300 mb-2">
                    This event took place from:
                  </p>
                  <p className="text-white font-semibold">
                    {formatDateTime(eventData.startTime)} to {formatDateTime(eventData.endTime)}
                  </p>
                </div>
                <div className="space-y-2 text-sm text-gray-400">
                  <p>🎉 Thanks to everyone who attended!</p>
                  <p>📷 Check out our gallery for event photos</p>
                  <p>🔔 Follow us for upcoming events</p>
                </div>
              </div>
            )}

            {/* Ongoing Event Message */}
            {eventStatus === 'ongoing' && (
              <div className="text-center py-8">
                <div className="w-20 h-20 bg-gradient-to-r from-red-500 to-orange-500 rounded-full mx-auto flex items-center justify-center mb-4 animate-pulse">
                  <Music className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-2xl font-bold bg-gradient-to-r from-red-400 to-orange-400 bg-clip-text text-transparent mb-4">
                  Event is Live Now!
                </h3>
                <div className="bg-gradient-to-r from-red-500/20 to-orange-500/20 border border-red-500/50 rounded-lg p-4 mb-6">
                  <p className="text-red-300 text-lg font-semibold mb-2">
                    🔥 The party is happening right now!
                  </p>
                  <p className="text-gray-300">
                    Event started: {formatDateTime(eventData.startTime)}
                  </p>
                  <p className="text-gray-300">
                    Ends: {formatDateTime(eventData.endTime)}
                  </p>
                </div>
                <div className="space-y-3">
                  <div className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-500/50 rounded-lg p-3">
                    <p className="text-yellow-300 font-medium">🎤 Registration is closed</p>
                    <p className="text-gray-300 text-sm">The event is already in progress</p>
                  </div>
                  <div className="text-sm text-gray-400 space-y-1">
                    <p>🎵 Feel the beats pumping</p>
                    <p>🎆 Experience the energy</p>
                    <p>💃 Dance the night away</p>
                  </div>
                </div>
              </div>
            )}

            {/* Registration Not Started Message */}
            {eventStatus === 'registration_not_started' && (
              <div className="text-center py-8">
                <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full mx-auto flex items-center justify-center mb-4">
                  <Calendar className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mb-4">
                  Registration Opens Soon
                </h3>
                <div className="bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-blue-500/50 rounded-lg p-4 mb-6">
                  <p className="text-blue-300 text-lg font-semibold mb-3">
                    🕒 Get ready to register!
                  </p>
                  <div className="space-y-2 text-gray-300">
                    <p><span className="text-blue-400 font-medium">Event Date:</span> {formatDateTime(eventData.startTime)}</p>
                    <p><span className="text-blue-400 font-medium">Registration Opens:</span> {formatDateTime(eventData.registrationStart)}</p>
                  </div>
                </div>
                <div className="space-y-2 text-sm text-gray-400">
                  <p>🔔 Set a reminder to register early</p>
                  <p>✨ Limited spots available</p>
                  <p>🎉 Don't miss out on this amazing event</p>
                </div>
              </div>
            )}

            {/* Registration Closed Message */}
            {eventStatus === 'registration_closed' && (
              <div className="text-center py-8">
                <div className="w-20 h-20 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full mx-auto flex items-center justify-center mb-4">
                  <Lock className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-2xl font-bold bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent mb-4">
                  Registration Closed
                </h3>
                <div className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-500/50 rounded-lg p-4 mb-6">
                  <p className="text-yellow-300 text-lg font-semibold mb-3">
                    😔 Sorry, registration has ended
                  </p>
                  <div className="space-y-2 text-gray-300">
                    <p><span className="text-yellow-400 font-medium">Event Date:</span> {formatDateTime(eventData.startTime)}</p>
                    <p><span className="text-yellow-400 font-medium">Registration Ended:</span> {formatDateTime(eventData.registrationEnd)}</p>
                  </div>
                </div>
                <div className="space-y-2 text-sm text-gray-400">
                  <p>👀 Follow us for future events</p>
                  <p>📧 Join our newsletter for early access</p>
                  <p>🚀 Next event announcement coming soon</p>
                </div>
              </div>
            )}

            {/* Registration Form - Only for upcoming events */}
            {eventStatus === 'upcoming' && (
              <>
                {/* Step 1: Phone Number Input */}
                {step === 1 && (
              <>
                <div className="text-center mb-6">
                  <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full mx-auto mb-4 flex items-center justify-center">
                    <Sparkles className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent mb-2">
                    Register Now
                  </h3>
                  <p className="text-gray-300">Enter your phone number to secure your spot</p>
                </div>

                <form onSubmit={handlePhoneSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Phone Number</label>
                    <input
                      type="tel"
                      value={phoneNumber}
                      onChange={(e) => {
                        const value = e.target.value.replace(/\D/g, '').slice(0, 10);
                        setPhoneNumber(value);
                        setError('');
                        
                        // Auto-submit when 10 digits are entered
                        if (value.length === 10 && !loading) {
                          console.log('🚀 10 digits entered, triggering auto-submit in 800ms');
                          setTimeout(() => {
                            console.log('⏰ Auto-submit timeout triggered');
                            handlePhoneSubmit({ preventDefault: () => {} });
                          }, 800);
                        }
                      }}
                      placeholder="1234567890"
                      className="w-full px-4 py-3 bg-gray-900/50 border border-gray-600 rounded-lg text-white text-center text-lg tracking-wider"
                      required
                      maxLength={10}
                    />
                  </div>

                  {phoneNumber.length === 10 && loading && (
                    <div className="text-center text-green-400 text-sm py-2 animate-pulse">
                      🔄 Processing your registration...
                    </div>
                  )}
                  {phoneNumber.length === 10 && !loading && (
                    <div className="text-center text-green-400 text-sm py-2">
                      ✨ Ready to register!
                    </div>
                  )}
                  {phoneNumber.length > 0 && phoneNumber.length < 10 && (
                    <div className="text-center text-gray-400 text-sm py-2">
                      {10 - phoneNumber.length} more digits needed
                    </div>
                  )}
                  
                  {/* Debug info */}
                  <div className="text-xs text-gray-500 text-center space-y-1">
                    <div>Debug: '{phoneNumber}' (Length: {phoneNumber.length}, Valid: {phoneNumber.length === 10 ? 'Yes' : 'No'})</div>
                    <div>Loading: {loading ? 'Yes' : 'No'} | Error: {error ? 'Yes' : 'No'}</div>
                    <div>Step: {step} | EventStatus: {eventStatus}</div>
                  </div>
                  
                  {/* Manual submit button as backup */}
                  {phoneNumber.length === 10 && !loading && (
                    <button
                      type="button"
                      onClick={() => {
                        const inputElement = document.querySelector('input[type="tel"]');
                        const actualValue = inputElement?.value?.replace(/\D/g, '') || '';
                        console.log('Manual button clicked:');
                        console.log('  - phoneNumber state:', phoneNumber, 'length:', phoneNumber.length);
                        console.log('  - input field value:', actualValue, 'length:', actualValue.length);
                        
                        // Use the actual input value instead of state
                        if (actualValue.length === 10) {
                          setPhoneNumber(actualValue);
                          setTimeout(() => {
                            handlePhoneSubmit({ preventDefault: () => {} });
                          }, 100);
                        } else {
                          handlePhoneSubmit({ preventDefault: () => {} });
                        }
                      }}
                      className="w-full py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white font-semibold rounded-lg hover:scale-105 transition-all"
                    >
                      Complete Registration
                    </button>
                  )}
                </form>
              </>
            )}

            {/* Step 2: User Details Form (for new users) */}
            {step === 2 && (
              <>
                <div className="text-center mb-6">
                  <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-teal-500 rounded-full mx-auto mb-4 flex items-center justify-center">
                    <User className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent mb-2">
                    Complete Your Profile
                  </h3>
                  <p className="text-gray-300">Tell us a bit about yourself</p>
                  <p className="text-sm text-blue-400 mt-2">Phone: {phoneNumber}</p>
                </div>

                <form onSubmit={handleDetailsSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      <User className="w-4 h-4 inline mr-2" />
                      Full Name
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 bg-gray-900/50 border border-gray-600 rounded-lg text-white"
                      required
                      placeholder="Enter your full name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      <Mail className="w-4 h-4 inline mr-2" />
                      Email Address
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 bg-gray-900/50 border border-gray-600 rounded-lg text-white"
                      required
                      placeholder="Enter your email"
                    />
                  </div>


                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => setStep(1)}
                      className="flex-1 py-3 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-all"
                    >
                      Back
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="flex-1 py-3 bg-gradient-to-r from-green-500 via-teal-500 to-blue-500 text-white font-bold rounded-lg hover:scale-105 transition-all disabled:opacity-50"
                    >
                      {loading ? 'Registering...' : 'Register Now'}
                    </button>
                  </div>
                </form>
              </>
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
                  <p className="text-green-300 text-lg font-semibold mb-2">{successMessage}</p>
                  <p className="text-gray-300">Welcome to {eventData.name}!</p>
                </div>
                <div className="space-y-2 text-sm text-gray-400 mb-6">
                  <p>📱 Phone: {phoneNumber}</p>
                  <p>📅 Event: {eventData.name}</p>
                  <p>🎯 Status: Registered</p>
                </div>
                <button
                  onClick={() => {
                    setStep(1);
                    setPhoneNumber('');
                    setFormData({ name: '', email: '' });
                    setError('');
                    setSuccessMessage('');
                  }}
                  className="px-8 py-3 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg hover:scale-105 transition-all"
                >
                  Register Another
                </button>
              </div>
            )}
              </>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-12 text-gray-400">
          <p>© 2024 Club Paradise. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
}