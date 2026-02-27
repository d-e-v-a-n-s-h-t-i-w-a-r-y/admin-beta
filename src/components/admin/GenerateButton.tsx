import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, Sparkles } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { ROADMAP_CATEGORIES } from '@/types/admin';

interface GenerateButtonProps {
    /** Called when the user confirms generation. Should call the AI service and fill the form. */
    onGenerate: (params: { category: string; topic: string }) => Promise<void>;
    /** If true, only asks for category (no topic field). */
    categoryOnly?: boolean;
    /** If true, skips the popover entirely — no params needed (e.g. vocab). */
    noParams?: boolean;
    /** Pre-fill category from the editor if already selected. */
    defaultCategory?: string;
    /** Pre-fill topic from the editor if already entered. */
    defaultTopic?: string;
    /** Custom label */
    label?: string;
    /** Variant for button size */
    size?: 'sm' | 'default';
}

const GenerateButton = ({
    onGenerate,
    categoryOnly = false,
    noParams = false,
    defaultCategory = '',
    defaultTopic = '',
    label = 'Generate with AI',
    size = 'sm',
}: GenerateButtonProps) => {
    const [isGenerating, setIsGenerating] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const [category, setCategory] = useState(defaultCategory);
    const [topic, setTopic] = useState(defaultTopic);

    const handleGenerate = async () => {
        setIsGenerating(true);
        setIsOpen(false);
        try {
            await onGenerate({ category, topic });
            toast({ title: 'Content generated', description: 'Review and edit before saving.' });
        } catch (err: any) {
            console.error('AI generation error:', err);
            toast({
                title: 'Generation failed',
                description: err?.message || 'Something went wrong. Check console for details.',
                variant: 'destructive',
            });
        } finally {
            setIsGenerating(false);
        }
    };

    // No-params mode: just click and go
    if (noParams) {
        return (
            <Button
                type="button"
                variant="outline"
                size={size}
                onClick={handleGenerate}
                disabled={isGenerating}
                className="gap-1.5"
            >
                {isGenerating ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                    <Sparkles className="w-3.5 h-3.5" />
                )}
                {isGenerating ? 'Generating...' : label}
            </Button>
        );
    }

    return (
        <Popover open={isOpen} onOpenChange={setIsOpen}>
            <PopoverTrigger asChild>
                <Button
                    type="button"
                    variant="outline"
                    size={size}
                    disabled={isGenerating}
                    className="gap-1.5"
                >
                    {isGenerating ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                        <Sparkles className="w-3.5 h-3.5" />
                    )}
                    {isGenerating ? 'Generating...' : label}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80" align="end">
                <div className="space-y-3">
                    <div className="space-y-1">
                        <Label className="text-xs font-medium">Category</Label>
                        <Select value={category} onValueChange={setCategory}>
                            <SelectTrigger className="h-8 text-sm">
                                <SelectValue placeholder="Select category" />
                            </SelectTrigger>
                            <SelectContent>
                                {ROADMAP_CATEGORIES.map(c => (
                                    <SelectItem key={c} value={c}>{c}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    {!categoryOnly && (
                        <div className="space-y-1">
                            <Label className="text-xs font-medium">Topic</Label>
                            <Input
                                value={topic}
                                onChange={e => setTopic(e.target.value)}
                                placeholder="e.g. How DNS Works"
                                className="h-8 text-sm"
                                onKeyDown={e => {
                                    if (e.key === 'Enter' && category) handleGenerate();
                                }}
                            />
                        </div>
                    )}
                    <Button
                        size="sm"
                        className="w-full gap-1.5"
                        onClick={handleGenerate}
                        disabled={!category || (!categoryOnly && !topic.trim())}
                    >
                        <Sparkles className="w-3.5 h-3.5" />
                        Generate
                    </Button>
                </div>
            </PopoverContent>
        </Popover>
    );
};

export default GenerateButton;
