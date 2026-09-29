import { Send, Clock } from 'lucide-react';
import {
  Card,
  Input,
  Textarea,
  Button,
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
  Label,
} from '@/components/ui';
import { toast } from 'sonner';
import { Link } from '@/i18n/navigation';
import { contactService } from '@/services/contact.service';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

const supportSchema = z
  .object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string().email('Please enter a valid email address'),
    topic: z.string().min(1, 'Please select a topic'),
    orderId: z.string().optional(),
    message: z.string().min(10, 'Message must be at least 10 characters'),
  })
  .superRefine((data, ctx) => {
    if (data.topic === 'order' && (!data.orderId || data.orderId.trim() === '')) {
      ctx.addIssue({
        path: ['orderId'],
        code: z.ZodIssueCode.custom,
        message: 'Order ID is required when topic is Order Issue',
      });
    }
  });

type SupportFormData = z.infer<typeof supportSchema>;

interface SupportFormProps {
  onSuccess: () => void;
}

export const SupportForm = ({ onSuccess }: SupportFormProps) => {
  const {
    register,
    handleSubmit,
    control,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<SupportFormData>({
    resolver: zodResolver(supportSchema),
    defaultValues: {
      name: '',
      email: '',
      topic: '',
      orderId: '',
      message: '',
    },
  });

  const selectedTopic = watch('topic');

  const onSubmit = async (data: SupportFormData) => {
    try {
      await contactService.sendMessage({
        name: data.name,
        email: data.email,
        topic: data.topic,
        message: data.message,
        orderId: data.orderId,
      });
      onSuccess();
      toast.success('Your ticket has been created successfully!');
    } catch (error) {
      console.log(error);
      toast.error('Failed to create ticket');
    }
  };

  return (
    <div className="lg:col-span-3">
      <Card className="p-8 md:p-10 bg-card border-border shadow-md rounded-4xl">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-2">
            <h2 className="text-2xl font-bold">Create a Support Ticket</h2>
            <p className="text-muted-foreground">
              Fill in the details below and we&apos;ll get back to you as soon as possible.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input id="name" placeholder="John Doe" {...register('name')} />
              {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input id="email" type="email" placeholder="john@example.com" {...register('email')} />
              {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="topic">Topic</Label>
            <Controller
              name="topic"
              control={control}
              render={({ field }) => (
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <SelectTrigger id="topic">
                    <SelectValue placeholder="Select a topic" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="general">General Inquiry</SelectItem>
                    <SelectItem value="order">Order Issue</SelectItem>
                    <SelectItem value="payment">Payment Problem</SelectItem>
                    <SelectItem value="account">Account Access</SelectItem>
                    <SelectItem value="technical">Technical Issue</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
            {errors.topic && <p className="text-sm text-destructive">{errors.topic.message}</p>}
          </div>

          {/* Dynamic Field */}
          {selectedTopic === 'order' && (
            <div className="space-y-2 animate-in slide-in-from-top-2 duration-300">
              <Label htmlFor="orderId">Order ID (#)</Label>
              <Input id="orderId" placeholder="e.g. #ORD-123456" {...register('orderId')} />
              {errors.orderId && <p className="text-sm text-destructive">{errors.orderId.message}</p>}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="message">Message</Label>
            <Textarea
              id="message"
              placeholder="How can we help you today?"
              className="min-h-37.5 bg-transparent dark:bg-input/30"
              {...register('message')}
            />
            {errors.message && <p className="text-sm text-destructive">{errors.message.message}</p>}
          </div>

          <Button
            type="submit"
            size="lg"
            disabled={isSubmitting}
            className="w-full text-lg font-bold shadow-lg shadow-primary/20 transition-all">
            {isSubmitting ? (
              <Clock className="animate-spin me-2" />
            ) : (
              <Send className="me-2" size={20} />
            )}
            {isSubmitting ? 'Sending Ticket...' : 'Submit Support Request'}
          </Button>

          <p className="text-center text-xs text-muted-foreground">
            By submitting this form, you agree to our{' '}
            <Link href={'/legal?tab=privacy'} className="underline cursor-pointer text-primary">
              Privacy Policy
            </Link>{' '}
            and{' '}
            <Link href={'/legal?tab=terms'} className="underline cursor-pointer text-primary">
              Terms of Service
            </Link>
            .
          </p>
        </form>
      </Card>
    </div>
  );
};
