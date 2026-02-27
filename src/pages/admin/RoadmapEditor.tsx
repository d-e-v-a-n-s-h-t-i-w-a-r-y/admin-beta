import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAdmin } from '@/contexts/AdminContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import MarkdownEditor from '@/components/admin/MarkdownEditor';
import QuizBuilder from '@/components/admin/QuizBuilder';
import ImageInput from '@/components/admin/ImageInput';
import PreviewModal from '@/components/admin/PreviewModal';
import GenerateButton from '@/components/admin/GenerateButton';
import { generateRoadmapUnit } from '@/lib/aiGenerate';
import { RoadmapUnit, ROADMAP_CATEGORIES } from '@/types/admin';
import { ArrowLeft, Eye, Save, Globe, Plus, Trash2, ChevronUp, ChevronDown, Search } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { toast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';

const genId = () => Math.random().toString(36).substr(2, 9);

const RoadmapEditor = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { roadmaps, addRoadmap, updateRoadmap } = useAdmin();

  const existing = id ? roadmaps.find(r => r.id === id) : null;
  const isEdit = !!existing;

  const [title, setTitle] = useState(existing?.title || '');
  const [category, setCategory] = useState(existing?.category || '');
  const [coverImage, setCoverImage] = useState(existing?.coverImage || '');
  const [description, setDescription] = useState(existing?.description || '');
  const [units, setUnits] = useState<RoadmapUnit[]>(existing?.units || []);
  const [showPreview, setShowPreview] = useState(false);
  const [previewUnit, setPreviewUnit] = useState<RoadmapUnit | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedUnit, setExpandedUnit] = useState<string | null>(null);

  useEffect(() => {
    if (id && !existing) navigate('/admin/roadmaps');
  }, [id, existing, navigate]);

  const addUnit = () => {
    const newUnit: RoadmapUnit = { id: genId(), title: '', order: units.length + 1, body: '', quiz: { questions: [] } };
    setUnits([...units, newUnit]);
    setExpandedUnit(newUnit.id);
  };

  const removeUnit = (uid: string) =>
    setUnits(units.filter(u => u.id !== uid).map((u, i) => ({ ...u, order: i + 1 })));

  const updateUnit = (uid: string, data: Partial<RoadmapUnit>) =>
    setUnits(units.map(u => u.id === uid ? { ...u, ...data } : u));

  const moveUnit = (index: number, dir: -1 | 1) => {
    const arr = [...units];
    const target = index + dir;
    if (target < 0 || target >= arr.length) return;
    [arr[index], arr[target]] = [arr[target], arr[index]];
    setUnits(arr.map((u, i) => ({ ...u, order: i + 1 })));
  };

  const handleSave = (publish = false) => {
    if (!title.trim()) { toast({ title: 'Title is required', variant: 'destructive' }); return; }

    // Preserve existing status when editing — only "Publish" forces a status change.
    const resolvedStatus = publish
      ? 'published' as const
      : isEdit
        ? (existing?.status ?? 'draft' as const)
        : 'draft' as const;

    const data = {
      title,
      category: category as typeof ROADMAP_CATEGORIES[number],
      coverImage, description, units,
      status: resolvedStatus,
    };
    if (isEdit) {
      updateRoadmap(id!, data);
      toast({ title: publish ? 'Roadmap published!' : 'Roadmap updated' });
    } else {
      addRoadmap(data);
      toast({ title: publish ? 'Roadmap published' : 'Roadmap saved as draft' });
    }
    navigate('/admin/roadmaps');
  };


  const filteredUnits = searchQuery
    ? units.filter(u => u.title.toLowerCase().includes(searchQuery.toLowerCase()) || `unit ${u.order}`.includes(searchQuery.toLowerCase()))
    : units;

  return (
    <div className="p-8 max-w-4xl">
      <Button variant="ghost" onClick={() => navigate('/admin/roadmaps')} className="mb-4">
        <ArrowLeft className="w-4 h-4 mr-2" /> Back to Roadmaps
      </Button>

      <h1 className="text-2xl font-bold mb-6">{isEdit ? 'Edit Roadmap' : 'New Roadmap'}</h1>

      <div className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Title</Label>
            <Input value={title} onChange={e => setTitle(e.target.value)} placeholder="Roadmap title…" />
          </div>
          <div className="space-y-2">
            <Label>Category</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
              <SelectContent>
                {ROADMAP_CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </div>

        <ImageInput value={coverImage} onChange={setCoverImage} label="Cover Image" />

        <div className="space-y-2">
          <Label>Description</Label>
          <Textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="Roadmap description…" className="min-h-[100px]" />
        </div>

        {/* Units */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Label className="text-lg font-semibold">Snippets</Label>
              <Badge variant="secondary">{units.length}</Badge>
            </div>
            <Button type="button" variant="outline" onClick={addUnit}>
              <Plus className="w-4 h-4 mr-1" /> Add Snippet
            </Button>
          </div>

          {units.length > 10 && (
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search snippets by title or number…"
                className="pl-9"
              />
            </div>
          )}

          <div className="max-h-[600px] overflow-y-auto space-y-2 pr-1">
            {filteredUnits.map((unit) => {
              const i = units.findIndex(u => u.id === unit.id);
              return (
                <Card key={unit.id} className="p-3">
                  <Collapsible open={expandedUnit === unit.id} onOpenChange={(open) => setExpandedUnit(open ? unit.id : null)}>
                    <div className="flex items-center justify-between">
                      <CollapsibleTrigger className="flex items-center gap-2 font-medium text-sm hover:text-foreground text-muted-foreground transition-colors flex-1 text-left">
                        <Badge variant="outline" className="text-xs shrink-0">{unit.order}</Badge>
                        {unit.title || 'Untitled snippet'}
                        {unit.quiz.questions.length > 0 && (
                          <Badge variant="secondary" className="text-xs ml-1">Quiz ({unit.quiz.questions.length})</Badge>
                        )}
                      </CollapsibleTrigger>
                      <div className="flex items-center gap-0.5 shrink-0">
                        <Button type="button" variant="ghost" size="icon" className="h-7 w-7" onClick={() => setPreviewUnit(unit)}>
                          <Eye className="w-3.5 h-3.5" />
                        </Button>
                        <Button type="button" variant="ghost" size="icon" className="h-7 w-7" onClick={() => moveUnit(i, -1)} disabled={i === 0}>
                          <ChevronUp className="w-3.5 h-3.5" />
                        </Button>
                        <Button type="button" variant="ghost" size="icon" className="h-7 w-7" onClick={() => moveUnit(i, 1)} disabled={i === units.length - 1}>
                          <ChevronDown className="w-3.5 h-3.5" />
                        </Button>
                        <Button type="button" variant="ghost" size="icon" className="h-7 w-7" onClick={() => removeUnit(unit.id)}>
                          <Trash2 className="w-3.5 h-3.5 text-destructive" />
                        </Button>
                      </div>
                    </div>
                    <CollapsibleContent className="mt-4 space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="space-y-2 flex-1 mr-3">
                          <Label>Snippet Title</Label>
                          <Input value={unit.title} onChange={e => updateUnit(unit.id, { title: e.target.value })} placeholder="Snippet title…" />
                        </div>
                        <GenerateButton
                          defaultTopic={unit.title}
                          defaultCategory={category}
                          label="Generate"
                          onGenerate={async ({ topic }) => {
                            const result = await generateRoadmapUnit(title || 'Untitled Roadmap', unit.order, topic);
                            updateUnit(unit.id, {
                              title: result.title,
                              body: result.body,
                              quiz: result.quiz,
                            });
                          }}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Content</Label>
                        <MarkdownEditor value={unit.body} onChange={body => updateUnit(unit.id, { body })} />
                      </div>
                      <QuizBuilder
                        questions={unit.quiz.questions}
                        onChange={questions => updateUnit(unit.id, { quiz: { questions } })}
                      />
                    </CollapsibleContent>
                  </Collapsible>
                </Card>
              );
            })}
          </div>

          {units.length === 0 && <p className="text-sm text-muted-foreground italic">No snippets yet. Add your first snippet above.</p>}
        </div>

        <div className="flex gap-3 pt-4 border-t border-border">
          <Button variant="outline" onClick={() => setShowPreview(true)}>
            <Eye className="w-4 h-4 mr-2" /> Preview Roadmap
          </Button>
          <Button variant="secondary" onClick={() => handleSave(false)}>
            <Save className="w-4 h-4 mr-2" /> Save Draft
          </Button>
          <Button onClick={() => handleSave(true)}>
            <Globe className="w-4 h-4 mr-2" /> Publish
          </Button>
        </div>
      </div>

      <PreviewModal
        open={showPreview}
        onClose={() => setShowPreview(false)}
        title={title}
        imageUrl={coverImage}
        body={`${description}\n\n---\n\n**Snippets (${units.length}):**\n${units.map(u => `${u.order}. ${u.title}`).join('\n')}`}
        type="Roadmap Overview"
      />

      {previewUnit && (
        <PreviewModal
          open={!!previewUnit}
          onClose={() => setPreviewUnit(null)}
          title={`Snippet ${previewUnit.order}: ${previewUnit.title}`}
          body={previewUnit.body}
          quiz={previewUnit.quiz.questions}
          type="Roadmap Snippet"
        />
      )}
    </div>
  );
};

export default RoadmapEditor;
