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


        const token = await getToken(
            messaging,
            {
                vapidKey: VAPID_KEY
            }
        );


        if (!token) {

            console.log("No FCM token available");

            return null;
        }


        console.log(
            "FCM TOKEN:",
            token
        );


        return token;


    } catch (error) {

        console.error(
            "FCM Error:",
            error
        );

        return null;
    }
}


onMessage(
    messaging,
    payload => {

        console.log(
            "FCM Notification:",
            payload
        );


        const title =
            payload.notification?.title ||
            "MP Frames";


        const body =
            payload.notification?.body ||
            "New notification";


        alert(
            title + "\n\n" + body
        );
    }
);
