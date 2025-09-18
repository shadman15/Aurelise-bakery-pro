import { useState, useEffect } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Plus } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useCart } from '@/hooks/useCart';
import { Link } from 'react-router-dom';
import { toast } from '@/hooks/use-toast';

interface SearchDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

interface SearchResult {
  id: string;
  name: string;
  slug: string;
  short_description: string;
  images: string[];
  product_sizes: { size: string; price: number; is_available: boolean }[];
}

export function SearchDrawer({ isOpen, onClose }: SearchDrawerProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const { addToCart } = useCart();

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    const timeoutId = setTimeout(() => {
      searchProducts(query);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [query]);

  const searchProducts = async (searchQuery: string) => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .rpc('search_products', { search_query: searchQuery });

      if (error) throw error;

      // Get product sizes for each result
      const productsWithSizes = await Promise.all(
        data.map(async (product: any) => {
          const { data: sizes } = await supabase
            .from('product_sizes')
            .select('size, price, is_available')
            .eq('product_id', product.id)
            .eq('is_available', true);

          return {
            ...product,
            product_sizes: sizes || []
          };
        })
      );

      setResults(productsWithSizes);
    } catch (error) {
      console.error('Error searching products:', error);
      toast({
        title: 'Search Error',
        description: 'Failed to search products. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async (product: SearchResult) => {
    if (product.product_sizes.length === 0) {
      toast({
        title: 'Unavailable',
        description: 'This product is currently unavailable.',
        variant: 'destructive'
      });
      return;
    }

    const defaultSize = product.product_sizes[0];
    await addToCart(product, defaultSize.size);
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side="top" className="h-full overflow-y-auto">
        <SheetHeader className="space-y-4">
          <SheetTitle className="text-2xl font-heading">Search Products</SheetTitle>
          
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search for cheesecakes, flavours, or ingredients..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="pl-10"
              autoFocus
            />
          </div>
        </SheetHeader>

        <div className="mt-6">
          {loading && (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          )}

          {!loading && query && results.length === 0 && (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No products found for "{query}"</p>
            </div>
          )}

          {!loading && results.length > 0 && (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {results.map((product) => (
                <div key={product.id} className="card-elegant p-4">
                  <div className="flex space-x-4">
                    {product.images[0] && (
                      <img
                        src={product.images[0]}
                        alt={product.name}
                        className="w-16 h-16 rounded-lg object-cover flex-shrink-0"
                      />
                    )}
                    
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-sm mb-1 truncate">
                        {product.name}
                      </h3>
                      <p className="text-xs text-muted-foreground mb-2 line-clamp-2">
                        {product.short_description}
                      </p>
                      
                      {product.product_sizes.length > 0 && (
                        <div className="text-sm font-medium text-primary mb-2">
                          From £{Math.min(...product.product_sizes.map(s => s.price)).toFixed(2)}
                        </div>
                      )}
                      
                      <div className="flex space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleAddToCart(product)}
                          className="h-8 text-xs"
                          disabled={product.product_sizes.length === 0}
                        >
                          <Plus className="h-3 w-3 mr-1" />
                          Add
                        </Button>
                        
                        <Link to={`/product/${product.slug}`} onClick={onClose}>
                          <Button size="sm" variant="outline" className="h-8 text-xs">
                            View
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {!query && (
            <div className="text-center py-8">
              <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">Start typing to search our delicious products</p>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}