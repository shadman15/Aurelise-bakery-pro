import { ArrowRight, Clock, MapPin } from 'lucide-react';
import { Button } from './ui/button';
import { Link } from 'react-router-dom';
import heroImage1 from '@/assets/basque-cheesecake-1.jpg';
import heroImage2 from '@/assets/basque-cheesecake-2.jpg';
import heroImage3 from '@/assets/tiramisu-cheesecake.jpg';

const Hero = () => {
  return (
    <section className="relative min-h-screen flex items-center overflow-hidden">
      {/* Background Gradient */}
      <div className="absolute inset-0 gradient-warm"></div>
      
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-20 left-10 w-64 h-64 rounded-full bg-primary/20 blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 rounded-full bg-accent/20 blur-3xl"></div>
      </div>

      <div className="container mx-auto px-4 lg:px-8 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Content */}
          <div className="space-y-8">
            <div className="space-y-4">
              <h1 className="text-hero">
                Aurélise
              </h1>
              <p className="text-tagline">
                Where Every Bite Tells a Story
              </p>
              <p className="text-lg lg:text-xl text-muted-foreground max-w-xl leading-relaxed">
                We craft exquisite artisan Basque burnt cheesecakes and specialty desserts, 
                each one a masterpiece of flavour and artistry. Made fresh to order with 
                love and the finest ingredients.
              </p>
            </div>

            {/* Key Features */}
            <div className="flex flex-col sm:flex-row gap-4 text-sm text-muted-foreground">
              <div className="flex items-center space-x-2">
                <Clock className="h-5 w-5 text-primary" />
                <span>Pre-orders only - 3 day advance notice</span>
              </div>
              <div className="flex items-center space-x-2">
                <MapPin className="h-5 w-5 text-primary" />
                <span>Handcrafted in the UK</span>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Link to="/menu">
                <Button className="btn-hero group">
                  View Our Menu
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Link to="/contact">
                <Button className="btn-secondary">
                  Pre-Order Now
                </Button>
              </Link>
            </div>
          </div>

          {/* Image Gallery */}
          <div className="relative">
            <div className="grid grid-cols-2 gap-4">
              {/* Main large image */}
              <div className="col-span-2 relative">
                <div className="card-elegant overflow-hidden group">
                  <img 
                    src={heroImage1} 
                    alt="Signature Basque Burnt Cheesecake"
                    className="w-full h-64 lg:h-80 object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-aurelise-cocoa/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </div>
              </div>
              
              {/* Two smaller images */}
              <div className="card-elegant overflow-hidden group">
                <img 
                  src={heroImage2} 
                  alt="Basque Cheesecake Slice"
                  className="w-full h-32 lg:h-40 object-cover group-hover:scale-105 transition-transform duration-700"
                />
              </div>
              <div className="card-elegant overflow-hidden group">
                <img 
                  src={heroImage3} 
                  alt="Tiramisu Basque Cheesecake"
                  className="w-full h-32 lg:h-40 object-cover group-hover:scale-105 transition-transform duration-700"
                />
              </div>
            </div>
            
            {/* Floating accent */}
            <div className="absolute -top-4 -right-4 w-24 h-24 gradient-hero rounded-full shadow-gold opacity-60 animate-pulse"></div>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
        <div className="w-6 h-10 border-2 border-primary rounded-full flex justify-center">
          <div className="w-1 h-3 bg-primary rounded-full mt-2 animate-pulse"></div>
        </div>
      </div>
    </section>
  );
};

export default Hero;