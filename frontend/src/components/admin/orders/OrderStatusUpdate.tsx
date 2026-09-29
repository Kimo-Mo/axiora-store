'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Loader2 } from 'lucide-react';
import { useAdminUpdateOrderMutation } from '@/hooks/admin/useAdminOrderMutations';
import type { AdminOrderDetail, OrderStatus } from '@/types/admin/orders';

const STATUS_OPTIONS: { value: OrderStatus; label: string }[] = [
  { value: 'pending', label: 'Pending' },
  { value: 'paid', label: 'Paid' },
  { value: 'processing', label: 'Processing' },
  { value: 'completed', label: 'Completed' },
  { value: 'failed', label: 'Failed' },
  { value: 'cancelled', label: 'Cancelled' },
];

const notifySchema = z
  .object({
    status: z.enum(['pending', 'paid', 'processing', 'completed', 'failed', 'cancelled']),
    send_notification: z.boolean(),
    subject: z.string().optional(),
    message: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.send_notification) {
      if (!data.subject?.trim()) {
        ctx.addIssue({
          code: 'custom',
          path: ['subject'],
          message: 'Subject is required when sending notification',
        });
      }
      if (!data.message?.trim()) {
        ctx.addIssue({
          code: 'custom',
          path: ['message'],
          message: 'Message is required when sending notification',
        });
      }
    }
  });

type NotifyForm = z.infer<typeof notifySchema>;

interface OrderStatusUpdateProps {
  order: AdminOrderDetail;
  onClose: () => void;
}

export function OrderStatusUpdate({ order, onClose }: OrderStatusUpdateProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const updateMutation = useAdminUpdateOrderMutation();

  const form = useForm<NotifyForm>({
    resolver: zodResolver(notifySchema),
    defaultValues: {
      status: order.status,
      send_notification: false,
      subject: '',
      message: '',
    },
  });

  useEffect(() => {
    form.reset({
      status: order.status,
      send_notification: false,
      subject: '',
      message: '',
    });
  }, [order.order_number, order.status, form]);

  const sendNotification = form.watch('send_notification');
  const selectedStatus = form.watch('status');

  const handleConfirm = async () => {
    const isValid = await form.trigger();
    if (!isValid) {
      setDialogOpen(false);
      return;
    }
    const values = form.getValues();
    updateMutation.mutate(
      {
        id: order.order_number,
        payload: {
          status: values.status,
          ...(values.send_notification && {
            send_notification: values.send_notification,
            notification_data: {
              subject: values.subject ?? '',
              message: values.message ?? '',
              email_type: 'default',
            },
          }),
        },
      },
      {
        onSuccess: () => {
          setDialogOpen(false);
          onClose();
        },
      }
    );
  };

  return (
    <div className="space-y-4">
      <div className="text-sm font-medium text-foreground">Update Status</div>

      {/* Status selector */}
      <div className="flex gap-3 items-center flex-wrap">
        <Select
          value={selectedStatus}
          onValueChange={(v) => form.setValue('status', v as OrderStatus)}>
          <SelectTrigger id="order-status-select" className="w-48 bg-background border-border">
            <SelectValue placeholder="Select status" />
          </SelectTrigger>
          <SelectContent className="bg-card border-border">
            {STATUS_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* AlertDialog wraps the trigger button */}
        <AlertDialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <AlertDialogTrigger asChild>
            <Button
              disabled={selectedStatus === order.status || updateMutation.isPending}
              className="bg-primary hover:bg-primary-hover text-primary-foreground"
              onClick={async (e) => {
                e.preventDefault();
                const isValid = await form.trigger();
                if (isValid) setDialogOpen(true);
              }}>
              {updateMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 me-2 animate-spin" /> Updating…
                </>
              ) : (
                'Update Status'
              )}
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent className="bg-card border-border">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-foreground">Confirm Status Update</AlertDialogTitle>
              <AlertDialogDescription className="text-muted-foreground">
                Change order #{order.order_number} status to{' '}
                <span className="font-semibold text-foreground capitalize">{selectedStatus}</span>?
                {sendNotification && ' A notification email will be sent to the customer.'} This
                action cannot be undone without another manual update.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="border-border" onClick={() => setDialogOpen(false)}>
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={handleConfirm}
                disabled={updateMutation.isPending}
                className="bg-primary hover:bg-primary-hover text-primary-foreground">
                {updateMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 me-2 animate-spin" /> Updating…
                  </>
                ) : (
                  'Confirm Update'
                )}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>

      {/* Send Notification toggle */}
      <div className="flex items-center gap-3">
        <Switch
          id="send-notification-toggle"
          checked={sendNotification}
          onCheckedChange={(v: boolean) => form.setValue('send_notification', v)}
        />
        <Label
          htmlFor="send-notification-toggle"
          className="text-sm text-foreground cursor-pointer">
          Send email notification to customer
        </Label>
      </div>

      {/* Notification fields — shown only when toggle is ON */}
      {sendNotification && (
        <div className="space-y-3 p-4 rounded-lg bg-muted/30 border border-border">
          <div>
            <Label htmlFor="notification-subject" className="text-sm text-foreground mb-1.5 block">
              Subject <span className="text-destructive">*</span>
            </Label>
            <Input
              id="notification-subject"
              placeholder="e.g. Your order is processing"
              className="bg-background border-border"
              {...form.register('subject')}
            />
            {form.formState.errors.subject && (
              <p className="text-xs text-destructive mt-1">
                {form.formState.errors.subject.message}
              </p>
            )}
          </div>
          <div>
            <Label htmlFor="notification-message" className="text-sm text-foreground mb-1.5 block">
              Message <span className="text-destructive">*</span>
            </Label>
            <Input
              id="notification-message"
              placeholder="e.g. Your order is now being processed…"
              className="bg-background border-border"
              {...form.register('message')}
            />
            {form.formState.errors.message && (
              <p className="text-xs text-destructive mt-1">
                {form.formState.errors.message.message}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
