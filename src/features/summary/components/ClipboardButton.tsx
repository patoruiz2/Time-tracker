import { useState, useCallback } from 'react';
import { Button } from '@/shared/components/Button/Button';

interface ClipboardButtonProps {
  text: string;
  label?: string;
  variant?: 'primary' | 'secondary';
}

export const ClipboardButton = ({
  text,
  label = 'Copy',
  variant = 'primary',
}: ClipboardButtonProps) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }, [text]);

  return (
    <Button variant={variant} onClick={handleCopy}>
      {copied ? 'Copied!' : label}
    </Button>
  );
};
