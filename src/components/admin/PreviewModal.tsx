import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import remarkGfm from 'remark-gfm';
import 'katex/dist/katex.min.css';
import { QuizQuestion } from '@/types/admin';
import { Badge } from '@/components/ui/badge';

interface PreviewModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  imageUrl?: string;
  body?: string;
  quiz?: QuizQuestion[];
  type?: string;
}

const PreviewModal = ({ open, onClose, title, imageUrl, body, quiz, type = 'Content' }: PreviewModalProps) => {
  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) onClose(); }}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            Preview
            <Badge variant="secondary" className="font-normal">{type}</Badge>
          </DialogTitle>
        </DialogHeader>

        <div className="bg-card rounded-xl border p-6 space-y-4">
          {title && <h2 className="text-xl font-bold text-foreground">{title}</h2>}

          {imageUrl && (
            <img src={imageUrl} alt={title || 'Content'} className="w-full rounded-lg object-cover max-h-48" />
          )}

          {body && (
            <div className="prose max-w-none text-sm">
              <ReactMarkdown remarkPlugins={[remarkMath, remarkGfm]} rehypePlugins={[rehypeKatex]}>
                {body}
              </ReactMarkdown>
            </div>
          )}

          {quiz && quiz.length > 0 && (
            <div className="space-y-4 pt-4 border-t border-border">
              <h3 className="font-semibold text-foreground text-sm">Quiz</h3>
              {quiz.map((q, i) => (
                <div key={q.id} className="space-y-2">
                  <p className="font-medium text-sm">{i + 1}. {q.text || '(No question text)'}</p>
                  <div className="space-y-1 pl-4">
                    {q.options.map((opt, oi) => (
                      <div
                        key={oi}
                        className={`text-sm px-3 py-1.5 rounded-md ${
                          oi === q.correctIndex
                            ? 'bg-accent text-accent-foreground font-medium'
                            : 'bg-secondary text-secondary-foreground'
                        }`}
                      >
                        {opt || `Option ${oi + 1}`}
                      </div>
                    ))}
                  </div>
                  {q.explanation && (
                    <div className="mt-2 pl-4 text-xs text-muted-foreground border-l-2 border-accent py-1 pl-3">
                      <span className="font-medium">Explanation:</span> {q.explanation}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PreviewModal;
