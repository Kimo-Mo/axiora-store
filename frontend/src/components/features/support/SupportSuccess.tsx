import { CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui';

interface SupportSuccessProps {
  onReset: () => void;
}

export const SupportSuccess = ({ onReset }: SupportSuccessProps) => {
  return (
    <div className="container max-w-2xl mx-auto py-20 text-center space-y-6">
      <div className="size-20 rounded-full bg-primary/20 flex items-center justify-center text-primary mx-auto animate-bounce">
        <CheckCircle2 size={40} />
      </div>
      <h1 className="text-3xl font-bold">Ticket Submitted!</h1>
      <p className="text-muted-foreground text-lg">
        Thank you for reaching out. We have received your message and our team will get back to you
        within 12 hours. A confirmation email has been sent to your inbox.
      </p>
      <Button variant="outline" onClick={onReset} className="rounded-full px-8">
        Send another message
      </Button>
    </div>
  );
};
