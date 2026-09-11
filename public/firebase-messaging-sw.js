// Firebase Cloud Messaging service worker for the AG Fresh Eggs admin dashboard.
// Handles push notifications when the CMS tab (or browser) isn't in the foreground —
// this is what makes "new order" alerts work even with the tab in the background or,
// once the browser has fully started this worker at least once, after it's reopened.
//
// The config values below are the same public web-app identifiers exposed in any
// Firebase web app's client bundle (restricted by Firebase's own security rules, not
// secret) — safe to have in a plain static file served to anyone.
importScripts("https://www.gstatic.com/firebasejs/10.13.2/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.13.2/firebase-messaging-compat.js");

firebase.initializeApp({
  apiKey: "AIzaSyBSaRFoWh8e1ZpZ1HY7Ol35llRDOYw6C2Y",
  authDomain: "ag-egg-app.firebaseapp.com",
  projectId: "ag-egg-app",
  storageBucket: "ag-egg-app.firebasestorage.app",
  messagingSenderId: "142600766119",
  appId: "1:142600766119:web:a008ad4505e95ceeeb9182",
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  const title = payload.notification?.title ?? "New order";
  const body = payload.notification?.body ?? "";
  self.registration.showNotification(title, {
    body,
    icon: "/icon.png",
    tag: payload.data?.orderId ? `ag-order-${payload.data.orderId}` : undefined,
    data: { link: payload.fcmOptions?.link ?? payload.data?.link ?? "/admin/orders" },
  });
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const link = event.notification.data?.link ?? "/admin/orders";
  event.waitUntil(clients.openWindow(link));
});
