'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';

// Utility function to convert 24-hour time to 12-hour format
const convertTo12Hour = (time24) => {
  if (!time24) return time24;

  const [hours, minutes] = time24.split(':');
  const hour = parseInt(hours);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const hour12 = hour % 12 || 12;

  return `${hour12}:${minutes} ${ampm}`;
};

// Utility function to check if current time is between start and end time
const isCurrentlyLive = (startTime, endTime) => {
  if (!startTime || !endTime) return false;

  const now = new Date();
  const dayOfWeek = now.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday

  // Check if it's Monday to Friday (1-5)
  if (dayOfWeek === 0 || dayOfWeek === 6) {
    return false; // Not available on weekends
  }

  const currentHours = now.getHours();
  const currentMinutes = now.getMinutes();
  const currentTimeInMinutes = currentHours * 60 + currentMinutes;

  const [startHours, startMinutes] = startTime.split(':').map(Number);
  const startTimeInMinutes = startHours * 60 + startMinutes;

  const [endHours, endMinutes] = endTime.split(':').map(Number);
  const endTimeInMinutes = endHours * 60 + endMinutes;

  // Handle case where end time is past midnight (e.g., 22:00 - 02:00)
  if (endTimeInMinutes < startTimeInMinutes) {
    return currentTimeInMinutes >= startTimeInMinutes || currentTimeInMinutes <= endTimeInMinutes;
  }

  return currentTimeInMinutes >= startTimeInMinutes && currentTimeInMinutes <= endTimeInMinutes;
};

