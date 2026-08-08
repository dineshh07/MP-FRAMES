import { getMessaging, getToken, onMessage }
from "https://www.gstatic.com/firebasejs/12.0.0/firebase-messaging.js";

import { app } from "./firebase.js";

const messaging = getMessaging(app);

const VAPID_KEY =
"BCfsMWuDmRYo0PK5dCB6gJPcSy-GWxn4iLR7IopNog94XqPHwMPU4GPQEEgst6tF2-WWhryhHrFQv-QAeTDj4Qw";

export async function requestNotificationPermission() {

    const permission = await Notification.requestPermission();

    if (permission !== "granted") {
        console.log("Notification permission denied");
        return null;
    }

    const token = await getToken(messaging, {
        vapidKey: VAPID_KEY
    });

    console.log("FCM Token:", token);

    return token;
}

onMessage(messaging, payload => {

    console.log("Notification received:", payload);

    alert(
        payload.notification?.title ||
        "New MP Frames Order"
    );
});
