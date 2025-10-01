import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';
import { Plus, Pencil, Trash2, Upload } from 'lucide-react';
import { format } from 'date-fns';

interface Post {
  id: string;
  title: string;
  slug: string;
  content: string | null;
  excerpt: string | null;
  featured_image: string | null;
  category_id: string | null;
  published: boolean;
  published_at: string | null;
  created_at: string;
}

interface Category {
  id: string;
  name: string;
}

export default function Posts() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<Post | null>(null);
  const [deletingPost, setDeletingPost] = useState<Post | null>(null);

  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [content, setContent] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [featuredImage, setFeaturedImage] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [published, setPublished] = useState(false);

  useEffect(() => {
    loadPosts();
    loadCategories();
  }, []);

  const loadPosts = async () => {
    try {
      const { data, error } = await supabase
        .from('posts')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPosts(data || []);
    } catch (error) {
      console.error('Error loading posts:', error);
      toast({
        title: 'Error',
        description: 'Failed to load posts',
        variant: 'destructive',
      });
    }
  };

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

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  };

  const handleTitleChange = (value: string) => {
    setTitle(value);
    if (!editingPost) {
      setSlug(generateSlug(value));
    }
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setLoading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('product-images')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('product-images')
        .getPublicUrl(filePath);

      setFeaturedImage(publicUrl);
      toast({
        title: 'Success',
        description: 'Image uploaded successfully',
      });
    } catch (error: any) {
      console.error('Error uploading image:', error);
      toast({
        title: 'Upload Failed',
        description: error.message || 'Failed to upload image',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const openDialog = (post?: Post) => {
    if (post) {
      setEditingPost(post);
      setTitle(post.title);
      setSlug(post.slug);
      setContent(post.content || '');
      setExcerpt(post.excerpt || '');
      setFeaturedImage(post.featured_image || '');
      setCategoryId(post.category_id || '');
      setPublished(post.published);
    } else {
      setEditingPost(null);
      setTitle('');
      setSlug('');
      setContent('');
      setExcerpt('');
      setFeaturedImage('');
      setCategoryId('');
      setPublished(false);
    }
    setDialogOpen(true);
  };

  const closeDialog = () => {
    setDialogOpen(false);
    setEditingPost(null);
    setTitle('');
    setSlug('');
    setContent('');
    setExcerpt('');
    setFeaturedImage('');
    setCategoryId('');
    setPublished(false);
  };

  const handleSave = async () => {
    if (!title || !slug) {
      toast({
        title: 'Validation Error',
        description: 'Title and slug are required',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    try {
      const postData = {
        title,
        slug,
        content: content || null,
        excerpt: excerpt || null,
        featured_image: featuredImage || null,
        category_id: categoryId || null,
        published,
        published_at: published ? new Date().toISOString() : null,
      };

      if (editingPost) {
        const { error } = await supabase
          .from('posts')
          .update(postData)
          .eq('id', editingPost.id);

        if (error) throw error;

        toast({
          title: 'Success',
          description: 'Post updated successfully',
        });
      } else {
        const { error } = await supabase
          .from('posts')
          .insert(postData);

        if (error) throw error;

        toast({
          title: 'Success',
          description: 'Post created successfully',
        });
      }

      loadPosts();
      closeDialog();
    } catch (error: any) {
      console.error('Error saving post:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to save post',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingPost) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('posts')
        .delete()
        .eq('id', deletingPost.id);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Post deleted successfully',
      });

      loadPosts();
      setDeleteDialogOpen(false);
      setDeletingPost(null);
    } catch (error: any) {
      console.error('Error deleting post:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete post',
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
          <h1 className="text-3xl font-bold">Posts</h1>
          <p className="text-muted-foreground">Manage blog posts and news</p>
        </div>
        <Button onClick={() => openDialog()}>
          <Plus className="h-4 w-4 mr-2" />
          Add Post
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Posts</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Slug</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Published</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {posts.map((post) => (
                <TableRow key={post.id}>
                  <TableCell className="font-medium">{post.title}</TableCell>
                  <TableCell className="font-mono text-sm">{post.slug}</TableCell>
                  <TableCell>
                    <Badge variant={post.published ? 'default' : 'secondary'}>
                      {post.published ? 'Published' : 'Draft'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {post.published_at ? format(new Date(post.published_at), 'PP') : '-'}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openDialog(post)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => {
                          setDeletingPost(post);
                          setDeleteDialogOpen(true);
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {posts.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                    No posts found. Create your first post to get started.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingPost ? 'Edit Post' : 'Add New Post'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="title">Post Title</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => handleTitleChange(e.target.value)}
                placeholder="e.g., New Seasonal Flavors"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="slug">URL Slug</Label>
              <Input
                id="slug"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                placeholder="new-seasonal-flavors"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="excerpt">Excerpt</Label>
              <Textarea
                id="excerpt"
                value={excerpt}
                onChange={(e) => setExcerpt(e.target.value)}
                placeholder="Brief summary of the post"
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="content">Content</Label>
              <Textarea
                id="content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Post content..."
                rows={10}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select value={categoryId} onValueChange={setCategoryId}>
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
            <div className="space-y-2">
              <Label>Featured Image</Label>
              {featuredImage && (
                <div className="relative w-full h-48 mb-2">
                  <img
                    src={featuredImage}
                    alt="Featured"
                    className="w-full h-full object-cover rounded-md"
                  />
                </div>
              )}
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
                id="featured-image-upload"
              />
              <Label
                htmlFor="featured-image-upload"
                className="flex items-center justify-center w-full h-20 border-2 border-dashed border-muted-foreground/25 rounded-lg cursor-pointer hover:bg-muted/50"
              >
                <Upload className="h-6 w-6 text-muted-foreground mr-2" />
                <span className="text-sm text-muted-foreground">
                  {featuredImage ? 'Change Image' : 'Upload Featured Image'}
                </span>
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="published"
                checked={published}
                onCheckedChange={setPublished}
              />
              <Label htmlFor="published">Published</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={closeDialog}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={loading}>
              {loading ? 'Saving...' : editingPost ? 'Update' : 'Create'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Post</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{deletingPost?.title}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDeletingPost(null)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={loading}>
              {loading ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
