'use client';
import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Star, Clock, Flame, ChevronDown, ChevronUp, Search, Filter } from 'lucide-react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import Navbar from '../../../components/Navbar';
import Footer from '../../../components/Footer';

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

// Function to render food type icon
const getFoodTypeIcon = (type) => {
  switch (type) {
    case 'Veg':
      return (
        <div className="w-4 h-4 border-2 border-green-500 flex items-center justify-center">
          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
        </div>
      );
    case 'Non-Veg':
      return (
        <div className="w-4 h-4 border-2 border-red-500 flex items-center justify-center">
          <div className="w-2 h-2 bg-red-500 rounded-full"></div>
        </div>
      );
    case 'Egg':
      return (
        <div className="w-4 h-4 border-2 border-yellow-500 flex items-center justify-center">
          <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
        </div>
      );
    default:
      return null;
  }
};

const RestaurantMenuSystem = () => {
  const params = useParams();
  const router = useRouter();
  const categoryId = params.id;

  const [currentView, setCurrentView] = useState('food');
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [expandedSections, setExpandedSections] = useState({});
  const [foodSections, setFoodSections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [happyHoursData, setHappyHoursData] = useState(null);
  const [categoryNotFound, setCategoryNotFound] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('All');
  const [filteredSections, setFilteredSections] = useState([]);

  // Calculate if Happy Hours is currently live based on time
  const isLive = happyHoursData?.exists && happyHoursData?.startTime && happyHoursData?.endTime
    ? isCurrentlyLive(happyHoursData.startTime, happyHoursData.endTime)
    : false;

  useEffect(() => {
    if (categoryId) {
      fetchAllData();
    }
  }, [categoryId]);

  // Filter and search functionality
  useEffect(() => {
    if (foodSections.length === 0) {
      setFilteredSections([]);
      return;
    }

    let filtered = foodSections.map(section => {
      let filteredItems = section.items;

      // Apply food type filter
      if (selectedFilter !== 'All') {
        filteredItems = filteredItems.filter(item => {
          // For items without options, check the item type directly
          if (!item.hasOptions) {
            return item.type === selectedFilter;
          }

          // For items with options, check if ANY variant matches the selected type
          if (item.optionGroups && item.optionGroups.length > 0) {
            return item.optionGroups.some(group =>
              group.variants && group.variants.some(variant =>
                variant.type === selectedFilter
              )
            );
          }

          return false;
        });
      }

      // Apply search filter
      if (searchTerm) {
        filteredItems = filteredItems.filter(item => {
          const searchLower = searchTerm.toLowerCase();

          // Search in item name and description
          const matchesNameOrDesc = item.name.toLowerCase().includes(searchLower) ||
            (item.description && item.description.toLowerCase().includes(searchLower));

          // Search in option groups and variants
          const matchesOptions = item.hasOptions && item.optionGroups &&
            item.optionGroups.some(group =>
              (group.title && group.title.toLowerCase().includes(searchLower)) ||
              (group.description && group.description.toLowerCase().includes(searchLower)) ||
              (group.variants && group.variants.some(variant =>
                variant.name.toLowerCase().includes(searchLower)
              ))
            );

          return matchesNameOrDesc || matchesOptions;
        });
      }

      return {
        ...section,
        items: filteredItems
      };
    });

    // Remove sections with no items
    filtered = filtered.filter(section => section.items.length > 0);
    setFilteredSections(filtered);
  }, [foodSections, searchTerm, selectedFilter]);

  const fetchAllData = async () => {
    await Promise.all([fetchCategoryMenuData(), fetchHappyHoursData(), fetchCategoriesData()]);
  };

  const fetchCategoriesData = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000'}/web/landing/menu/categories`);
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data.categories) {
          const apiCategories = data.data.categories.map((cat, index) => ({
            id: index + 1,
            name: cat.name,
            image: cat.image || defaultCategories.find(dc => dc.name === cat.name)?.image,
            gradient: defaultCategories.find(dc => dc.name === cat.name)?.gradient || 'from-gray-600/80 to-gray-700/80',
            totalItems: cat.totalItems
          }));
          setCategoriesData(apiCategories);
        } else {
          setCategoriesData([]);
        }
      } else {
        setCategoriesData([]);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
      setCategoriesData([]);
    }
  };

  const addHappyHoursCategory = (existingCategories) => {
    if (happyHoursData && happyHoursData.exists) {
      const hasHappyHours = existingCategories.some(cat => cat.name === 'Happy Hours');
      if (!hasHappyHours) {
        const happyHoursCategory = {
          id: existingCategories.length + 1,
          name: 'Happy Hours',
          image: happyHoursData.image || 'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?w=500&h=300&fit=crop',
          gradient: 'from-yellow-600/80 to-amber-600/80',
          totalItems: null
        };
        return [...existingCategories, happyHoursCategory];
      }
    }
    return existingCategories;
  };

  // Update categories when happy hours data changes
  useEffect(() => {
    if (categories.length > 0 || (happyHoursData !== null)) {
      setCategoriesData(prevCategories => addHappyHoursCategory(prevCategories));
    }
  }, [happyHoursData]);


  const fetchAllMenuItemsForHappyHours = async () => {
    try {
      // Fetch all menu categories
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000'}/web/landing/menu/categories`);
      if (response.ok) {
        const categoriesData = await response.json();
        if (categoriesData.success && categoriesData.data.categories) {
          setSelectedCategory({ name: 'Happy Hours' });

          const allHappyHourSections = [];

          // Fetch each category's full data
          for (const category of categoriesData.data.categories) {
            try {
              const categoryResponse = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000'}/web/landing/menu/${category.name}`);
              if (categoryResponse.ok) {
                const categoryData = await categoryResponse.json();
                if (categoryData.success && categoryData.data.subcategories) {

                  categoryData.data.subcategories.forEach((subcategory, subIndex) => {
                    // Filter items that have happy hour pricing or are marked for happy hours
                    const happyHourItems = subcategory.items.filter(item => 
                      item.price && (item.price.happyHour || item.price.isHappyHourActive)
                    );

                    if (happyHourItems.length > 0) {
                      const sectionId = `${category.name.toLowerCase().replace(/\s+/g, '')}-${subcategory.name.toLowerCase().replace(/\s+/g, '')}`;

                      allHappyHourSections.push({
                        id: sectionId,
                        name: `${category.name} - ${subcategory.name}`,
                        icon: subIndex === 0 ? <Clock className="w-5 h-5" /> : <Flame className="w-5 h-5" />,
                        categoryName: category.name,
                        items: happyHourItems.map(item => ({
                          id: item._id,
                          name: item.name,
                          description: item.description || 'Happy Hour special item',
                          price: isLive && item.price.happyHour
                            ? `₹${item.price.happyHour}`
                            : `₹${item.price.standard}`,
                          originalPrice: isLive && item.price.happyHour
                            ? `₹${item.price.standard}`
                            : null,
                          image: item.image || 'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?w=400&h=300&fit=crop',
                          isSpicy: item.type === 'Non-Veg',
                          prepTime: happyHoursData ? `${convertTo12Hour(happyHoursData.startTime)} - ${convertTo12Hour(happyHoursData.endTime)}` : '15-20 min',
                          rating: 4.8,
                          isHappyHour: true,
                          type: item.type,
                          isCurrentlyDiscounted: isLive && item.price.happyHour,
                          happyHourPrice: item.price.happyHour,
                          standardPrice: item.price.standard,
                          isHappyHourActive: item.price.isHappyHourActive
                        }))
                      });
                    }
                  });
                }
              }
            } catch (err) {
              console.error(`Error fetching category ${category.name}:`, err);
            }
          }

          if (allHappyHourSections.length > 0) {
            setFoodSections(allHappyHourSections);

            // Set expanded sections - first section expanded by default
            const newExpandedSections = {};
            allHappyHourSections.forEach((section, index) => {
              newExpandedSections[section.id] = index === 0;
            });
            setExpandedSections(newExpandedSections);
          } else {
            setCategoryNotFound(true);
          }
        } else {
          setCategoryNotFound(true);
        }
      } else {
        setCategoryNotFound(true);
      }
    } catch (error) {
      console.error('Error fetching all menu items for happy hours:', error);
      setCategoryNotFound(true);
    }
  };

  const fetchHappyHoursMenu = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000'}/web/landing/happyhours/menu`);
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data.categories && data.data.categories.length > 0) {
          setSelectedCategory({ name: 'Happy Hours' });

          // Map Happy Hours categories to food sections format
          const happyHourSections = [];

          data.data.categories.forEach(category => {
            category.subcategories.forEach((subcategory, subIndex) => {
              const sectionId = `${category.category.toLowerCase().replace(/\s+/g, '')}-${subcategory.name.toLowerCase().replace(/\s+/g, '')}`;

              happyHourSections.push({
                id: sectionId,
                name: `${category.category} - ${subcategory.name}`,
                icon: subIndex === 0 ? <Clock className="w-5 h-5" /> : <Flame className="w-5 h-5" />,
                categoryName: category.category,
                items: subcategory.items.map(item => ({
                  id: item._id,
                  name: item.name,
                  description: item.description || 'Happy Hour special item',
                  price: data.data.happyHoursConfig.isLive && item.isCurrentlyDiscounted 
                    ? `₹${item.happyHourPrice}` 
                    : `₹${item.currentPrice}`,
                  originalPrice: item.standardPrice !== item.currentPrice ? `₹${item.standardPrice}` : null,
                  image: item.image || 'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?w=400&h=300&fit=crop',
                  isSpicy: item.type === 'Non-Veg',
                  prepTime: `${convertTo12Hour(data.data.happyHoursConfig.startTime)} - ${convertTo12Hour(data.data.happyHoursConfig.endTime)}`,
                  rating: 4.8,
                  isHappyHour: true,
                  type: item.type,
                  isCurrentlyDiscounted: item.isCurrentlyDiscounted,
                  happyHourPrice: item.happyHourPrice,
                  standardPrice: item.standardPrice
                }))
              });
            });
          });

          setFoodSections(happyHourSections);

          // Set expanded sections - first section expanded by default
          const newExpandedSections = {};
          happyHourSections.forEach((section, index) => {
            newExpandedSections[section.id] = index === 0;
          });
          setExpandedSections(newExpandedSections);

        } else {
          // No specific happy hour items found, fallback to showing all menu items with happy hour pricing
          await fetchAllMenuItemsForHappyHours();
        }
      } else {
        setCategoryNotFound(true);
      }
    } catch (error) {
      console.error('Error fetching happy hours menu:', error);
      setCategoryNotFound(true);
    }
  };


  const fetchCategoryMenuData = async () => {
    try {
      // Handle special case for Happy Hours
      if (categoryId.toLowerCase() === 'happyhours' || categoryId.toLowerCase() === 'happy-hours') {
        await fetchHappyHoursMenu();
        return;
      }

      // For regular categories, fetch from API using categoryId
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000'}/web/landing/menu/${categoryId}`);
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data.subcategories) {
          // Set the selected category
          setSelectedCategory({ name: data.data.category });

          // Map API data to our foodSections format
          const mappedSections = data.data.subcategories.map((subcat, index) => ({
            id: subcat.name.toLowerCase().replace(/\s+/g, ''),
            name: subcat.name,
            icon: index === 0 ? <Star className="w-5 h-5" /> : <Flame className="w-5 h-5" />,
            items: subcat.items.map(item => ({
              id: item._id || item.id,
              name: item.name,
              description: item.description || '',
              // Include hasOptions and optionGroups from API
              hasOptions: item.hasOptions || false,
              optionGroups: item.optionGroups || [],
              // Regular price (for non-option items)
              price: item.hasOptions ? null : (isLive && item.price?.happyHour
                ? `₹${item.price.happyHour}`
                : `₹${item.price?.standard}`),
              originalPrice: item.hasOptions ? null : (isLive && item.price?.happyHour
                ? `₹${item.price.standard}`
                : null),
              image: item.image || 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400&h=300&fit=crop',
              isSpicy: item.isSpicy || false,
              prepTime: item.prepTime || '15 min',
              rating: item.rating || 4.5,
              type: item.type,
              isCurrentlyDiscounted: !item.hasOptions && isLive && item.price?.happyHour,
              isHappyHour: !item.hasOptions && isLive && item.price?.happyHour,
              happyHourPrice: item.price?.happyHour,
              standardPrice: item.price?.standard
            }))
          }));
          setFoodSections(mappedSections);

          // Update expanded sections based on API data
          const newExpandedSections = {};
          mappedSections.forEach((section, index) => {
            newExpandedSections[section.id] = index === 0; // First section expanded by default
          });
          setExpandedSections(newExpandedSections);
        } else {
          setCategoryNotFound(true);
        }
      } else if (response.status === 404) {
        setCategoryNotFound(true);
      } else {
        setCategoryNotFound(true);
      }
    } catch (error) {
      console.error('Error fetching category menu:', error);
      setCategoryNotFound(true);
    } finally {
      setLoading(false);
    }
  };

  const fetchHappyHoursData = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000'}/web/landing/happyhours`);
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setHappyHoursData(data.data);
        }
      }
    } catch (error) {
      console.error('Error fetching happy hours data:', error);
    }
  };

  const [categories, setCategoriesData] = useState([]);

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

  const defaultFoodSections = [
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
    // Navigate to the selected category page
    const categoryUrl = category.name === 'Happy Hours' ? 'happyhours' : category.name.toLowerCase().replace(/\s+/g, '');
    router.push(`/menu/${categoryUrl}`);
  };

  const handleBackToCategories = () => {
    // Navigate back to menu page
    window.history.back();
  };

  const toggleSection = (sectionId) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionId]: !prev[sectionId]
    }));
  };

  const CategoryCard = ({ category, onClick }) => {
    // Check if this category is currently selected
    const isCurrentCategory = selectedCategory && selectedCategory.name === category.name;

    return (
      <div
        onClick={() => onClick(category)}
        className={`group relative overflow-hidden rounded-2xl shadow-2xl transform transition-all duration-500 hover:scale-105 hover:shadow-3xl cursor-pointer ${
          isCurrentCategory ? 'ring-2 ring-yellow-400 scale-105' : ''
        }`}
      >
      <div 
        className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110 z-0"
        style={{ backgroundImage: `url(${category.image})` }}
      />
      <div className={`absolute inset-0 bg-gradient-to-t ${category.gradient} opacity-70 group-hover:opacity-80 transition-opacity duration-500 z-10`} />
      <div className="absolute inset-0 rounded-2xl border-2 border-transparent group-hover:border-yellow-400 transition-all duration-500 z-20" />

      {/* Happy Hours Status Badge */}
      {category.name === 'Happy Hours' && happyHoursData && happyHoursData.exists && (
        <div className="absolute top-4 right-4 z-30">
          <div className={`px-3 py-1 rounded-full text-xs font-bold ${
            isLive
              ? 'bg-green-500 text-white animate-pulse'
              : 'bg-gray-800/80 text-yellow-300'
          }`}>
            {isLive ? '🔴 LIVE' : `⏰ ${convertTo12Hour(happyHoursData.startTime)}`}
          </div>
        </div>
      )}

      <div className="relative h-64 flex flex-col items-center justify-center text-center p-6 z-20">
        <h3 className="text-2xl font-bold text-white mb-2 transform transition-all duration-500 group-hover:scale-110 group-hover:text-yellow-300">
          {category.name}
        </h3>

        {/* Happy Hours additional info */}
        {category.name === 'Happy Hours' && happyHoursData && happyHoursData.exists && (
          <p className="text-sm text-gray-200 opacity-90 mb-2">
            {isLive ? 'LIVE NOW' : `Available ${convertTo12Hour(happyHoursData.startTime)} - ${convertTo12Hour(happyHoursData.endTime)}`}
          </p>
        )}

        <div className="w-0 h-0.5 bg-yellow-400 transition-all duration-500 group-hover:w-full"></div>
      </div>
      <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-30" 
           style={{ boxShadow: 'inset 0 0 50px rgba(255, 215, 0, 0.3)' }} />
      </div>
    );
  };

  const FoodItemCard = ({ item, isFirstItem = false }) => {
    // Check if we're on the happy hours page
    const isHappyHoursPage = categoryId?.toLowerCase() === 'happyhours' || categoryId?.toLowerCase() === 'happy-hours';

    // Check if item has options
    const hasOptions = item.hasOptions && item.optionGroups && item.optionGroups.length > 0;

    // State to track if the item is expanded - first item is expanded by default
    const [isExpanded, setIsExpanded] = useState(isFirstItem);

    // Determine which price to show (for non-option items)
    const displayPrice = !hasOptions && isHappyHoursPage && item.happyHourPrice
      ? `₹${item.happyHourPrice}`
      : !hasOptions ? item.price : null;

    // Show original price if we're showing happy hour price
    const showOriginalPrice = !hasOptions && isHappyHoursPage && item.happyHourPrice && item.standardPrice;

    // ALL items now use the collapsed card format
    return (
      <div className={`bg-gray-800/50 backdrop-blur-sm border ${
        item.isHappyHour
          ? 'border-yellow-400/50 bg-gradient-to-r from-yellow-600/10 to-amber-600/10'
          : 'border-gray-700/50'
      } rounded-2xl shadow-xl overflow-hidden hover:shadow-2xl transition-all duration-300`}>

        {/* Collapsed Header (like reference image) */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full flex items-center gap-4 p-4 hover:bg-gray-700/30 transition-colors"
        >
          {/* Left: Thumbnail Image - Only show when collapsed */}
          {!isExpanded && item.image && (
            <div
              className="w-20 h-20 rounded-lg bg-cover bg-center flex-shrink-0"
              style={{ backgroundImage: `url(${item.image})` }}
            />
          )}

          {/* Center: Item Name */}
          <div className="flex-1 text-left">
            <h4 className={`text-lg font-bold ${
              item.isHappyHour ? 'text-yellow-400' : 'text-white'
            }`}>
              {item.name}
            </h4>
            {!isExpanded && item.description && (
              <p className="text-gray-400 text-xs mt-1 line-clamp-1">{item.description}</p>
            )}
          </div>

          {/* Right: Chevron Icon */}
          <div className="text-yellow-400 flex-shrink-0">
            {isExpanded ? (
              <ChevronUp className="w-5 h-5" />
            ) : (
              <ChevronDown className="w-5 h-5" />
            )}
          </div>
        </button>

        {/* Expanded Content */}
        {isExpanded && (
          <div className="border-t border-gray-700/50 p-4">
            {/* Full Image - Only show when expanded */}
            {item.image && (
              <div
                className="w-full h-48 rounded-lg bg-cover bg-center mb-4"
                style={{ backgroundImage: `url(${item.image})` }}
              >
                {/* Happy Hour Live Badge */}
                {item.isHappyHour && isLive && (
                  <div className="inline-block bg-green-500 text-white text-xs px-2 py-1 rounded-full animate-pulse font-bold m-2">
                    🔴 LIVE
                  </div>
                )}
              </div>
            )}

            {/* Description */}
            {item.description && (
              <p className="text-gray-300 text-sm mb-4">{item.description}</p>
            )}

            {/* For items WITH options - show option groups and variants */}
            {hasOptions && (
              <div className="space-y-3">
                {item.optionGroups.map((group, groupIndex) => (
                  <div key={groupIndex} className="border border-gray-700/50 rounded-lg p-3 bg-gray-900/30">
                    {/* Group Title and Description */}
                    {group.title && (
                      <h5 className="font-bold text-white text-sm uppercase mb-1">
                        {group.title}
                      </h5>
                    )}
                    {group.description && (
                      <p className="text-gray-400 text-xs mb-3 italic">
                        {group.description}
                      </p>
                    )}

                    {/* Variants - All visible when expanded */}
                    <div className="space-y-2">
                      {group.variants?.map((variant, variantIndex) => (
                        <div
                          key={variantIndex}
                          className="flex justify-between items-center py-2 px-2 rounded hover:bg-gray-700/30 transition-colors"
                        >
                          <div className="flex items-center gap-2">
                            {/* Veg/Non-Veg indicator */}
                            {variant.type && variant.type !== 'None' && (
                              getFoodTypeIcon(variant.type)
                            )}

                            {/* Variant name */}
                            <span className="text-gray-200 font-medium uppercase text-sm">
                              {variant.name}
                            </span>
                          </div>

                          {/* Price */}
                          <span className="font-semibold text-yellow-400">
                            ₹{variant.price?.standard}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* For items WITHOUT options - show price with veg/non-veg indicator */}
            {!hasOptions && (
              <div className="border border-gray-700/50 rounded-lg p-3 bg-gray-900/30">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    {/* Veg/Non-Veg indicator */}
                    {item.type && item.type !== 'None' && (
                      getFoodTypeIcon(item.type)
                    )}
                    <span className="text-gray-200 font-medium text-sm">Price</span>
                  </div>

                  {/* Price */}
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-yellow-400 text-lg">
                      {displayPrice}
                    </span>
                    {showOriginalPrice && (
                      <span className="text-sm text-gray-400 line-through">
                        ₹{item.standardPrice}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  // Loading state
  if (loading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 pt-24 py-12 px-4">

        {/* Logo Section */}
        {/* <div className="max-w-6xl mx-auto text-center mb-16">
          <div className="flex flex-col items-center justify-center mb-8">
            <img 
              src="/logo.png" 
              alt="The Velvet Lounge" 
              className="w-32 h-32 md:w-40 md:h-40 object-contain mb-6 hover:scale-110 transition-transform duration-500"
            />
            
          </div>
          <div className="w-32 h-1 bg-gradient-to-r from-amber-400 to-yellow-500 mx-auto rounded-full mb-16"></div>
        </div> */}

        <div className="flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-yellow-400 mx-auto mb-4"></div>
            <p className="text-yellow-400 text-xl">Loading menu...</p>
          </div>
        </div>
        </div>
        <Footer />
      </>
    );
  }

  // Category not found state
  if (categoryNotFound) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 pt-24 py-12 px-4">

        {/* Logo Section */}
        {/* <div className="max-w-6xl mx-auto text-center mb-16">
          <div className="flex flex-col items-center justify-center mb-8">
            <img 
              src="/logo.png" 
              alt="The Velvet Lounge" 
              className="w-32 h-32 md:w-40 md:h-40 object-contain mb-6 hover:scale-110 transition-transform duration-500"
            />
            
          </div>
          <div className="w-32 h-1 bg-gradient-to-r from-amber-400 to-yellow-500 mx-auto rounded-full mb-16"></div>
        </div> */}

        <div className="max-w-6xl mx-auto text-center">
          <Link
            href="/menu"
            className="flex items-center gap-2 text-yellow-400 hover:text-yellow-300 transition-colors duration-300 mb-8 group w-fit mx-auto"
          >
            <ChevronLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform duration-300" />
            Back to Menu
          </Link>

          <div className="text-center py-20">
            <h1 className="text-4xl font-bold text-white mb-4">Category Not Found</h1>
            <p className="text-gray-300 mb-8">The menu category "{categoryId}" doesn't exist or has no items.</p>
            <Link
              href="/menu"
              className="bg-yellow-500 hover:bg-yellow-600 text-black font-bold py-3 px-8 rounded-lg transition-colors duration-300"
            >
              View All Categories
            </Link>
          </div>
        </div>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 pt-24 py-12 px-4">

      {/* Logo Section */}
      {/* <div className="max-w-6xl mx-auto text-center mb-16">
        <div className="flex flex-col items-center justify-center mb-8">
          <img 
            src="/logo.png" 
            alt="The Velvet Lounge" 
            className="w-32 h-32 md:w-40 md:h-40 object-contain mb-6 hover:scale-110 transition-transform duration-500"
          />
         
        </div>
        {/* <div className="w-32 h-1 bg-gradient-to-r from-amber-400 to-yellow-500 mx-auto rounded-full mb-16"></div> */}
      {/* </div> */}

      {/* Header with Back Button */}
      <div className="max-w-6xl mx-auto mb-12">
        {/* <Link
          href="/menu"
          className="flex items-center gap-2 text-yellow-400 hover:text-yellow-300 transition-colors duration-300 mb-8 group"
        >
          <ChevronLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform duration-300" />
          Back to Categories
        </Link> */}

        <h1 className="text-5xl font-bold text-center mb-4 bg-gradient-to-r from-yellow-400 via-red-500 to-orange-500 bg-clip-text text-transparent">
          {selectedCategory ? `${selectedCategory.name}` : 'Menu'}
        </h1>
        <div className="w-32 h-1 bg-gradient-to-r from-yellow-400 to-red-500 mx-auto rounded-full"></div>
      </div>

      {/* Search and Filter Section */}
      <div className="max-w-6xl mx-auto mb-12 md:mb-8">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-center">
          {/* Search Bar */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search menu items..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-gray-800/50 border border-gray-700/50 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-yellow-400/50 focus:ring-2 focus:ring-yellow-400/20 transition-all duration-300"
            />
          </div>

          {/* /* Filter Buttons */} 
                {(selectedCategory && !['Beverages', 'Drinks'].includes(selectedCategory.name)) && (
                <div className="flex items-center gap-2">
                  <Filter className="text-gray-400 w-5 h-5" />
                  <div className="flex gap-2">
                  {['All', 'Veg', 'Non-Veg', 'Egg'].map((filter) => (
                    <button
                    key={filter}
                    onClick={() => setSelectedFilter(filter)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 flex items-center gap-2 ${
                      selectedFilter === filter
                      ? 'bg-yellow-400 text-black'
                      : 'bg-gray-800/50 text-gray-300 hover:bg-gray-700/50 border border-gray-700/50'
                    }`}
                    >
                    {filter !== 'All' && getFoodTypeIcon(filter)}
                    {filter}
                    </button>
                  ))}
                  </div>
                </div>
                )}
              </div>
              </div>

              {/* Mobile Horizontal Carousel */}
      <div className="md:hidden mb-12 mt-24 relative z-50 overflow-visible">
        <div className="flex gap-4 overflow-x-auto pb-8 pt-4 px-4 scrollbar-hide">
          {categories.map((category) => (
            <div key={category.id} className="min-w-[280px] flex-shrink-0 relative z-50">
              <CategoryCard category={category} onClick={handleCategoryClick} />
            </div>
          ))}
        </div>
      </div>

      {/* Food Sections */}
      <div className="max-w-6xl mx-auto space-y-8">
        {/* No results message */}
        {(searchTerm || selectedFilter !== 'All') && filteredSections.length === 0 && foodSections.length > 0 && (
          <div className="text-center py-12">
            <div className="bg-gray-800/50 rounded-2xl p-8 border border-gray-700/50">
              <h3 className="text-2xl font-bold text-white mb-4">No items found</h3>
              <p className="text-gray-400 mb-6">
                {searchTerm 
                  ? `No items match "${searchTerm}"${selectedFilter !== 'All' ? ` in ${selectedFilter} category` : ''}`
                  : `No ${selectedFilter} items available`
                }
              </p>
              <button
                onClick={() => {
                  setSearchTerm('');
                  setSelectedFilter('All');
                }}
                className="bg-yellow-400 hover:bg-yellow-500 text-black font-bold py-2 px-6 rounded-lg transition-colors duration-300"
              >
                Clear Filters
              </button>
            </div>
          </div>
        )}

        {(filteredSections.length > 0 ? filteredSections : foodSections).map((section) => (
          <div key={section.id} className="space-y-6">
            {/* Section Header with Dropdown */}
            <div className="text-center">
              <button
                onClick={() => toggleSection(section.id)}
                className="group flex items-center justify-center gap-2 mb-3 hover:scale-105 transition-transform duration-300 cursor-pointer mx-auto"
              >
                <div className="text-yellow-400 group-hover:text-yellow-300 transition-colors duration-300 flex-shrink-0">
                  {section.icon}
                </div>
                <h2 className="text-2xl font-bold text-white group-hover:text-yellow-400 transition-colors duration-300 text-center">
                  {section.name}
                </h2>
                <div className="text-yellow-400 group-hover:text-yellow-300 transition-colors duration-300 flex-shrink-0">
                  {section.icon}
                </div>
                <div className="text-yellow-400 group-hover:text-yellow-300 transition-all duration-300 flex-shrink-0">
                  {expandedSections[section.id] ? (
                    <ChevronUp className="w-5 h-5" />
                  ) : (
                    <ChevronDown className="w-5 h-5" />
                  )}
                </div>
              </button>
              <div className="w-20 h-0.5 bg-gradient-to-r from-yellow-400 to-red-500 mx-auto"></div>
            </div>

            {/* Food Items Grid with Smooth Transition */}
            <div className={`overflow-hidden transition-all duration-500 ease-in-out ${
              expandedSections[section.id]
                ? 'max-h-none opacity-100'
                : 'max-h-0 opacity-0'
            }`}>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pt-4">
                {section.items.map((item, index) => (
                  <FoodItemCard key={item.id} item={item} isFirstItem={index === 0} />
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Floating Particles Effect */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-30">
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
      <Footer />
    </>
  );
};

export default RestaurantMenuSystem;