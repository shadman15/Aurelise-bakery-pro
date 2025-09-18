-- Create missing tables for cart functionality and search
CREATE TABLE IF NOT EXISTS public.carts (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  session_id text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT carts_user_or_session CHECK (user_id IS NOT NULL OR session_id IS NOT NULL)
);

CREATE TABLE IF NOT EXISTS public.cart_items (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  cart_id uuid NOT NULL REFERENCES public.carts(id) ON DELETE CASCADE,
  product_id uuid NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  size text NOT NULL,
  quantity integer NOT NULL DEFAULT 1 CHECK (quantity > 0),
  unit_price numeric NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(cart_id, product_id, size)
);

-- Enable RLS on new tables
ALTER TABLE public.carts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cart_items ENABLE ROW LEVEL SECURITY;

-- RLS policies for carts
CREATE POLICY "Users can access their own carts by user_id" 
ON public.carts FOR ALL 
USING (auth.uid() = user_id OR session_id = current_setting('app.session_id', true));

CREATE POLICY "Admins can view all carts" 
ON public.carts FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM profiles 
  WHERE profiles.user_id = auth.uid() 
  AND profiles.role IN ('ADMIN', 'SUPER_ADMIN')
));

-- RLS policies for cart_items  
CREATE POLICY "Users can access cart items for their carts" 
ON public.cart_items FOR ALL 
USING (EXISTS (
  SELECT 1 FROM public.carts 
  WHERE carts.id = cart_items.cart_id 
  AND (carts.user_id = auth.uid() OR carts.session_id = current_setting('app.session_id', true))
));

CREATE POLICY "Admins can view all cart items" 
ON public.cart_items FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM profiles 
  WHERE profiles.user_id = auth.uid() 
  AND profiles.role IN ('ADMIN', 'SUPER_ADMIN')
));

-- Add triggers for updated_at
CREATE TRIGGER update_carts_updated_at
  BEFORE UPDATE ON public.carts
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create search function for products
CREATE OR REPLACE FUNCTION public.search_products(search_query text)
RETURNS TABLE (
  id uuid,
  name text,
  slug text,
  short_description text,
  description text,
  category_id uuid,
  featured boolean,
  active boolean,
  created_at timestamp with time zone,
  updated_at timestamp with time zone,
  allergens text[],
  ingredients text[],
  images text[]
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id, p.name, p.slug, p.short_description, p.description,
    p.category_id, p.featured, p.active, p.created_at, p.updated_at,
    p.allergens, p.ingredients, p.images
  FROM public.products p
  WHERE p.active = true
  AND (
    p.name ILIKE '%' || search_query || '%' OR
    p.short_description ILIKE '%' || search_query || '%' OR
    p.description ILIKE '%' || search_query || '%' OR
    array_to_string(p.allergens, ' ') ILIKE '%' || search_query || '%' OR
    array_to_string(p.ingredients, ' ') ILIKE '%' || search_query || '%'
  )
  ORDER BY 
    CASE 
      WHEN p.name ILIKE '%' || search_query || '%' THEN 1
      WHEN p.short_description ILIKE '%' || search_query || '%' THEN 2
      ELSE 3
    END,
    p.featured DESC,
    p.name ASC;
END;
$$;