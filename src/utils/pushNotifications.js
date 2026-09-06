import api from "../api/axios";

function urlBase64ToUint8Array(
  base64String
) {
  const padding =
    "=".repeat(
      (4 -
        (base64String.length %
          4)) %
        4
    );

  const base64 =
    (
      base64String +
      padding
    )
      .replace(
        /-/g,
        "+"
      )
      .replace(
        /_/g,
        "/"
      );

  const rawData =
    window.atob(
      base64
    );

  const outputArray =
    new Uint8Array(
      rawData.length
    );

  for (
    let index = 0;
    index <
    rawData.length;
    index += 1
  ) {
    outputArray[index] =
      rawData.charCodeAt(
        index
      );
  }

  return outputArray;
}

function checkBrowserSupport() {
  if (
    !(
      "serviceWorker" in
      navigator
    )
  ) {
    throw new Error(
      "This browser does not support service workers."
    );
  }

  if (
    !(
      "PushManager" in
      window
    )
  ) {
    throw new Error(
      "This browser does not support push notifications."
    );
  }

  if (
    !(
      "Notification" in
      window
    )
  ) {
    throw new Error(
      "This browser does not support notifications."
    );
  }
}

export async function getCurrentPushSubscription() {
  checkBrowserSupport();

  const registration =
    await navigator.serviceWorker.register(
      "/sw.js"
    );

  return registration.pushManager.getSubscription();
}

export async function subscribeToPush() {
  checkBrowserSupport();

  const registration =
    await navigator.serviceWorker.register(
      "/sw.js"
    );

  const {
    data,
  } = await api.get(
    "/push/vapid-public-key"
  );

  if (!data?.publicKey) {
    throw new Error(
      "Push notification configuration is unavailable."
    );
  }

  let permission =
    Notification.permission;

  if (
    permission !==
    "granted"
  ) {
    permission =
      await Notification.requestPermission();
  }

  if (
    permission !==
    "granted"
  ) {
    throw new Error(
      "Notification permission was not granted."
    );
  }

  let subscription =
    await registration.pushManager.getSubscription();

  if (!subscription) {
    subscription =
      await registration.pushManager.subscribe(
        {
          userVisibleOnly:
            true,

          applicationServerKey:
            urlBase64ToUint8Array(
              data.publicKey
            ),
        }
      );
  }

  const subscriptionJson =
    subscription.toJSON();

  await api.post(
    "/push/subscribe",
    {
      endpoint:
        subscriptionJson.endpoint,

      expirationTime:
        subscriptionJson.expirationTime,

      keys:
        subscriptionJson.keys,

      userAgent:
        navigator.userAgent,
    }
  );

  return subscription;
}

export async function unsubscribeFromPush() {
  checkBrowserSupport();

  const registration =
    await navigator.serviceWorker.register(
      "/sw.js"
    );

  const subscription =
    await registration.pushManager.getSubscription();

  if (!subscription) {
    return;
  }

  const endpoint =
    subscription.endpoint;

  await api.delete(
    "/push/subscribe",
    {
      data: {
        endpoint,
      },
    }
  );

  await subscription.unsubscribe();
}

export async function sendTestPush() {
  const {
    data,
  } = await api.post(
    "/push/test"
  );

  return data;
}