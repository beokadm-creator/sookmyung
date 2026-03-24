"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.confirmPayment = void 0;
const functions = __importStar(require("firebase-functions"));
const admin = __importStar(require("firebase-admin"));
const cors_1 = __importDefault(require("cors"));
const common_1 = require("../utils/common");
const db = admin.firestore();
const corsHandler = (0, cors_1.default)({ origin: true });
exports.confirmPayment = functions.region('asia-northeast1').https.onRequest(async (req, res) => {
    corsHandler(req, res, async () => {
        if (req.method !== 'POST') {
            res.status(405).json({ error: 'Method not allowed' });
            return;
        }
        try {
            const tossSecretKey = await (0, common_1.getTossSecretKey)();
            const { paymentKey, orderId, amount, userId: requestUserId } = req.body;
            if (!paymentKey || !orderId || !amount) {
                res.status(400).json({ error: 'Missing required parameters' });
                return;
            }
            const response = await fetch('https://api.tosspayments.com/v1/payments/confirm', {
                method: 'POST',
                headers: {
                    'Authorization': `Basic ${Buffer.from(`${tossSecretKey}:`).toString('base64')}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    paymentKey,
                    orderId,
                    amount,
                }),
            });
            const paymentData = await response.json();
            if (paymentData.status === 'DONE' || paymentData.status === 'IN_PROGRESS') {
                let userId = requestUserId;
                if (!userId && paymentData.customerKey && paymentData.customerKey.startsWith('user_')) {
                    userId = paymentData.customerKey.replace('user_', '');
                }
                if (userId) {
                    try {
                        await db.collection('users').doc(userId).update({
                            paymentStatus: true,
                            updated_at: admin.firestore.FieldValue.serverTimestamp(),
                        });
                    }
                    catch (e) {
                        console.warn(`Failed to update user ${userId} payment status:`, e);
                    }
                }
                await db.collection('payments').add({
                    user_id: userId || 'anonymous',
                    payment_key: paymentKey,
                    order_id: orderId,
                    amount: Number(amount),
                    status: 'completed',
                    payment_type: 'membership',
                    created_at: admin.firestore.FieldValue.serverTimestamp(),
                    updated_at: admin.firestore.FieldValue.serverTimestamp(),
                    approvedAt: admin.firestore.FieldValue.serverTimestamp(),
                    payment_data: paymentData
                });
                res.json({ success: true, paymentData });
            }
            else {
                res.status(400).json({ success: false, error: 'Payment not completed' });
            }
        }
        catch (error) {
            console.error('Payment confirmation error:', error);
            res.status(500).json({ success: false, error: error.message });
        }
    });
});
