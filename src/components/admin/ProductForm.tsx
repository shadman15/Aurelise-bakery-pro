import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { X, Plus, Upload } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

const productSchema = z.object({
  name: z.string().min(1, 'Product name is required'),
  slug: z.string().min(1, 'Slug is required'),
  short_description: z.string().min(1, 'Short description is required'),
  description: z.string().min(1, 'Description is required'),
  category_id: z.string().optional(),
  featured: z.boolean().default(false),
  active: z.boolean().default(true),
});

const sizeSchema = z.object({
  size: z.string().min(1, 'Size name is required'),
  price: z.number().min(0.01, 'Price must be greater than 0'),
  is_available: z.boolean().default(true),
});

type ProductFormData = z.infer<typeof productSchema>;
type SizeFormData = z.infer<typeof sizeSchema>;

interface Category {
  id: string;
  name: string;
}

const commonAllergens = [
  'Milk', 'Eggs', 'Gluten (wheat)', 'Tree Nuts (cashew)', 'Tree Nuts (almond)', 
  'Tree Nuts (hazelnut)', 'Coconut', 'Sesame', 'Soya', 'Sulphites'
];

export function ProductForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id);

  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [images, setImages] = useState<string[]>([]);
  const [allergens, setAllergens] = useState<string[]>([]);
  const [ingredients, setIngredients] = useState<string[]>([]);
  const [sizes, setSizes] = useState<SizeFormData[]>([]);
  const [newIngredient, setNewIngredient] = useState('');

  const form = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: '',
      slug: '',
      short_description: '',
      description: '',
      category_id: '',
      featured: false,
      active: true,
    },
  });

  useEffect(() => {
    loadCategories();
    if (isEdit && id) {
      loadProduct(id);
    }
  }, [id, isEdit]);

  const loadCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('id, name')
        .eq('active', true)
        .order('name');

      if (error) throw error;
      setCategories(data || []);
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  };

  const loadProduct = async (productId: string) => {
    try {
      const { data: product, error } = await supabase
        .from('products')
        .select(`
          *,
          product_sizes (
            size,
            price,
            is_available
          )
        `)
        .eq('id', productId)
        .single();

      if (error) throw error;

      form.reset({
        name: product.name,
        slug: product.slug,
        short_description: product.short_description,
        description: product.description,
        category_id: product.category_id || '',
        featured: product.featured,
        active: product.active,
      });

      setImages(product.images || []);
      setAllergens(product.allergens || []);
      setIngredients(product.ingredients || []);
      setSizes(product.product_sizes || []);
    } catch (error) {
      console.error('Error loading product:', error);
      toast({
        title: 'Error',
        description: 'Failed to load product',
        variant: 'destructive',
      });
    }
  };

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  };

  const handleNameChange = (name: string) => {
    form.setValue('name', name);
    if (!isEdit) {
      const slug = generateSlug(name);
      form.setValue('slug', slug);
    }
  };

  const addAllergen = (allergen: string) => {
    if (!allergens.includes(allergen)) {
      setAllergens([...allergens, allergen]);
    }
  };

  const removeAllergen = (allergen: string) => {
    setAllergens(allergens.filter(a => a !== allergen));
  };

  const addIngredient = () => {
    if (newIngredient.trim() && !ingredients.includes(newIngredient.trim())) {
      setIngredients([...ingredients, newIngredient.trim()]);
      setNewIngredient('');
    }
  };

  const removeIngredient = (ingredient: string) => {
    setIngredients(ingredients.filter(i => i !== ingredient));
  };

  const addSize = () => {
    setSizes([...sizes, { size: '', price: 0, is_available: true }]);
  };

  const updateSize = (index: number, field: keyof SizeFormData, value: any) => {
    const newSizes = [...sizes];
    newSizes[index] = { ...newSizes[index], [field]: value };
    setSizes(newSizes);
  };

  const removeSize = (index: number) => {
    setSizes(sizes.filter((_, i) => i !== index));
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    setLoading(true);
    try {
      const uploadedUrls: string[] = [];

      for (const file of Array.from(files)) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const filePath = `${fileName}`;

        const { error: uploadError, data } = await supabase.storage
          .from('product-images')
          .upload(filePath, file);

        if (uploadError) throw uploadError;

        // Get public URL
        const { data: { publicUrl } } = supabase.storage
          .from('product-images')
          .getPublicUrl(filePath);

        uploadedUrls.push(publicUrl);
      }

      setImages([...images, ...uploadedUrls]);
      toast({
        title: 'Success',
        description: `${uploadedUrls.length} image(s) uploaded successfully`,
      });
    } catch (error: any) {
      console.error('Error uploading images:', error);
      toast({
        title: 'Upload Failed',
        description: error.message || 'Failed to upload images',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const removeImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const onSubmit = async (data: ProductFormData) => {
    try {
      setLoading(true);

      // Validate sizes
      if (sizes.length === 0) {
        toast({
          title: 'Error',
          description: 'At least one size is required',
          variant: 'destructive',
        });
        return;
      }

      const productData = {
        name: data.name,
        slug: data.slug,
        short_description: data.short_description,
        description: data.description,
        category_id: data.category_id || null,
        featured: data.featured,
        active: data.active,
        images,
        allergens,
        ingredients,
      };

      let productId = id;

      if (isEdit) {
        // Update product
        const { error } = await supabase
          .from('products')
          .update(productData)
          .eq('id', id);

        if (error) throw error;

        // Delete existing sizes and recreate them
        await supabase
          .from('product_sizes')
          .delete()
          .eq('product_id', id);
      } else {
        // Create product
        const { data: newProduct, error } = await supabase
          .from('products')
          .insert(productData)
          .select()
          .single();

        if (error) throw error;
        productId = newProduct.id;
      }

      // Insert sizes
      if (productId && sizes.length > 0) {
        const sizesData = sizes
          .filter(size => size.size && size.price > 0)
          .map(size => ({
            product_id: productId,
            size: size.size,
            price: size.price,
            is_available: size.is_available,
          }));

        if (sizesData.length > 0) {
          const { error: sizesError } = await supabase
            .from('product_sizes')
            .insert(sizesData);

          if (sizesError) throw sizesError;
        }
      }

      toast({
        title: 'Success',
        description: `Product ${isEdit ? 'updated' : 'created'} successfully`,
      });

      navigate('/admin/products');
    } catch (error) {
      console.error('Error saving product:', error);
      toast({
        title: 'Error',
        description: `Failed to ${isEdit ? 'update' : 'create'} product`,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{isEdit ? 'Edit' : 'Add'} Product</h1>
          <p className="text-muted-foreground">
            {isEdit ? 'Update product details' : 'Create a new bakery product'}
          </p>
        </div>
        <Button variant="outline" onClick={() => navigate('/admin/products')}>
          Cancel
        </Button>
      </div>

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Product Name</Label>
                <Input
                  id="name"
                  {...form.register('name')}
                  onChange={(e) => handleNameChange(e.target.value)}
                  placeholder="e.g., Basque Burnt Cheesecake"
                />
                {form.formState.errors.name && (
                  <p className="text-sm text-destructive">{form.formState.errors.name.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="slug">URL Slug</Label>
                <Input
                  id="slug"
                  {...form.register('slug')}
                  placeholder="basque-burnt-cheesecake"
                />
                {form.formState.errors.slug && (
                  <p className="text-sm text-destructive">{form.formState.errors.slug.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="short_description">Short Description</Label>
                <Textarea
                  id="short_description"
                  {...form.register('short_description')}
                  placeholder="Brief description for product cards"
                  rows={3}
                />
                {form.formState.errors.short_description && (
                  <p className="text-sm text-destructive">{form.formState.errors.short_description.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Full Description</Label>
                <Textarea
                  id="description"
                  {...form.register('description')}
                  placeholder="Detailed product description"
                  rows={6}
                />
                {form.formState.errors.description && (
                  <p className="text-sm text-destructive">{form.formState.errors.description.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select 
                  value={form.watch('category_id')} 
                  onValueChange={(value) => form.setValue('category_id', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="featured"
                    checked={form.watch('featured')}
                    onCheckedChange={(checked) => form.setValue('featured', checked)}
                  />
                  <Label htmlFor="featured">Featured</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="active"
                    checked={form.watch('active')}
                    onCheckedChange={(checked) => form.setValue('active', checked)}
                  />
                  <Label htmlFor="active">Active</Label>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Images */}
          <Card>
            <CardHeader>
              <CardTitle>Images</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Product Images</Label>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                  id="image-upload"
                />
                <Label 
                  htmlFor="image-upload"
                  className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-muted-foreground/25 rounded-lg cursor-pointer hover:bg-muted/50"
                >
                  <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                  <span className="text-sm text-muted-foreground">Click to upload images</span>
                </Label>
              </div>

              {images.length > 0 && (
                <div className="grid grid-cols-2 gap-2">
                  {images.map((image, index) => (
                    <div key={index} className="relative">
                      <img 
                        src={image} 
                        alt={`Product ${index + 1}`}
                        className="w-full h-24 object-cover rounded-md"
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        className="absolute top-1 right-1 h-6 w-6 p-0"
                        onClick={() => removeImage(index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sizes and Prices */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Sizes & Prices
              <Button type="button" variant="outline" size="sm" onClick={addSize}>
                <Plus className="h-4 w-4 mr-2" />
                Add Size
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {sizes.map((size, index) => (
              <div key={index} className="flex items-center space-x-4 p-4 border rounded-lg">
                        <Input
                          placeholder="Size (e.g., 6&quot;, 8&quot;, 10&quot;)"
                  value={size.size}
                  onChange={(e) => updateSize(index, 'size', e.target.value)}
                  className="flex-1"
                />
                <div className="flex items-center space-x-2">
                  <span className="text-sm">£</span>
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                    value={size.price || ''}
                    onChange={(e) => updateSize(index, 'price', parseFloat(e.target.value) || 0)}
                    className="w-20"
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={size.is_available}
                    onCheckedChange={(checked) => updateSize(index, 'is_available', checked)}
                  />
                  <Label>Available</Label>
                </div>
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  onClick={() => removeSize(index)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
            {sizes.length === 0 && (
              <p className="text-muted-foreground text-center py-8">
                No sizes added yet. Click "Add Size" to get started.
              </p>
            )}
          </CardContent>
        </Card>

        {/* Allergens and Ingredients */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Allergens</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-2">
                {commonAllergens.map((allergen) => (
                  <Button
                    key={allergen}
                    type="button"
                    variant={allergens.includes(allergen) ? "default" : "outline"}
                    size="sm"
                    onClick={() => 
                      allergens.includes(allergen) 
                        ? removeAllergen(allergen)
                        : addAllergen(allergen)
                    }
                  >
                    {allergen}
                  </Button>
                ))}
              </div>

              {allergens.length > 0 && (
                <div className="space-y-2">
                  <Label>Selected Allergens:</Label>
                  <div className="flex flex-wrap gap-1">
                    {allergens.map((allergen) => (
                      <Badge key={allergen} variant="secondary" className="cursor-pointer" onClick={() => removeAllergen(allergen)}>
                        {allergen} <X className="h-3 w-3 ml-1" />
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Ingredients</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex space-x-2">
                <Input
                  placeholder="Add an ingredient"
                  value={newIngredient}
                  onChange={(e) => setNewIngredient(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addIngredient())}
                />
                <Button type="button" onClick={addIngredient}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>

              {ingredients.length > 0 && (
                <div className="space-y-2">
                  <Label>Ingredients:</Label>
                  <div className="flex flex-wrap gap-1">
                    {ingredients.map((ingredient) => (
                      <Badge key={ingredient} variant="outline" className="cursor-pointer" onClick={() => removeIngredient(ingredient)}>
                        {ingredient} <X className="h-3 w-3 ml-1" />
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="flex justify-end space-x-4">
          <Button type="button" variant="outline" onClick={() => navigate('/admin/products')}>
            Cancel
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? 'Saving...' : isEdit ? 'Update Product' : 'Create Product'}
          </Button>
        </div>
      </form>
    </div>
  );
}