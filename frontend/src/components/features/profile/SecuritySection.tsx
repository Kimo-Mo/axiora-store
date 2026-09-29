import { KeyRound, Loader2, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface SecuritySectionProps {
  onResetPassword: () => Promise<void>;
  isSubmitting: boolean;
}

export function SecuritySection({ onResetPassword, isSubmitting }: SecuritySectionProps) {
  return (
    <Card className="border-border bg-card/60">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          <Shield className="text-primary" size={18} />
          Security
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Button
          type="button"
          variant="outline"
          className="w-full sm:w-auto"
          onClick={() => void onResetPassword()}
          disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <Loader2 size={16} className="mr-2 animate-spin" />
              Sending
            </>
          ) : (
            <>
              <KeyRound size={16} className="mr-2" />
              Send Reset Password Link
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
