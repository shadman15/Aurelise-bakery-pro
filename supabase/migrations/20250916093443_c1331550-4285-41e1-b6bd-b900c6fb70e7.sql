-- Create custom types for enums
CREATE TYPE user_role AS ENUM ('CUSTOMER', 'ADMIN', 'SUPER_ADMIN');
CREATE TYPE order_status AS ENUM ('PENDING', 'CONFIRMED', 'PREPARING', 'READY', 'COMPLETED', 'CANCELLED');
CREATE TYPE delivery_type AS ENUM ('PICKUP', 'DELIVERY');
CREATE TYPE payment_status AS ENUM ('PENDING', 'COMPLETED', 'FAILED', 'REFUNDED');
CREATE TYPE address_type AS ENUM ('HOME', 'WORK', 'OTHER');
CREATE TYPE setting_type AS ENUM ('TEXT', 'NUMBER', 'BOOLEAN', 'JSON');

-- Create profiles table for additional user information
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  first_name TEXT,
  last_name TEXT,
  phone TEXT,
  role user_role NOT NULL DEFAULT 'CUSTOMER',
  email_verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create categories table
CREATE TABLE public.categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create products table
CREATE TABLE public.products (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  short_description TEXT,
  category_id UUID REFERENCES public.categories(id),
  featured BOOLEAN DEFAULT FALSE,
  active BOOLEAN DEFAULT TRUE,
  allergens TEXT[] DEFAULT '{}',
  ingredients TEXT[],
  images TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create product sizes table
CREATE TABLE public.product_sizes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  size TEXT NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  is_available BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create addresses table
CREATE TABLE public.addresses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type address_type NOT NULL DEFAULT 'HOME',
  street TEXT NOT NULL,
  city TEXT NOT NULL,
  postcode TEXT NOT NULL,
  county TEXT,
  country TEXT DEFAULT 'UK',
  is_default BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create orders table
CREATE TABLE public.orders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  order_number TEXT NOT NULL UNIQUE,
  user_id UUID REFERENCES auth.users(id),
  status order_status NOT NULL DEFAULT 'PENDING',
  customer_info JSONB NOT NULL,
  delivery_type delivery_type NOT NULL,
  delivery_address JSONB,
  delivery_fee DECIMAL(10,2) DEFAULT 0,
  order_date DATE NOT NULL,
  delivery_date DATE NOT NULL,
  delivery_time TEXT,
  subtotal DECIMAL(10,2) NOT NULL,
  tax DECIMAL(10,2) DEFAULT 0,
  total DECIMAL(10,2) NOT NULL,
  currency TEXT DEFAULT 'GBP',
  payment_status payment_status NOT NULL DEFAULT 'PENDING',
  payment_intent_id TEXT,
  special_instructions TEXT,
  allergen_acknowledged BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create order items table
CREATE TABLE public.order_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES public.products(id),
  size TEXT NOT NULL,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  price DECIMAL(10,2) NOT NULL,
  customizations JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create reviews table
CREATE TABLE public.reviews (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  approved BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create wishlist table
CREATE TABLE public.wishlist (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, product_id)
);

-- Create settings table
CREATE TABLE public.settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  key TEXT NOT NULL UNIQUE,
  value TEXT NOT NULL,
  type setting_type NOT NULL DEFAULT 'TEXT',
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_sizes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wishlist ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for profiles
CREATE POLICY "Users can view their own profile" ON public.profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Admins can view all profiles" ON public.profiles FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE user_id = auth.uid() AND role IN ('ADMIN', 'SUPER_ADMIN'))
);

-- Create RLS policies for categories (public read, admin write)
CREATE POLICY "Anyone can view active categories" ON public.categories FOR SELECT USING (active = TRUE);
CREATE POLICY "Admins can manage categories" ON public.categories FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE user_id = auth.uid() AND role IN ('ADMIN', 'SUPER_ADMIN'))
);

-- Create RLS policies for products (public read, admin write)
CREATE POLICY "Anyone can view active products" ON public.products FOR SELECT USING (active = TRUE);
CREATE POLICY "Admins can manage products" ON public.products FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE user_id = auth.uid() AND role IN ('ADMIN', 'SUPER_ADMIN'))
);

-- Create RLS policies for product sizes (public read, admin write)
CREATE POLICY "Anyone can view available product sizes" ON public.product_sizes FOR SELECT USING (is_available = TRUE);
CREATE POLICY "Admins can manage product sizes" ON public.product_sizes FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE user_id = auth.uid() AND role IN ('ADMIN', 'SUPER_ADMIN'))
);

-- Create RLS policies for addresses
CREATE POLICY "Users can manage their own addresses" ON public.addresses FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Admins can view all addresses" ON public.addresses FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE user_id = auth.uid() AND role IN ('ADMIN', 'SUPER_ADMIN'))
);

