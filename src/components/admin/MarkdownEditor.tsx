import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import remarkGfm from 'remark-gfm';
import 'katex/dist/katex.min.css';
import { Textarea } from '@/components/ui/textarea';

interface MarkdownEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  minHeight?: string;
}

const MarkdownEditor = ({ value, onChange, placeholder, minHeight = '280px' }: MarkdownEditorProps) => {
  return (
    <div className="grid grid-cols-2 gap-3 w-full">
      <div className="flex flex-col">
        <span className="text-xs font-medium text-muted-foreground mb-1.5">Write</span>
        <Textarea
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder || "Paste content here… Supports **Markdown** and $LaTeX$"}
          className="flex-1 font-mono text-sm resize-none"
          style={{ minHeight }}
        />
      </div>
      <div className="flex flex-col">
        <span className="text-xs font-medium text-muted-foreground mb-1.5">Live Preview</span>
        <div
          className="flex-1 p-3 border rounded-md bg-card prose prose-sm max-w-none overflow-auto"
          style={{ minHeight }}
        >
          {value ? (
            <ReactMarkdown remarkPlugins={[remarkMath, remarkGfm]} rehypePlugins={[rehypeKatex]}>
              {value}
            </ReactMarkdown>
          ) : (
            <p className="text-muted-foreground italic text-xs">Preview appears here…</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default MarkdownEditor;
