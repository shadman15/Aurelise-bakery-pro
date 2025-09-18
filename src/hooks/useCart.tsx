import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from '@/hooks/use-toast';

interface CartItem {
  id: string;
  productId: string;
  name: string;
  size: string;
  quantity: number;
  unitPrice: number;
  image?: string;
}

interface CartContextType {
  items: CartItem[];
  totalItems: number;
  totalPrice: number;
  loading: boolean;
  addToCart: (product: any, size: string, quantity?: number) => Promise<void>;
  updateQuantity: (itemId: string, quantity: number) => Promise<void>;
  removeItem: (itemId: string) => Promise<void>;
  clearCart: () => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    loadCart();
  }, [user]);

  const getSessionId = () => {
    let sessionId = localStorage.getItem('cart_session_id');
    if (!sessionId) {
      sessionId = 'sess_' + Math.random().toString(36).substr(2, 9);
      localStorage.setItem('cart_session_id', sessionId);
    }
    return sessionId;
  };

  const loadCart = async () => {
    try {
      setLoading(true);
      
      const localCart = localStorage.getItem('cart_items');
      if (localCart) {
        setItems(JSON.parse(localCart));
      }

      if (user) {
        const { data: cart } = await supabase
          .from('carts')
          .select(`
            id,
            cart_items (
              id,
              product_id,
              size,
              quantity,
              unit_price,
              products (name, images)
            )
          `)
          .eq('user_id', user.id)
          .maybeSingle();

        if (cart?.cart_items) {
          const cartItems = cart.cart_items.map((item: any) => ({
            id: item.id,
            productId: item.product_id,
            name: item.products.name,
            size: item.size,
            quantity: item.quantity,
            unitPrice: parseFloat(item.unit_price.toString()),
            image: item.products.images?.[0]
          }));
          setItems(cartItems);
          localStorage.setItem('cart_items', JSON.stringify(cartItems));
        }
      }
    } catch (error) {
      console.error('Error loading cart:', error);
    } finally {
      setLoading(false);
    }
  };

  const addToCart = async (product: any, size: string, quantity: number = 1) => {
    try {
      const { data: sizeData } = await supabase
        .from('product_sizes')
        .select('price')
        .eq('product_id', product.id)
        .eq('size', size)
        .eq('is_available', true)
        .single();

      if (!sizeData) {
        toast({
          title: 'Size Unavailable',
          description: `The ${size} size is not available for ${product.name}`,
          variant: 'destructive'
        });
        return;
      }

      const unitPrice = parseFloat(sizeData.price.toString());
      
      let cartId: string;
      
      if (user) {
        const { data: existingCart } = await supabase
          .from('carts')
          .select('id')
          .eq('user_id', user.id)
          .maybeSingle();

        if (existingCart) {
          cartId = existingCart.id;
        } else {
          const { data: newCart } = await supabase
            .from('carts')
            .insert({ user_id: user.id })
            .select('id')
            .single();
          
          if (newCart) cartId = newCart.id;
        }
      } else {
        const sessionId = getSessionId();
        const { data: existingCart } = await supabase
          .from('carts')
          .select('id')
          .eq('session_id', sessionId)
          .maybeSingle();

        if (existingCart) {
          cartId = existingCart.id;
        } else {
          const { data: newCart } = await supabase
            .from('carts')
            .insert({ session_id: sessionId })
            .select('id')
            .single();
          
          if (newCart) cartId = newCart.id;
        }
      }

      await supabase
        .from('cart_items')
        .upsert({
          cart_id: cartId!,
          product_id: product.id,
          size,
          quantity,
          unit_price: unitPrice
        });

      await loadCart();
      
      toast({
        title: 'Added to Cart',
        description: `${product.name} (${size}) has been added to your cart.`
      });
    } catch (error) {
      console.error('Error adding to cart:', error);
    }
  };

  const updateQuantity = async (itemId: string, quantity: number) => {
    try {
      if (quantity <= 0) {
        await removeItem(itemId);
        return;
      }

      await supabase
        .from('cart_items')
        .update({ quantity: quantity })
        .eq('id', itemId);

      await loadCart();
    } catch (error) {
      console.error('Error updating quantity:', error);
    }
  };

  const removeItem = async (itemId: string) => {
    try {
      await supabase
        .from('cart_items')
        .delete()
        .eq('id', itemId);

      await loadCart();
    } catch (error) {
      console.error('Error removing item:', error);
    }
  };

  const clearCart = async () => {
    try {
      if (user) {
        const { data: cart } = await supabase
          .from('carts')
          .select('id')
          .eq('user_id', user.id)
          .maybeSingle();

        if (cart) {
          await supabase
            .from('cart_items')
            .delete()
            .eq('cart_id', cart.id);
        }
      }

      setItems([]);
      localStorage.removeItem('cart_items');
    } catch (error) {
      console.error('Error clearing cart:', error);
    }
  };

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);

  const value: CartContextType = {
    items,
    totalItems,
    totalPrice,
    loading,
    addToCart,
    updateQuantity,
    removeItem,
    clearCart
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}