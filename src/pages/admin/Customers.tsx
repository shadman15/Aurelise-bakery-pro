import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { 
  Search, 
  MoreHorizontal, 
  Eye, 
  UserCheck,
  ShieldCheck
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface Customer {
  id: string;
  user_id: string;
  first_name: string;
  last_name: string;
  role: 'CUSTOMER' | 'ADMIN' | 'SUPER_ADMIN';
  phone?: string;
  email_verified: boolean;
  created_at: string;
  updated_at: string;
  orderCount?: number;
  totalSpent?: number;
  lastOrderDate?: string;
}

interface CustomerOrder {
  id: string;
  order_number: string;
  status: string;
  total: number;
  created_at: string;
  delivery_date: string;
}

export function Customers() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [customerOrders, setCustomerOrders] = useState<CustomerOrder[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);

  useEffect(() => {
    loadCustomers();
  }, []);

  const loadCustomers = async () => {
    try {
      setLoading(true);
      
      // Get all customer profiles with order statistics
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('*');

      if (profilesError) throw profilesError;

      // Get order statistics for each customer
      const customersWithStats = await Promise.all(
        (profiles || []).map(async (profile) => {
          const { data: orders } = await supabase
            .from('orders')
            .select('total, created_at')
            .eq('user_id', profile.user_id);

          const orderCount = orders?.length || 0;
          const totalSpent = orders?.reduce((sum, order) => sum + parseFloat(order.total.toString()), 0) || 0;
          const lastOrderDate = orders?.length ? 
            new Date(Math.max(...orders.map(order => new Date(order.created_at).getTime()))).toISOString() :
            undefined;

          return {
            ...profile,
            orderCount,
            totalSpent,
            lastOrderDate,
          };
        })
      );

      setCustomers(customersWithStats);
    } catch (error) {
      console.error('Error loading customers:', error);
      toast({
        title: 'Error',
        description: 'Failed to load customers',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const loadCustomerOrders = async (customerId: string) => {
    try {
      setLoadingOrders(true);
      const { data, error } = await supabase
        .from('orders')
        .select('id, order_number, status, total, created_at, delivery_date')
        .eq('user_id', customerId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCustomerOrders(data || []);
    } catch (error) {
      console.error('Error loading customer orders:', error);
      toast({
        title: 'Error',
        description: 'Failed to load customer orders',
        variant: 'destructive',
      });
    } finally {
      setLoadingOrders(false);
    }
  };

  const updateCustomerRole = async (customerId: string, newRole: 'CUSTOMER' | 'ADMIN' | 'SUPER_ADMIN') => {
    if (!confirm(`Are you sure you want to change this customer's role to ${newRole}?`)) {
      return;
    }

    try {
      const { error } = await supabase
        .from('profiles')
        .update({ role: newRole })
        .eq('user_id', customerId);

      if (error) throw error;

      setCustomers(customers.map(customer => 
        customer.user_id === customerId 
          ? { ...customer, role: newRole }
          : customer
      ));

      toast({
        title: 'Success',
        description: `Customer role updated to ${newRole}`,
      });
    } catch (error) {
      console.error('Error updating customer role:', error);
      toast({
        title: 'Error',
        description: 'Failed to update customer role',
        variant: 'destructive',
      });
    }
  };

  const viewCustomerDetails = (customer: Customer) => {
    setSelectedCustomer(customer);
    loadCustomerOrders(customer.user_id);
  };

  const filteredCustomers = customers.filter(customer =>
    customer.first_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    customer.last_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    `${customer.first_name} ${customer.last_name}`.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP'
    }).format(amount);
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'SUPER_ADMIN':
        return <Badge className="bg-red-500 text-white">Super Admin</Badge>;
      case 'ADMIN':
        return <Badge className="bg-blue-500 text-white">Admin</Badge>;
      default:
        return <Badge variant="outline">Customer</Badge>;
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
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Customers</h1>
          <p className="text-muted-foreground">Manage customer accounts and roles</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Customers</CardTitle>
          <CardDescription>
            {filteredCustomers.length} of {customers.length} customers
          </CardDescription>
          <div className="flex items-center space-x-2">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search customers..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Customer</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Orders</TableHead>
                <TableHead>Total Spent</TableHead>
                <TableHead>Last Order</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCustomers.map((customer) => (
                <TableRow key={customer.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">
                        {customer.first_name} {customer.last_name}
                      </div>
                      <div className="text-sm text-muted-foreground flex items-center gap-2">
                        ID: {customer.user_id.slice(0, 8)}...
                        {customer.email_verified && (
                          <UserCheck className="h-3 w-3 text-green-500" />
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    {getRoleBadge(customer.role)}
                  </TableCell>
                  <TableCell>
                    <div className="font-medium">{customer.orderCount || 0}</div>
                  </TableCell>
                  <TableCell>
                    <div className="font-medium">
                      {formatCurrency(customer.totalSpent || 0)}
                    </div>
                  </TableCell>
                  <TableCell>
                    {customer.lastOrderDate ? (
                      <div className="text-sm">
                        {new Date(customer.lastOrderDate).toLocaleDateString('en-GB')}
                      </div>
                    ) : (
                      <div className="text-sm text-muted-foreground">Never</div>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      {new Date(customer.created_at).toLocaleDateString('en-GB')}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => viewCustomerDetails(customer)}>
                          <Eye className="h-4 w-4 mr-2" />
                          View Details
                        </DropdownMenuItem>
                        
                        {customer.role === 'CUSTOMER' && (
                          <DropdownMenuItem
                            onClick={() => updateCustomerRole(customer.user_id, 'ADMIN')}
                          >
                            <ShieldCheck className="h-4 w-4 mr-2" />
                            Promote to Admin
                          </DropdownMenuItem>
                        )}
                        
                        {customer.role === 'ADMIN' && (
                          <>
                            <DropdownMenuItem
                              onClick={() => updateCustomerRole(customer.user_id, 'CUSTOMER')}
                            >
                              Demote to Customer
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => updateCustomerRole(customer.user_id, 'SUPER_ADMIN')}
                            >
                              <ShieldCheck className="h-4 w-4 mr-2" />
                              Promote to Super Admin
                            </DropdownMenuItem>
                          </>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Customer Details Dialog */}
      <Dialog open={!!selectedCustomer} onOpenChange={() => setSelectedCustomer(null)}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>
              {selectedCustomer?.first_name} {selectedCustomer?.last_name}
            </DialogTitle>
            <DialogDescription>
              Customer details and order history
            </DialogDescription>
          </DialogHeader>

          {selectedCustomer && (
            <div className="space-y-6">
              {/* Customer Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="font-medium mb-2">Customer Information</h3>
                  <div className="space-y-2 text-sm">
                    <div><strong>Role:</strong> {getRoleBadge(selectedCustomer.role)}</div>
                    <div><strong>Phone:</strong> {selectedCustomer.phone || 'Not provided'}</div>
                    <div><strong>Email Verified:</strong> {selectedCustomer.email_verified ? 'Yes' : 'No'}</div>
                    <div><strong>Member Since:</strong> {new Date(selectedCustomer.created_at).toLocaleDateString('en-GB')}</div>
                  </div>
                </div>
                <div>
                  <h3 className="font-medium mb-2">Statistics</h3>
                  <div className="space-y-2 text-sm">
                    <div><strong>Total Orders:</strong> {selectedCustomer.orderCount}</div>
                    <div><strong>Total Spent:</strong> {formatCurrency(selectedCustomer.totalSpent || 0)}</div>
                    <div><strong>Last Order:</strong> {selectedCustomer.lastOrderDate ? 
                      new Date(selectedCustomer.lastOrderDate).toLocaleDateString('en-GB') : 
                      'Never'
                    }</div>
                  </div>
                </div>
              </div>

              {/* Orders History */}
              <div>
                <h3 className="font-medium mb-4">Order History</h3>
                {loadingOrders ? (
                  <div className="animate-pulse h-32 bg-muted rounded"></div>
                ) : customerOrders.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Order</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Total</TableHead>
                        <TableHead>Order Date</TableHead>
                        <TableHead>Delivery Date</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {customerOrders.map((order) => (
                        <TableRow key={order.id}>
                          <TableCell className="font-medium">{order.order_number}</TableCell>
                          <TableCell>
                            <Badge variant="outline">{order.status}</Badge>
                          </TableCell>
                          <TableCell>{formatCurrency(order.total)}</TableCell>
                          <TableCell>{new Date(order.created_at).toLocaleDateString('en-GB')}</TableCell>
                          <TableCell>{order.delivery_date}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    No orders found for this customer
                  </div>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}