import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.4';
import Stripe from 'https://esm.sh/stripe@17.0.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
  apiVersion: '2023-10-16',
  httpClient: Stripe.createFetchHttpClient(),
});

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

interface CreatePaymentIntentRequest {
  orderId: string;
  amount: number;
  currency: string;
  customerInfo: {
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
  };
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const method = req.method;
    const pathSegments = url.pathname.split('/').filter(Boolean);

    // POST /payments/create-intent - Create Stripe payment intent
    if (method === 'POST' && pathSegments[1] === 'create-intent') {
      const { orderId, amount, currency, customerInfo }: CreatePaymentIntentRequest = await req.json();

      // Validate order exists
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .select('*')
        .eq('id', orderId)
        .single();

      if (orderError || !order) {
        return new Response(JSON.stringify({ error: 'Order not found' }), {
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // Check if payment intent already exists
      if (order.payment_intent_id) {
        try {
          const existingIntent = await stripe.paymentIntents.retrieve(order.payment_intent_id);
          if (existingIntent.status === 'succeeded') {
            return new Response(JSON.stringify({ 
              error: 'Order already paid',
              paymentIntent: existingIntent 
            }), {
              status: 400,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            });
          }
          
          // Return existing intent if still pending
          if (['requires_payment_method', 'requires_confirmation', 'requires_action'].includes(existingIntent.status)) {
            return new Response(JSON.stringify({ 
              clientSecret: existingIntent.client_secret,
              paymentIntent: existingIntent 
            }), {
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            });
          }
        } catch (stripeError) {
          console.log('Existing payment intent not found, creating new one');
        }
      }

      // Create or find Stripe customer
      let customer;
      const customers = await stripe.customers.list({
        email: customerInfo.email,
        limit: 1
      });

      if (customers.data.length > 0) {
        customer = customers.data[0];
      } else {
        customer = await stripe.customers.create({
          email: customerInfo.email,
          name: `${customerInfo.first_name} ${customerInfo.last_name}`,
          phone: customerInfo.phone,
          metadata: {
            order_id: orderId,
            user_id: order.user_id || 'guest'
          }
        });
      }

      // Create payment intent
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(amount * 100), // Convert to pence/cents
        currency: currency.toLowerCase(),
        customer: customer.id,
        description: `Aurélise Bakery - Order #${order.order_number}`,
        metadata: {
          order_id: orderId,
          order_number: order.order_number,
          user_id: order.user_id || 'guest'
        },
        automatic_payment_methods: {
          enabled: true,
        },
        receipt_email: customerInfo.email,
      });

      // Update order with payment intent ID
      await supabase
        .from('orders')
        .update({ payment_intent_id: paymentIntent.id })
        .eq('id', orderId);

      return new Response(JSON.stringify({
        clientSecret: paymentIntent.client_secret,
        paymentIntent: paymentIntent
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // POST /payments/webhook - Handle Stripe webhooks
    if (method === 'POST' && pathSegments[1] === 'webhook') {
      const signature = req.headers.get('stripe-signature');
      if (!signature) {
        return new Response(JSON.stringify({ error: 'No signature' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const body = await req.text();
      let event;

      try {
        event = stripe.webhooks.constructEvent(
          body,
          signature,
          Deno.env.get('STRIPE_WEBHOOK_SECRET') || ''
        );
      } catch (err) {
        console.error('Webhook signature verification failed:', err);
        return new Response(JSON.stringify({ error: 'Invalid signature' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      console.log('Received webhook event:', event.type);

      // Handle different event types
      switch (event.type) {
        case 'payment_intent.succeeded':
          const paymentIntent = event.data.object as Stripe.PaymentIntent;
          
          // Update order status
          const { error: updateError } = await supabase
            .from('orders')
            .update({ 
              payment_status: 'COMPLETED',
              status: 'CONFIRMED'
            })
            .eq('payment_intent_id', paymentIntent.id);

          if (updateError) {
            console.error('Error updating order:', updateError);
          } else {
            console.log('Order updated successfully for payment:', paymentIntent.id);
            
            // Trigger order confirmation email
            try {
              const { data: order } = await supabase
                .from('orders')
                .select('*')
                .eq('payment_intent_id', paymentIntent.id)
                .single();

              if (order) {
                await supabase.functions.invoke('send-order-confirmation', {
                  body: { orderId: order.id }
                });
              }
            } catch (emailError) {
              console.error('Error sending confirmation email:', emailError);
            }
          }
          break;

        case 'payment_intent.payment_failed':
          const failedPayment = event.data.object as Stripe.PaymentIntent;
          
          await supabase
            .from('orders')
            .update({ payment_status: 'FAILED' })
            .eq('payment_intent_id', failedPayment.id);
          
          console.log('Payment failed for:', failedPayment.id);
          break;

        case 'payment_intent.canceled':
          const canceledPayment = event.data.object as Stripe.PaymentIntent;
          
          await supabase
            .from('orders')
            .update({ 
              payment_status: 'FAILED',
              status: 'CANCELLED'
            })
            .eq('payment_intent_id', canceledPayment.id);
          
          console.log('Payment canceled for:', canceledPayment.id);
          break;

        default:
          console.log(`Unhandled event type: ${event.type}`);
      }

      return new Response(JSON.stringify({ received: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // POST /payments/refund - Process refund (Admin only)
    if (method === 'POST' && pathSegments[1] === 'refund') {
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

      // Check admin access
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

      const { orderId, amount, reason } = await req.json();

      // Get order details
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .select('*')
        .eq('id', orderId)
        .single();

      if (orderError || !order || !order.payment_intent_id) {
        return new Response(JSON.stringify({ error: 'Order or payment not found' }), {
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // Process refund with Stripe
      const refund = await stripe.refunds.create({
        payment_intent: order.payment_intent_id,
        amount: amount ? Math.round(amount * 100) : undefined, // Partial or full refund
        reason: reason || 'requested_by_customer',
        metadata: {
          order_id: orderId,
          order_number: order.order_number,
          processed_by: user.id
        }
      });

      // Update order status
      await supabase
        .from('orders')
        .update({ 
          payment_status: amount && amount < order.total ? 'PARTIAL_REFUND' : 'REFUNDED',
          status: 'CANCELLED'
        })
        .eq('id', orderId);

      return new Response(JSON.stringify({
        refund,
        message: 'Refund processed successfully'
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ error: 'Not found' }), {
      status: 404,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Payment API error:', error);
    return new Response(JSON.stringify({ 
      error: 'Payment processing failed',
      details: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
};

serve(handler);