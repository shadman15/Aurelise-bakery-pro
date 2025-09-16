import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

// Middleware to get authenticated user
const getAuthenticatedUser = async (req: Request) => {
  const authHeader = req.headers.get('Authorization');
  if (!authHeader) {
    throw new Error('Authentication required');
  }

  const token = authHeader.replace('Bearer ', '');
  const { data: { user }, error: authError } = await supabase.auth.getUser(token);

  if (authError || !user) {
    throw new Error('Invalid token');
  }

  return user;
};

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const method = req.method;
    const pathSegments = url.pathname.split('/').filter(Boolean);

    // GET /user/profile - Get user profile
    if (method === 'GET' && pathSegments[1] === 'profile') {
      const user = await getAuthenticatedUser(req);

      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error) {
        return new Response(JSON.stringify({ error: error.message }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      return new Response(JSON.stringify({ profile }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // PUT /user/profile - Update user profile
    if (method === 'PUT' && pathSegments[1] === 'profile') {
      const user = await getAuthenticatedUser(req);
      const profileData = await req.json();

      const { data: profile, error } = await supabase
        .from('profiles')
        .update({
          first_name: profileData.first_name,
          last_name: profileData.last_name,
          phone: profileData.phone
        })
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) {
        return new Response(JSON.stringify({ error: error.message }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      return new Response(JSON.stringify({ 
        profile,
        message: 'Profile updated successfully'
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // GET /user/addresses - Get user addresses
    if (method === 'GET' && pathSegments[1] === 'addresses') {
      const user = await getAuthenticatedUser(req);

      const { data: addresses, error } = await supabase
        .from('addresses')
        .select('*')
        .eq('user_id', user.id)
        .order('is_default', { ascending: false });

      if (error) {
        return new Response(JSON.stringify({ error: error.message }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      return new Response(JSON.stringify({ addresses }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // POST /user/addresses - Add new address
    if (method === 'POST' && pathSegments[1] === 'addresses') {
      const user = await getAuthenticatedUser(req);
      const addressData = await req.json();

      // If this is set as default, update other addresses
      if (addressData.is_default) {
        await supabase
          .from('addresses')
          .update({ is_default: false })
          .eq('user_id', user.id);
      }

      const { data: address, error } = await supabase
        .from('addresses')
        .insert({
          user_id: user.id,
          type: addressData.type || 'HOME',
          street: addressData.street,
          city: addressData.city,
          postcode: addressData.postcode,
          county: addressData.county,
          country: addressData.country || 'UK',
          is_default: addressData.is_default || false
        })
        .select()
        .single();

      if (error) {
        return new Response(JSON.stringify({ error: error.message }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      return new Response(JSON.stringify({ 
        address,
        message: 'Address added successfully'
      }), {
        status: 201,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // PUT /user/addresses/:id - Update address
    if (method === 'PUT' && pathSegments[1] === 'addresses' && pathSegments[2]) {
      const user = await getAuthenticatedUser(req);
      const addressId = pathSegments[2];
      const addressData = await req.json();

      // If this is set as default, update other addresses
      if (addressData.is_default) {
        await supabase
          .from('addresses')
          .update({ is_default: false })
          .eq('user_id', user.id)
          .neq('id', addressId);
      }

      const { data: address, error } = await supabase
        .from('addresses')
        .update({
          type: addressData.type,
          street: addressData.street,
          city: addressData.city,
          postcode: addressData.postcode,
          county: addressData.county,
          country: addressData.country,
          is_default: addressData.is_default
        })
        .eq('id', addressId)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) {
        return new Response(JSON.stringify({ error: error.message }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      return new Response(JSON.stringify({ 
        address,
        message: 'Address updated successfully'
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // DELETE /user/addresses/:id - Delete address
    if (method === 'DELETE' && pathSegments[1] === 'addresses' && pathSegments[2]) {
      const user = await getAuthenticatedUser(req);
      const addressId = pathSegments[2];

      const { error } = await supabase
        .from('addresses')
        .delete()
        .eq('id', addressId)
        .eq('user_id', user.id);

      if (error) {
        return new Response(JSON.stringify({ error: error.message }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      return new Response(JSON.stringify({ 
        message: 'Address deleted successfully'
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // GET /user/wishlist - Get user wishlist
    if (method === 'GET' && pathSegments[1] === 'wishlist') {
      const user = await getAuthenticatedUser(req);

      const { data: wishlist, error } = await supabase
        .from('wishlist')
        .select(`
          id, created_at,
          product:products(
            id, name, slug, short_description, images,
            sizes:product_sizes(size, price)
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        return new Response(JSON.stringify({ error: error.message }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      return new Response(JSON.stringify({ wishlist }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // POST /user/wishlist/:productId - Add to wishlist
    if (method === 'POST' && pathSegments[1] === 'wishlist' && pathSegments[2]) {
      const user = await getAuthenticatedUser(req);
      const productId = pathSegments[2];

      const { data: wishlistItem, error } = await supabase
        .from('wishlist')
        .insert({
          user_id: user.id,
          product_id: productId
        })
        .select()
        .single();

      if (error) {
        // Handle duplicate entry
        if (error.code === '23505') {
          return new Response(JSON.stringify({ 
            error: 'Product already in wishlist' 
          }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }
        
        return new Response(JSON.stringify({ error: error.message }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      return new Response(JSON.stringify({ 
        wishlistItem,
        message: 'Added to wishlist'
      }), {
        status: 201,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // DELETE /user/wishlist/:productId - Remove from wishlist
    if (method === 'DELETE' && pathSegments[1] === 'wishlist' && pathSegments[2]) {
      const user = await getAuthenticatedUser(req);
      const productId = pathSegments[2];

      const { error } = await supabase
        .from('wishlist')
        .delete()
        .eq('user_id', user.id)
        .eq('product_id', productId);

      if (error) {
        return new Response(JSON.stringify({ error: error.message }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      return new Response(JSON.stringify({ 
        message: 'Removed from wishlist'
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // POST /user/reviews - Create product review
    if (method === 'POST' && pathSegments[1] === 'reviews') {
      const user = await getAuthenticatedUser(req);
      const { product_id, rating, comment } = await req.json();

      if (!product_id || !rating || rating < 1 || rating > 5) {
        return new Response(JSON.stringify({ 
          error: 'Valid product_id and rating (1-5) are required' 
        }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const { data: review, error } = await supabase
        .from('reviews')
        .insert({
          user_id: user.id,
          product_id,
          rating,
          comment: comment || null,
          approved: false
        })
        .select()
        .single();

      if (error) {
        return new Response(JSON.stringify({ error: error.message }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      return new Response(JSON.stringify({ 
        review,
        message: 'Review submitted for approval'
      }), {
        status: 201,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ error: 'Not found' }), {
      status: 404,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('User API error:', error);
    
    if (error.message.includes('Authentication') || error.message.includes('Invalid token')) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
};

serve(handler);