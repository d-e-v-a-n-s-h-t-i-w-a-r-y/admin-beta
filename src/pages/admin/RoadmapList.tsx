import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdmin } from '@/contexts/AdminContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Eye, Pencil, Trash2, Globe, GlobeLock } from 'lucide-react';
import PreviewModal from '@/components/admin/PreviewModal';
import { Roadmap } from '@/types/admin';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

const RoadmapList = () => {
  const { roadmaps, deleteRoadmap, toggleRoadmapStatus } = useAdmin();
  const navigate = useNavigate();
  const [preview, setPreview] = useState<Roadmap | null>(null);

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Roadmaps</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage micro-courses and learning paths</p>
        </div>
        <Button onClick={() => navigate('/admin/roadmaps/new')}>
          <Plus className="w-4 h-4 mr-2" /> New Roadmap
        </Button>
      </div>

      {roadmaps.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <p className="text-lg">No roadmaps yet</p>
          <p className="text-sm mt-1">Create your first roadmap to get started</p>
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Snippets</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {roadmaps.map(r => (
              <TableRow key={r.id}>
                <TableCell className="font-medium">{r.title}</TableCell>
                <TableCell>{r.category}</TableCell>
                <TableCell>{r.units.length}</TableCell>
                <TableCell>
                  <Badge variant={r.status === 'published' ? 'default' : 'secondary'}>{r.status}</Badge>
                </TableCell>
                <TableCell className="text-right space-x-1">
                  <Button variant="ghost" size="sm" onClick={() => setPreview(r)}>
                    <Eye className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => navigate(`/admin/roadmaps/${r.id}`)}>
                    <Pencil className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => toggleRoadmapStatus(r.id)}>
                    {r.status === 'published' ? <GlobeLock className="w-4 h-4" /> : <Globe className="w-4 h-4" />}
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="ghost" size="sm"><Trash2 className="w-4 h-4 text-destructive" /></Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete roadmap?</AlertDialogTitle>
                        <AlertDialogDescription>This will delete all units. Cannot be undone.</AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => deleteRoadmap(r.id)}>Delete</AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      {preview && (
        <PreviewModal
          open={!!preview}
          onClose={() => setPreview(null)}
          title={preview.title}
          imageUrl={preview.coverImage}
          body={`${preview.description}\n\n---\n\n**Units:**\n${preview.units.map((u, i) => `${i + 1}. ${u.title}`).join('\n')}`}
          type="Roadmap"
        />
      )}
    </div>
  );
};

export default RoadmapList;
