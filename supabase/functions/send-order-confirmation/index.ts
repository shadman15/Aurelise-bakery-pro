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
const generateOrderConfirmationEmail = (order: any, items: any[]) => {
  const formatPrice = (price: number) => `£${price.toFixed(2)}`;
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const itemsHtml = items.map(item => `
    <tr style="border-bottom: 1px solid #e5e7eb;">
      <td style="padding: 12px 0; vertical-align: top;">
        <strong>${item.product.name}</strong><br>
        <small style="color: #6b7280;">Size: ${item.size}</small>
        ${item.customizations && Object.keys(item.customizations).length > 0 ? 
          `<br><small style="color: #6b7280;">Customizations: ${JSON.stringify(item.customizations)}</small>` 
          : ''}
      </td>
      <td style="padding: 12px 0; text-align: center;">${item.quantity}</td>
      <td style="padding: 12px 0; text-align: right;">${formatPrice(item.price)}</td>
      <td style="padding: 12px 0; text-align: right; font-weight: bold;">${formatPrice(item.price * item.quantity)}</td>
    </tr>
  `).join('');

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Order Confirmation - Aurélise Bakery</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: 'Arial', sans-serif; line-height: 1.6; color: #333; background-color: #f8f9fa;">
      <div style="max-width: 600px; margin: 0 auto; background-color: white; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
        
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #D4AF37, #F8F1E7); padding: 40px 30px; text-align: center; color: white;">
          <h1 style="margin: 0; font-size: 28px; font-weight: bold; color: #4A3327;">Aurélise</h1>
          <p style="margin: 8px 0 0 0; font-size: 14px; color: #4A3327; opacity: 0.9;">Where Every Bite Tells a Story</p>
        </div>

        <!-- Content -->
        <div style="padding: 40px 30px;">
          
          <!-- Greeting -->
          <h2 style="margin: 0 0 20px 0; color: #4A3327; font-size: 24px;">Thank you for your order!</h2>
          <p style="margin: 0 0 24px 0; color: #6b7280; font-size: 16px;">
            Dear ${order.customer_info.first_name},<br>
            We've received your order and will begin preparing your delicious treats. Here are the details:
          </p>

          <!-- Order Summary -->
          <div style="background-color: #F8F1E7; border-radius: 8px; padding: 24px; margin: 24px 0;">
            <h3 style="margin: 0 0 16px 0; color: #4A3327; font-size: 18px;">Order Summary</h3>
            
            <div style="display: flex; justify-content: space-between; margin-bottom: 12px;">
              <span style="font-weight: bold;">Order Number:</span>
              <span style="color: #D4AF37; font-weight: bold;">${order.order_number}</span>
            </div>
            
            <div style="display: flex; justify-content: space-between; margin-bottom: 12px;">
              <span style="font-weight: bold;">Order Date:</span>
              <span>${formatDate(order.order_date)}</span>
            </div>
            
            <div style="display: flex; justify-content: space-between; margin-bottom: 12px;">
              <span style="font-weight: bold;">${order.delivery_type === 'DELIVERY' ? 'Delivery' : 'Collection'} Date:</span>
              <span>${formatDate(order.delivery_date)}</span>
            </div>
            
            ${order.delivery_time ? `
            <div style="display: flex; justify-content: space-between; margin-bottom: 12px;">
              <span style="font-weight: bold;">Time:</span>
              <span>${order.delivery_time}</span>
            </div>
            ` : ''}
            
            ${order.delivery_type === 'DELIVERY' && order.delivery_address ? `
            <div style="margin-top: 16px;">
              <span style="font-weight: bold;">Delivery Address:</span><br>
              <div style="margin-top: 4px; color: #6b7280;">
                ${order.delivery_address.street}<br>
                ${order.delivery_address.city}, ${order.delivery_address.postcode}<br>
                ${order.delivery_address.county ? order.delivery_address.county + '<br>' : ''}
                ${order.delivery_address.country || 'UK'}
              </div>
            </div>
            ` : ''}
          </div>

          <!-- Items Table -->
          <div style="margin: 32px 0;">
            <h3 style="margin: 0 0 16px 0; color: #4A3327; font-size: 18px;">Your Items</h3>
            <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
              <thead>
                <tr style="border-bottom: 2px solid #D4AF37;">
                  <th style="padding: 12px 0; text-align: left; color: #4A3327; font-weight: bold;">Item</th>
                  <th style="padding: 12px 0; text-align: center; color: #4A3327; font-weight: bold;">Qty</th>
                  <th style="padding: 12px 0; text-align: right; color: #4A3327; font-weight: bold;">Price</th>
                  <th style="padding: 12px 0; text-align: right; color: #4A3327; font-weight: bold;">Total</th>
                </tr>
              </thead>
              <tbody>
                ${itemsHtml}
              </tbody>
            </table>
          </div>

          <!-- Pricing -->
          <div style="border-top: 2px solid #D4AF37; padding-top: 16px; margin-top: 24px;">
            <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
              <span>Subtotal:</span>
              <span>${formatPrice(order.subtotal)}</span>
            </div>
            
            ${order.delivery_fee > 0 ? `
            <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
              <span>Delivery Fee:</span>
              <span>${formatPrice(order.delivery_fee)}</span>
            </div>
            ` : ''}
            
            <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
              <span>VAT (20%):</span>
              <span>${formatPrice(order.tax)}</span>
            </div>
            
            <div style="display: flex; justify-content: space-between; font-size: 18px; font-weight: bold; color: #D4AF37; border-top: 1px solid #e5e7eb; padding-top: 8px; margin-top: 8px;">
              <span>Total:</span>
              <span>${formatPrice(order.total)}</span>
            </div>
          </div>

          ${order.special_instructions ? `
          <!-- Special Instructions -->
          <div style="background-color: #FEF3C7; border-left: 4px solid #D97706; padding: 16px; margin: 24px 0; border-radius: 0 8px 8px 0;">
            <h4 style="margin: 0 0 8px 0; color: #92400E; font-size: 16px;">Special Instructions</h4>
            <p style="margin: 0; color: #92400E;">${order.special_instructions}</p>
          </div>
          ` : ''}

          <!-- What's Next -->
          <div style="background-color: #F0FDF4; border-radius: 8px; padding: 24px; margin: 32px 0;">
            <h3 style="margin: 0 0 16px 0; color: #166534; font-size: 18px;">What happens next?</h3>
            <ul style="margin: 0; padding-left: 20px; color: #166534;">
              <li style="margin-bottom: 8px;">We'll confirm your order and begin preparation</li>
              <li style="margin-bottom: 8px;">You'll receive updates as your order progresses</li>
              <li style="margin-bottom: 8px;">Your delicious treats will be ready for ${order.delivery_type === 'DELIVERY' ? 'delivery' : 'collection'} on ${formatDate(order.delivery_date)}</li>
            </ul>
          </div>

          <!-- Contact Info -->
          <div style="text-align: center; color: #6b7280; font-size: 14px; margin-top: 40px;">
            <p style="margin: 0 0 8px 0;">Questions about your order?</p>
            <p style="margin: 0;">
              WhatsApp: <a href="https://wa.me/447440645831" style="color: #D4AF37; text-decoration: none;">+44 7440 645831</a> | 
              Instagram: <a href="https://instagram.com/aurelise.uk" style="color: #D4AF37; text-decoration: none;">@aurelise.uk</a>
            </p>
          </div>

        </div>

        <!-- Footer -->
        <div style="background-color: #4A3327; color: white; text-align: center; padding: 24px;">
          <p style="margin: 0; font-size: 14px;">Thank you for choosing Aurélise Bakery</p>
          <p style="margin: 8px 0 0 0; font-size: 12px; opacity: 0.8;">Where Every Bite Tells a Story</p>
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
    const { orderId } = await req.json();

    if (!orderId) {
      return new Response(JSON.stringify({ error: 'Order ID is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Get order details with items
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select(`
        *,
        items:order_items(
          *,
          product:products(name, images)
        )
      `)
      .eq('id', orderId)
      .single();

    if (orderError || !order) {
      console.error('Order not found:', orderError);
      return new Response(JSON.stringify({ error: 'Order not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const customerEmail = order.customer_info.email;
    const customerName = `${order.customer_info.first_name} ${order.customer_info.last_name}`;

    // Generate email HTML
    const emailHtml = generateOrderConfirmationEmail(order, order.items);

    // Send confirmation email to customer
    const customerEmailResponse = await resend.emails.send({
      from: 'Aurélise Bakery <orders@aurelise.uk>',
      to: [customerEmail],
      subject: `Order Confirmation - ${order.order_number} | Aurélise Bakery`,
      html: emailHtml,
    });

    console.log('Customer email sent:', customerEmailResponse);

    // Send notification email to admin
    const adminEmailResponse = await resend.emails.send({
      from: 'Aurélise Bakery <orders@aurelise.uk>',
      to: ['admin@aurelise.uk'], // Replace with actual admin email
      subject: `New Order Received - ${order.order_number}`,
      html: `
        <h2>New Order Received</h2>
        <p><strong>Order Number:</strong> ${order.order_number}</p>
        <p><strong>Customer:</strong> ${customerName}</p>
        <p><strong>Total:</strong> £${order.total}</p>
        <p><strong>Delivery Type:</strong> ${order.delivery_type}</p>
        <p><strong>Delivery Date:</strong> ${order.delivery_date}</p>
        <br>
        <p>Please check the admin dashboard for full order details.</p>
      `,
    });

    console.log('Admin email sent:', adminEmailResponse);

    return new Response(JSON.stringify({
      success: true,
      message: 'Order confirmation emails sent successfully',
      customerEmail: customerEmailResponse,
      adminEmail: adminEmailResponse
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error sending order confirmation:', error);
    return new Response(JSON.stringify({ 
      error: 'Failed to send confirmation emails',
      details: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
};

serve(handler);