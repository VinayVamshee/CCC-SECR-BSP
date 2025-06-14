import { initializeApp } from "firebase/app";
import { getMessaging, getToken, onMessage } from "firebase/messaging";

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
const app = initializeApp(firebaseConfig);
const messaging = getMessaging(app);

// Function to request notification permission and get FCM token
export const requestNotificationPermission = async (messaging, vapidKey) => {
    try {
      const permission = await Notification.requestPermission();
      if (permission === "granted") {
        const token = await getToken(messaging, { vapidKey });
        return token;
      } else {
        console.warn("Notification permission denied.");
        return null;
      }
    } catch (error) {
      console.error("Error getting FCM token:", error);
      return null;
    }
  };
  

// Listen for incoming messages
onMessage(messaging, (payload) => {
  alert(`New Notification: ${payload.notification.title}`);
});
