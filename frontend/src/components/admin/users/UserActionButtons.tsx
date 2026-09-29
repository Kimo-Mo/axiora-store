import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Trash2, ShieldCheck, ShieldOff, KeyRound } from 'lucide-react';
import { toast } from 'sonner';
import { DeleteUserDialog } from './DeleteUserDialog';
import { RoleChangeDialog } from './RoleChangeDialog';
import { ResetPasswordDialog } from './ResetPasswordDialog';
import {
  useDeleteUserMutation,
  useRoleChangeMutation,
  useResetPasswordMutation,
} from '@/hooks/admin/useAdminUserMutations';
import type { AdminUser } from '@/types/admin/users';
import { AxiosError } from 'axios';

interface UserActionButtonsProps {
  user: AdminUser;
  currentAdminId: string;
  onActionSuccess: () => void;
}

export function UserActionButtons({ user, currentAdminId, onActionSuccess }: UserActionButtonsProps) {
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [roleChangeOpen, setRoleChangeOpen] = useState(false);
  const [resetOpen, setResetOpen] = useState(false);

  const deleteUserMutation = useDeleteUserMutation();
  const roleChangeMutation = useRoleChangeMutation();
  const resetPasswordMutation = useResetPasswordMutation();

  const targetRole = user?.role === 'admin' ? 'user' : 'admin';
  const isSelf = user?.id === currentAdminId;

  const getErrorMessage = () => {
    if (deleteUserMutation.isError) return deleteUserMutation.error?.message ?? 'Failed to delete user.';
    if (roleChangeMutation.isError) return roleChangeMutation.error?.message ?? 'Failed to change role.';
    if (resetPasswordMutation.isError) {
      const err = resetPasswordMutation.error as AxiosError<{ detail?: string; message?: string }>;
      return err.response?.data?.detail ?? err.response?.data?.message ?? err.message ?? 'Failed to send reset email.';
    }
    return null;
  };

  const errorMessage = getErrorMessage();

  return (
    <div className="flex flex-col gap-2 w-full mt-4">
      <div className="flex flex-wrap gap-2">
        <Button
          variant="destructive"
          size="sm"
          onClick={() => setDeleteOpen(true)}
          disabled={deleteOpen || isSelf}
          title={isSelf ? "You cannot delete your own account" : undefined}
        >
          <Trash2 className="w-4 h-4 mr-2" />
          Delete User
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={() => setRoleChangeOpen(true)}
          disabled={roleChangeOpen || isSelf}
          title={isSelf ? "You cannot change your own role" : undefined}
        >
          {targetRole === 'admin' ? <ShieldCheck className="w-4 h-4 mr-2" /> : <ShieldOff className="w-4 h-4 mr-2" />}
          {targetRole === 'admin' ? "Assign Admin" : "Revoke Admin"}
        </Button>

        <Button
          variant="ghost"
          size="sm"
          onClick={() => setResetOpen(true)}
        >
          <KeyRound className="w-4 h-4 mr-2" />
          Reset Password
        </Button>
      </div>

      {errorMessage && (
        <p className="text-sm text-destructive mt-2">{errorMessage}</p>
      )}

      <DeleteUserDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        username={user?.username}
        isPending={deleteUserMutation.isPending}
        onConfirm={() => {
          deleteUserMutation.mutate(user?.id, {
            onSuccess: () => {
              setDeleteOpen(false);
              toast.success(`User ${user?.username} deleted successfully.`);
              onActionSuccess();
            },
          });
        }}
      />

      <RoleChangeDialog
        open={roleChangeOpen}
        onOpenChange={setRoleChangeOpen}
        username={user?.username}
        targetRole={targetRole}
        isPending={roleChangeMutation.isPending}
        onConfirm={() => {
          roleChangeMutation.mutate(
            { userId: user?.id, role: targetRole },
            {
              onSuccess: () => {
                setRoleChangeOpen(false);
                toast.success(`Role for ${user?.username} updated to ${targetRole}.`);
                onActionSuccess();
              },
            }
          );
        }}
      />

      <ResetPasswordDialog
        open={resetOpen}
        onOpenChange={setResetOpen}
        email={user?.email}
        isPending={resetPasswordMutation.isPending}
        onConfirm={() => {
          resetPasswordMutation.mutate(user?.email, {
            onSuccess: () => {
              setResetOpen(false);
              toast.success(`Password reset email sent to ${user?.email}.`);
            },
          });
        }}
      />
    </div>
  );
}
