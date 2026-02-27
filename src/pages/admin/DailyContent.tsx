import { useState } from 'react';
import { format } from 'date-fns';
import { useAdmin } from '@/contexts/AdminContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Plus, Trash2, Eye, Save } from 'lucide-react';
import { cn } from '@/lib/utils';
import QuizBuilder from '@/components/admin/QuizBuilder';
import MarkdownEditor from '@/components/admin/MarkdownEditor';
import ImageInput from '@/components/admin/ImageInput';
import PreviewModal from '@/components/admin/PreviewModal';
import GenerateButton from '@/components/admin/GenerateButton';
import { generateDailyQuiz, generateDailyVocab, generateLongRead } from '@/lib/aiGenerate';
import { QuizQuestion, VocabWord } from '@/types/admin';
import { toast } from '@/hooks/use-toast';

const genId = () => Math.random().toString(36).substr(2, 9);

const DatePicker = ({ date, onSelect }: { date: Date | undefined; onSelect: (d: Date | undefined) => void }) => (
  <Popover>
    <PopoverTrigger asChild>
      <Button variant="outline" className={cn("w-[240px] justify-start text-left font-normal", !date && "text-muted-foreground")}>
        <CalendarIcon className="mr-2 h-4 w-4" />
        {date ? format(date, "yyyy-MM-dd") : "Select date"}
      </Button>
    </PopoverTrigger>
    <PopoverContent className="w-auto p-0" align="start">
      <Calendar mode="single" selected={date} onSelect={onSelect} className="p-3 pointer-events-auto" />
    </PopoverContent>
  </Popover>
);

/* ── Daily Quiz ─────────────────────────────── */

const DailyQuizTab = () => {
  const { getDailyQuiz, setDailyQuiz } = useAdmin();
  const [date, setDate] = useState<Date>(new Date());
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [showPreview, setShowPreview] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const dateStr = format(date, 'yyyy-MM-dd');

  const handleDateSelect = async (d: Date | undefined) => {
    if (!d) return;
    setDate(d);
    const existing = await getDailyQuiz(format(d, 'yyyy-MM-dd'));
    setQuestions(existing?.questions || []);
  };

  const handleSave = async () => {
    setIsSaving(true);
    await setDailyQuiz(dateStr, { questions });
    setIsSaving(false);
    toast({ title: `Quiz saved for ${dateStr}` });
  };

  return (
    <div className="mt-6 space-y-6 max-w-3xl">
      <DatePicker date={date} onSelect={handleDateSelect} />
      <QuizBuilder questions={questions} onChange={setQuestions} />
      <div className="flex gap-3">
        <GenerateButton
          categoryOnly
          onGenerate={async ({ category }) => {
            const result = await generateDailyQuiz(category);
            setQuestions(result.questions);
          }}
        />
        <Button variant="outline" onClick={() => setShowPreview(true)}><Eye className="w-4 h-4 mr-2" /> Preview</Button>
        <Button onClick={handleSave} disabled={isSaving}><Save className="w-4 h-4 mr-2" /> {isSaving ? 'Saving…' : 'Save'}</Button>
      </div>
      <PreviewModal open={showPreview} onClose={() => setShowPreview(false)} title={`Daily Quiz — ${dateStr}`} quiz={questions} type="Daily Quiz" />
    </div>
  );
};

/* ── Daily Vocabulary ───────────────────────── */

