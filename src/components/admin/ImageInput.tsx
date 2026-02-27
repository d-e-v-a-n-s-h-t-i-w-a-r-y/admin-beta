import { useRef, useEffect, useCallback } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Upload, Link, Clipboard, X } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface ImageInputProps {
  value: string;
  onChange: (url: string) => void;
  label?: string;
}

/** Append Unsplash optimization params if it's an Unsplash URL */
function optimizeUrl(url: string): string {
  if (!url) return url;
  try {
    const u = new URL(url);
    if (u.hostname === 'images.unsplash.com') {
      u.searchParams.set('w', '800');
      u.searchParams.set('h', '450');
      u.searchParams.set('fit', 'crop');
      u.searchParams.set('auto', 'format');
      u.searchParams.set('q', '75');
      return u.toString();
    }
  } catch { /* not a URL, leave as-is */ }
  return url;
}

/** Compress an image File/Blob to a JPEG data URL at target width */
function compressImage(file: File | Blob, maxWidth = 800, quality = 0.75): Promise<string> {
  return new Promise((resolve) => {
    const img = new Image();
    const objectUrl = URL.createObjectURL(file);
    img.onload = () => {
      const scale = Math.min(1, maxWidth / img.width);
      const canvas = document.createElement('canvas');
      canvas.width = img.width * scale;
      canvas.height = img.height * scale;
      const ctx = canvas.getContext('2d')!;
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      URL.revokeObjectURL(objectUrl);
      resolve(canvas.toDataURL('image/jpeg', quality));
    };
    img.src = objectUrl;
  });
}

const ImageInput = ({ value, onChange, label = 'Image' }: ImageInputProps) => {
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const compressed = await compressImage(file);
    onChange(compressed);
  };

  const readImageFromClipboard = useCallback(async (items: DataTransfer | ClipboardItems) => {
    if (items instanceof DataTransfer) {
      for (const item of Array.from(items.items)) {
        if (item.type.startsWith('image/')) {
          const file = item.getAsFile();
          if (!file) return;
          const compressed = await compressImage(file);
          onChange(compressed);
          toast({ title: 'Image pasted & compressed!' });
          return true;
        }
      }
    } else {
      for (const item of items) {
        const imageType = item.types.find(t => t.startsWith('image/'));
        if (imageType) {
          const blob = await item.getType(imageType);
          const compressed = await compressImage(blob as File);
          onChange(compressed);
          toast({ title: 'Image pasted & compressed!' });
          return true;
        }
      }
    }
    return false;
  }, [onChange]);

  const handlePasteButton = async () => {
    try {
      const items = await navigator.clipboard.read();
      const found = await readImageFromClipboard(items);
      if (!found) toast({ title: 'No image in clipboard', variant: 'destructive' });
    } catch {
      toast({ title: 'Clipboard access denied — try Ctrl+V', variant: 'destructive' });
    }
  };

  useEffect(() => {
    const handler = (e: ClipboardEvent) => {
      if (e.clipboardData) readImageFromClipboard(e.clipboardData);
    };
    document.addEventListener('paste', handler);
    return () => document.removeEventListener('paste', handler);
  }, [readImageFromClipboard]);

  /** When user types/pastes a URL, auto-optimize Unsplash links on blur */
  const handleUrlChange = (raw: string) => onChange(raw);
  const handleUrlBlur = (raw: string) => {
    const optimized = optimizeUrl(raw);
    if (optimized !== raw) onChange(optimized);
  };

  if (value) {
    return (
      <div className="relative inline-block">
        <img src={value} alt="Cover" className="h-28 rounded-lg border object-cover" />
        <Button
          type="button"
          variant="destructive"
          size="icon"
          className="absolute -top-2 -right-2 h-6 w-6 rounded-full"
          onClick={() => onChange('')}
        >
          <X className="w-3 h-3" />
        </Button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm font-medium text-muted-foreground whitespace-nowrap">{label}:</span>
      <div className="relative flex-1 max-w-sm">
        <Link className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
        <Input
          value={value}
          onChange={e => handleUrlChange(e.target.value)}
          onBlur={e => handleUrlBlur(e.target.value)}
          placeholder="Paste Unsplash URL or Ctrl+V image"
          className="pl-8 h-8 text-sm"
        />
      </div>
      <Button type="button" variant="outline" size="sm" className="h-8" onClick={handlePasteButton}>
        <Clipboard className="w-3.5 h-3.5 mr-1" /> Paste
      </Button>
      <Button type="button" variant="outline" size="sm" className="h-8" onClick={() => fileRef.current?.click()}>
        <Upload className="w-3.5 h-3.5 mr-1" /> Upload
      </Button>
      <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
    </div>
  );
};

export default ImageInput;
