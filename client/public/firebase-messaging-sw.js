importScripts('https://www.gstatic.com/firebasejs/10.13.2/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.13.2/firebase-messaging-compat.js');

const firebaseConfig = {
  apiKey: "AIzaSyDCcErBWKh2QIrF1nU6YBCVi1RFK3PPN1U",
  authDomain: "project-ccc-31062.firebaseapp.com",
  projectId: "project-ccc-31062",
  storageBucket: "project-ccc-31062.firebasestorage.app",
  messagingSenderId: "1065930708696",
  appId: "1:1065930708696:web:a6e75dc4fc6176d2c9e9ad",
  measurementId: "G-YWMJ4RZFF1"
};
// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Retrieve an instance of Firebase Messaging
const messaging = firebase.messaging();

// Handle background messages
messaging.onBackgroundMessage((payload) => {
  console.log('Received background message: ', payload);

  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: '/firebase-logo.png',
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