-- Create RLS policies for orders
CREATE POLICY "Users can view their own orders" ON public.orders FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create orders" ON public.orders FOR INSERT WITH CHECK (auth.uid() = user_id OR user_id IS NULL);
CREATE POLICY "Admins can manage all orders" ON public.orders FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE user_id = auth.uid() AND role IN ('ADMIN', 'SUPER_ADMIN'))
);

-- Create RLS policies for order items
CREATE POLICY "Users can view their own order items" ON public.order_items FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.orders WHERE id = order_id AND user_id = auth.uid())
);
CREATE POLICY "Users can create order items for their orders" ON public.order_items FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.orders WHERE id = order_id AND (user_id = auth.uid() OR user_id IS NULL))
);
CREATE POLICY "Admins can manage all order items" ON public.order_items FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE user_id = auth.uid() AND role IN ('ADMIN', 'SUPER_ADMIN'))
);

-- Create RLS policies for reviews
CREATE POLICY "Anyone can view approved reviews" ON public.reviews FOR SELECT USING (approved = TRUE);
CREATE POLICY "Users can create reviews" ON public.reviews FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own reviews" ON public.reviews FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Admins can manage all reviews" ON public.reviews FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE user_id = auth.uid() AND role IN ('ADMIN', 'SUPER_ADMIN'))
);

-- Create RLS policies for wishlist
CREATE POLICY "Users can manage their own wishlist" ON public.wishlist FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Admins can view all wishlists" ON public.wishlist FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE user_id = auth.uid() AND role IN ('ADMIN', 'SUPER_ADMIN'))
);

-- Create RLS policies for settings (admin only)
CREATE POLICY "Admins can manage settings" ON public.settings FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE user_id = auth.uid() AND role IN ('ADMIN', 'SUPER_ADMIN'))
);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create triggers for updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON public.categories FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON public.products FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_product_sizes_updated_at BEFORE UPDATE ON public.product_sizes FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_addresses_updated_at BEFORE UPDATE ON public.addresses FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON public.orders FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_reviews_updated_at BEFORE UPDATE ON public.reviews FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_settings_updated_at BEFORE UPDATE ON public.settings FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to generate order numbers
CREATE OR REPLACE FUNCTION public.generate_order_number()
RETURNS TEXT AS $$
DECLARE
  order_num TEXT;
  counter INTEGER;
BEGIN
  -- Get today's date in YYYYMMDD format
  order_num := 'AUR' || TO_CHAR(NOW(), 'YYYYMMDD');
  
  -- Get count of orders today and add 1
  SELECT COUNT(*) + 1 INTO counter
  FROM public.orders
  WHERE order_number LIKE order_num || '%';
  
  -- Append 3-digit counter
  order_num := order_num || LPAD(counter::TEXT, 3, '0');
  
  RETURN order_num;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create function to handle new user registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, first_name, last_name, role)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data ->> 'first_name',
    NEW.raw_user_meta_data ->> 'last_name',
    'CUSTOMER'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create trigger for new user registration
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create indexes for better performance
CREATE INDEX idx_profiles_user_id ON public.profiles(user_id);
CREATE INDEX idx_profiles_role ON public.profiles(role);
CREATE INDEX idx_products_slug ON public.products(slug);
CREATE INDEX idx_products_category_id ON public.products(category_id);
CREATE INDEX idx_products_featured ON public.products(featured);
CREATE INDEX idx_products_active ON public.products(active);
CREATE INDEX idx_product_sizes_product_id ON public.product_sizes(product_id);
CREATE INDEX idx_orders_user_id ON public.orders(user_id);
CREATE INDEX idx_orders_status ON public.orders(status);
CREATE INDEX idx_orders_order_number ON public.orders(order_number);
CREATE INDEX idx_orders_delivery_date ON public.orders(delivery_date);
CREATE INDEX idx_order_items_order_id ON public.order_items(order_id);
CREATE INDEX idx_order_items_product_id ON public.order_items(product_id);
CREATE INDEX idx_reviews_product_id ON public.reviews(product_id);
CREATE INDEX idx_reviews_user_id ON public.reviews(user_id);
CREATE INDEX idx_reviews_approved ON public.reviews(approved);
CREATE INDEX idx_wishlist_user_id ON public.wishlist(user_id);
CREATE INDEX idx_addresses_user_id ON public.addresses(user_id);

-- Insert sample categories
INSERT INTO public.categories (name, slug, description) VALUES
('Cheesecakes', 'cheesecakes', 'Artisanal cheesecakes with premium ingredients'),
('Seasonal Specials', 'seasonal-specials', 'Limited time seasonal offerings'),
('Custom Cakes', 'custom-cakes', 'Bespoke cakes for special occasions');

