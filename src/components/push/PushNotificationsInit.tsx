"use client";

import { useEffect } from "react";
import { initPushNotifications } from "@/lib/push-notifications";

/** Renders nothing — just kicks off native push registration once on mount. */
export function PushNotificationsInit() {
  useEffect(() => {
    initPushNotifications();
  }, []);

  return null;
}
