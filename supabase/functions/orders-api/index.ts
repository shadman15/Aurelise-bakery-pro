import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface OrderItem {
  product_id: string;
  size: string;
  quantity: number;
  price: number;
  customizations?: Record<string, any>;
}

interface CreateOrderRequest {
  items: OrderItem[];
  delivery_type: 'PICKUP' | 'DELIVERY';
  delivery_date: string;
  delivery_time?: string;
  delivery_address?: any;
  special_instructions?: string;
  customer_info: {
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
  };
}

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

// Function to validate delivery date (minimum 3 days in advance)
const validateDeliveryDate = (deliveryDate: string): boolean => {
  const minDate = new Date();
  minDate.setDate(minDate.getDate() + 3);
  const requestedDate = new Date(deliveryDate);
  return requestedDate >= minDate;
};

// Function to calculate delivery fee based on postcode
const calculateDeliveryFee = async (postcode?: string): Promise<number> => {
  if (!postcode) return 0;
  
  // Get delivery fee from settings
  const { data: setting } = await supabase
    .from('settings')
    .select('value')
    .eq('key', 'delivery_fee')
    .single();
    
  return parseFloat(setting?.value || '5.99');
};

// Function to calculate tax
const calculateTax = async (subtotal: number): Promise<number> => {
  const { data: setting } = await supabase
    .from('settings')
    .select('value')
    .eq('key', 'tax_rate')
    .single();
    
  const taxRate = parseFloat(setting?.value || '0.20');
  return Math.round(subtotal * taxRate * 100) / 100;
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

    // POST /orders - Create new order
    if (method === 'POST' && pathSegments.length === 2) {
      const orderData: CreateOrderRequest = await req.json();

      // Validate delivery date
      if (!validateDeliveryDate(orderData.delivery_date)) {
        return new Response(JSON.stringify({ 
          error: 'Delivery date must be at least 3 days in advance' 
        }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // Calculate subtotal
      let subtotal = 0;
      for (const item of orderData.items) {
        subtotal += item.price * item.quantity;
      }

      // Calculate delivery fee
      const deliveryFee = orderData.delivery_type === 'DELIVERY' 
        ? await calculateDeliveryFee(orderData.delivery_address?.postcode)
        : 0;

      // Calculate tax
      const tax = await calculateTax(subtotal);
      const total = subtotal + deliveryFee + tax;

      // Get user ID from auth header if provided
      let userId = null;
      const authHeader = req.headers.get('Authorization');
      if (authHeader) {
        const token = authHeader.replace('Bearer ', '');
        const { data: { user } } = await supabase.auth.getUser(token);
        userId = user?.id || null;
      }

      // Generate order number
      const { data: orderNumberResult } = await supabase
        .rpc('generate_order_number');
      
      const orderNumber = orderNumberResult || `AUR${Date.now()}`;

      // Create order
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          order_number: orderNumber,
          user_id: userId,
          status: 'PENDING',
          customer_info: orderData.customer_info,
          delivery_type: orderData.delivery_type,
          delivery_address: orderData.delivery_address,
          delivery_fee: deliveryFee,
          order_date: new Date().toISOString().split('T')[0],
          delivery_date: orderData.delivery_date,
          delivery_time: orderData.delivery_time,
          subtotal: subtotal,
          tax: tax,
          total: total,
          special_instructions: orderData.special_instructions,
          allergen_acknowledged: true
        })
        .select()
        .single();

      if (orderError) {
        console.error('Error creating order:', orderError);
        return new Response(JSON.stringify({ error: orderError.message }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // Create order items
      const orderItems = orderData.items.map(item => ({
        order_id: order.id,
        product_id: item.product_id,
        size: item.size,
        quantity: item.quantity,
        price: item.price,
        customizations: item.customizations || {}
      }));

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);

      if (itemsError) {
        // Rollback order if items creation fails
        await supabase.from('orders').delete().eq('id', order.id);
        return new Response(JSON.stringify({ error: itemsError.message }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      return new Response(JSON.stringify({ 
        order,
        message: 'Order created successfully'
      }), {
        status: 201,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // GET /orders - Get user's orders
    if (method === 'GET' && pathSegments.length === 2) {
      const authHeader = req.headers.get('Authorization');
      if (!authHeader) {
        return new Response(JSON.stringify({ error: 'Authentication required' }), {
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

      const { data: orders, error } = await supabase
        .from('orders')
        .select(`
          *,
          items:order_items(
            *,
            product:products(name, images)
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

      return new Response(JSON.stringify({ orders }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // GET /orders/:id - Get specific order
    if (method === 'GET' && pathSegments.length === 3) {
      const orderId = pathSegments[2];
      const authHeader = req.headers.get('Authorization');
      
      if (!authHeader) {
        return new Response(JSON.stringify({ error: 'Authentication required' }), {
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

      const { data: order, error } = await supabase
        .from('orders')
        .select(`
          *,
          items:order_items(
            *,
            product:products(name, images, allergens)
          )
        `)
        .eq('id', orderId)
        .eq('user_id', user.id)
        .single();

      if (error) {
        return new Response(JSON.stringify({ error: 'Order not found' }), {
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      return new Response(JSON.stringify({ order }), {
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