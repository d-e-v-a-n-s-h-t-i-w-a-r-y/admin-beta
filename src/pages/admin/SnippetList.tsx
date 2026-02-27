import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdmin } from '@/contexts/AdminContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Eye, Pencil, Trash2, Globe, GlobeLock, Search, FileText } from 'lucide-react';
import PreviewModal from '@/components/admin/PreviewModal';
import { Snippet } from '@/types/admin';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

const SnippetList = () => {
  const { snippets, deleteSnippet, toggleSnippetStatus } = useAdmin();
  const navigate = useNavigate();
  const [preview, setPreview] = useState<Snippet | null>(null);
  const [search, setSearch] = useState('');

  const filtered = search
    ? snippets.filter(s =>
        s.title.toLowerCase().includes(search.toLowerCase()) ||
        s.category.toLowerCase().includes(search.toLowerCase())
      )
    : snippets;

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Snippets</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage main feed content</p>
        </div>
        <Button onClick={() => navigate('/admin/snippets/new')}>
          <Plus className="w-4 h-4 mr-2" /> New Snippet
        </Button>
      </div>

      {snippets.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-16 h-16 rounded-2xl bg-secondary flex items-center justify-center mb-4">
            <FileText className="w-8 h-8 text-muted-foreground" />
          </div>
          <h2 className="text-lg font-semibold text-foreground mb-1">No snippets yet</h2>
          <p className="text-sm text-muted-foreground mb-4 max-w-sm">
            Create your first snippet — paste your content, add an image, and publish in under 2 minutes.
          </p>
          <Button onClick={() => navigate('/admin/snippets/new')}>
            <Plus className="w-4 h-4 mr-2" /> Create First Snippet
          </Button>
        </div>
      ) : (
        <>
          {snippets.length > 5 && (
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search by title or category…"
                className="pl-9"
              />
            </div>
          )}
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Quiz</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map(s => (
                <TableRow key={s.id} className="cursor-pointer" onDoubleClick={() => navigate(`/admin/snippets/${s.id}`)}>
                  <TableCell className="font-medium">{s.title}</TableCell>
                  <TableCell>{s.category}</TableCell>
                  <TableCell>
                    {s.quiz.questions.length > 0 ? (
                      <Badge variant="outline" className="text-xs">{s.quiz.questions.length}Q</Badge>
                    ) : (
                      <span className="text-xs text-muted-foreground">—</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge variant={s.status === 'published' ? 'default' : 'secondary'}>{s.status}</Badge>
                  </TableCell>
                  <TableCell className="text-right space-x-1">
                    <Button variant="ghost" size="sm" onClick={() => setPreview(s)}>
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => navigate(`/admin/snippets/${s.id}`)}>
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => toggleSnippetStatus(s.id)}>
                      {s.status === 'published' ? <GlobeLock className="w-4 h-4" /> : <Globe className="w-4 h-4" />}
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="sm"><Trash2 className="w-4 h-4 text-destructive" /></Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete snippet?</AlertDialogTitle>
                          <AlertDialogDescription>This action cannot be undone.</AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={() => deleteSnippet(s.id)}>Delete</AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {search && filtered.length === 0 && (
            <p className="text-center text-sm text-muted-foreground py-8">No snippets match "{search}"</p>
          )}
        </>
      )}

      {preview && (
        <PreviewModal
          open={!!preview}
          onClose={() => setPreview(null)}
          title={preview.title}
          imageUrl={preview.imageUrl}
          body={preview.body}
          quiz={preview.quiz.questions}
          type="Snippet"
        />
      )}
    </div>
  );
};

export default SnippetList;
