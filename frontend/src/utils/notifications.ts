// Mock notification service - in production, integrate with Twilio/WhatsApp API
export const sendSMSNotification = async (phone: string, message: string) => {
  // Simulate API call
  console.log(`SMS to ${phone}: ${message}`);
  return new Promise(resolve => setTimeout(resolve, 1000));
};

export const sendWhatsAppNotification = async (phone: string, message: string) => {
  // Simulate API call
  console.log(`WhatsApp to ${phone}: ${message}`);
  return new Promise(resolve => setTimeout(resolve, 1000));
};

export const generateCompletionMessage = (ticketNumber: string, customerName: string) => {
  return `Hi ${customerName}, your laptop repair (Ticket #${ticketNumber}) is completed and ready for pickup. Please visit our store during business hours. Thank you!`;
};

export const generateStatusUpdateMessage = (ticketNumber: string, status: string, customerName: string) => {
  const statusMessages = {
    diagnosis: 'is being diagnosed by our technicians',
    repair: 'is currently under repair',
    testing: 'is being tested after repair',
    completed: 'is completed and ready for pickup'
  };
  
  const statusText = statusMessages[status as keyof typeof statusMessages] || `status updated to ${status}`;
  
  return `Hi ${customerName}, your laptop repair (Ticket #${ticketNumber}) ${statusText}. We'll keep you updated on the progress.`;
};