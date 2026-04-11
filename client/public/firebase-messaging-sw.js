importScripts('https://www.gstatic.com/firebasejs/10.9.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.9.0/firebase-messaging-compat.js');

const firebaseConfig = {
  apiKey: "AIzaSyBbIoJLIfQKwvCNS3Gg3ur4yeZjWwKkbO8",
  authDomain: "fams-8c5c9.firebaseapp.com",
  projectId: "fams-8c5c9",
  storageBucket: "fams-8c5c9.firebasestorage.app",
  messagingSenderId: "627480718815",
  appId: "1:627480718815:web:6f091915d5cbdfb71de86a",
  measurementId: "G-Y39LSBBDQ4"
};

firebase.initializeApp(firebaseConfig);

const messaging = firebase.messaging();

// Handle background messages
messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: '/favicon.ico' // Or any path to your app icon
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
