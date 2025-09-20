import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Upload, X, Save } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

const heroSlideSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  subtitle: z.string().min(1, 'Subtitle is required'),
  image: z.string().min(1, 'Image is required'),
  cta_text: z.string().min(1, 'CTA text is required'),
  cta_link: z.string().min(1, 'CTA link is required'),
});

const signatureCreationSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(1, 'Description is required'),
  image: z.string().min(1, 'Image is required'),
  product_slug: z.string().min(1, 'Product slug is required'),
});

type HeroSlide = z.infer<typeof heroSlideSchema>;
type SignatureCreation = z.infer<typeof signatureCreationSchema>;

export function Content() {
  const [loading, setLoading] = useState(false);
  const [heroSlides, setHeroSlides] = useState<HeroSlide[]>([
    {
      title: 'Original Basque Burnt Cheesecake',
      subtitle: 'Our signature burnt cheesecake with perfectly caramelised top',
      image: '/src/assets/basque-cheesecake-1.jpg',
      cta_text: 'Order Now',
      cta_link: '/product/basque-burnt-cheesecake'
    },
    {
      title: 'Tiramisu Basque Burnt Cheesecake',
      subtitle: 'Luxurious twist with delicate tiramisu-flavoured mascarpone layer',
      image: '/src/assets/tiramisu-cheesecake.jpg',
      cta_text: 'Order Now',
      cta_link: '/product/tiramisu-basque-cheesecake'
    },
    {
      title: 'Coconut Cashew Basque Cheesecake',
      subtitle: 'Rich cheesecake topped with roasted cashews and coconut flakes',
      image: '/src/assets/coconut-cashew-cheesecake-1.jpg',
      cta_text: 'Order Now',
      cta_link: '/product/coconut-cashew-cheesecake'
    }
  ]);

  const [signatureCreations, setSignatureCreations] = useState<SignatureCreation[]>([
    {
      title: 'Original Basque Burnt',
      description: 'The cake that started our journey - perfectly caramelised and creamy',
      image: '/src/assets/basque-cheesecake-1.jpg',
      product_slug: 'basque-burnt-cheesecake'
    },
    {
      title: 'Tiramisu Basque',
      description: 'Coffee-infused elegance meets Basque tradition',
      image: '/src/assets/tiramisu-cheesecake.jpg',
      product_slug: 'tiramisu-basque-cheesecake'
    },
    {
      title: 'Coconut Cashew',
      description: 'Tropical flavours with a delightful crunch',
      image: '/src/assets/coconut-cashew-cheesecake-1.jpg',
      product_slug: 'coconut-cashew-cheesecake'
    }
  ]);

  const [aboutContent, setAboutContent] = useState({
    hero_title: 'About Aurélise Bakery',
    hero_subtitle: 'Crafting artisan cheesecakes with passion and precision',
    story: 'Founded with a love for authentic Basque burnt cheesecakes, Aurélise brings traditional techniques to modern palates. Every cake is handcrafted using the finest ingredients, ensuring each bite delivers the perfect balance of creamy texture and caramelised flavour.',
    mission: 'Our mission is to share the joy of authentic artisan baking, creating memorable moments through exceptional cheesecakes made with traditional techniques and premium ingredients.',
    values: 'Quality, authenticity, and customer satisfaction are at the heart of everything we do.'
  });

  useEffect(() => {
    loadContentSettings();
  }, []);

  const loadContentSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('settings')
        .select('key, value')
        .in('key', ['hero_slides', 'signature_creations', 'about_content']);

      if (error) throw error;

      data?.forEach((setting) => {
        const value = JSON.parse(setting.value);
        switch (setting.key) {
          case 'hero_slides':
            setHeroSlides(value);
            break;
          case 'signature_creations':
            setSignatureCreations(value);
            break;
          case 'about_content':
            setAboutContent(value);
            break;
        }
      });
    } catch (error) {
      console.error('Error loading content settings:', error);
    }
  };

  const saveSettings = async (key: string, value: any) => {
    try {
      setLoading(true);

      const { error } = await supabase
        .from('settings')
        .upsert({
          key,
          value: JSON.stringify(value),
          type: 'JSON'
        });

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Content updated successfully',
      });
    } catch (error) {
      console.error('Error saving settings:', error);
      toast({
        title: 'Error',
        description: 'Failed to save content',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    // Mock image upload - in production, would use Supabase Storage
    const mockUrl = `https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=800&h=600&fit=crop&crop=center&${Math.random()}`;
    
    toast({
      title: 'Image Upload',
      description: 'Image upload integration pending. Using placeholder URL.',
    });

    return mockUrl;
  };

  const updateHeroSlide = (index: number, field: keyof HeroSlide, value: string) => {
    const newSlides = [...heroSlides];
    newSlides[index] = { ...newSlides[index], [field]: value };
    setHeroSlides(newSlides);
  };

  const updateSignatureCreation = (index: number, field: keyof SignatureCreation, value: string) => {
    const newCreations = [...signatureCreations];
    newCreations[index] = { ...newCreations[index], [field]: value };
    setSignatureCreations(newCreations);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Content Management</h1>
        <p className="text-muted-foreground">Manage homepage content, hero slides, and about information</p>
      </div>

      <Tabs defaultValue="hero" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="hero">Hero Slides</TabsTrigger>
          <TabsTrigger value="signature">Signature Creations</TabsTrigger>
          <TabsTrigger value="about">About Page</TabsTrigger>
        </TabsList>

        {/* Hero Slides */}
        <TabsContent value="hero" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-semibold">Hero Carousel Slides</h2>
            <Button onClick={() => saveSettings('hero_slides', heroSlides)} disabled={loading}>
              <Save className="h-4 w-4 mr-2" />
              Save Changes
            </Button>
          </div>

          <div className="grid gap-6">
            {heroSlides.map((slide, index) => (
              <Card key={index}>
                <CardHeader>
                  <CardTitle>Slide {index + 1}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label>Title</Label>
                        <Input
                          value={slide.title}
                          onChange={(e) => updateHeroSlide(index, 'title', e.target.value)}
                          placeholder="Slide title"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>Subtitle</Label>
                        <Textarea
                          value={slide.subtitle}
                          onChange={(e) => updateHeroSlide(index, 'subtitle', e.target.value)}
                          placeholder="Slide subtitle"
                          rows={3}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>CTA Text</Label>
                        <Input
                          value={slide.cta_text}
                          onChange={(e) => updateHeroSlide(index, 'cta_text', e.target.value)}
                          placeholder="Button text"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>CTA Link</Label>
                        <Input
                          value={slide.cta_link}
                          onChange={(e) => updateHeroSlide(index, 'cta_link', e.target.value)}
                          placeholder="/product/product-slug"
                        />
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label>Image</Label>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={async (e) => {
                            const url = await handleImageUpload(e);
                            if (url) updateHeroSlide(index, 'image', url);
                          }}
                          className="hidden"
                          id={`hero-image-${index}`}
                        />
                        <Label 
                          htmlFor={`hero-image-${index}`}
                          className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-muted-foreground/25 rounded-lg cursor-pointer hover:bg-muted/50"
                        >
                          <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                          <span className="text-sm text-muted-foreground">Upload new image</span>
                        </Label>
                      </div>

                      {slide.image && (
                        <img
                          src={slide.image}
                          alt={slide.title}
                          className="w-full h-32 object-cover rounded-md"
                        />
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Signature Creations */}
        <TabsContent value="signature" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-semibold">Signature Creations Section</h2>
            <Button onClick={() => saveSettings('signature_creations', signatureCreations)} disabled={loading}>
              <Save className="h-4 w-4 mr-2" />
              Save Changes
            </Button>
          </div>

          <div className="grid gap-6">
            {signatureCreations.map((creation, index) => (
              <Card key={index}>
                <CardHeader>
                  <CardTitle>Creation {index + 1}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label>Title</Label>
                        <Input
                          value={creation.title}
                          onChange={(e) => updateSignatureCreation(index, 'title', e.target.value)}
                          placeholder="Creation title"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>Description</Label>
                        <Textarea
                          value={creation.description}
                          onChange={(e) => updateSignatureCreation(index, 'description', e.target.value)}
                          placeholder="Creation description"
                          rows={3}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>Product Slug</Label>
                        <Input
                          value={creation.product_slug}
                          onChange={(e) => updateSignatureCreation(index, 'product_slug', e.target.value)}
                          placeholder="product-slug"
                        />
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label>Image</Label>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={async (e) => {
                            const url = await handleImageUpload(e);
                            if (url) updateSignatureCreation(index, 'image', url);
                          }}
                          className="hidden"
                          id={`creation-image-${index}`}
                        />
                        <Label 
                          htmlFor={`creation-image-${index}`}
                          className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-muted-foreground/25 rounded-lg cursor-pointer hover:bg-muted/50"
                        >
                          <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                          <span className="text-sm text-muted-foreground">Upload new image</span>
                        </Label>
                      </div>

                      {creation.image && (
                        <img
                          src={creation.image}
                          alt={creation.title}
                          className="w-full h-32 object-cover rounded-md"
                        />
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* About Content */}
        <TabsContent value="about" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-semibold">About Page Content</h2>
            <Button onClick={() => saveSettings('about_content', aboutContent)} disabled={loading}>
              <Save className="h-4 w-4 mr-2" />
              Save Changes
            </Button>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>About Page</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Hero Title</Label>
                <Input
                  value={aboutContent.hero_title}
                  onChange={(e) => setAboutContent(prev => ({ ...prev, hero_title: e.target.value }))}
                  placeholder="About page title"
                />
              </div>

              <div className="space-y-2">
                <Label>Hero Subtitle</Label>
                <Input
                  value={aboutContent.hero_subtitle}
                  onChange={(e) => setAboutContent(prev => ({ ...prev, hero_subtitle: e.target.value }))}
                  placeholder="About page subtitle"
                />
              </div>

              <div className="space-y-2">
                <Label>Our Story</Label>
                <Textarea
                  value={aboutContent.story}
                  onChange={(e) => setAboutContent(prev => ({ ...prev, story: e.target.value }))}
                  placeholder="Tell your story..."
                  rows={4}
                />
              </div>

              <div className="space-y-2">
                <Label>Our Mission</Label>
                <Textarea
                  value={aboutContent.mission}
                  onChange={(e) => setAboutContent(prev => ({ ...prev, mission: e.target.value }))}
                  placeholder="Your mission statement..."
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label>Our Values</Label>
                <Textarea
                  value={aboutContent.values}
                  onChange={(e) => setAboutContent(prev => ({ ...prev, values: e.target.value }))}
                  placeholder="Your core values..."
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}