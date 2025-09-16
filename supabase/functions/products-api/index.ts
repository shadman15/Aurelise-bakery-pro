import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  short_description: string;
  category_id: string;
  featured: boolean;
  active: boolean;
  allergens: string[];
  ingredients: string[];
  images: string[];
}

interface ProductWithSizes extends Product {
  sizes: {
    id: string;
    size: string;
    price: number;
    is_available: boolean;
  }[];
  category: {
    name: string;
    slug: string;
  };
}

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const pathSegments = url.pathname.split('/').filter(Boolean);
    const method = req.method;

    // GET /products - List all products with filtering
    if (method === 'GET' && pathSegments.length === 2) {
      const category = url.searchParams.get('category');
      const featured = url.searchParams.get('featured');
      const search = url.searchParams.get('search');
      const page = parseInt(url.searchParams.get('page') || '1');
      const limit = parseInt(url.searchParams.get('limit') || '12');
      const offset = (page - 1) * limit;

      let query = supabase
        .from('products')
        .select(`
          *,
          sizes:product_sizes(*),
          category:categories(name, slug)
        `)
        .eq('active', true)
        .order('created_at', { ascending: false });

      if (category) {
        query = query.eq('category.slug', category);
      }

      if (featured === 'true') {
        query = query.eq('featured', true);
      }

      if (search) {
        query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%`);
      }

      const { data: products, error, count } = await query
        .range(offset, offset + limit - 1);

      if (error) {
        console.error('Error fetching products:', error);
        return new Response(JSON.stringify({ error: error.message }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      return new Response(JSON.stringify({
        products,
        pagination: {
          page,
          limit,
          total: count,
          totalPages: Math.ceil((count || 0) / limit)
        }
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // GET /products/:slug - Get single product by slug
    if (method === 'GET' && pathSegments.length === 3) {
      const slug = pathSegments[2];

      const { data: product, error } = await supabase
        .from('products')
        .select(`
          *,
          sizes:product_sizes(*),
          category:categories(name, slug),
          reviews:reviews!inner(
            id, rating, comment, created_at,
            user:profiles(first_name, last_name)
          )
        `)
        .eq('slug', slug)
        .eq('active', true)
        .eq('reviews.approved', true)
        .single();

      if (error) {
        console.error('Error fetching product:', error);
        return new Response(JSON.stringify({ error: 'Product not found' }), {
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // Get related products
      const { data: relatedProducts } = await supabase
        .from('products')
        .select(`
          id, name, slug, short_description, images,
          sizes:product_sizes(size, price)
        `)
        .eq('category_id', product.category_id)
        .neq('id', product.id)
        .eq('active', true)
        .limit(3);

      return new Response(JSON.stringify({
        product,
        relatedProducts: relatedProducts || []
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // GET /categories - Get all categories
    if (method === 'GET' && url.pathname.includes('categories')) {
      const { data: categories, error } = await supabase
        .from('categories')
        .select('*')
        .eq('active', true)
        .order('name');

      if (error) {
        return new Response(JSON.stringify({ error: error.message }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      return new Response(JSON.stringify({ categories }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Admin endpoints (require authentication)
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Invalid token' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Check if user is admin
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('user_id', user.id)
      .single();

    if (!profile || !['ADMIN', 'SUPER_ADMIN'].includes(profile.role)) {
      return new Response(JSON.stringify({ error: 'Admin access required' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // POST /admin/products - Create new product
    if (method === 'POST' && url.pathname.includes('admin/products')) {
      const productData = await req.json();

      const { data: product, error } = await supabase
        .from('products')
        .insert({
          name: productData.name,
          slug: productData.slug,
          description: productData.description,
          short_description: productData.short_description,
          category_id: productData.category_id,
          featured: productData.featured || false,
          active: productData.active ?? true,
          allergens: productData.allergens || [],
          ingredients: productData.ingredients || [],
          images: productData.images || []
        })
        .select()
        .single();

      if (error) {
        return new Response(JSON.stringify({ error: error.message }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // Insert product sizes
      if (productData.sizes && productData.sizes.length > 0) {
        const sizesData = productData.sizes.map((size: any) => ({
          product_id: product.id,
          size: size.size,
          price: size.price,
          is_available: size.is_available ?? true
        }));

        await supabase.from('product_sizes').insert(sizesData);
      }

      return new Response(JSON.stringify({ product }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // PUT /admin/products/:id - Update product
    if (method === 'PUT' && url.pathname.includes('admin/products/')) {
      const productId = pathSegments[pathSegments.length - 1];
      const productData = await req.json();

      const { data: product, error } = await supabase
        .from('products')
        .update({
          name: productData.name,
          slug: productData.slug,
          description: productData.description,
          short_description: productData.short_description,
          category_id: productData.category_id,
          featured: productData.featured,
          active: productData.active,
          allergens: productData.allergens,
          ingredients: productData.ingredients,
          images: productData.images
        })
        .eq('id', productId)
        .select()
        .single();

      if (error) {
        return new Response(JSON.stringify({ error: error.message }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      return new Response(JSON.stringify({ product }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ error: 'Not found' }), {
      status: 404,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Unexpected error:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
};

serve(handler);