import { Clock, Heart, Award } from 'lucide-react';

const features = [
  {
    icon: <Award className="h-8 w-8" />,
    title: 'Signature Burnt Top',
    description: 'Our Basque cheesecakes feature the perfect caramelised burnt top that has become our signature.'
  },
  {
    icon: <Heart className="h-8 w-8" />,
    title: 'Finest Ingredients',
    description: 'We use only premium ingredients, sourced locally where possible, for exceptional quality in every bite.'
  },
  {
    icon: <Clock className="h-8 w-8" />,
    title: 'Handcrafted Fresh',
    description: 'Every cake is made to order with 3-day advance notice, ensuring you receive the freshest possible dessert.'
  }
];

const WhyChooseUs = () => {
  return (
    <section className="py-16 lg:py-24 gradient-warm">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl lg:text-5xl font-heading font-bold text-foreground mb-6">
            Why Choose Aurélise?
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Every cake tells a story of craftsmanship, quality, and passion for the perfect Basque cheesecake
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {features.map((feature, index) => (
            <div key={index} className="text-center space-y-6">
              <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto shadow-gold">
                <div className="text-primary-foreground">
                  {feature.icon}
                </div>
              </div>
              <h3 className="font-heading text-xl font-semibold text-foreground">
                {feature.title}
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default WhyChooseUs;