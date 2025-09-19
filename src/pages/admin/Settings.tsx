import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { toast } from '@/hooks/use-toast';

const settingsSchema = z.object({
  deliveryFee: z.coerce.number(),
  taxRate: z.coerce.number(),
  minimumOrderDays: z.coerce.number(),
  maxDailyOrders: z.coerce.number(),
  deliveryRadius: z.string(),
  businessHours: z.string(),
  allergenNotice: z.string(),
  maintenanceMode: z.boolean(),
  pickupAddress: z.string(),
  contactEmail: z.string().email(),
  contactPhone: z.string(),
});

type SettingsFormData = z.infer<typeof settingsSchema>;

interface Setting {
  key: string;
  value: string;
  type: 'TEXT' | 'NUMBER' | 'BOOLEAN' | 'JSON';
}

export function Settings() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const form = useForm<SettingsFormData>({
    resolver: zodResolver(settingsSchema),
    defaultValues: {
      deliveryFee: 0,
      taxRate: 20,
      minimumOrderDays: 3,
      maxDailyOrders: 50,
      deliveryRadius: '10',
      businessHours: '9:00-17:00',
      allergenNotice: 'Please be aware that all our products may contain or have been in contact with allergens including nuts, gluten, dairy, and eggs.',
      maintenanceMode: false,
      pickupAddress: '123 Baker Street, London, SW1A 1AA',
      contactEmail: 'hello@aurelise.com',
      contactPhone: '+44 20 1234 5678',
    },
  });

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('settings')
        .select('*');

      if (error) throw error;

      // Convert settings array to form values
      const settingsMap: { [key: string]: string } = {};
      data?.forEach((setting: Setting) => {
        settingsMap[setting.key] = setting.value;
      });

      // Update form with loaded values
      form.reset({
        deliveryFee: parseFloat(settingsMap.delivery_fee || '0'),
        taxRate: parseFloat(settingsMap.tax_rate || '20'),
        minimumOrderDays: parseInt(settingsMap.minimum_order_days || '3'),
        maxDailyOrders: parseInt(settingsMap.max_daily_orders || '50'),
        deliveryRadius: settingsMap.delivery_radius || '10',
        businessHours: settingsMap.business_hours || '9:00-17:00',
        allergenNotice: settingsMap.allergen_notice || 'Please be aware that all our products may contain or have been in contact with allergens including nuts, gluten, dairy, and eggs.',
        maintenanceMode: settingsMap.maintenance_mode === 'true',
        pickupAddress: settingsMap.pickup_address || '123 Baker Street, London, SW1A 1AA',
        contactEmail: settingsMap.contact_email || 'hello@aurelise.com',
        contactPhone: settingsMap.contact_phone || '+44 20 1234 5678',
      });
    } catch (error) {
      console.error('Error loading settings:', error);
      toast({
        title: 'Error',
        description: 'Failed to load settings',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data: SettingsFormData) => {
    try {
      setSaving(true);

      // Prepare settings for upsert
      const settings = [
        { key: 'delivery_fee', value: data.deliveryFee.toString(), type: 'NUMBER' as const },
        { key: 'tax_rate', value: data.taxRate.toString(), type: 'NUMBER' as const },
        { key: 'minimum_order_days', value: data.minimumOrderDays.toString(), type: 'NUMBER' as const },
        { key: 'max_daily_orders', value: data.maxDailyOrders.toString(), type: 'NUMBER' as const },
        { key: 'delivery_radius', value: data.deliveryRadius, type: 'TEXT' as const },
        { key: 'business_hours', value: data.businessHours, type: 'TEXT' as const },
        { key: 'allergen_notice', value: data.allergenNotice, type: 'TEXT' as const },
        { key: 'maintenance_mode', value: data.maintenanceMode.toString(), type: 'BOOLEAN' as const },
        { key: 'pickup_address', value: data.pickupAddress, type: 'TEXT' as const },
        { key: 'contact_email', value: data.contactEmail, type: 'TEXT' as const },
        { key: 'contact_phone', value: data.contactPhone, type: 'TEXT' as const },
      ];

      // Use admin API to update settings
      const { error } = await supabase.functions.invoke('admin-api', {
        body: {
          action: 'updateSettings',
          settings: settings
        }
      });

      if (error) throw error;

      toast({
        title: 'Settings updated',
        description: 'Your settings have been saved successfully.',
      });
    } catch (error) {
      console.error('Error saving settings:', error);
      toast({
        title: 'Error',
        description: 'Failed to save settings',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-muted rounded w-48"></div>
        </div>
        <div className="animate-pulse">
          <div className="h-96 bg-muted rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground">Manage your bakery settings and preferences</p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Business Information */}
          <Card>
            <CardHeader>
              <CardTitle>Business Information</CardTitle>
              <CardDescription>Basic contact and location details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="contactEmail"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Contact Email</FormLabel>
                    <FormControl>
                      <Input type="email" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="contactPhone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Contact Phone</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="pickupAddress"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Pickup Address</FormLabel>
                    <FormControl>
                      <Textarea {...field} rows={3} />
                    </FormControl>
                    <FormDescription>
                      Address customers can collect their orders from
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="businessHours"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Business Hours</FormLabel>
                    <FormControl>
                      <Input placeholder="9:00-17:00" {...field} />
                    </FormControl>
                    <FormDescription>
                      Format: HH:MM-HH:MM (24-hour format)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Order Settings */}
          <Card>
            <CardHeader>
              <CardTitle>Order Settings</CardTitle>
              <CardDescription>Configure order processing and delivery rules</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="minimumOrderDays"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Minimum Pre-order Days</FormLabel>
                    <FormControl>
                      <Input type="number" min="1" {...field} />
                    </FormControl>
                    <FormDescription>
                      Minimum number of days in advance customers must place orders
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="maxDailyOrders"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Maximum Daily Orders</FormLabel>
                    <FormControl>
                      <Input type="number" min="1" {...field} />
                    </FormControl>
                    <FormDescription>
                      Maximum number of orders accepted per day
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Delivery Settings */}
          <Card>
            <CardHeader>
              <CardTitle>Delivery Settings</CardTitle>
              <CardDescription>Configure delivery options and pricing</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="deliveryFee"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Delivery Fee (£)</FormLabel>
                    <FormControl>
                      <Input type="number" min="0" step="0.01" {...field} />
                    </FormControl>
                    <FormDescription>
                      Standard delivery fee in GBP
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="deliveryRadius"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Delivery Radius (km)</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormDescription>
                      Maximum delivery distance from your location
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Tax Settings */}
          <Card>
            <CardHeader>
              <CardTitle>Tax Settings</CardTitle>
              <CardDescription>Configure VAT and tax rates</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="taxRate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>VAT Rate (%)</FormLabel>
                    <FormControl>
                      <Input type="number" min="0" max="100" step="0.01" {...field} />
                    </FormControl>
                    <FormDescription>
                      VAT rate as a percentage (e.g., 20 for 20%)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Allergen Notice */}
          <Card>
            <CardHeader>
              <CardTitle>Allergen Notice</CardTitle>
              <CardDescription>Allergen warning displayed to customers</CardDescription>
            </CardHeader>
            <CardContent>
              <FormField
                control={form.control}
                name="allergenNotice"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Allergen Warning Text</FormLabel>
                    <FormControl>
                      <Textarea {...field} rows={4} />
                    </FormControl>
                    <FormDescription>
                      This text will be displayed to customers during checkout
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Site Settings */}
          <Card>
            <CardHeader>
              <CardTitle>Site Settings</CardTitle>
              <CardDescription>General website configuration</CardDescription>
            </CardHeader>
            <CardContent>
              <FormField
                control={form.control}
                name="maintenanceMode"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">
                        Maintenance Mode
                      </FormLabel>
                      <FormDescription>
                        When enabled, the site will show a maintenance message to customers
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <Button type="submit" disabled={saving} className="w-full">
            {saving ? 'Saving...' : 'Save Settings'}
          </Button>
        </form>
      </Form>
    </div>
  );
}