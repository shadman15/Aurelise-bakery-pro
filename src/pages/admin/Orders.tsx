import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
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
  Search, 
  MoreHorizontal, 
  Eye, 
  Printer,
  RefreshCw,
  Filter
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface Order {
  id: string;
  order_number: string;
  status: string;
  payment_status: string;
  customer_info: any;
  delivery_type: string;
  delivery_date: string;
  delivery_time?: string;
  total: number;
  subtotal: number;
  delivery_fee?: number;
  tax?: number;
  created_at: string;
  order_items?: {
    id: string;
    product_id: string;
    size: string;
    quantity: number;
    price: number;
    products: {
      name: string;
      images: string[];
    };
  }[];
}

const statusOptions = [
  { value: 'PENDING', label: 'Pending', color: 'bg-yellow-500' },
  { value: 'CONFIRMED', label: 'Confirmed', color: 'bg-blue-500' },
  { value: 'PREPARING', label: 'Preparing', color: 'bg-orange-500' },
  { value: 'READY', label: 'Ready', color: 'bg-green-500' },
  { value: 'COMPLETED', label: 'Completed', color: 'bg-green-600' },
  { value: 'CANCELLED', label: 'Cancelled', color: 'bg-red-500' },
];

export function Orders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<string>('all');

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          order_items (
            *,
            products (
              name,
              images
            )
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setOrders(data || []);
    } catch (error) {
      console.error('Error loading orders:', error);
      toast({
        title: 'Error',
        description: 'Failed to load orders',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId: string, newStatus: 'PENDING' | 'CONFIRMED' | 'PREPARING' | 'READY' | 'COMPLETED' | 'CANCELLED') => {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status: newStatus })
        .eq('id', orderId);

      if (error) throw error;

      setOrders(orders.map(order => 
        order.id === orderId 
          ? { ...order, status: newStatus }
          : order
      ));

      // TODO: Send email notification to customer
      toast({
        title: 'Success',
        description: `Order status updated to ${newStatus.toLowerCase()}`,
      });
    } catch (error) {
      console.error('Error updating order status:', error);
      toast({
        title: 'Error',
        description: 'Failed to update order status',
        variant: 'destructive',
      });
    }
  };

  const processRefund = async (order: Order) => {
    if (!confirm(`Are you sure you want to refund ${formatCurrency(order.total)} for order ${order.order_number}?`)) {
      return;
    }

    try {
      // Call payments API to process refund
      const { data, error } = await supabase.functions.invoke('payments-api', {
        body: {
          action: 'refund',
          orderId: order.id,
          amount: order.total
        }
      });

      if (error) throw error;

      // Update order status to cancelled and payment status to refunded
      await supabase
        .from('orders')
        .update({ 
          status: 'CANCELLED',
          payment_status: 'REFUNDED'
        })
        .eq('id', order.id);

      loadOrders(); // Reload orders

      toast({
        title: 'Refund processed',
        description: `Refund of ${formatCurrency(order.total)} has been processed for order ${order.order_number}`,
      });
    } catch (error) {
      console.error('Error processing refund:', error);
      toast({
        title: 'Error',
        description: 'Failed to process refund',
        variant: 'destructive',
      });
    }
  };

  const printOrder = (order: Order) => {
    // Create a print-friendly version of the order
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const printContent = `
      <html>
        <head>
          <title>Order ${order.order_number}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            .header { text-align: center; margin-bottom: 30px; }
            .order-details { margin-bottom: 20px; }
            .items { margin-bottom: 20px; }
            table { width: 100%; border-collapse: collapse; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f2f2f2; }
            .total { text-align: right; font-weight: bold; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Aurélise Bakery</h1>
            <h2>Order ${order.order_number}</h2>
          </div>
          
          <div class="order-details">
            <p><strong>Date:</strong> ${new Date(order.created_at).toLocaleDateString('en-GB')}</p>
            <p><strong>Status:</strong> ${order.status}</p>
            <p><strong>Delivery Type:</strong> ${order.delivery_type}</p>
            <p><strong>Delivery Date:</strong> ${order.delivery_date}</p>
            ${order.delivery_time ? `<p><strong>Delivery Time:</strong> ${order.delivery_time}</p>` : ''}
            
            <h3>Customer Information</h3>
            <p><strong>Name:</strong> ${order.customer_info.firstName} ${order.customer_info.lastName}</p>
            <p><strong>Email:</strong> ${order.customer_info.email}</p>
            <p><strong>Phone:</strong> ${order.customer_info.phone}</p>
          </div>

          <div class="items">
            <h3>Order Items</h3>
            <table>
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Size</th>
                  <th>Quantity</th>
                  <th>Price</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                ${order.order_items?.map(item => `
                  <tr>
                    <td>${item.products.name}</td>
                    <td>${item.size}</td>
                    <td>${item.quantity}</td>
                    <td>£${parseFloat(item.price.toString()).toFixed(2)}</td>
                    <td>£${(parseFloat(item.price.toString()) * item.quantity).toFixed(2)}</td>
                  </tr>
                `).join('') || ''}
              </tbody>
            </table>
          </div>

          <div class="total">
            <p>Subtotal: £${parseFloat(order.subtotal.toString()).toFixed(2)}</p>
            ${order.delivery_fee ? `<p>Delivery Fee: £${parseFloat(order.delivery_fee.toString()).toFixed(2)}</p>` : ''}
            ${order.tax ? `<p>Tax: £${parseFloat(order.tax.toString()).toFixed(2)}</p>` : ''}
            <p><strong>Total: £${parseFloat(order.total.toString()).toFixed(2)}</strong></p>
          </div>
        </body>
      </html>
    `;

    printWindow.document.write(printContent);
    printWindow.document.close();
    printWindow.print();
  };

  const getStatusBadge = (status: string) => {
    const statusOption = statusOptions.find(option => option.value === status);
    return (
      <Badge 
        variant="outline" 
        className={`${statusOption?.color} text-white border-transparent`}
      >
        {statusOption?.label || status}
      </Badge>
    );
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP'
    }).format(amount);
  };

  const filteredOrders = orders.filter(order => {
    const matchesSearch = 
      order.order_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customer_info?.firstName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customer_info?.lastName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customer_info?.email?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;

    let matchesDate = true;
    if (dateFilter !== 'all') {
      const orderDate = new Date(order.created_at);
      const today = new Date();
      
      if (dateFilter === 'today') {
        matchesDate = orderDate.toDateString() === today.toDateString();
      } else if (dateFilter === 'week') {
        const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
        matchesDate = orderDate >= weekAgo;
      } else if (dateFilter === 'month') {
        const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
        matchesDate = orderDate >= monthAgo;
      }
    }

    return matchesSearch && matchesStatus && matchesDate;
  });

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
          <h1 className="text-3xl font-bold">Orders</h1>
          <p className="text-muted-foreground">Manage customer orders and statuses</p>
        </div>
        <Button onClick={loadOrders} variant="outline">
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Orders</CardTitle>
          <CardDescription>
            {filteredOrders.length} of {orders.length} orders
          </CardDescription>
          <div className="flex items-center space-x-2">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search orders..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                {statusOptions.map(status => (
                  <SelectItem key={status.value} value={status.value}>
                    {status.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={dateFilter} onValueChange={setDateFilter}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="All Dates" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Dates</SelectItem>
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="week">Last 7 days</SelectItem>
                <SelectItem value="month">Last 30 days</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Delivery</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Payment</TableHead>
                <TableHead>Total</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredOrders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell>
                    <div className="font-medium">{order.order_number}</div>
                    <div className="text-sm text-muted-foreground">
                      {order.order_items?.length || 0} items
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">
                        {order.customer_info?.firstName} {order.customer_info?.lastName}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {order.customer_info?.email}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>{new Date(order.created_at).toLocaleDateString('en-GB')}</div>
                    <div className="text-sm text-muted-foreground">
                      {new Date(order.created_at).toLocaleTimeString('en-GB', { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <Badge variant="outline">{order.delivery_type}</Badge>
                    </div>
                    <div className="text-sm text-muted-foreground mt-1">
                      {order.delivery_date}
                      {order.delivery_time && ` at ${order.delivery_time}`}
                    </div>
                  </TableCell>
                  <TableCell>
                    {getStatusBadge(order.status)}
                  </TableCell>
                  <TableCell>
                    <Badge 
                      variant={order.payment_status === 'COMPLETED' ? 'default' : 'secondary'}
                    >
                      {order.payment_status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="font-medium">{formatCurrency(order.total)}</div>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => printOrder(order)}>
                          <Printer className="h-4 w-4 mr-2" />
                          Print Order
                        </DropdownMenuItem>
                        
                        {statusOptions
                          .filter(status => status.value !== order.status)
                          .map(status => (
                          <DropdownMenuItem
                            key={status.value}
                            onClick={() => updateOrderStatus(order.id, status.value as 'PENDING' | 'CONFIRMED' | 'PREPARING' | 'READY' | 'COMPLETED' | 'CANCELLED')}
                          >
                            Mark as {status.label}
                          </DropdownMenuItem>
                        ))}
                        
                        {order.payment_status === 'COMPLETED' && order.status !== 'CANCELLED' && (
                          <DropdownMenuItem
                            onClick={() => processRefund(order)}
                            className="text-destructive"
                          >
                            Process Refund
                          </DropdownMenuItem>
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
    </div>
  );
}