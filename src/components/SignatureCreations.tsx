import { Link } from 'react-router-dom';
import { Button } from './ui/button';
import basqueImage from '@/assets/basque-cheesecake-2.jpg';
import tiramisuImage from '@/assets/tiramisu-cheesecake.jpg';
import coconutImage from '@/assets/coconut-cashew-slice.jpg';

const signatures = [
  {
    id: 1,
    name: 'Basque Burnt Cheesecake',
    description: 'Rich, creamy perfection with our signature burnt top',
    image: basqueImage,
    priceFrom: '£22',
    slug: 'basque-burnt-cheesecake'
  },
  {
    id: 2,
    name: 'Tiramisu Basque',
    description: 'Coffee-kissed cream meets caramelised perfection',
    image: tiramisuImage,
    priceFrom: '£38',
    slug: 'tiramisu-basque-cheesecake'
  },
  {
    id: 3,
    name: 'Coconut Cashew Basque',
    description: 'Tropical twist with premium cashews and coconut',
    image: coconutImage,
    priceFrom: '£36',
    slug: 'coconut-cashew-basque-cheesecake'
  }
];

const SignatureCreations = () => {
  return (
    <section className="py-16 lg:py-24 bg-background">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl lg:text-5xl font-heading font-bold text-foreground mb-6">
            Our Signature Creations
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Each cake is handcrafted to order with the finest ingredients and our signature burnt-top technique
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {signatures.map((cake) => (
            <div key={cake.id} className="card-product">
              <div className="relative overflow-hidden aspect-[4/3]">
                <img 
                  src={cake.image}
                  alt={cake.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-aurelise-cocoa/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </div>
              
              <div className="p-6">
                <div className="flex justify-between items-start mb-3">
                  <h3 className="font-heading text-xl font-semibold text-foreground">
                    {cake.name}
                  </h3>
                  <span className="text-lg font-bold text-primary">
                    from {cake.priceFrom}
                  </span>
                </div>
                
                <p className="text-muted-foreground mb-6 leading-relaxed">
                  {cake.description}
                </p>
                
                <Link to={`/product/${cake.slug}`}>
                  <Button className="btn-hero w-full">
                    Order Now
                  </Button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default SignatureCreations;