import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Clock, Utensils } from 'lucide-react';

import basqueImage1 from '@/assets/basque-cheesecake-1.jpg';
import basqueImage2 from '@/assets/basque-cheesecake-2.jpg';
import basqueImage3 from '@/assets/basque-cheesecake-3.jpg';
import tiramisuImage from '@/assets/tiramisu-cheesecake.jpg';
import coconutCashewImage1 from '@/assets/coconut-cashew-cheesecake-1.jpg';
import coconutCashewImage2 from '@/assets/coconut-cashew-cheesecake-2.jpg';

interface CakeSize {
  size: string;
  price: number;
}

interface Cake {
  id: string;
  name: string;
  description: string;
  image: string;
  allergens: string[];
  sizes: CakeSize[];
  featured?: boolean;
}

const cakes: Cake[] = [
  {
    id: 'basque-burnt',
    name: 'Basque Burnt Cheesecake',
    description: 'Our signature burnt cheesecake with a perfectly caramelised top and creamy centre. The original that started our journey.',
    image: basqueImage1,
    allergens: ['Milk', 'Eggs'],
    sizes: [
      { size: '6"', price: 22 },
      { size: '8"', price: 34 },
      { size: '10"', price: 46 }
    ],
    featured: true
  },
  {
    id: 'tiramisu-basque',
    name: 'Creamy Basque Cheesecake (Tiramisu Top)',
    description: 'A luxurious twist combining our signature Basque cheesecake with a delicate tiramisu-flavoured mascarpone layer.',
    image: tiramisuImage,
    allergens: ['Milk', 'Eggs', 'Gluten (wheat)'],
    sizes: [
      { size: '8"', price: 38 }
    ],
    featured: true
  },
  {
    id: 'coconut-cashew-basque',
    name: 'Coconut Cashew Basque Cheesecake',
    description: 'Rich Basque cheesecake topped with roasted cashews and coconut flakes for a delightful textural contrast.',
    image: coconutCashewImage1,
    allergens: ['Milk', 'Eggs', 'Tree Nuts (cashew)', 'Coconut'],
    sizes: [
      { size: '8"', price: 36 }
    ],
    featured: true
  },
  {
    id: 'classic-ny',
    name: 'Classic New York Cheesecake',
    description: 'Traditional American-style cheesecake with a graham cracker base and smooth, dense texture.',
    image: basqueImage2,
    allergens: ['Milk', 'Eggs', 'Gluten (wheat)'],
    sizes: [
      { size: '8"', price: 34 }
    ]
  },
  {
    id: 'seasonal-fruit',
    name: 'Seasonal Fruit Cheesecake',
    description: 'Our classic cheesecake adorned with the finest seasonal fruits. Flavours change throughout the year.',
    image: basqueImage3,
    allergens: ['Milk', 'Eggs', 'Gluten (wheat)'],
    sizes: [
      { size: '8"', price: 38 }
    ]
  }
];

const Menu = () => {
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
            {cakes.map((cake) => (
              <Card key={cake.id} className="card-elegant group">
                {/* Image */}
                <div className="relative overflow-hidden">
                  {cake.featured && (
                    <Badge className="absolute top-4 left-4 z-10 bg-primary text-primary-foreground">
                      Featured
                    </Badge>
                  )}
                  <img 
                    src={cake.image} 
                    alt={cake.name}
                    className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-aurelise-cocoa/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </div>

                <CardHeader>
                  <CardTitle className="font-heading text-xl">{cake.name}</CardTitle>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    {cake.description}
                  </p>
                </CardHeader>

                <CardContent className="space-y-4">
                  {/* Sizes and Prices */}
                  <div className="space-y-2">
                    <h4 className="font-semibold text-sm">Sizes & Prices:</h4>
                    <div className="flex flex-wrap gap-2">
                      {cake.sizes.map((size) => (
                        <div key={size.size} className="flex items-center space-x-2 bg-secondary px-3 py-1 rounded-full">
                          <span className="text-sm font-medium">{size.size}</span>
                          <span className="text-sm text-primary font-semibold">£{size.price}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Allergens */}
                  <div className="space-y-2">
                    <h4 className="font-semibold text-sm flex items-center space-x-2">
                      <AlertTriangle className="h-4 w-4 text-orange-500" />
                      <span>Allergens:</span>
                    </h4>
                    <div className="flex flex-wrap gap-1">
                      {cake.allergens.map((allergen) => (
                        <Badge key={allergen} variant="outline" className="text-xs">
                          {allergen}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* CTA Button */}
                  <Button className="w-full btn-hero">
                    Pre-Order This Cake
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
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