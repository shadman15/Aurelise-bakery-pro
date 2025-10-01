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
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';
import { Plus, Pencil, Trash2 } from 'lucide-react';

interface Page {
  id: string;
  title: string;
  slug: string;
  content: string | null;
  meta_description: string | null;
  active: boolean;
  created_at: string;
}

export default function Pages() {
  const [pages, setPages] = useState<Page[]>([]);
  const [loading, setLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editingPage, setEditingPage] = useState<Page | null>(null);
  const [deletingPage, setDeletingPage] = useState<Page | null>(null);

  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [content, setContent] = useState('');
  const [metaDescription, setMetaDescription] = useState('');
  const [active, setActive] = useState(true);

  useEffect(() => {
    loadPages();
  }, []);

  const loadPages = async () => {
    try {
      const { data, error } = await supabase
        .from('pages')
        .select('*')
        .order('title');

      if (error) throw error;
      setPages(data || []);
    } catch (error) {
      console.error('Error loading pages:', error);
      toast({
        title: 'Error',
        description: 'Failed to load pages',
        variant: 'destructive',
      });
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
    if (!editingPage) {
      setSlug(generateSlug(value));
    }
  };

  const openDialog = (page?: Page) => {
    if (page) {
      setEditingPage(page);
      setTitle(page.title);
      setSlug(page.slug);
      setContent(page.content || '');
      setMetaDescription(page.meta_description || '');
      setActive(page.active);
    } else {
      setEditingPage(null);
      setTitle('');
      setSlug('');
      setContent('');
      setMetaDescription('');
      setActive(true);
    }
    setDialogOpen(true);
  };

  const closeDialog = () => {
    setDialogOpen(false);
    setEditingPage(null);
    setTitle('');
    setSlug('');
    setContent('');
    setMetaDescription('');
    setActive(true);
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
      const pageData = {
        title,
        slug,
        content: content || null,
        meta_description: metaDescription || null,
        active,
      };

      if (editingPage) {
        const { error } = await supabase
          .from('pages')
          .update(pageData)
          .eq('id', editingPage.id);

        if (error) throw error;

        toast({
          title: 'Success',
          description: 'Page updated successfully',
        });
      } else {
        const { error } = await supabase
          .from('pages')
          .insert(pageData);

        if (error) throw error;

        toast({
          title: 'Success',
          description: 'Page created successfully',
        });
      }

      loadPages();
      closeDialog();
    } catch (error: any) {
      console.error('Error saving page:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to save page',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingPage) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('pages')
        .delete()
        .eq('id', deletingPage.id);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Page deleted successfully',
      });

      loadPages();
      setDeleteDialogOpen(false);
      setDeletingPage(null);
    } catch (error: any) {
      console.error('Error deleting page:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete page',
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
          <h1 className="text-3xl font-bold">Pages</h1>
          <p className="text-muted-foreground">Manage custom pages</p>
        </div>
        <Button onClick={() => openDialog()}>
          <Plus className="h-4 w-4 mr-2" />
          Add Page
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Pages</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Slug</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pages.map((page) => (
                <TableRow key={page.id}>
                  <TableCell className="font-medium">{page.title}</TableCell>
                  <TableCell className="font-mono text-sm">{page.slug}</TableCell>
                  <TableCell>
                    <Badge variant={page.active ? 'default' : 'secondary'}>
                      {page.active ? 'Active' : 'Inactive'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openDialog(page)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => {
                          setDeletingPage(page);
                          setDeleteDialogOpen(true);
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {pages.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                    No pages found. Create your first page to get started.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingPage ? 'Edit Page' : 'Add New Page'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="title">Page Title</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => handleTitleChange(e.target.value)}
                placeholder="e.g., About Us"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="slug">URL Slug</Label>
              <Input
                id="slug"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                placeholder="about-us"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="content">Content</Label>
              <Textarea
                id="content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Page content..."
                rows={10}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="metaDescription">Meta Description</Label>
              <Textarea
                id="metaDescription"
                value={metaDescription}
                onChange={(e) => setMetaDescription(e.target.value)}
                placeholder="SEO meta description"
                rows={3}
              />
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="active"
                checked={active}
                onCheckedChange={setActive}
              />
              <Label htmlFor="active">Active</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={closeDialog}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={loading}>
              {loading ? 'Saving...' : editingPage ? 'Update' : 'Create'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Page</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{deletingPage?.title}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDeletingPage(null)}>
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
