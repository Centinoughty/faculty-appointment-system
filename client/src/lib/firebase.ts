import { initializeApp, getApps } from "firebase/app";
import { getMessaging, getToken, onMessage, isSupported } from "firebase/messaging";

// Web app's Firebase configuration from server/firebase.config
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyBbIoJLIfQKwvCNS3Gg3ur4yeZjWwKkbO8",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "fams-8c5c9.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "fams-8c5c9",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "fams-8c5c9.firebasestorage.app",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "627480718815",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:627480718815:web:6f091915d5cbdfb71de86a",
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || "G-Y39LSBBDQ4"
};

// Initialize Firebase
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

// Export messaging conditionally because it might not be supported (e.g. in Safari desktop or without HTTPS)
export const messaging = async () => {
    const supported = await isSupported();
    if (supported) {
        return getMessaging(app);
    }
    return null;
};

export const requestForToken = async () => {
  try {
    const msg = await messaging();
    if (!msg) return null;
    
    // Replace with your VAPID key if you have generated one in Firebase Console project settings
    // If not provided, Firebase generates it, but it's required for web push (VAPID)
    const currentToken = await getToken(msg, { 
      // vapidKey: 'YOUR_VAPID_KEY_HERE' 
    });
    
    if (currentToken) {
      return currentToken;
    } else {
      console.log('No registration token available. Request permission to generate one.');
      return null;
    }
  } catch (err) {
    console.log('An error occurred while retrieving token. ', err);
    return null;
  }
};

export const onMessageListener = async () => {
  const msg = await messaging();
  if (!msg) return;

  return new Promise((resolve) => {
    onMessage(msg, (payload) => {
      resolve(payload);
    });
  });
};
