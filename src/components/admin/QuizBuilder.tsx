import { QuizQuestion } from '@/types/admin';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Plus, Trash2, ChevronDown, ChevronUp } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { useState } from 'react';

interface QuizBuilderProps {
  questions: QuizQuestion[];
  onChange: (questions: QuizQuestion[]) => void;
}

const genId = () => Math.random().toString(36).substr(2, 9);

const QuizBuilder = ({ questions, onChange }: QuizBuilderProps) => {
  const [openIds, setOpenIds] = useState<Set<string>>(new Set());

  const toggle = (id: string) => setOpenIds(prev => {
    const next = new Set(prev);
    next.has(id) ? next.delete(id) : next.add(id);
    return next;
  });

  const addQuestion = () => {
    const id = genId();
    onChange([...questions, { id, text: '', options: ['', '', '', ''], correctIndex: 0, explanation: '' }]);
    setOpenIds(prev => new Set(prev).add(id));
  };

  const removeQuestion = (id: string) => {
    onChange(questions.filter(q => q.id !== id));
    setOpenIds(prev => { const n = new Set(prev); n.delete(id); return n; });
  };

  const updateQuestion = (id: string, data: Partial<QuizQuestion>) =>
    onChange(questions.map(q => q.id === id ? { ...q, ...data } : q));

  const updateOption = (qid: string, idx: number, val: string) =>
    onChange(questions.map(q => {
      if (q.id !== qid) return q;
      const options = [...q.options];
      options[idx] = val;
      return { ...q, options };
    }));

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-muted-foreground">
          Quiz {questions.length > 0 && `(${questions.length})`}
        </span>
        <Button type="button" variant="outline" size="sm" className="h-7 text-xs" onClick={addQuestion}>
          <Plus className="w-3 h-3 mr-1" /> Add Question
        </Button>
      </div>

      {questions.map((q, i) => (
        <Collapsible key={q.id} open={openIds.has(q.id)} onOpenChange={() => toggle(q.id)}>
          <div className="border rounded-lg bg-card">
            <CollapsibleTrigger asChild>
              <button className="w-full flex items-center justify-between px-3 py-2 text-sm hover:bg-accent/50 rounded-t-lg transition-colors">
                <span className="font-medium text-muted-foreground">
                  Q{i + 1}: {q.text || <span className="italic">Untitled</span>}
                </span>
                {openIds.has(q.id) ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <div className="px-3 pb-3 space-y-2 border-t">
                <Input
                  value={q.text}
                  onChange={e => updateQuestion(q.id, { text: e.target.value })}
                  placeholder="Question text…"
                  className="h-8 text-sm mt-2"
                />

                <RadioGroup
                  value={String(q.correctIndex)}
                  onValueChange={v => updateQuestion(q.id, { correctIndex: Number(v) })}
                  className="space-y-1"
                >
                  {q.options.map((opt, oi) => (
                    <div key={oi} className="flex items-center gap-1.5">
                      <RadioGroupItem value={String(oi)} id={`${q.id}-o-${oi}`} className="h-3.5 w-3.5" />
                      <Input
                        value={opt}
                        onChange={e => updateOption(q.id, oi, e.target.value)}
                        placeholder={`Option ${oi + 1}`}
                        className="flex-1 h-7 text-sm"
                      />
                    </div>
                  ))}
                </RadioGroup>

                <Textarea
                  value={q.explanation || ''}
                  onChange={e => updateQuestion(q.id, { explanation: e.target.value })}
                  placeholder="Explanation (optional)…"
                  rows={2}
                  className="text-sm"
                />

                <div className="flex justify-end">
                  <Button type="button" variant="ghost" size="sm" className="h-7 text-xs text-destructive" onClick={() => removeQuestion(q.id)}>
                    <Trash2 className="w-3 h-3 mr-1" /> Remove
                  </Button>
                </div>
              </div>
            </CollapsibleContent>
          </div>
        </Collapsible>
      ))}
    </div>
  );
};

export default QuizBuilder;