const DailyVocabTab = () => {
  const { getDailyVocab, setDailyVocab } = useAdmin();
  const [date, setDate] = useState<Date>(new Date());
  const [words, setWords] = useState<VocabWord[]>([]);
  const [showPreview, setShowPreview] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const dateStr = format(date, 'yyyy-MM-dd');

  const handleDateSelect = async (d: Date | undefined) => {
    if (!d) return;
    setDate(d);
    setWords((await getDailyVocab(format(d, 'yyyy-MM-dd'))) || []);
  };

  const addWord = () => setWords([...words, { id: genId(), word: '', meaning: '', example: '' }]);
  const removeWord = (id: string) => setWords(words.filter(w => w.id !== id));
  const updateWord = (id: string, data: Partial<VocabWord>) =>
    setWords(words.map(w => w.id === id ? { ...w, ...data } : w));

  const handleSave = async () => {
    setIsSaving(true);
    await setDailyVocab(dateStr, words);
    setIsSaving(false);
    toast({ title: `Vocabulary saved for ${dateStr}` });
  };

  return (
    <div className="mt-6 space-y-6 max-w-3xl">
      <DatePicker date={date} onSelect={handleDateSelect} />
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label>Words</Label>
          <Button type="button" variant="outline" size="sm" onClick={addWord}>
            <Plus className="w-4 h-4 mr-1" /> Add Word
          </Button>
        </div>
        {words.map(w => (
          <div key={w.id} className="border rounded-lg p-4 space-y-2 bg-card">
            <div className="flex justify-between gap-2">
              <div className="grid grid-cols-2 gap-2 flex-1">
                <Input value={w.word} onChange={e => updateWord(w.id, { word: e.target.value })} placeholder="Word" />
                <Input value={w.meaning} onChange={e => updateWord(w.id, { meaning: e.target.value })} placeholder="Meaning" />
              </div>
              <Button type="button" variant="ghost" size="sm" onClick={() => removeWord(w.id)}>
                <Trash2 className="w-4 h-4 text-destructive" />
              </Button>
            </div>
            <Input value={w.example} onChange={e => updateWord(w.id, { example: e.target.value })} placeholder="Example sentence (optional)" />
          </div>
        ))}
        {words.length === 0 && <p className="text-sm text-muted-foreground italic">No words added yet. Click "Add Word" to start.</p>}
      </div>
      <div className="flex gap-3">
        <GenerateButton
          noParams
          label="Generate Word"
          onGenerate={async () => {
            const result = await generateDailyVocab();
            setWords([...words, { id: genId(), word: result.word, meaning: result.meaning, example: result.example }]);
          }}
        />
        <Button variant="outline" onClick={() => setShowPreview(true)}><Eye className="w-4 h-4 mr-2" /> Preview</Button>
        <Button onClick={handleSave} disabled={isSaving}><Save className="w-4 h-4 mr-2" /> {isSaving ? 'Saving…' : 'Save'}</Button>
      </div>
      <PreviewModal
        open={showPreview}
        onClose={() => setShowPreview(false)}
        title={`Daily Vocabulary — ${dateStr}`}
        body={words.map(w => `**${w.word}** — ${w.meaning}${w.example ? `\n\n_"${w.example}"_` : ''}`).join('\n\n---\n\n')}
        type="Vocabulary"
      />
    </div>
  );
};

/* ── Daily Long Read ────────────────────────── */

const DailyLongReadTab = () => {
  const { getDailyLongRead, setDailyLongRead } = useAdmin();
  const [date, setDate] = useState<Date>(new Date());
  const [title, setTitle] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [body, setBody] = useState('');
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [showPreview, setShowPreview] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const dateStr = format(date, 'yyyy-MM-dd');

  const handleDateSelect = async (d: Date | undefined) => {
    if (!d) return;
    setDate(d);
    const existing = await getDailyLongRead(format(d, 'yyyy-MM-dd'));
    if (existing) {
      setTitle(existing.title); setImageUrl(existing.imageUrl);
      setBody(existing.body); setQuestions(existing.quiz.questions);
    } else {
      setTitle(''); setImageUrl(''); setBody(''); setQuestions([]);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    await setDailyLongRead(dateStr, { title, imageUrl, body, quiz: { questions } });
    setIsSaving(false);
    toast({ title: `Long read saved for ${dateStr}` });
  };

  return (
    <div className="mt-6 space-y-6 max-w-4xl">
      <DatePicker date={date} onSelect={handleDateSelect} />
      <div className="space-y-2">
        <Label>Title</Label>
        <Input value={title} onChange={e => setTitle(e.target.value)} placeholder="Article title…" />
      </div>
      <ImageInput value={imageUrl} onChange={setImageUrl} />
      <div className="space-y-2">
        <Label>Body Content</Label>
        <MarkdownEditor value={body} onChange={setBody} />
      </div>
      <QuizBuilder questions={questions} onChange={setQuestions} />
      <div className="flex gap-3">
        <GenerateButton
          onGenerate={async ({ category, topic }) => {
            const result = await generateLongRead(category, topic);
            setTitle(result.title);
            setBody(result.body);
            setQuestions(result.quiz.questions);
          }}
        />
        <Button variant="outline" onClick={() => setShowPreview(true)}><Eye className="w-4 h-4 mr-2" /> Preview</Button>
        <Button onClick={handleSave} disabled={isSaving}><Save className="w-4 h-4 mr-2" /> {isSaving ? 'Saving…' : 'Save'}</Button>
      </div>
      <PreviewModal
        open={showPreview}
        onClose={() => setShowPreview(false)}
        title={title}
        imageUrl={imageUrl}
        body={body}
        quiz={questions}
        type="Long Read"
      />
    </div>
  );
};

/* ── Main Component ─────────────────────────── */

const DailyContent = () => {
  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">Daily Content</h1>
        <p className="text-sm text-muted-foreground mt-1">Manage quizzes, vocabulary, and long reads by date</p>
      </div>
      <Tabs defaultValue="quiz">
        <TabsList>
          <TabsTrigger value="quiz">Daily Quiz</TabsTrigger>
          <TabsTrigger value="vocab">Vocabulary</TabsTrigger>
          <TabsTrigger value="longread">Long Read</TabsTrigger>
        </TabsList>
        <TabsContent value="quiz"><DailyQuizTab /></TabsContent>
        <TabsContent value="vocab"><DailyVocabTab /></TabsContent>
        <TabsContent value="longread"><DailyLongReadTab /></TabsContent>
      </Tabs>
    </div>
  );
};

export default DailyContent;
