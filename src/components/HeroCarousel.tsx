import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from './ui/button';
import { Link } from 'react-router-dom';

import basqueImage from '@/assets/basque-cheesecake-1.jpg';
import tiramisuImage from '@/assets/tiramisu-cheesecake-full.jpg';
import coconutImage from '@/assets/coconut-cashew-cheesecake-1.jpg';

const slides = [
  {
    id: 1,
    image: basqueImage,
    title: "Original Basque Burnt Cheesecake",
    subtitle: "Our signature golden-brown caramelised perfection",
    cta: "Order Now"
  },
  {
    id: 2,
    image: tiramisuImage,
    title: "Tiramisu Basque Cheesecake",
    subtitle: "Coffee-kissed cream meets caramelised perfection",
    cta: "Order Now"
  },
  {
    id: 3,
    image: coconutImage,
    title: "Coconut Basque Cheesecake",
    subtitle: "Tropical twist with premium cashews and coconut",
    cta: "Order Now"
  }
];

const HeroCarousel = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  // Auto-rotate every 5 seconds
  useEffect(() => {
    if (!isAutoPlaying) return;
    
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [isAutoPlaying]);

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
    setIsAutoPlaying(false);
    // Resume auto-play after 10 seconds
    setTimeout(() => setIsAutoPlaying(true), 10000);
  };

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
    setIsAutoPlaying(false);
    setTimeout(() => setIsAutoPlaying(true), 10000);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
    setIsAutoPlaying(false);
    setTimeout(() => setIsAutoPlaying(true), 10000);
  };

  return (
    <section className="relative h-screen overflow-hidden">
      {/* Slides */}
      <div className="relative w-full h-full">
        {slides.map((slide, index) => (
          <div
            key={slide.id}
            className={`absolute inset-0 w-full h-full transition-opacity duration-1000 ease-in-out ${
              index === currentSlide ? 'opacity-100' : 'opacity-0'
            }`}
          >
            {/* Background Image */}
            <div className="absolute inset-0">
              <img
                src={slide.image}
                alt={slide.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 gradient-overlay"></div>
            </div>
            
            {/* Content Overlay */}
            <div className="relative z-10 h-full flex items-center justify-center">
              <div className="container mx-auto px-4 lg:px-8 text-center">
                <div className="max-w-4xl mx-auto space-y-8">
                  <h1 className="text-hero-overlay animate-fade-in">
                    Handcrafted Basque Cheesecakes
                  </h1>
                  <p className="text-subtitle-overlay animate-fade-in">
                    {slide.subtitle}
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in">
                    <Link to="/menu">
                      <Button className="btn-hero">
                        {slide.cta}
                      </Button>
                    </Link>
                    <Link to="/menu">
                      <Button className="btn-hero-outline">
                        View Menu
                      </Button>
                    </Link>
                  </div>
                  <div className="text-white/80 text-sm font-medium animate-fade-in">
                    Pre-orders only • 3-day advance notice • Always baked fresh
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Navigation Arrows */}
      <button
        onClick={prevSlide}
        className="absolute left-4 lg:left-8 top-1/2 -translate-y-1/2 z-20 p-3 rounded-full bg-white/10 text-white hover:bg-white/20 transition-all duration-300 backdrop-blur-sm"
      >
        <ChevronLeft className="h-6 w-6" />
      </button>
      <button
        onClick={nextSlide}
        className="absolute right-4 lg:right-8 top-1/2 -translate-y-1/2 z-20 p-3 rounded-full bg-white/10 text-white hover:bg-white/20 transition-all duration-300 backdrop-blur-sm"
      >
        <ChevronRight className="h-6 w-6" />
      </button>

      {/* Navigation Dots */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex space-x-3">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`w-3 h-3 rounded-full transition-all duration-300 ${
              index === currentSlide 
                ? 'bg-white shadow-lg' 
                : 'bg-white/50 hover:bg-white/70'
            }`}
          />
        ))}
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 right-8 animate-bounce z-20">
        <div className="w-6 h-10 border-2 border-white/60 rounded-full flex justify-center">
          <div className="w-1 h-3 bg-white/60 rounded-full mt-2 animate-pulse"></div>
        </div>
      </div>
    </section>
  );
};

export default HeroCarousel;