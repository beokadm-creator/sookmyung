"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NHNAlimTalkService = void 0;
exports.createAlimTalkService = createAlimTalkService;
const axios_1 = __importDefault(require("axios"));
const NHN_API_BASE = 'https://api-alimtalk.cloud.toast.com';
class NHNAlimTalkService {
    constructor(config) {
        this.config = config;
    }
    async getTemplates(senderKey) {
        if (!this.config.appKey || !this.config.secretKey) {
            throw new Error('Configuration missing');
        }
        try {
            const url = `${NHN_API_BASE}/alimtalk/v2.2/appkeys/${this.config.appKey}/senders/${senderKey}/templates`;
            const response = await axios_1.default.get(url, {
                headers: {
                    'Content-Type': 'application/json;charset=UTF-8',
                    'X-Secret-Key': this.config.secretKey
                }
            });
            if (response.data.header.isSuccessful) {
                return response.data.templateList || [];
            }
            else {
                throw new Error(`Code: ${response.data.header.resultCode}, Message: ${response.data.header.resultMessage}`);
            }
        }
        catch (error) {
            console.error('NHN AlimTalk Get Templates Error:', error);
            let errorMessage = error.message || 'Unknown error';
            if (axios_1.default.isAxiosError(error) && error.response) {
                const responseBody = error.response.data;
                if (responseBody && responseBody.header) {
                    errorMessage = `Code: ${responseBody.header.resultCode}, Message: ${responseBody.header.resultMessage}`;
                }
                else if (typeof responseBody === 'string') {
                    errorMessage = responseBody;
                }
                else if (responseBody && responseBody.message) {
                    errorMessage = responseBody.message;
                }
            }
            throw new Error(errorMessage);
        }
    }
    async send(templateCode, recipientPhone, templateParameter) {
        if (!this.config.appKey || !this.config.secretKey || !this.config.senderKey) {
            console.error('AlimTalk configuration missing');
            return { success: false, error: 'Configuration missing' };
        }
        try {
            const url = `${NHN_API_BASE}/alimtalk/v2.2/appkeys/${this.config.appKey}/messages`;
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
            const response = await axios_1.default.post(url, body, {
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
            }
            else {
                console.error('NHN AlimTalk API Error Header:', result.header);
                console.error('NHN AlimTalk API Error Body:', JSON.stringify(result));
                return {
                    success: false,
                    error: `Code: ${result.header.resultCode}, Message: ${result.header.resultMessage}`
                };
            }
        }
        catch (error) {
            console.error('NHN AlimTalk Network Error:', error);
            let errorMessage = error.message || 'Network error';
            if (axios_1.default.isAxiosError(error) && error.response) {
                const responseBody = error.response.data;
                console.error('NHN AlimTalk Error Response:', JSON.stringify(responseBody));
                if (responseBody && responseBody.header) {
                    errorMessage = `Code: ${responseBody.header.resultCode}, Message: ${responseBody.header.resultMessage}`;
                }
                else if (typeof responseBody === 'string') {
                    errorMessage = responseBody;
                }
                else if (responseBody && responseBody.message) {
                    errorMessage = responseBody.message;
                }
            }
            return {
                success: false,
                error: errorMessage
            };
        }
    }
    async sendVerificationCode(phone, code) {
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
            return { success: true };
        }
        console.log(`Sending AlimTalk with template: ${template.templateId} to phone: ${phone}`);
        return this.send(template.templateId, phone, {
            confirmnumber: code
        });
    }
    async sendWelcomeMessage(phone, name, receiptNumber) {
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
    async sendEventRegistration(phone, name, eventTitle, date, location) {
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
    async sendPasswordReset(phone, name, tempPassword) {
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
    async sendRefundRequest(phone, name, amount, orderId) {
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
    async sendRefundComplete(phone, name, amount, reason) {
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
exports.NHNAlimTalkService = NHNAlimTalkService;
function createAlimTalkService(config) {
    return new NHNAlimTalkService(config);
}
