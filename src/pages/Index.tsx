import Hero from "../components/Hero";

const Index = () => {
  return (
    <div className="min-h-screen">
      <Hero />
      
      {/* Features Section */}
      <section className="py-16 bg-secondary/30">
        <div className="container mx-auto px-4 lg:px-8 text-center">
          <h2 className="text-3xl lg:text-4xl font-heading font-bold text-foreground mb-8">
            Why Choose Aurélise?
          </h2>
          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="space-y-4">
              <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto">
                <span className="text-2xl">🔥</span>
              </div>
              <h3 className="font-heading text-xl font-semibold">Signature Burnt Top</h3>
              <p className="text-muted-foreground">
                Our Basque cheesecakes feature the perfect caramelised burnt top that's become our signature.
              </p>
            </div>
            <div className="space-y-4">
              <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto">
                <span className="text-2xl">🥛</span>
              </div>
              <h3 className="font-heading text-xl font-semibold">Finest Ingredients</h3>
              <p className="text-muted-foreground">
                We use only premium ingredients, sourced locally where possible, for exceptional quality.
              </p>
            </div>
            <div className="space-y-4">
              <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto">
                <span className="text-2xl">👩‍🍳</span>
              </div>
              <h3 className="font-heading text-xl font-semibold">Handcrafted Fresh</h3>
              <p className="text-muted-foreground">
                Every cake is made to order, ensuring you receive the freshest possible dessert.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Index;
