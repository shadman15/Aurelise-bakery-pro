import { Instagram, Phone, Mail, MapPin, Clock, AlertTriangle } from 'lucide-react';
import { Link } from 'react-router-dom';
import logoImage from '@/assets/aurelise-logo.jpg';

const Footer = () => {
  return (
    <footer className="bg-aurelise-cocoa text-aurelise-cream">
      {/* Main Footer */}
      <div className="container mx-auto px-4 lg:px-8 py-12">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand Column */}
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <img 
                src={logoImage} 
                alt="Aurélise Logo" 
                className="h-10 w-auto object-contain rounded-md"
              />
              <div>
                <h3 className="font-heading text-xl font-bold text-aurelise-gold">Aurélise</h3>
                <p className="text-sm text-aurelise-cream/80 italic">Where Every Bite Tells a Story</p>
              </div>
            </div>
            <p className="text-sm text-aurelise-cream/80 leading-relaxed">
              Crafting exquisite artisan Basque burnt cheesecakes and specialty desserts 
              with love, precision, and the finest ingredients.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-heading text-lg font-semibold text-aurelise-gold mb-4">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/" className="hover:text-aurelise-gold transition-colors">Home</Link></li>
              <li><Link to="/menu" className="hover:text-aurelise-gold transition-colors">Our Menu</Link></li>
              <li><Link to="/gallery" className="hover:text-aurelise-gold transition-colors">Gallery</Link></li>
              <li><Link to="/about" className="hover:text-aurelise-gold transition-colors">About Us</Link></li>
              <li><Link to="/contact" className="hover:text-aurelise-gold transition-colors">Contact</Link></li>
              <li><Link to="/allergens" className="hover:text-aurelise-gold transition-colors flex items-center space-x-1">
                <AlertTriangle className="h-3 w-3" />
                <span>Allergen Notice</span>
              </Link></li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="font-heading text-lg font-semibold text-aurelise-gold mb-4">Get In Touch</h4>
            <ul className="space-y-3 text-sm">
              <li className="flex items-center space-x-2">
                <Phone className="h-4 w-4 text-aurelise-gold" />
                <a href="https://wa.me/447440645831" className="hover:text-aurelise-gold transition-colors">
                  +44 7440 645831
                </a>
              </li>
              <li className="flex items-center space-x-2">
                <Instagram className="h-4 w-4 text-aurelise-gold" />
                <a href="https://instagram.com/aurelise.uk" target="_blank" rel="noopener noreferrer" className="hover:text-aurelise-gold transition-colors">
                  @aurelise.uk
                </a>
              </li>
              <li className="flex items-center space-x-2">
                <Mail className="h-4 w-4 text-aurelise-gold" />
                <span className="text-aurelise-cream/80">Email via contact form</span>
              </li>
              <li className="flex items-start space-x-2">
                <MapPin className="h-4 w-4 text-aurelise-gold mt-0.5" />
                <span className="text-aurelise-cream/80">Based in the UK<br />Collection & Delivery Available</span>
              </li>
            </ul>
          </div>

          {/* Important Info */}
          <div>
            <h4 className="font-heading text-lg font-semibold text-aurelise-gold mb-4">Important Info</h4>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start space-x-2">
                <Clock className="h-4 w-4 text-aurelise-gold mt-0.5" />
                <span>Pre-orders only<br />3-day advance notice required</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-aurelise-gold text-lg">🍰</span>
                <span>Always baked fresh to order</span>
              </li>
              <li className="flex items-start space-x-2">
                <AlertTriangle className="h-4 w-4 text-orange-400 mt-0.5" />
                <span className="text-aurelise-cream/80">
                  Contains allergens: Please check individual product information
                </span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-aurelise-cream/20">
        <div className="container mx-auto px-4 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="text-sm text-aurelise-cream/80 text-center md:text-left">
              <p>&copy; 2024 Aurélise. All rights reserved.</p>
              <p className="text-xs mt-1">
                Pre-orders only – 3-day advance notice | Always baked fresh!
              </p>
            </div>
            <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-6 text-xs text-aurelise-cream/80">
              <Link to="/terms" className="hover:text-aurelise-gold transition-colors">Terms & Conditions</Link>
              <Link to="/privacy" className="hover:text-aurelise-gold transition-colors">Privacy Policy</Link>
              <Link to="/allergens" className="hover:text-aurelise-gold transition-colors">Allergen Information</Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;