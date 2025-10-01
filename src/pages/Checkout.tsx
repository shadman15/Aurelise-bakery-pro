import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '@/hooks/useCart';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { toast } from '@/hooks/use-toast';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Loader2 } from 'lucide-react';
import { format, addDays } from 'date-fns';
import { cn } from '@/lib/utils';

const stripePromise = loadStripe('pk_test_51QdVfqBZJeGKlX42yk8F5YBLRhXCIQRLaMhWj8y4Np9YNMi2JXdjTnZxVkjQxJ5IkxBmNfxPpPqF0oL5v6RVrEps00wHVqWJvC');

const CheckoutForm = ({ clientSecret, orderData }: { clientSecret: string; orderData: any }) => {
  const stripe = useStripe();
  const elements = useElements();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setLoading(true);
    try {
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/order-confirmation`,
        },
        redirect: 'if_required',
      });

      if (error) {
        toast({
          title: 'Payment Failed',
          description: error.message,
          variant: 'destructive',
        });
      } else if (paymentIntent?.status === 'succeeded') {
        toast({
          title: 'Order Placed Successfully!',
          description: 'You will receive a confirmation email shortly.',
        });
        navigate(`/order-confirmation?order=${orderData.order_number}`);
      }
    } catch (err) {
      toast({
        title: 'Error',
        description: 'Something went wrong with your payment.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <PaymentElement />
      <Button type="submit" disabled={!stripe || loading} className="w-full">
        {loading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Processing...
          </>
        ) : (
          'Place Order'
        )}
      </Button>
    </form>
  );
};

export default function Checkout() {
  const { items, totalPrice, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(false);
  const [clientSecret, setClientSecret] = useState('');
  const [orderData, setOrderData] = useState<any>(null);
  
  // Form state
  const [deliveryType, setDeliveryType] = useState<'DELIVERY' | 'PICKUP'>('DELIVERY');
  const [deliveryDate, setDeliveryDate] = useState<Date>();
  const [deliveryTime, setDeliveryTime] = useState('');
  const [allergenAcknowledged, setAllergenAcknowledged] = useState(false);
  const [specialInstructions, setSpecialInstructions] = useState('');
  
  // Customer info
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState('');
  
  // Delivery address
  const [street, setStreet] = useState('');
  const [city, setCity] = useState('');
  const [postcode, setPostcode] = useState('');
  const [county, setCounty] = useState('');

  const deliveryFee = deliveryType === 'DELIVERY' ? 5.00 : 0;
  const subtotal = totalPrice;
  const tax = subtotal * 0.2; // 20% VAT
  const finalTotal = subtotal + deliveryFee + tax;

  useEffect(() => {
    if (items.length === 0) {
      navigate('/menu');
    }
  }, [items, navigate]);

  const createOrder = async () => {
    if (!deliveryDate || !allergenAcknowledged) {
      toast({
        title: 'Missing Information',
        description: 'Please select a delivery date and acknowledge allergen information.',
        variant: 'destructive',
      });
      return;
    }

    if (deliveryType === 'DELIVERY' && (!street || !city || !postcode)) {
      toast({
        title: 'Missing Address',
        description: 'Please provide a complete delivery address.',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    try {
      // Create order in database
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert([{
          user_id: user?.id || null,
          order_date: new Date().toISOString().split('T')[0],
          delivery_date: format(deliveryDate, 'yyyy-MM-dd'),
          delivery_time: deliveryTime || null,
          delivery_type: deliveryType,
          delivery_address: deliveryType === 'DELIVERY' ? {
            street,
            city,
            postcode,
            county,
            country: 'UK'
          } : null,
          delivery_fee: deliveryFee,
          subtotal,
          tax,
          total: finalTotal,
          currency: 'GBP',
          customer_info: {
            firstName,
            lastName,
            email,
            phone
          },
          allergen_acknowledged: allergenAcknowledged,
          special_instructions: specialInstructions || null,
          status: 'PENDING',
          payment_status: 'PENDING'
        }])
        .select()
        .single();

      if (orderError) throw orderError;

      // Create order items
      const orderItems = items.map(item => ({
        order_id: order.id,
        product_id: item.productId,
        size: item.size,
        quantity: item.quantity,
        price: item.unitPrice
      }));

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);

      if (itemsError) throw itemsError;

      // Create payment intent
      const { data: paymentData, error: paymentError } = await supabase.functions.invoke('payments-api', {
        body: {
          action: 'create-intent',
          orderId: order.id,
          amount: Math.round(finalTotal * 100), // Convert to cents
          currency: 'gbp',
          customerEmail: email
        }
      });

      if (paymentError) throw paymentError;

      setClientSecret(paymentData.clientSecret);
      setOrderData(order);
      
    } catch (error: any) {
      console.error('Error creating order:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to create order',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const minDate = addDays(new Date(), 3);

  if (items.length === 0) return null;

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <h1 className="text-3xl font-bold mb-8">Checkout</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column - Forms */}
        <div className="space-y-6">
          {/* Customer Information */}
          <Card>
            <CardHeader>
              <CardTitle>Customer Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input
                    id="firstName"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                />
              </div>
            </CardContent>
          </Card>

          {/* Delivery Information */}
          <Card>
            <CardHeader>
              <CardTitle>Delivery Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Delivery Type</Label>
                <Select value={deliveryType} onValueChange={(value: any) => setDeliveryType(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="DELIVERY">Delivery</SelectItem>
                    <SelectItem value="PICKUP">Pickup</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {deliveryType === 'DELIVERY' && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="street">Street Address</Label>
                    <Input
                      id="street"
                      value={street}
                      onChange={(e) => setStreet(e.target.value)}
                      required
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="city">City</Label>
                      <Input
                        id="city"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="postcode">Postcode</Label>
                      <Input
                        id="postcode"
                        value={postcode}
                        onChange={(e) => setPostcode(e.target.value)}
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="county">County</Label>
                    <Input
                      id="county"
                      value={county}
                      onChange={(e) => setCounty(e.target.value)}
                    />
                  </div>
                </>
              )}

              <div className="space-y-2">
                <Label>Delivery Date (Min 3 days advance)</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !deliveryDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {deliveryDate ? format(deliveryDate, "PPP") : "Pick a date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={deliveryDate}
                      onSelect={setDeliveryDate}
                      disabled={(date) => date < minDate}
                      initialFocus
                      className="pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2">
                <Label htmlFor="deliveryTime">Preferred Time (Optional)</Label>
                <Input
                  id="deliveryTime"
                  type="time"
                  value={deliveryTime}
                  onChange={(e) => setDeliveryTime(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="specialInstructions">Special Instructions</Label>
                <Textarea
                  id="specialInstructions"
                  value={specialInstructions}
                  onChange={(e) => setSpecialInstructions(e.target.value)}
                  rows={3}
                  placeholder="Any special requests or delivery notes..."
                />
              </div>
            </CardContent>
          </Card>

          {/* Allergen Notice */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-start space-x-3">
                <Checkbox
                  id="allergen"
                  checked={allergenAcknowledged}
                  onCheckedChange={(checked) => setAllergenAcknowledged(checked as boolean)}
                />
                <div className="space-y-1">
                  <Label htmlFor="allergen" className="font-medium cursor-pointer">
                    I acknowledge the allergen information
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Please review product allergen information before ordering. All products may contain traces of nuts, dairy, eggs, and gluten.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Order Summary */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {items.map((item) => (
                <div key={`${item.productId}-${item.size}`} className="flex justify-between">
                  <div className="flex-1">
                    <p className="font-medium">{item.name}</p>
                    <p className="text-sm text-muted-foreground">
                      Size: {item.size} × {item.quantity}
                    </p>
                  </div>
                  <p className="font-medium">£{(item.unitPrice * item.quantity).toFixed(2)}</p>
                </div>
              ))}

              <Separator />

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Subtotal</span>
                  <span>£{subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Delivery Fee</span>
                  <span>£{deliveryFee.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>VAT (20%)</span>
                  <span>£{tax.toFixed(2)}</span>
                </div>
                <Separator />
                <div className="flex justify-between font-bold text-lg">
                  <span>Total</span>
                  <span>£{finalTotal.toFixed(2)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Payment Section */}
          <Card>
            <CardHeader>
              <CardTitle>Payment</CardTitle>
            </CardHeader>
            <CardContent>
              {!clientSecret ? (
                <Button
                  onClick={createOrder}
                  disabled={loading || !allergenAcknowledged || !deliveryDate}
                  className="w-full"
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating Order...
                    </>
                  ) : (
                    'Continue to Payment'
                  )}
                </Button>
              ) : (
                <Elements stripe={stripePromise} options={{ clientSecret }}>
                  <CheckoutForm clientSecret={clientSecret} orderData={orderData} />
                </Elements>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
