// ========================================================
// FIREBASE AUTHENTICATION CONFIGURATION
// ========================================================

const firebaseConfig = {
  apiKey: "AIzaSyBqEoNbVtloFDiVmjq5dxYS3_AXcpTWX30",
  authDomain: "sabarimala-temple-system.firebaseapp.com",
  projectId: "sabarimala-temple-system",
  storageBucket: "sabarimala-temple-system.firebasestorage.app",
  messagingSenderId: "186247910386",
  appId: "1:186247910386:web:9094ee39584ce5429cd16b"
};

// Initialize Firebase SDK
if (typeof firebase !== "undefined" && !firebase.apps.length) {
    try {
        firebase.initializeApp(firebaseConfig);
        console.log("[FIREBASE] Initialized successfully with project:", firebaseConfig.projectId);
    } catch (e) {
        console.warn("[FIREBASE] Initialization note:", e.message);
    }
}