-- Insert sample products
INSERT INTO public.products (name, slug, description, short_description, category_id, featured, allergens, ingredients, images) 
SELECT 
  'Basque Burnt Cheesecake',
  'basque-burnt-cheesecake',
  'Our signature Basque burnt cheesecake with its characteristic caramelized top and creamy interior. Made with premium cream cheese, farm-fresh eggs, and a hint of vanilla.',
  'Rich, creamy perfection with our signature burnt top',
  c.id,
  true,
  ARRAY['Milk', 'Eggs'],
  ARRAY['Cream cheese', 'Double cream', 'Caster sugar', 'Free-range eggs', 'Vanilla extract', 'Plain flour'],
  ARRAY['/assets/basque-cheesecake-1.jpg', '/assets/basque-cheesecake-2.jpg', '/assets/basque-cheesecake-3.jpg']
FROM public.categories c WHERE c.slug = 'cheesecakes';

INSERT INTO public.products (name, slug, description, short_description, category_id, featured, allergens, ingredients, images)
SELECT 
  'Tiramisu Basque Cheesecake',
  'tiramisu-basque-cheesecake',
  'A delightful fusion of Italian tiramisu and Basque cheesecake. Features coffee-soaked ladyfingers, mascarpone cream, and our signature burnt top with a dusting of cocoa.',
  'Coffee-kissed cream meets caramelized perfection',
  c.id,
  true,
  ARRAY['Milk', 'Eggs', 'Gluten'],
  ARRAY['Mascarpone', 'Cream cheese', 'Strong coffee', 'Ladyfinger biscuits', 'Free-range eggs', 'Caster sugar', 'Cocoa powder'],
  ARRAY['/assets/tiramisu-cheesecake.jpg', '/assets/tiramisu-cheesecake-full.jpg']
FROM public.categories c WHERE c.slug = 'cheesecakes';

INSERT INTO public.products (name, slug, description, short_description, category_id, featured, allergens, ingredients, images)
SELECT 
  'Coconut Cashew Basque Cheesecake',
  'coconut-cashew-basque-cheesecake',
  'A tropical twist on our classic Basque cheesecake with roasted cashews and coconut flakes. Dairy-free option available using coconut cream.',
  'Tropical twist with premium cashews and coconut',
  c.id,
  true,
  ARRAY['Milk', 'Eggs', 'Tree Nuts', 'Coconut'],
  ARRAY['Cream cheese', 'Coconut cream', 'Roasted cashews', 'Coconut flakes', 'Free-range eggs', 'Coconut sugar'],
  ARRAY['/assets/coconut-cashew-cheesecake-1.jpg', '/assets/coconut-cashew-cheesecake-2.jpg', '/assets/coconut-cashew-slice.jpg']
FROM public.categories c WHERE c.slug = 'cheesecakes';

-- Insert product sizes
INSERT INTO public.product_sizes (product_id, size, price)
SELECT p.id, '6"', 22.00 FROM public.products p WHERE p.slug = 'basque-burnt-cheesecake';

INSERT INTO public.product_sizes (product_id, size, price)
SELECT p.id, '8"', 34.00 FROM public.products p WHERE p.slug = 'basque-burnt-cheesecake';

INSERT INTO public.product_sizes (product_id, size, price)
SELECT p.id, '10"', 46.00 FROM public.products p WHERE p.slug = 'basque-burnt-cheesecake';

INSERT INTO public.product_sizes (product_id, size, price)
SELECT p.id, '8"', 38.00 FROM public.products p WHERE p.slug = 'tiramisu-basque-cheesecake';

INSERT INTO public.product_sizes (product_id, size, price)
SELECT p.id, '8"', 36.00 FROM public.products p WHERE p.slug = 'coconut-cashew-basque-cheesecake';

-- Insert default settings
INSERT INTO public.settings (key, value, type, description) VALUES
('business_hours', '{"monday":"9:00-17:00","tuesday":"9:00-17:00","wednesday":"9:00-17:00","thursday":"9:00-17:00","friday":"9:00-18:00","saturday":"8:00-18:00","sunday":"10:00-16:00"}', 'JSON', 'Business opening hours'),
('delivery_fee', '5.99', 'NUMBER', 'Standard delivery fee'),
('minimum_order_days', '3', 'NUMBER', 'Minimum days advance notice for orders'),
('tax_rate', '0.20', 'NUMBER', 'VAT rate (20%)'),
('delivery_radius', '15', 'NUMBER', 'Maximum delivery radius in miles'),
('site_maintenance', 'false', 'BOOLEAN', 'Site maintenance mode'),
('order_confirmation_email', 'true', 'BOOLEAN', 'Send order confirmation emails'),
('max_daily_orders', '50', 'NUMBER', 'Maximum orders per day');