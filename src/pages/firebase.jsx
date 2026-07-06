import { initializeApp } from "firebase/app";
import { getMessaging } from "firebase/messaging";

const firebaseConfig = {
    apiKey: "AIzaSyDHiRrkPERGqgaCWTrUBSgXvrmaHM1YqBQ",
    authDomain: "socialgist-59506.firebaseapp.com",
    projectId: "socialgist-59506",
    storageBucket: "socialgist-59506.firebasestorage.app",
    messagingSenderId: "739927272825",
    appId: "1:739927272825:web:507d36a2702be82c8c13a8",
    measurementId: "G-QCZ2HNH2ER"
};

const app = initializeApp(firebaseConfig);

// 👇 THIS is important
export const messaging = getMessaging(app);
export default app;

