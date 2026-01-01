/// <reference types="vite/client" />

interface ImportMetaEnv {
  // Firebase Client (Public)
  readonly VITE_FIREBASE_API_KEY: string;
  readonly VITE_FIREBASE_AUTH_DOMAIN: string;
  readonly VITE_FIREBASE_PROJECT_ID: string;
  readonly VITE_FIREBASE_STORAGE_BUCKET: string;
  readonly VITE_FIREBASE_MESSAGING_SENDER_ID: string;
  readonly VITE_FIREBASE_APP_ID: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

// Node.js process.env types
declare namespace NodeJS {
  interface ProcessEnv {
    // Server
    NODE_ENV: 'development' | 'production' | 'test';
    API_PORT: string;
    CLIENT_URL: string;

    // Firebase Admin
    FIREBASE_PROJECT_ID: string;
    FIREBASE_CLIENT_EMAIL: string;
    FIREBASE_PRIVATE_KEY: string;

    // Firebase Emulator (optional)
    FIRESTORE_EMULATOR_HOST?: string;
    FIREBASE_AUTH_EMULATOR_HOST?: string;

    // LINE Notify (optional)
    LINE_NOTIFY_TOKEN?: string;

    // SMS API (optional)
    SMS_API_KEY?: string;
    SMS_API_SECRET?: string;
  }
}
