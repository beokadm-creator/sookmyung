import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

const db = admin.firestore();

export async function verifyAdmin(uid: string): Promise<void> {
  const adminUserDoc = await db.collection('users').doc(uid).get();
  if (!adminUserDoc.exists || adminUserDoc.data()?.role !== 'admin') {
    throw new functions.https.HttpsError('permission-denied', '관리자 권한이 필요합니다.');
  }
}

export async function getTossSecretKey(): Promise<string> {
  let tossSecretKey = process.env.TOSS_SECRET_KEY;

  if (!tossSecretKey) {
    try {
      const siteConfigDoc = await db.collection('settings').doc('site_config').get();
      if (siteConfigDoc.exists) {
        tossSecretKey = siteConfigDoc.data()?.pg_config?.secretKey;
      }
    } catch (configError) {
      console.warn('Failed to load site config for Toss key:', configError);
    }
  }

  if (!tossSecretKey) {
    throw new functions.https.HttpsError('failed-precondition', '결제 시크릿 키가 설정되지 않았습니다. 관리자에게 문의해주세요.');
  }

  return tossSecretKey;
}

let cachedSiteConfig: any = null;
let cacheExpiry = 0;
const CACHE_TTL = 5 * 60 * 1000;

export async function getSiteConfigWithCache(): Promise<any> {
  const now = Date.now();
  
  if (cachedSiteConfig && now < cacheExpiry) {
    return cachedSiteConfig;
  }

  const siteConfigDoc = await db.collection('settings').doc('site_config').get();
  
  if (siteConfigDoc.exists) {
    cachedSiteConfig = siteConfigDoc.data();
    cacheExpiry = now + CACHE_TTL;
    return cachedSiteConfig;
  }

  return null;
}
