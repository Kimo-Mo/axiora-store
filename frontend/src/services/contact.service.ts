import apiClient from '@/lib/api/axios';

interface SendMessageParams {
  name: string;
  email: string;
  topic: string;
  message: string;
  orderId?: string;
}

export const contactService = {
  async sendMessage({ name, email, topic, message, orderId }: SendMessageParams) {
    const response = await apiClient.post('/support/create/', {
      name,
      email,
      subject: topic,
      message,
      ...(orderId && { order_id: orderId }),
    });
    return response.data;
  },
};
