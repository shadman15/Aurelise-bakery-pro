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

// Middleware to check admin access
const checkAdminAccess = async (req: Request) => {
  const authHeader = req.headers.get('Authorization');
  if (!authHeader) {
    throw new Error('Authentication required');
  }

  const token = authHeader.replace('Bearer ', '');
  const { data: { user }, error: authError } = await supabase.auth.getUser(token);

  if (authError || !user) {
    throw new Error('Invalid token');
  }

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('role')
    .eq('user_id', user.id)
    .single();

  if (profileError || !profile || !['ADMIN', 'SUPER_ADMIN'].includes(profile.role)) {
    throw new Error('Admin access required');
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

    // Check admin access for all endpoints
    const user = await checkAdminAccess(req);

    // GET /admin/dashboard - Dashboard statistics
    if (method === 'GET' && pathSegments[2] === 'dashboard') {
      const today = new Date().toISOString().split('T')[0];
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

      // Get today's orders
      const { count: todayOrders } = await supabase
        .from('orders')
        .select('*', { count: 'exact' })
        .eq('order_date', today);

      // Get today's revenue
      const { data: todayRevenue } = await supabase
        .from('orders')
        .select('total')
        .eq('order_date', today)
        .eq('payment_status', 'COMPLETED');

      const todayTotal = todayRevenue?.reduce((sum, order) => sum + parseFloat(order.total), 0) || 0;

      // Get monthly orders
      const { count: monthlyOrders } = await supabase
        .from('orders')
        .select('*', { count: 'exact' })
        .gte('order_date', thirtyDaysAgo);

      // Get monthly revenue
      const { data: monthlyRevenue } = await supabase
        .from('orders')
        .select('total')
        .gte('order_date', thirtyDaysAgo)
        .eq('payment_status', 'COMPLETED');

      const monthlyTotal = monthlyRevenue?.reduce((sum, order) => sum + parseFloat(order.total), 0) || 0;

      // Get pending orders
      const { count: pendingOrders } = await supabase
        .from('orders')
        .select('*', { count: 'exact' })
        .eq('status', 'PENDING');

      // Get popular products (top 5)
      const { data: popularProducts } = await supabase
        .from('order_items')
        .select(`
          product_id,
          product:products(name),
          quantity
        `)
        .order('quantity', { ascending: false })
        .limit(5);

      // Get recent orders
      const { data: recentOrders } = await supabase
        .from('orders')
        .select(`
          id, order_number, total, status, delivery_date,
          customer_info
        `)
        .order('created_at', { ascending: false })
        .limit(10);

      return new Response(JSON.stringify({
        stats: {
          todayOrders: todayOrders || 0,
          todayRevenue: todayTotal,
          monthlyOrders: monthlyOrders || 0,
          monthlyRevenue: monthlyTotal,
          pendingOrders: pendingOrders || 0
        },
        popularProducts: popularProducts || [],
        recentOrders: recentOrders || []
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // GET /admin/orders - Get all orders with filtering
    if (method === 'GET' && pathSegments[2] === 'orders') {
      const status = url.searchParams.get('status');
      const date = url.searchParams.get('date');
      const page = parseInt(url.searchParams.get('page') || '1');
      const limit = parseInt(url.searchParams.get('limit') || '20');
      const offset = (page - 1) * limit;

      let query = supabase
        .from('orders')
        .select(`
          *,
          items:order_items(
            *,
            product:products(name, images)
          )
        `, { count: 'exact' })
        .order('created_at', { ascending: false });

      if (status) {
        query = query.eq('status', status);
      }

      if (date) {
        query = query.eq('delivery_date', date);
      }

      const { data: orders, error, count } = await query
        .range(offset, offset + limit - 1);

      if (error) {
        return new Response(JSON.stringify({ error: error.message }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      return new Response(JSON.stringify({
        orders,
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

    // PUT /admin/orders/:id/status - Update order status
    if (method === 'PUT' && pathSegments[2] === 'orders' && pathSegments[4] === 'status') {
      const orderId = pathSegments[3];
      const { status } = await req.json();

      const validStatuses = ['PENDING', 'CONFIRMED', 'PREPARING', 'READY', 'COMPLETED', 'CANCELLED'];
      if (!validStatuses.includes(status)) {
        return new Response(JSON.stringify({ error: 'Invalid status' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const { data: order, error } = await supabase
        .from('orders')
        .update({ status })
        .eq('id', orderId)
        .select()
        .single();

      if (error) {
        return new Response(JSON.stringify({ error: error.message }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      return new Response(JSON.stringify({ 
        order,
        message: 'Order status updated successfully'
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // GET /admin/customers - Get all customers
    if (method === 'GET' && pathSegments[2] === 'customers') {
      const { data: customers, error } = await supabase
        .from('profiles')
        .select(`
          *,
          orders:orders(count)
        `)
        .eq('role', 'CUSTOMER')
        .order('created_at', { ascending: false });

      if (error) {
        return new Response(JSON.stringify({ error: error.message }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      return new Response(JSON.stringify({ customers }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // GET /admin/settings - Get all settings
    if (method === 'GET' && pathSegments[2] === 'settings') {
      const { data: settings, error } = await supabase
        .from('settings')
        .select('*')
        .order('key');

      if (error) {
        return new Response(JSON.stringify({ error: error.message }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      return new Response(JSON.stringify({ settings }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // PUT /admin/settings - Update settings
    if (method === 'PUT' && pathSegments[2] === 'settings') {
      const { settings } = await req.json();

      const updates = Object.entries(settings).map(([key, value]) => ({
        key,
        value: String(value)
      }));

      const { data: updatedSettings, error } = await supabase
        .from('settings')
        .upsert(updates, { onConflict: 'key' })
        .select();

      if (error) {
        return new Response(JSON.stringify({ error: error.message }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      return new Response(JSON.stringify({ 
        settings: updatedSettings,
        message: 'Settings updated successfully'
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // GET /admin/reviews - Get all reviews for moderation
    if (method === 'GET' && pathSegments[2] === 'reviews') {
      const approved = url.searchParams.get('approved');
      
      let query = supabase
        .from('reviews')
        .select(`
          *,
          product:products(name),
          user:profiles(first_name, last_name)
        `)
        .order('created_at', { ascending: false });

      if (approved !== null) {
        query = query.eq('approved', approved === 'true');
      }

      const { data: reviews, error } = await query;

      if (error) {
        return new Response(JSON.stringify({ error: error.message }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      return new Response(JSON.stringify({ reviews }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // PUT /admin/reviews/:id/approve - Approve/disapprove review
    if (method === 'PUT' && pathSegments[2] === 'reviews' && pathSegments[4] === 'approve') {
      const reviewId = pathSegments[3];
      const { approved } = await req.json();

      const { data: review, error } = await supabase
        .from('reviews')
        .update({ approved })
        .eq('id', reviewId)
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
        message: `Review ${approved ? 'approved' : 'disapproved'} successfully`
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ error: 'Not found' }), {
      status: 404,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Admin API error:', error);
    
    if (error.message.includes('Authentication') || error.message.includes('Admin access')) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: error.message.includes('Authentication') ? 401 : 403,
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