const MenuCategoriesPage = () => {
  const [categories, setCategories] = useState([]);
  const [happyHoursData, setHappyHoursData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Hardcoded categories as fallback
  const defaultCategories = [
    {
      id: 1,
      name: 'Food',
      image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=500&h=300&fit=crop',
      gradient: 'from-red-600/80 to-orange-600/80'
    },
    {
      id: 2,
      name: 'Beverages',
      image: 'https://images.unsplash.com/photo-1544145945-f90425340c7e?w=500&h=300&fit=crop',
      gradient: 'from-green-600/80 to-emerald-600/80'
    },
    {
      id: 3,
      name: 'Happy Hours',
      image: 'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?w=500&h=300&fit=crop',
      gradient: 'from-yellow-600/80 to-amber-600/80'
    },
    {
      id: 4,
      name: 'Dessert',
      image: 'https://images.unsplash.com/photo-1551024601-bec78aea704b?w=500&h=300&fit=crop',
      gradient: 'from-orange-600/80 to-red-600/80'
    }
  ];

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    // Fetch happy hours first, then menu data
    const hhData = await fetchHappyHoursData();
    await fetchMenuData(hhData);
  };

  const fetchMenuData = async (hhData = null) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/web/landing/menu/categories`);
      if (response.ok) {
        const data = await response.json();
        if (data?.success && data?.data?.categories) {
          // Map API data to our format - only show what's in database
          let apiCategories = data?.data?.categories?.map((cat, index) => ({
            id: index + 1,
            name: cat?.name,
            image: cat?.image || defaultCategories.find(dc => dc.name === cat?.name)?.image,
            gradient: defaultCategories.find(dc => dc.name === cat?.name)?.gradient || 'from-gray-600/80 to-gray-700/80',
            totalItems: cat?.totalItems
          })) || [];

          // Add Happy Hours if data is provided
          if (hhData?.exists) {
            const hasHappyHours = apiCategories.some(cat => cat.name === 'Happy Hours');
            if (!hasHappyHours) {
              const happyHoursCategory = {
                id: apiCategories.length + 1,
                name: 'Happy Hours',
                image: hhData.image || 'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?w=500&h=300&fit=crop',
                gradient: 'from-yellow-600/80 to-amber-600/80',
                totalItems: null
              };
              apiCategories = [...apiCategories, happyHoursCategory];
            }
          }

          setCategories(apiCategories);
        } else {
          setCategories([]);
        }
      } else {
        setCategories([]);
      }
    } catch (error) {
      console.error('Error fetching menu categories:', error);
      setCategories([]);
    }
  };

  const fetchHappyHoursData = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/web/landing/happyhours`);
      if (response.ok) {
        const data = await response.json();
        if (data?.success) {
          setHappyHoursData(data?.data);
          return data?.data; // Return the data for use in fetchMenuData
        }
      }
      return null;
    } catch (error) {
      console.error('Error fetching happy hours data:', error);
      return null;
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 pt-24 py-12 px-4">
      
      {/* Logo Section */}
      <div className="max-w-6xl mx-auto text-center mb-8">
        <div className="flex flex-col items-center justify-center mb-8">
          <img
            src="/logo.png"
            alt="The Velvet Lounge"
            className="w-32 h-32 md:w-40 md:h-40 object-contain mb-6 hover:scale-110 transition-transform duration-500"
          />

        </div>
        {/* <div className="w-32 h-1 bg-gradient-to-r from-amber-400 to-yellow-500 mx-auto rounded-full"></div> */}
      </div>

      {/* Header */}
      <div className="max-w-6xl mx-auto mb-16">
        <h1 className="text-6xl font-bold text-center mb-4 bg-gradient-to-r from-yellow-400 via-red-500 to-orange-500 bg-clip-text text-transparent">
          Our Menu
        </h1>
        <div className="w-32 h-1 bg-gradient-to-r from-yellow-400 to-red-500 mx-auto rounded-full"></div>
      </div>

      {/* Categories Grid */}
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {categories?.map((category) => {
          // Create URL-friendly category ID
          const categoryUrl = category?.name?.toLowerCase().replace(/\s+/g, '');
          // All categories from database are clickable
          const isClickable = true;

          // Check if Happy Hours is currently live based on time
          const isLive = category?.name === 'Happy Hours' && happyHoursData?.exists
            ? isCurrentlyLive(happyHoursData?.startTime, happyHoursData?.endTime)
            : false;

          const CategoryWrapper = isClickable ? Link : 'div';
          const linkProps = isClickable ? {
            href: `/menu/${category?.name === 'Happy Hours' ? 'happyhours' : categoryUrl}`
          } : {};

          return (
            <CategoryWrapper key={category?.id} {...linkProps}>
              <div className={`group relative overflow-hidden rounded-2xl shadow-2xl transform transition-all duration-500 ${
                isClickable
                  ? 'hover:scale-105 hover:shadow-3xl cursor-pointer'
                  : 'opacity-70 cursor-not-allowed'
              }`}>
                {/* Background Image */}
                <div
                  className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110 z-0"
                  style={{
                    backgroundImage: `url(${category?.image})`
                  }}
                />

                {/* Overlay Gradient */}
                <div className={`absolute inset-0 bg-gradient-to-t ${category?.gradient} opacity-70 group-hover:opacity-80 transition-opacity duration-500 z-10`} />

                {/* Animated Border */}
                <div className="absolute inset-0 rounded-2xl border-2 border-transparent group-hover:border-yellow-400 transition-all duration-500 z-20" />

                {/* Happy Hours Status Badge */}
                {category?.name === 'Happy Hours' && happyHoursData?.exists && (
                  <div className="absolute top-4 right-4 z-30">
                    <div className={`px-3 py-1 rounded-full text-xs font-bold ${
                      isLive
                        ? 'bg-green-500 text-white animate-pulse'
                        : 'bg-gray-800/80 text-yellow-300'
                    }`}>
                      {isLive
                        ? '🔴 LIVE'
                        : `⏰ ${convertTo12Hour(happyHoursData?.startTime)}`
                      }
                    </div>
                  </div>
                )}

                {/* Content */}
                <div className="relative h-64 flex flex-col items-center justify-center text-center p-6 z-20">
                  <h3 className="text-2xl font-bold text-white mb-2 transform transition-all duration-500 group-hover:scale-110 group-hover:text-yellow-300">
                    {category?.name}
                  </h3>



                  {/* Happy Hours additional info */}
                  {category?.name === 'Happy Hours' && happyHoursData?.exists && (
                    <p className="text-sm text-gray-200 opacity-90">
                      {isLive ? 'LIVE NOW' : `Available ${convertTo12Hour(happyHoursData?.startTime)} - ${convertTo12Hour(happyHoursData?.endTime)}`}
                    </p>
                  )}

                  {/* Clickable indicator */}


                  <div className="w-0 h-0.5 bg-yellow-400 transition-all duration-500 group-hover:w-full"></div>
                </div>

                {/* Glow Effect */}
                <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-30"
                     style={{
                       boxShadow: 'inset 0 0 50px rgba(255, 215, 0, 0.3)'
                     }} />
              </div>
            </CategoryWrapper>
          );
        })}
      </div>

      {/* Floating Particles Effect */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-40">
        {[...Array(20)].map((_, i) => (
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
      <Footer />
    </>
  );
};

export default MenuCategoriesPage;
