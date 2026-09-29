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
import { Loader2 } from 'lucide-react';

interface RoleChangeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  username: string;
  targetRole: 'admin' | 'user';
  onConfirm: () => void;
  isPending: boolean;
}

export function RoleChangeDialog({ open, onOpenChange, username, targetRole, onConfirm, isPending }: RoleChangeDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            {targetRole === 'admin' ? "Assign Admin Privileges" : "Revoke Admin Privileges"}
          </AlertDialogTitle>
          <AlertDialogDescription>
            {targetRole === 'admin' ? (
              <><strong>{username}</strong> will be granted admin privileges and will have full access to the admin dashboard.</>
            ) : (
              <><strong>{username}</strong> will have their admin privileges revoked and returned to a regular user account.</>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            disabled={isPending}
            onClick={(e) => {
              e.preventDefault();
              onConfirm();
            }}
          >
            {isPending ? <Loader2 className="me-2 h-4 w-4 animate-spin" /> : (targetRole === 'admin' ? "Grant Admin" : "Revoke Admin")}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
