import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Clock, Utensils, ShoppingCart } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useCart } from '@/hooks/useCart';
import { toast } from '@/hooks/use-toast';

interface Product {
  id: string;
  name: string;
  slug: string;
  short_description: string;
  description: string;
  allergens: string[];
  images: string[];
  featured: boolean;
  active: boolean;
  categories?: {
    name: string;
  };
  product_sizes?: {
    size: string;
    price: number;
    is_available: boolean;
  }[];
}

const Menu = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          categories (name),
          product_sizes (
            size,
            price,
            is_available
          )
        `)
        .eq('active', true)
        .order('featured', { ascending: false })
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProducts(data || []);
    } catch (error) {
      console.error('Error loading products:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async (product: Product, size?: { size: string; price: number }) => {
    if (!size && product.product_sizes?.[0]) {
      size = product.product_sizes[0];
    }

    if (!size) {
      toast({
        title: 'Error',
        description: 'Please select a size first',
        variant: 'destructive',
      });
      return;
    }

    try {
      await addToCart(product, size.size, 1);
      
      toast({
        title: 'Added to cart',
        description: `${product.name} (${size.size}) added to your cart`,
      });
    } catch (error) {
      console.error('Error adding to cart:', error);
      toast({
        title: 'Error',
        description: 'Failed to add item to cart',
        variant: 'destructive',
      });
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP'
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <section className="gradient-warm py-16">
        <div className="container mx-auto px-4 lg:px-8 text-center">
          <h1 className="text-4xl lg:text-6xl font-heading font-bold text-foreground mb-4">
            Our Artisan Menu
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Each cake is handcrafted to order using the finest ingredients. 
            Pre-orders require a minimum of 3 days' advance notice.
          </p>
        </div>
      </section>

      {/* Important Notice */}
      <section className="bg-secondary/50 border-y border-border py-4">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="flex items-center justify-center space-x-4 text-secondary-foreground">
            <div className="flex items-center space-x-2">
              <Clock className="h-5 w-5 text-primary" />
              <span className="font-medium">Minimum 3-day pre-order required</span>
            </div>
            <div className="hidden md:block w-px h-6 bg-border"></div>
            <div className="flex items-center space-x-2">
              <Utensils className="h-5 w-5 text-primary" />
              <span className="font-medium">Always baked fresh</span>
            </div>
            <div className="hidden md:block w-px h-6 bg-border"></div>
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5 text-primary" />
              <span className="font-medium">Please check allergen information</span>
            </div>
          </div>
        </div>
      </section>

      {/* Menu Grid */}
      <section className="py-16">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {products.map((product) => (
              <Card key={product.id} className="card-elegant group">
                {/* Image */}
                <div className="relative overflow-hidden">
                  {product.featured && (
                    <Badge className="absolute top-4 left-4 z-10 bg-primary text-primary-foreground">
                      Featured
                    </Badge>
                  )}
                  <img 
                    src={product.images?.[0] || '/placeholder-cake.jpg'} 
                    alt={product.name}
                    className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-aurelise-cocoa/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </div>

                <CardHeader>
                  <CardTitle className="font-heading text-xl">{product.name}</CardTitle>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    {product.short_description}
                  </p>
                </CardHeader>

                <CardContent className="space-y-4">
                  {/* Sizes and Prices */}
                  <div className="space-y-2">
                    <h4 className="font-semibold text-sm">Sizes & Prices:</h4>
                    <div className="flex flex-wrap gap-2">
                      {product.product_sizes?.map((size) => (
                        <button
                          key={size.size}
                          onClick={() => handleAddToCart(product, size)}
                          disabled={!size.is_available}
                          className={`flex items-center space-x-2 px-3 py-1 rounded-full text-sm transition-colors ${
                            size.is_available 
                              ? 'bg-secondary hover:bg-primary hover:text-primary-foreground cursor-pointer' 
                              : 'bg-muted text-muted-foreground cursor-not-allowed'
                          }`}
                        >
                          <span className="font-medium">{size.size}</span>
                          <span className="font-semibold">{formatCurrency(size.price)}</span>
                          <ShoppingCart className="h-3 w-3" />
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Allergens */}
                  {product.allergens && product.allergens.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="font-semibold text-sm flex items-center space-x-2">
                        <AlertTriangle className="h-4 w-4 text-orange-500" />
                        <span>Allergens:</span>
                      </h4>
                      <div className="flex flex-wrap gap-1">
                        {product.allergens.map((allergen) => (
                          <Badge key={allergen} variant="outline" className="text-xs">
                            {allergen}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* CTA Buttons */}
                  <div className="flex gap-2">
                    <Link to={`/product/${product.slug}`} className="flex-1">
                      <Button variant="outline" className="w-full">
                        View Details
                      </Button>
                    </Link>
                    <Button 
                      onClick={() => handleAddToCart(product)}
                      className="btn-hero"
                      disabled={!product.product_sizes?.length}
                    >
                      <ShoppingCart className="h-4 w-4 mr-1" />
                      Add
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {products.length === 0 && (
            <div className="text-center py-16">
              <h3 className="text-2xl font-semibold mb-4">No products available</h3>
              <p className="text-muted-foreground">Please check back later for our delicious offerings.</p>
            </div>
          )}
        </div>
      </section>

      {/* Call to Action */}
      <section className="bg-primary text-primary-foreground py-16">
        <div className="container mx-auto px-4 lg:px-8 text-center space-y-6">
          <h2 className="text-3xl lg:text-4xl font-heading font-bold">
            Can't Decide? We're Here to Help
          </h2>
          <p className="text-lg max-w-2xl mx-auto opacity-90">
            Get in touch via WhatsApp or Instagram for personalised recommendations 
            or to discuss custom orders for special occasions.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button variant="outline" className="border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary">
              WhatsApp Us
            </Button>
            <Button variant="outline" className="border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary">
              Follow on Instagram
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Menu;