import {
    getMessaging,
    getToken,
    onMessage
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-messaging.js";

import { app } from "./firebase.js";

const messaging = getMessaging(app);

const VAPID_KEY =
"BCfsMWuDmRYo0PK5dCB6gJPcSy-GWxn4iLR7IopNog94XqPHwMPU4GPQEEgst6tF2-WWhryhHrFQv-QAeTDj4Qw";

export async function requestNotificationPermission() {

    try {

        const permission =
            await Notification.requestPermission();

        if (permission !== "granted") {
            console.log("Notification permission denied");
            return null;
        }

        const registration =
            await navigator.serviceWorker.register(
                "/firebase-messaging-sw.js"
            );

        console.log(
            "Firebase service worker registered:",
            registration
        );

        const token =
            await getToken(messaging, {
                vapidKey: VAPID_KEY,
                serviceWorkerRegistration: registration
            });

        if (!token) {
            console.log("FCM token not generated");
            return null;
        }

        console.log("FCM TOKEN:", token);

        return token;

    } catch (error) {

        console.error(
            "FCM setup error:",
            error
        );

        return null;
    }
}

onMessage(messaging, payload => {

    console.log(
        "Notification received:",
        payload
    );

    const title =
        payload.notification?.title ||
        "MP Frames";

    const body =
        payload.notification?.body ||
        "New Order";

    alert(
        title + "\n\n" + body
    );
});
