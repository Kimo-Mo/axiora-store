'use client';

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
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Loader2, Trash2 } from 'lucide-react';
import { useAdminDeleteOrderMutation } from '@/hooks/admin/useAdminOrderMutations';

interface OrderDeleteActionProps {
  orderId: string;   // order_number (string ID used by the API endpoints)
  onSuccess: () => void; // called after successful deletion (closes modal)
}

export function OrderDeleteAction({ orderId, onSuccess }: OrderDeleteActionProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const deleteMutation = useAdminDeleteOrderMutation();

  const handleConfirm = () => {
    deleteMutation.mutate(orderId, {
      onSuccess: () => {
        setDialogOpen(false);
        onSuccess(); // closes the modal
      },
    });
  };

  return (
    <div>
      <div className="text-sm font-medium text-foreground mb-3">Danger Zone</div>
      <AlertDialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <AlertDialogTrigger asChild>
          <Button
            variant="outline"
            className="border-destructive/50 text-destructive hover:bg-destructive/10 hover:text-destructive gap-2"
            onClick={() => setDialogOpen(true)}
          >
            <Trash2 className="h-4 w-4" />
            Delete Order
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent className="bg-card border-border">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-destructive">
              Delete Order #{orderId}?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-muted-foreground">
              This action is <span className="font-semibold text-foreground">permanent</span> and
              cannot be undone. The order and all its data will be removed from the system.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              className="border-border"
              onClick={() => setDialogOpen(false)}
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirm}
              disabled={deleteMutation.isPending}
              className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
            >
              {deleteMutation.isPending ? (
                <><Loader2 className="h-4 w-4 me-2 animate-spin" /> Deleting…</>
              ) : (
                'Confirm Delete'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
