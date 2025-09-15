import { useLocation, Link } from 'react-router-dom';
import { ArrowLeft, Phone, Instagram } from 'lucide-react';
import { Button } from '@/components/ui/button';

const ComingSoon = () => {
  const location = useLocation();
  const pageName = location.pathname.replace('/', '').replace('-', ' ');
  const capitalizedPageName = pageName.charAt(0).toUpperCase() + pageName.slice(1);

  return (
    <div className="min-h-screen bg-gradient-warm flex items-center justify-center">
      <div className="container mx-auto px-4 lg:px-8 text-center space-y-8">
        <div className="space-y-4">
          <div className="w-24 h-24 bg-primary rounded-full flex items-center justify-center mx-auto shadow-gold">
            <span className="text-4xl">🍰</span>
          </div>
          
          <h1 className="text-4xl lg:text-6xl font-heading font-bold text-foreground">
            {capitalizedPageName || 'Page'} Coming Soon
          </h1>
          
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            We're putting the finishing touches on this page. In the meantime, 
            explore our delicious menu or get in touch to place your order!
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link to="/">
            <Button className="btn-hero group">
              <ArrowLeft className="mr-2 h-5 w-5 group-hover:-translate-x-1 transition-transform" />
              Back to Home
            </Button>
          </Link>
          <Link to="/menu">
            <Button className="btn-secondary">
              View Menu
            </Button>
          </Link>
        </div>

        <div className="pt-8 border-t border-border max-w-md mx-auto">
          <p className="text-sm text-muted-foreground mb-4">
            Ready to order? Get in touch with us directly:
          </p>
          <div className="flex justify-center space-x-6">
            <a 
              href="https://wa.me/447440645831" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center space-x-2 text-muted-foreground hover:text-primary transition-colors"
            >
              <Phone className="h-5 w-5" />
              <span>WhatsApp</span>
            </a>
            <a 
              href="https://instagram.com/aurelise.uk" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center space-x-2 text-muted-foreground hover:text-primary transition-colors"
            >
              <Instagram className="h-5 w-5" />
              <span>Instagram</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ComingSoon;