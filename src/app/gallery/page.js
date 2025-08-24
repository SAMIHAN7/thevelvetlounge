'use client';
import React, { useState, useEffect } from 'react';
import { X, ZoomIn, ChevronLeft, ChevronRight, Filter, Grid, Maximize2 } from 'lucide-react';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';

const GalleryPage = () => {
  const [galleryImages, setGalleryImages] = useState({ ambience: [], food: [] });
  const [activeTab, setActiveTab] = useState('all');
  const [selectedImage, setSelectedImage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // API base URL from environment variable
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000';

  // Fetch gallery data
  useEffect(() => {
    const fetchGalleryData = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${API_BASE_URL}/web/landing`);
        const result = await response.json();
        
        if (result.success) {
          const { gallery } = result.data;
          setGalleryImages({
            ambience: gallery.ambience || [],
            food: gallery.food || []
          });
        }
      } catch (error) {
        console.error('Error fetching gallery data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchGalleryData();
  }, []);

  // Get all images based on active tab
  const getAllImages = () => {
    switch (activeTab) {
      case 'ambience':
        return galleryImages.ambience.map(img => ({ ...img, category: 'ambience' }));
      case 'food':
        return galleryImages.food.map(img => ({ ...img, category: 'food' }));
      default:
        return [
          ...galleryImages.ambience.map(img => ({ ...img, category: 'ambience' })),
          ...galleryImages.food.map(img => ({ ...img, category: 'food' }))
        ];
    }
  };

  const allImages = getAllImages();

  // Modal handlers
  const openModal = (image, index) => {
    setSelectedImage(image);
    setCurrentImageIndex(index);
  };

  const closeModal = () => {
    setSelectedImage(null);
    setCurrentImageIndex(0);
  };

  const nextImage = () => {
    const nextIndex = (currentImageIndex + 1) % allImages.length;
    setCurrentImageIndex(nextIndex);
    setSelectedImage(allImages[nextIndex]);
  };

  const prevImage = () => {
    const prevIndex = (currentImageIndex - 1 + allImages.length) % allImages.length;
    setCurrentImageIndex(prevIndex);
    setSelectedImage(allImages[prevIndex]);
  };

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (selectedImage) {
        if (e.key === 'ArrowRight') nextImage();
        if (e.key === 'ArrowLeft') prevImage();
        if (e.key === 'Escape') closeModal();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [selectedImage, currentImageIndex, allImages.length]);

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
            Our Gallery
          </h1>
          <div className="w-32 h-1 bg-gradient-to-r from-yellow-400 to-red-500 mx-auto rounded-full mb-6"></div>
          <p className="text-gray-300 text-lg max-w-2xl mx-auto">
            Discover the elegance and atmosphere of The Velvet Lounge through our curated collection of moments
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="max-w-6xl mx-auto mb-12">
          <div className="flex justify-center items-center gap-2 flex-wrap">
            <Filter className="text-gray-400 w-5 h-5 mr-2" />
            {[
              { id: 'all', label: 'All Photos', icon: Grid },
              { id: 'ambience', label: 'Ambience', icon: Maximize2 },
              { id: 'food', label: 'Food', icon: Filter }
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-6 py-3 rounded-lg text-sm font-medium transition-all duration-300 ${
                    activeTab === tab.id
                      ? 'bg-yellow-400 text-black'
                      : 'bg-gray-800/50 text-gray-300 hover:bg-gray-700/50 border border-gray-700/50'
                  }`}
                >
                  {/* <Icon className="w-4 h-4" /> */}
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Gallery Grid */}
        <div className="max-w-7xl mx-auto">
          {loading ? (
            // Loading skeleton
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[...Array(12)].map((_, index) => (
                <div key={index} className="animate-pulse">
                  <div className="h-64 bg-gray-800/50 rounded-2xl"></div>
                </div>
              ))}
            </div>
          ) : allImages.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {allImages.map((image, index) => (
                <div
                  key={`${image.category}-${index}`}
                  className="group relative overflow-hidden rounded-2xl shadow-xl cursor-pointer transform transition-all duration-500 hover:scale-105 hover:shadow-3xl"
                  onClick={() => openModal(image, index)}
                >
                  {/* Image */}
                  <div className="aspect-square">
                    <img 
                      src={image.imageUrl || image} 
                      alt={`${image.category} ${index + 1}`}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                  </div>

                  {/* Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  
                  {/* Content */}
                  <div className="absolute bottom-0 left-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-all duration-500 transform translate-y-4 group-hover:translate-y-0">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-yellow-400 font-bold text-sm capitalize">{image.category}</div>
                        <div className="text-white text-xs">Photo {index + 1}</div>
                      </div>
                      <ZoomIn className="w-5 h-5 text-white" />
                    </div>
                  </div>

                  {/* Category Badge */}
                  <div className="absolute top-3 left-3 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      image.category === 'ambience' 
                        ? 'bg-purple-600/80 text-white' 
                        : 'bg-green-600/80 text-white'
                    }`}>
                      {image.category}
                    </span>
                  </div>

                  {/* Glow Effect */}
                  <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" 
                       style={{ boxShadow: 'inset 0 0 50px rgba(255, 215, 0, 0.3)' }} />
                </div>
              ))}
            </div>
          ) : (
            // No images state
            <div className="text-center py-20">
              <div className="bg-gray-800/50 rounded-2xl p-12 border border-gray-700/50 max-w-md mx-auto">
                <Grid className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-2xl font-bold text-white mb-4">No Images Found</h3>
                <p className="text-gray-400">
                  {activeTab === 'all' 
                    ? 'No images available in the gallery' 
                    : `No ${activeTab} images available`
                  }
                </p>
              </div>
            </div>
          )}
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

      {/* Modal */}
      {selectedImage && (
        <div className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center p-4">
          <div className="relative max-w-7xl max-h-full">
            {/* Close Button */}
            <button
              onClick={closeModal}
              className="absolute top-4 right-4 z-10 bg-black/50 hover:bg-black/70 text-white rounded-full p-2 transition-colors duration-300"
            >
              <X className="w-6 h-6" />
            </button>

            {/* Navigation Arrows */}
            {allImages.length > 1 && (
              <>
                <button
                  onClick={prevImage}
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 z-10 bg-black/50 hover:bg-black/70 text-white rounded-full p-3 transition-colors duration-300"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
                <button
                  onClick={nextImage}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 z-10 bg-black/50 hover:bg-black/70 text-white rounded-full p-3 transition-colors duration-300"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
              </>
            )}

            {/* Image */}
            <img
              src={selectedImage.imageUrl || selectedImage}
              alt={`${selectedImage.category} gallery`}
              className="max-w-full max-h-full object-contain rounded-lg"
            />

            {/* Image Info */}
            <div className="absolute bottom-4 left-4 right-4 bg-black/70 backdrop-blur-sm rounded-lg p-4">
              <div className="flex items-center justify-between text-white">
                <div>
                  <h3 className="text-lg font-semibold capitalize">{selectedImage.category}</h3>
                  <p className="text-sm text-gray-300">
                    {currentImageIndex + 1} of {allImages.length}
                  </p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                  selectedImage.category === 'ambience' 
                    ? 'bg-purple-600 text-white' 
                    : 'bg-green-600 text-white'
                }`}>
                  {selectedImage.category}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </>
  );
};

export default GalleryPage;