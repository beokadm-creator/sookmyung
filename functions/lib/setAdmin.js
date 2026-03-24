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
Object.defineProperty(exports, "__esModule", { value: true });
const admin = __importStar(require("firebase-admin"));
const serviceAccount = require('../../sookmyung-97032-firebase-adminsdk-fbsvc-cdee98bac9.json');
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    projectId: 'sookmyung-97032',
});
const db = admin.firestore();
db.settings({ ignoreUndefinedProperties: true });
const TARGET_UID = 'DiMxXk9JZug3Ma2I2hK68ia0WZs1';
const TARGET_EMAIL = 'admin@hongcomm.kr';
async function setAdminRole() {
    try {
        console.log(`Setting admin role for user: ${TARGET_EMAIL} (${TARGET_UID})`);
        const userRef = db.collection('users').doc(TARGET_UID);
        const userDoc = await userRef.get();
        if (!userDoc.exists) {
            console.log('User document does not exist. Creating new admin user document...');
            await userRef.set({
                id: TARGET_UID,
                email: TARGET_EMAIL,
                name: 'Admin',
                role: 'admin',
                paymentStatus: false,
                created_at: admin.firestore.FieldValue.serverTimestamp(),
                updated_at: admin.firestore.FieldValue.serverTimestamp(),
            });
        }
        else {
            console.log('User document exists. Updating role to admin...');
            await userRef.update({
                role: 'admin',
                updated_at: admin.firestore.FieldValue.serverTimestamp(),
            });
        }
        console.log('Successfully set admin role!');
    }
    catch (error) {
        console.error('Error setting admin role:', error);
    }
}
setAdminRole();
