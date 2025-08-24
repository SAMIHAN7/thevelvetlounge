'use client';
import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Star, Clock, Flame, ChevronDown, ChevronUp } from 'lucide-react';

const RestaurantMenuSystem = () => {
  const [currentView, setCurrentView] = useState('categories');
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [expandedSections, setExpandedSections] = useState({
    appetizers: true,
    mains: true,
    desserts: true
  });

  const categories = [
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

  const foodSections = [
    {
      id: 'appetizers',
      name: 'Appetizers',
      icon: <Star className="w-5 h-5" />,
      items: [
        {
          id: 1,
          name: 'Truffle Arancini',
          description: 'Crispy risotto balls with truffle oil and parmesan',
          price: '$16',
          image: 'https://images.unsplash.com/photo-1541014741259-de529411b96a?w=400&h=300&fit=crop',
          isSpicy: false,
          prepTime: '15 min',
          rating: 4.8
        },
        {
          id: 2,
          name: 'Spicy Tuna Tartare',
          description: 'Fresh tuna with avocado, sesame, and sriracha aioli',
          price: '$22',
          image: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=400&h=300&fit=crop',
          isSpicy: true,
          prepTime: '10 min',
          rating: 4.9
        },
        {
          id: 3,
          name: 'Burrata Caprese',
          description: 'Fresh burrata with heirloom tomatoes and basil',
          price: '$18',
          image: 'https://images.unsplash.com/photo-1608897013039-887f21d8c804?w=400&h=300&fit=crop',
          isSpicy: false,
          prepTime: '8 min',
          rating: 4.7
        }
      ]
    },
    {
      id: 'mains',
      name: 'Main Course',
      icon: <Flame className="w-5 h-5" />,
      items: [
        {
          id: 4,
          name: 'Wagyu Ribeye',
          description: 'Premium wagyu with roasted vegetables and red wine jus',
          price: '$65',
          image: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=400&h=300&fit=crop',
          isSpicy: false,
          prepTime: '25 min',
          rating: 4.9
        },
        {
          id: 5,
          name: 'Lobster Thermidor',
          description: 'Fresh lobster with cognac cream sauce and herbs',
          price: '$48',
          image: 'https://images.unsplash.com/photo-1559847844-d5f0b0c2e4c2?w=400&h=300&fit=crop',
          isSpicy: false,
          prepTime: '30 min',
          rating: 4.8
        },
        {
          id: 6,
          name: 'Spicy Ramen Bowl',
          description: 'Rich tonkotsu broth with chashu pork and soft egg',
          price: '$28',
          image: 'https://images.unsplash.com/photo-1557872943-16a5ac26437e?w=400&h=300&fit=crop',
          isSpicy: true,
          prepTime: '20 min',
          rating: 4.6
        }
      ]
    },
    {
      id: 'desserts',
      name: 'Desserts',
      icon: <Star className="w-5 h-5" />,
      items: [
        {
          id: 7,
          name: 'Chocolate Lava Cake',
          description: 'Warm chocolate cake with molten center and vanilla ice cream',
          price: '$14',
          image: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=400&h=300&fit=crop',
          isSpicy: false,
          prepTime: '12 min',
          rating: 4.9
        },
        {
          id: 8,
          name: 'Tiramisu',
          description: 'Classic Italian dessert with coffee and mascarpone',
          price: '$12',
          image: 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=400&h=300&fit=crop',
          isSpicy: false,
          prepTime: '5 min',
          rating: 4.7
        }
      ]
    }
  ];

  const handleCategoryClick = (category) => {
    if (category.name === 'Food') {
      setSelectedCategory(category);
      setCurrentView('food');
    }
  };

  const handleBackToCategories = () => {
    setCurrentView('categories');
    setSelectedCategory(null);
  };

  const toggleSection = (sectionId) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionId]: !prev[sectionId]
    }));
  };

  const CategoryCard = ({ category, onClick }) => (
    <div
      onClick={() => onClick(category)}
      className="group relative overflow-hidden rounded-2xl shadow-2xl transform transition-all duration-500 hover:scale-105 hover:shadow-3xl cursor-pointer"
    >
      <div 
        className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110 z-0"
        style={{ backgroundImage: `url(${category.image})` }}
      />
      <div className={`absolute inset-0 bg-gradient-to-t ${category.gradient} opacity-70 group-hover:opacity-80 transition-opacity duration-500 z-10`} />
      <div className="absolute inset-0 rounded-2xl border-2 border-transparent group-hover:border-yellow-400 transition-all duration-500 z-20" />
      <div className="relative h-64 flex flex-col items-center justify-center text-center p-6 z-20">
        <h3 className="text-2xl font-bold text-white mb-2 transform transition-all duration-500 group-hover:scale-110 group-hover:text-yellow-300">
          {category.name}
        </h3>
        <div className="w-0 h-0.5 bg-yellow-400 transition-all duration-500 group-hover:w-full"></div>
      </div>
      <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-30" 
           style={{ boxShadow: 'inset 0 0 50px rgba(255, 215, 0, 0.3)' }} />
    </div>
  );

  const FoodItemCard = ({ item }) => (
    <div className="group relative overflow-hidden rounded-2xl shadow-2xl transform transition-all duration-500 hover:scale-105 hover:shadow-3xl cursor-pointer bg-gray-800/50 backdrop-blur-sm border border-gray-700/50">
      <div 
        className="h-48 bg-cover bg-center transition-transform duration-700 group-hover:scale-110"
        style={{ backgroundImage: `url(${item.image})` }}
      />
      <div className="absolute top-4 right-4 flex gap-2">
        {/* {item.isSpicy && (
          <div className="bg-red-600 text-white px-2 py-1 rounded-full text-xs flex items-center gap-1">
            <Flame className="w-3 h-3" />
            Spicy
          </div>
        )} */}
        {/* <div className="bg-yellow-600 text-white px-2 py-1 rounded-full text-xs flex items-center gap-1">
          <Star className="w-3 h-3" />
          {item.rating}
        </div> */}
      </div>
      
      <div className="p-6">
        <div className="flex justify-between items-start mb-2">
          <h4 className="text-xl font-bold text-white group-hover:text-yellow-400 transition-colors duration-300">
            {item.name}
          </h4>
          <span className="text-2xl font-bold text-yellow-400">{item.price}</span>
        </div>
        
        <p className="text-gray-300 text-sm mb-4 leading-relaxed">
          {item.description}
        </p>
        
        <div className="flex items-center justify-between">
          {/* <div className="flex items-center gap-1 text-gray-400 text-sm">
            <Clock className="w-4 h-4" />
            {item.prepTime}
          </div>
          <button className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white px-4 py-2 rounded-full text-sm font-semibold hover:from-yellow-600 hover:to-orange-600 transition-all duration-300 transform hover:scale-105">
            Add to Cart
          </button> */}
        </div>
      </div>
    </div>
  );

  if (currentView === 'categories') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 py-12 px-4">
        <div className="max-w-6xl mx-auto mb-16">
          <h1 className="text-6xl font-bold text-center mb-4 bg-gradient-to-r from-yellow-400 via-red-500 to-orange-500 bg-clip-text text-transparent">
            Our Menu
          </h1>
          <div className="w-32 h-1 bg-gradient-to-r from-yellow-400 to-red-500 mx-auto rounded-full"></div>
        </div>

        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {categories.map((category) => (
            <CategoryCard key={category.id} category={category} onClick={handleCategoryClick} />
          ))}
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

        <div className="max-w-6xl mx-auto mt-16">
          <div className="h-px bg-gradient-to-r from-transparent via-yellow-400 to-transparent opacity-30"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 py-12 px-4">
      {/* Header with Back Button */}
      <div className="max-w-6xl mx-auto mb-12">
        <button
          onClick={handleBackToCategories}
          className="flex items-center gap-2 text-yellow-400 hover:text-yellow-300 transition-colors duration-300 mb-8 group"
        >
          <ChevronLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform duration-300" />
          Back to Categories
        </button>
        
        <h1 className="text-5xl font-bold text-center mb-4 bg-gradient-to-r from-yellow-400 via-red-500 to-orange-500 bg-clip-text text-transparent">
          Food Menu
        </h1>
        <div className="w-32 h-1 bg-gradient-to-r from-yellow-400 to-red-500 mx-auto rounded-full"></div>
      </div>

      {/* Mobile Horizontal Carousel */}
      <div className="md:hidden mb-8">
        <div className="flex gap-4 overflow-x-auto pb-4 px-4 scrollbar-hide">
          {categories.map((category) => (
            <div key={category.id} className="min-w-[280px]">
              <CategoryCard category={category} onClick={handleCategoryClick} />
            </div>
          ))}
        </div>
      </div>

      {/* Food Sections */}
      <div className="max-w-6xl mx-auto space-y-8">
        {foodSections.map((section) => (
          <div key={section.id} className="space-y-6">
            {/* Section Header with Dropdown */}
            <div className="text-center">
              <button
                onClick={() => toggleSection(section.id)}
                className="group flex items-center justify-center gap-3 mb-4 hover:scale-105 transition-transform duration-300 cursor-pointer"
              >
                <div className="text-yellow-400 group-hover:text-yellow-300 transition-colors duration-300">
                  {section.icon}
                </div>
                <h2 className="text-4xl font-bold text-white group-hover:text-yellow-400 transition-colors duration-300">
                  {section.name}
                </h2>
                <div className="text-yellow-400 group-hover:text-yellow-300 transition-colors duration-300">
                  {section.icon}
                </div>
                <div className="ml-2 text-yellow-400 group-hover:text-yellow-300 transition-all duration-300">
                  {expandedSections[section.id] ? (
                    <ChevronUp className="w-6 h-6" />
                  ) : (
                    <ChevronDown className="w-6 h-6" />
                  )}
                </div>
              </button>
              <div className="w-24 h-0.5 bg-gradient-to-r from-yellow-400 to-red-500 mx-auto"></div>
            </div>

            {/* Food Items Grid with Smooth Transition */}
            <div className={`overflow-hidden transition-all duration-500 ease-in-out ${
              expandedSections[section.id] 
                ? 'max-h-none opacity-100' 
                : 'max-h-0 opacity-0'
            }`}>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pt-4">
                {section.items.map((item) => (
                  <FoodItemCard key={item.id} item={item} />
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Floating Particles Effect */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-40">
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

      {/* Bottom Decorative Element */}
      <div className="max-w-6xl mx-auto mt-16">
        <div className="h-px bg-gradient-to-r from-transparent via-yellow-400 to-transparent opacity-30"></div>
      </div>

      <style jsx>{`
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
};

export default RestaurantMenuSystem;