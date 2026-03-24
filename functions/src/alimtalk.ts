import axios from 'axios';

// Test user support added
export interface AlimTalkConfig {
  appKey: string;
  secretKey: string;
  senderKey: string;
  templates: {
    [key: string]: {
      templateId: string;
      enabled: boolean;
    }
  };
}

export interface AlimTalkResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

const NHN_API_BASE = 'https://api-alimtalk.cloud.toast.com';

export class NHNAlimTalkService {
  private config: AlimTalkConfig;

  constructor(config: AlimTalkConfig) {
    this.config = config;
  }

  async getTemplates(senderKey: string): Promise<any[]> {
    if (!this.config.appKey || !this.config.secretKey) {
      throw new Error('Configuration missing');
    }

    try {
      // Using v2.3 endpoint to fetch templates for a sender key
      // If this fails, we might need to fallback or check documentation again
      // Standard pattern: GET /alimtalk/v2.2/appkeys/{appkey}/senders/{senderKey}/templates
      const url = `${NHN_API_BASE}/alimtalk/v2.2/appkeys/${this.config.appKey}/senders/${senderKey}/templates`;
      
      const response = await axios.get(url, {
        headers: {
          'Content-Type': 'application/json;charset=UTF-8',
          'X-Secret-Key': this.config.secretKey
        }
      });

      if (response.data.header.isSuccessful) {
        return response.data.templateList || [];
      } else {
        throw new Error(`Code: ${response.data.header.resultCode}, Message: ${response.data.header.resultMessage}`);
      }
    } catch (error: any) {
      console.error('NHN AlimTalk Get Templates Error:', error);
      
      let errorMessage = error.message || 'Unknown error';
      
      if (axios.isAxiosError(error) && error.response) {
        const responseBody = error.response.data;
        if (responseBody && responseBody.header) {
          errorMessage = `Code: ${responseBody.header.resultCode}, Message: ${responseBody.header.resultMessage}`;
        } else if (typeof responseBody === 'string') {
           errorMessage = responseBody;
        } else if (responseBody && responseBody.message) {
           errorMessage = responseBody.message;
        }
      }
      
      throw new Error(errorMessage);
    }
  }

  private async send(templateCode: string, recipientPhone: string, templateParameter: Record<string, string>): Promise<AlimTalkResult> {
    if (!this.config.appKey || !this.config.secretKey || !this.config.senderKey) {
      console.error('AlimTalk configuration missing');
      return { success: false, error: 'Configuration missing' };
    }

    try {
      const url = `${NHN_API_BASE}/alimtalk/v2.2/appkeys/${this.config.appKey}/messages`;
      
      // Format phone number for NHN API (remove hyphens, ensure country code)
      const formattedPhone = recipientPhone.replace(/-/g, '');
      console.log(`Formatted phone for AlimTalk: ${formattedPhone}`);
      
      const body = {
        senderKey: this.config.senderKey,
        templateCode: templateCode,
        recipientList: [
          {
            recipientNo: formattedPhone,
            templateParameter: templateParameter
          }
        ]
      };

      console.log(`AlimTalk request body:`, JSON.stringify({
        ...body,
        recipientList: [{ recipientNo: formattedPhone, templateParameter: '***' }]
      }));

      const response = await axios.post(url, body, {
        headers: {
          'Content-Type': 'application/json;charset=UTF-8',
          'X-Secret-Key': this.config.secretKey
        }
      });

      const result = response.data;
      if (result.header.isSuccessful) {
        return {
          success: true,
          messageId: result.header.resultMessage
        };
      } else {
        console.error('NHN AlimTalk API Error Header:', result.header);
        console.error('NHN AlimTalk API Error Body:', JSON.stringify(result));
        return {
          success: false,
          error: `Code: ${result.header.resultCode}, Message: ${result.header.resultMessage}`
        };
      }
    } catch (error: any) {
      console.error('NHN AlimTalk Network Error:', error);
      let errorMessage = error.message || 'Network error';
      
      if (axios.isAxiosError(error) && error.response) {
        const responseBody = error.response.data;
        console.error('NHN AlimTalk Error Response:', JSON.stringify(responseBody));
        
        if (responseBody && responseBody.header) {
          errorMessage = `Code: ${responseBody.header.resultCode}, Message: ${responseBody.header.resultMessage}`;
        } else if (typeof responseBody === 'string') {
           // Sometimes error might be a plain string
           errorMessage = responseBody;
        } else if (responseBody && responseBody.message) {
           // Or a simple message field
           errorMessage = responseBody.message;
        }
      }
      
      return {
        success: false,
        error: errorMessage
      };
    }
  }

  async sendVerificationCode(phone: string, code: string): Promise<AlimTalkResult> {
    console.log(`AlimTalk config check:`, JSON.stringify({
      hasConfig: !!this.config,
      hasTemplates: !!this.config.templates,
      hasVerification: !!this.config.templates?.verification,
      isEnabled: this.config.templates?.verification?.enabled,
      templateId: this.config.templates?.verification?.templateId
    }));

    const template = this.config.templates.verification;
    if (!template || !template.enabled) {
      console.log('Verification AlimTalk disabled or not configured, treating as success');
      return { success: true }; // Treat as success if disabled
    }

    console.log(`Sending AlimTalk with template: ${template.templateId} to phone: ${phone}`);
    return this.send(template.templateId, phone, {
      confirmnumber: code
    });
  }

  async sendWelcomeMessage(phone: string, name: string, receiptNumber: string): Promise<AlimTalkResult> {
    const template = this.config.templates.welcome;
    if (!template || !template.enabled) {
      console.log('Welcome AlimTalk disabled or not configured');
      return { success: true };
    }

    return this.send(template.templateId, phone, {
      name: name,
      receiptNumber: receiptNumber
    });
  }

  async sendEventRegistration(phone: string, name: string, eventTitle: string, date: string, location: string): Promise<AlimTalkResult> {
    const template = this.config.templates.event;
    if (!template || !template.enabled) {
      console.log('Event Registration AlimTalk disabled or not configured');
      return { success: true };
    }

    return this.send(template.templateId, phone, {
      name: name,
      title: eventTitle,
      date: date,
      location: location
    });
  }

  async sendPasswordReset(phone: string, name: string, tempPassword: string): Promise<AlimTalkResult> {
    const template = this.config.templates.passwordReset;
    if (!template || !template.enabled) {
      console.log('Password Reset AlimTalk disabled or not configured');
      return { success: true };
    }

    return this.send(template.templateId, phone, {
      name: name,
      password: tempPassword
    });
  }

  async sendRefundRequest(phone: string, name: string, amount: number, orderId: string): Promise<AlimTalkResult> {
    const template = this.config.templates.payment;
    if (!template || !template.enabled) {
      console.log('Refund request AlimTalk disabled or not configured');
      return { success: true };
    }

    return this.send(template.templateId, phone, {
      name: name,
      amount: amount.toLocaleString(),
      orderId: orderId
    });
  }

  async sendRefundComplete(phone: string, name: string, amount: number, reason: string): Promise<AlimTalkResult> {
    const template = this.config.templates.cancel;
    if (!template || !template.enabled) {
      console.log('Refund complete AlimTalk disabled or not configured');
      return { success: true };
    }

    return this.send(template.templateId, phone, {
      name: name,
      amount: amount.toLocaleString(),
      reason: reason
    });
  }
}

export function createAlimTalkService(config: AlimTalkConfig): NHNAlimTalkService {
  return new NHNAlimTalkService(config);
}
