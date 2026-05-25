/**
 * Notification Service Placeholder
 * 
 * Future Integration:
 * - WhatsApp API (Twilio/Meta)
 * - Email (Resend/SendGrid)
 * - SMS
 */

export type NotificationType = 'RENT_DUE' | 'PAYMENT_RECEIVED' | 'ANNOUNCEMENT';

export interface NotificationPayload {
    userId: string;
    type: NotificationType;
    message: string;
    metadata?: Record<string, any>;
}

export async function sendNotification(payload: NotificationPayload) {
    // TODO: Implement actual provider integration
    console.log('[Notification Service] Sending:', payload);

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 100));

    return { success: true, providerId: 'mock-id' };
}

export async function sendWhatsAppMessage(phone: string, templateId: string, variables: any) {
    // TODO: Implement WhatsApp API
    console.log(`[WhatsApp] Sending to ${phone} with template ${templateId}`);
    return { success: true };
}
