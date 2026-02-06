import "server-only";

import admin from "firebase-admin";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";

function formatPrivateKey(key: string) {
  return key.replace(/^"/, "").replace(/"$/, "").replace(/\\n/g, "\n");
}

function initAdmin() {
  if (admin.apps.length > 0) {
    return admin.app();
  }

  return admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: formatPrivateKey(process.env.FIREBASE_PRIVATE_KEY as string),
    }),
  });
}

export function getAdminAuth() {
  initAdmin();
  return getAuth();
}

export function getAdminFirestore() {
  initAdmin();
  return getFirestore();
}
