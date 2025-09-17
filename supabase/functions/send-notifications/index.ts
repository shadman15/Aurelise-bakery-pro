import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.4';
import { Resend } from 'npm:resend@2.0.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const resend = new Resend(Deno.env.get('RESEND_API_KEY'));

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

// Email templates
const getStatusUpdateTemplate = (order: any, newStatus: string) => {
  const statusMessages = {
    'CONFIRMED': 'Your order has been confirmed and we\'ll begin preparing your treats!',
    'PREPARING': 'Great news! We\'re now preparing your order with love and care.',
    'READY': 'Your order is ready! Please collect it at your scheduled time.',
    'COMPLETED': 'Thank you! Your order has been completed. We hope you enjoyed every bite!',
    'CANCELLED': 'We\'re sorry, but your order has been cancelled. If you have any questions, please contact us.'
  };

  const statusColors = {
    'CONFIRMED': '#10B981',
    'PREPARING': '#F59E0B', 
    'READY': '#3B82F6',
    'COMPLETED': '#059669',
    'CANCELLED': '#EF4444'
  };

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Order Update - Aurélise Bakery</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f8f9fa;">
      <div style="max-width: 600px; margin: 0 auto; background-color: white;">
        
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #D4AF37, #F8F1E7); padding: 30px; text-align: center;">
          <h1 style="margin: 0; color: #4A3327; font-size: 24px;">Order Update</h1>
          <p style="margin: 8px 0 0 0; color: #4A3327; opacity: 0.9;">Aurélise Bakery</p>
        </div>

        <!-- Content -->
        <div style="padding: 40px 30px;">
          
          <!-- Status Badge -->
          <div style="text-align: center; margin-bottom: 30px;">
            <div style="display: inline-block; background-color: ${statusColors[newStatus]}; color: white; padding: 12px 24px; border-radius: 25px; font-weight: bold; font-size: 16px;">
              ${newStatus.charAt(0) + newStatus.slice(1).toLowerCase()}
            </div>
          </div>

          <!-- Message -->
          <div style="background-color: #F8F1E7; border-radius: 8px; padding: 24px; margin: 24px 0; text-align: center;">
            <p style="margin: 0; font-size: 16px; color: #4A3327; line-height: 1.6;">
              ${statusMessages[newStatus]}
            </p>
          </div>

          <!-- Order Details -->
          <div style="border-top: 1px solid #e5e7eb; padding-top: 24px; margin-top: 32px;">
            <h3 style="margin: 0 0 16px 0; color: #4A3327;">Order Details</h3>
            
            <div style="display: flex; justify-content: space-between; margin-bottom: 12px;">
              <span>Order Number:</span>
              <span style="font-weight: bold; color: #D4AF37;">${order.order_number}</span>
            </div>
            
            <div style="display: flex; justify-content: space-between; margin-bottom: 12px;">
              <span>${order.delivery_type === 'DELIVERY' ? 'Delivery' : 'Collection'} Date:</span>
              <span style="font-weight: bold;">${new Date(order.delivery_date).toLocaleDateString('en-GB')}</span>
            </div>
            
            <div style="display: flex; justify-content: space-between; margin-bottom: 12px;">
              <span>Total:</span>
              <span style="font-weight: bold;">£${order.total}</span>
            </div>
          </div>

          <!-- Contact -->
          <div style="text-align: center; margin-top: 40px; padding-top: 24px; border-top: 1px solid #e5e7eb;">
            <p style="margin: 0 0 8px 0; color: #6b7280;">Questions about your order?</p>
            <p style="margin: 0; color: #D4AF37;">
              WhatsApp: +44 7440 645831 | Instagram: @aurelise.uk
            </p>
          </div>
        </div>

        <!-- Footer -->
        <div style="background-color: #4A3327; color: white; text-align: center; padding: 20px;">
          <p style="margin: 0; font-size: 14px;">Aurélise Bakery - Where Every Bite Tells a Story</p>
        </div>

      </div>
    </body>
    </html>
  `;
};

const getWelcomeEmailTemplate = (customerName: string) => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Welcome to Aurélise Bakery</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f8f9fa;">
      <div style="max-width: 600px; margin: 0 auto; background-color: white;">
        
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #D4AF37, #F8F1E7); padding: 40px 30px; text-align: center;">
          <h1 style="margin: 0; color: #4A3327; font-size: 28px;">Welcome to Aurélise</h1>
          <p style="margin: 8px 0 0 0; color: #4A3327; font-size: 16px;">Where Every Bite Tells a Story</p>
        </div>

        <!-- Content -->
        <div style="padding: 40px 30px;">
          
          <h2 style="margin: 0 0 20px 0; color: #4A3327;">Hello ${customerName}!</h2>
          
          <p style="margin: 0 0 24px 0; color: #6b7280; line-height: 1.6;">
            Thank you for joining the Aurélise family! We're delighted to have you discover our handcrafted Basque cheesecakes and artisanal treats.
          </p>

          <!-- Features -->
          <div style="background-color: #F8F1E7; border-radius: 8px; padding: 24px; margin: 24px 0;">
            <h3 style="margin: 0 0 16px 0; color: #4A3327;">What makes us special:</h3>
            <ul style="margin: 0; padding-left: 20px; color: #4A3327;">
              <li style="margin-bottom: 8px;">Signature Basque burnt cheesecakes with perfectly caramelized tops</li>
              <li style="margin-bottom: 8px;">Premium ingredients sourced with care</li>
              <li style="margin-bottom: 8px;">Handcrafted with love in small batches</li>
              <li style="margin-bottom: 8px;">Pre-order system ensures perfect freshness</li>
            </ul>
          </div>

          <!-- CTA -->
          <div style="text-align: center; margin: 32px 0;">
            <a href="${Deno.env.get('SUPABASE_URL')?.replace('supabase.co', 'vercel.app') || 'https://aurelise.vercel.app'}" 
               style="display: inline-block; background-color: #D4AF37; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: bold;">
              Browse Our Creations
            </a>
          </div>

          <!-- Follow Us -->
          <div style="text-align: center; color: #6b7280; margin-top: 40px;">
            <p style="margin: 0 0 12px 0;">Follow our journey:</p>
            <p style="margin: 0;">
              <a href="https://instagram.com/aurelise.uk" style="color: #D4AF37; text-decoration: none;">Instagram @aurelise.uk</a>
            </p>
          </div>

        </div>

        <!-- Footer -->
        <div style="background-color: #4A3327; color: white; text-align: center; padding: 24px;">
          <p style="margin: 0;">Thank you for choosing Aurélise Bakery</p>
        </div>

      </div>
    </body>
    </html>
  `;
};

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const { type, ...data } = await req.json();

    switch (type) {
      case 'order_status_update':
        const { orderId, newStatus } = data;
        
        // Get order details
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

        const emailHtml = getStatusUpdateTemplate(order, newStatus);

        await resend.emails.send({
          from: 'Aurélise Bakery <orders@aurelise.uk>',
          to: [order.customer_info.email],
          subject: `Order Update: ${order.order_number} - ${newStatus}`,
          html: emailHtml,
        });

        return new Response(JSON.stringify({ success: true }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });

      case 'welcome_email':
        const { email, firstName } = data;
        
        const welcomeHtml = getWelcomeEmailTemplate(firstName);

        await resend.emails.send({
          from: 'Aurélise Bakery <hello@aurelise.uk>',
          to: [email],
          subject: 'Welcome to Aurélise Bakery 🍰',
          html: welcomeHtml,
        });

        return new Response(JSON.stringify({ success: true }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });

      case 'newsletter_signup':
        const { subscriberEmail, subscriberName } = data;
        
        // Add to newsletter list (you can integrate with your email service)
        console.log('Newsletter signup:', subscriberEmail, subscriberName);

        // Send welcome email
        await resend.emails.send({
          from: 'Aurélise Bakery <newsletter@aurelise.uk>',
          to: [subscriberEmail],
          subject: 'Welcome to Aurélise Newsletter! 🍰',
          html: `
            <h2>Welcome to our newsletter, ${subscriberName || 'friend'}!</h2>
            <p>Thank you for subscribing to Aurélise Bakery updates.</p>
            <p>You'll be the first to know about:</p>
            <ul>
              <li>New seasonal creations</li>
              <li>Special offers and discounts</li>
              <li>Behind-the-scenes stories</li>
              <li>Baking tips and recipes</li>
            </ul>
            <p>Stay delicious!</p>
            <p>The Aurélise Team</p>
          `,
        });

        return new Response(JSON.stringify({ success: true }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });

      case 'daily_reminder':
        // Get orders for tomorrow that need reminders
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        const tomorrowStr = tomorrow.toISOString().split('T')[0];

        const { data: tomorrowOrders } = await supabase
          .from('orders')
          .select('*')
          .eq('delivery_date', tomorrowStr)
          .in('status', ['CONFIRMED', 'PREPARING']);

        if (tomorrowOrders && tomorrowOrders.length > 0) {
          for (const order of tomorrowOrders) {
            await resend.emails.send({
              from: 'Aurélise Bakery <orders@aurelise.uk>',
              to: [order.customer_info.email],
              subject: `Reminder: Your order is ready tomorrow - ${order.order_number}`,
              html: `
                <h2>Order Reminder</h2>
                <p>Hello ${order.customer_info.first_name},</p>
                <p>This is a friendly reminder that your order <strong>${order.order_number}</strong> 
                is scheduled for ${order.delivery_type === 'DELIVERY' ? 'delivery' : 'collection'} tomorrow.</p>
                ${order.delivery_time ? `<p>Time: ${order.delivery_time}</p>` : ''}
                <p>We're excited for you to enjoy your delicious treats!</p>
                <p>Best regards,<br>The Aurélise Team</p>
              `,
            });
          }
        }

        return new Response(JSON.stringify({ 
          success: true, 
          remindersSent: tomorrowOrders?.length || 0 
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });

      default:
        return new Response(JSON.stringify({ error: 'Invalid notification type' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
    }

  } catch (error) {
    console.error('Notification error:', error);
    return new Response(JSON.stringify({ 
      error: 'Failed to send notification',
      details: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
};

serve(handler);