import { useState } from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Input } from '@/components/ui';
import { Loader2 } from 'lucide-react';

interface ResetPasswordDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  username: string;
  onConfirm: (newPassword: string) => void;
  isPending: boolean;
}

/**
 * Staff-set password, not a mailed reset link.
 *
 * The previous version of this dialog emailed a recovery link, which cannot work:
 * there is no mail provider configured for this project. An administrator setting a
 * known account's password needs no mail at all, and it is a different action from
 * the removed self-service forgot-password flow.
 */
export function ResetPasswordDialog({
  open,
  onOpenChange,
  username,
  onConfirm,
  isPending,
}: ResetPasswordDialogProps) {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const mismatch = confirmPassword.length > 0 && newPassword !== confirmPassword;
  const tooShort = newPassword.length > 0 && newPassword.length < 8;
  const canSubmit = newPassword.length >= 8 && !mismatch && !tooShort;

  const handleOpenChange = (next: boolean) => {
    if (!next) {
      setNewPassword('');
      setConfirmPassword('');
    }
    onOpenChange(next);
  };

  return (
    <AlertDialog open={open} onOpenChange={handleOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Set New Password</AlertDialogTitle>
          <AlertDialogDescription>
            Set a new password for <strong>{username}</strong>. All of their active sessions will be signed
            out. At least 8 characters, including a letter and a number.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="flex flex-col gap-3 py-2">
          <Input
            type="password"
            autoComplete="new-password"
            placeholder="New password"
            aria-label="New password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />
          <Input
            type="password"
            autoComplete="new-password"
            placeholder="Confirm new password"
            aria-label="Confirm new password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
          {tooShort && <p className="text-destructive text-sm">Password must be at least 8 characters.</p>}
          {mismatch && <p className="text-destructive text-sm">Passwords do not match.</p>}
        </div>

        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            disabled={isPending || !canSubmit}
            onClick={(e) => {
              e.preventDefault();
              onConfirm(newPassword);
            }}
          >
            {isPending ? <Loader2 className="me-2 h-4 w-4 animate-spin" /> : 'Set Password'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
