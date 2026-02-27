import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAdmin } from '@/contexts/AdminContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import MarkdownEditor from '@/components/admin/MarkdownEditor';
import QuizBuilder from '@/components/admin/QuizBuilder';
import ImageInput from '@/components/admin/ImageInput';
import PreviewModal from '@/components/admin/PreviewModal';
import GenerateButton from '@/components/admin/GenerateButton';
import { generateSnippet } from '@/lib/aiGenerate';
import { QuizQuestion, ROADMAP_CATEGORIES } from '@/types/admin';
import { ArrowLeft, Eye, Save, Globe, Keyboard } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

const SnippetEditor = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { snippets, addSnippet, updateSnippet } = useAdmin();

  const existing = id ? snippets.find(s => s.id === id) : null;
  const isEdit = !!existing;

  const [title, setTitle] = useState(existing?.title || '');
  const [category, setCategory] = useState(existing?.category || '');
  const [imageUrl, setImageUrl] = useState(existing?.imageUrl || '');
  const [body, setBody] = useState(existing?.body || '');
  const [questions, setQuestions] = useState<QuizQuestion[]>(existing?.quiz.questions || []);
  const [showPreview, setShowPreview] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    if (id && !existing) navigate('/admin/snippets');
  }, [id, existing, navigate]);

  // Track changes
  useEffect(() => {
    setHasChanges(true);
  }, [title, category, imageUrl, body, questions]);

  const handleSave = useCallback((publish = false) => {
    if (!title.trim()) {
      toast({ title: 'Title is required', variant: 'destructive' });
      return;
    }

    // When editing: "Save" preserves existing status; "Publish" always sets published.
    // When creating: "Save" = draft, "Publish" = published.
    const resolvedStatus = publish
      ? 'published' as const
      : isEdit
        ? (existing?.status ?? 'draft' as const)
        : 'draft' as const;

    const data = {
      title, category, imageUrl, body,
      quiz: { questions },
      status: resolvedStatus,
    };
    if (isEdit) {
      updateSnippet(id!, data);
      toast({ title: publish ? 'Published!' : 'Snippet updated' });
    } else {
      addSnippet(data);
      toast({ title: publish ? 'Published!' : 'Saved as draft' });
    }
    setHasChanges(false);
    navigate('/admin/snippets');
  }, [title, category, imageUrl, body, questions, isEdit, id, existing, updateSnippet, addSnippet, navigate]);


  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        handleSave(false);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [handleSave]);

  return (
    <div className="flex flex-col h-full">
      {/* Top bar */}
      <div className="flex items-center justify-between px-6 py-3 border-b border-border bg-card/50">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => navigate('/admin/snippets')} className="h-8">
            <ArrowLeft className="w-4 h-4 mr-1" /> Back
          </Button>
          <span className="text-sm font-semibold text-foreground">{isEdit ? 'Edit Snippet' : 'New Snippet'}</span>
          {hasChanges && <span className="w-2 h-2 rounded-full bg-destructive" title="Unsaved changes" />}
        </div>
        <div className="flex items-center gap-2">
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="text-xs text-muted-foreground flex items-center gap-1 mr-2">
                <Keyboard className="w-3 h-3" /> Ctrl+S
              </div>
            </TooltipTrigger>
            <TooltipContent>Press Ctrl+S to quick-save as draft</TooltipContent>
          </Tooltip>
          <Button variant="ghost" size="sm" className="h-8" onClick={() => setShowPreview(true)}>
            <Eye className="w-4 h-4 mr-1" /> Preview
          </Button>
          <Button variant="outline" size="sm" className="h-8" onClick={() => handleSave(false)}>
            <Save className="w-4 h-4 mr-1" /> Draft
          </Button>
          <Button size="sm" className="h-8" onClick={() => handleSave(true)}>
            <Globe className="w-4 h-4 mr-1" /> Publish
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto px-6 py-4 space-y-4">
        {/* Title + Category + Generate inline */}
        <div className="flex gap-3 items-end">
          <Input
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="Snippet title…"
            className="text-lg font-semibold h-10 flex-1"
            autoFocus
          />
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger className="w-48 h-10">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              {ROADMAP_CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
            </SelectContent>
          </Select>
          <GenerateButton
            defaultCategory={category}
            defaultTopic={title}
            onGenerate={async ({ category: cat, topic }) => {
              const result = await generateSnippet(cat, topic);
              setTitle(result.title);
              setCategory(cat);
              setBody(result.body);
              setQuestions(result.quiz.questions);
            }}
          />
        </div>

        {/* Image */}
        <ImageInput value={imageUrl} onChange={setImageUrl} />

        {/* Body — side-by-side */}
        <MarkdownEditor value={body} onChange={setBody} />

        {/* Quiz — collapsible */}
        <QuizBuilder questions={questions} onChange={setQuestions} />
      </div>

      <PreviewModal
        open={showPreview}
        onClose={() => setShowPreview(false)}
        title={title}
        imageUrl={imageUrl}
        body={body}
        quiz={questions}
        type="Snippet"
      />
    </div>
  );
};

export default SnippetEditor;
