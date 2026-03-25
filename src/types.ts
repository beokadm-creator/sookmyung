import { Timestamp, FieldValue } from 'firebase/firestore';

export interface User {
  id: string;
  email?: string; // Only for admin users
  phone: string; // Primary identifier for users
  name: string;
  department?: string;
  password?: string; // 6-digit numeric password (hashed)
  role: 'user' | 'admin';
  paymentStatus: boolean;
  paymentMethod?: 'card' | 'transfer' | 'manual_vbank' | 'vbank';
  vbankStatus?: 'pending' | 'approved' | 'rejected' | null;
  created_at: Timestamp;
  updated_at: Timestamp;
  birthdate?: string;
  address?: string;
  address_detail?: string;
  enrollment_year?: string;
  message?: string;
  company?: string;
  company_department?: string;
  position?: string;
  additional_program_domestic_tour?: boolean;
  additional_program_domestic_tour_option?: 'option1' | 'option2' | null;
  additional_program_campus_tour?: boolean;
}

export interface Payment {
  id: string;
  user_id: string;
  user_name?: string;
  payment_key: string;
  order_id: string;
  amount: number;
  status: 'pending' | 'completed' | 'failed' | 'cancelled';
  payment_type: 'membership' | 'donation' | 'event';
  created_at: Timestamp;
  updated_at: Timestamp;
  approvedAt?: string;
}

export interface Config {
  id: string;
  key: string;
  value: string;
  description: string;
  created_at: Timestamp;
  updated_at: Timestamp;
  registrationFee?: number;
  priceTiers?: PriceTier[];
}

export interface PriceTier {
  id: string;
  label: string;
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  amount: number;
  active: boolean;
}

export interface RegisterFormData {
  phone: string;
  password: string;
  name: string;
  verificationCode: string;
  department?: string;
  company?: string;
  company_department?: string;
  position?: string;
  birthdate: string;
  address: string;
  address_detail: string;
  email: string;
  enrollment_year: string;
  message: string;
  additional_program_domestic_tour?: boolean;
  additional_program_domestic_tour_option?: 'option1' | 'option2' | null;
  additional_program_campus_tour?: boolean;
}

export interface LoginFormData {
  phone: string;
  password: string;
}

export interface PaymentRequest {
  paymentKey: string;
  orderId: string;
  amount: number;
}

export interface PaymentVerifyResponse {
  success: boolean;
  paymentData?: Payment;
  message?: string;
}

export interface PhoneAuthRequest {
  phone: string;
  name: string;
  recaptchaToken: string;
}

export interface PhoneAuthResponse {
  success: boolean;
  message?: string;
  expiresIn?: number;
}

export interface VerificationRequest {
  phone: string;
  code: string;
}

export interface VerificationResponse {
  success: boolean;
  tempToken?: string;
  phone?: string;
  name?: string;
  message?: string;
}

export interface PhoneLoginRequest {
  phone: string;
  password: string;
  recaptchaToken: string;
}

export interface PhoneLoginResponse {
  success: boolean;
  token?: string;
  user?: {
    id: string;
    phone: string;
    name: string;
    role: string;
    paymentStatus: boolean;
  };
  message?: string;
}

export interface AdminCreateUserResponse {
  success: boolean;
  message: string;
}

export interface Notice {
  id: string;
  title: string;
  content: string;
  category: 'event' | 'payment' | 'general' | 'urgent';
  is_pinned: boolean;
  created_at: Timestamp;
  updated_at: Timestamp;
  created_by: string;
}

export interface WithdrawalRequest {
  id: string;
  user_id: string;
  user_name: string;
  user_email: string;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  requested_at: Timestamp;
  processed_at?: Timestamp;
  processed_by?: string;
  reject_reason?: string;
}

export interface SiteConfig {
  id: string;
  type: string;
  pg_config: {
    clientKey: string; // Toss Payments Client Key (API 개별 연동 키)
    secretKey: string; // Toss Payments Secret Key (백엔드용, 결제 승인)
    pg_provider: string;
    enabled: boolean;
  };
  terms: {
    service_terms: string;
    privacy_policy: string;
    third_party_provision: string;
    marketing_consent: string;
    refund_policy: string;
  };
  updated_at: Timestamp;
  created_at: Timestamp;
}

export interface UserConsent {
  privacy_policy: boolean;
  third_party_provision: boolean;
  marketing_consent: boolean;
}

export interface TimelineItem {
  id: string;
  year: number;
  title: string;
  shortDesc: string;
  details: string;
  period?: string;
  category?: string;
  imageUrl?: string;
  displayOrder: number;
  active: boolean;
  created_at: Timestamp;
  updated_at: Timestamp;
}

export interface GalleryItem {
  id: string;
  type: 'photo' | 'video';
  title: string;
  description: string;
  thumbnailUrl: string;
  mediaUrl: string;
  videoId?: string;
  displayOrder: number;
  active: boolean;
  created_at: Timestamp;
  updated_at: Timestamp;
}

export interface EventItem {
  id: string;
  title: string;
  date: string;
  month: string;
  time: string;
  location: string;
  description: string;
  capacity?: number;
  registered?: number;
  displayOrder: number;
  active: boolean;
  created_at: Timestamp;
  updated_at: Timestamp;
}

export interface SiteConfigExtended {
  id: string;
  siteTitle: string;
  siteDescription: string;
  targetDate: string;
  contactEmail: string;
  contactPhone: string;
  facebookUrl?: string;
  instagramUrl?: string;
  youtubeUrl?: string;
  blogUrl?: string;
  showGallery: boolean;
  showEvents: boolean;
  showTimeline: boolean;
  updated_at: Timestamp;
}

export interface Message {
  id: string;
  senderName: string;
  content: string;
  isApproved: boolean;
  createdAt: Timestamp;
}

export interface AlimtalkTemplateConfig {
  templateId: string;
  enabled: boolean;
}

export interface AlimtalkConfig {
  appKey: string;
  secretKey: string;
  senderKey: string;
  templates: {
    verification: AlimtalkTemplateConfig;
    welcome: AlimtalkTemplateConfig;
    event: AlimtalkTemplateConfig;
    payment: AlimtalkTemplateConfig;
    passwordReset: AlimtalkTemplateConfig;
    vbankPending: AlimtalkTemplateConfig;
    [key: string]: AlimtalkTemplateConfig;
  };
  updatedAt: Timestamp | FieldValue;
  updatedBy: string;
}

export interface AlimtalkLog {
  id: string;
  templateId: string;
  recipientPhone: string;
  status: 'success' | 'failure';
  requestTime: Timestamp;
  responseCode?: string;
  responseMessage?: string;
  params: Record<string, any>;
}
