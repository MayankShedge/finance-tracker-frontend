self.addEventListener(
  "push",
  (event) => {
    let data = {};

    try {
      data = event.data
        ? event.data.json()
        : {};
    } catch (error) {
      data = {
        title:
          "Finance Tracker",
        body:
          "You have a reminder.",
        url: "/tasks",
      };
    }

    const title =
      data.title ||
      "Finance Tracker";

    const options = {
      body:
        data.body ||
        "You have a task reminder.",

      tag:
        data.tag ||
        "finance-tracker-reminder",

      data: {
        url:
          data.url ||
          "/tasks",

        taskId:
          data.taskId ||
          null,
      },

      icon:
        "/favicon.ico",

      badge:
        "/favicon.ico",

      requireInteraction:
        false,
    };

    event.waitUntil(
      self.registration.showNotification(
        title,
        options
      )
    );
  }
);

self.addEventListener(
  "notificationclick",
  (event) => {
    event.notification.close();

    const targetUrl =
      event.notification
        ?.data?.url ||
      "/tasks";

    event.waitUntil(
      clients
        .matchAll({
          type: "window",
          includeUncontrolled: true,
        })
        .then(
          (
            clientList
          ) => {
            for (
              const client of clientList
            ) {
              if (
                "focus" in client
              ) {
                client.navigate(
                  targetUrl
                );

                return client.focus();
              }
            }

            if (
              clients.openWindow
            ) {
              return clients.openWindow(
                targetUrl
              );
            }

            return undefined;
          }
        )
    );
  }
);