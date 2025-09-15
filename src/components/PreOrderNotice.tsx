import { Clock, Calendar, CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from './ui/button';

const PreOrderNotice = () => {
  return (
    <section className="py-12 bg-aurelise-blush/30 border-y border-border">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <div className="flex items-center justify-center space-x-4 mb-6">
            <Clock className="h-6 w-6 text-primary" />
            <h3 className="font-heading text-2xl font-bold text-foreground">
              Pre-Order Notice
            </h3>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <div className="flex items-center justify-center space-x-3">
              <Calendar className="h-5 w-5 text-primary" />
              <span className="font-medium text-foreground">3-day advance notice required</span>
            </div>
            <div className="flex items-center justify-center space-x-3">
              <CheckCircle className="h-5 w-5 text-primary" />
              <span className="font-medium text-foreground">Always baked fresh to order</span>
            </div>
            <div className="flex items-center justify-center space-x-3">
              <Clock className="h-5 w-5 text-primary" />
              <span className="font-medium text-foreground">Pickup & delivery available</span>
            </div>
          </div>
          
          <p className="text-muted-foreground mb-6">
            All our cheesecakes are handcrafted to order. Please place your order at least 3 full days in advance 
            to ensure we can create your perfect cake with the time and care it deserves.
          </p>
          
          <Link to="/menu">
            <Button className="btn-hero">
              Place Your Pre-Order
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default PreOrderNotice;