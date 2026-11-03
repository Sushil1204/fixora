"use client";

import { useEffect } from "react";

/**
 * Registers `/sw.js` for offline support and installability.
 *
 * Skipped in development so the worker cannot serve stale chunks over HMR.
 * When an updated worker takes over, the page reloads once — but not on the
 * very first install, where there was no controller before.
 */
export function ServiceWorkerRegister() {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production") return;
    if (!("serviceWorker" in navigator)) return;

    const hadController = Boolean(navigator.serviceWorker.controller);
    let reloading = false;

    function handleControllerChange() {
      if (!hadController || reloading) return;
      reloading = true;
      window.location.reload();
    }

    navigator.serviceWorker.addEventListener(
      "controllerchange",
      handleControllerChange,
    );

    navigator.serviceWorker
      .register("/sw.js", { scope: "/", updateViaCache: "none" })
      .catch((error) => {
        console.warn("Service worker registration failed:", error);
      });

    return () => {
      navigator.serviceWorker.removeEventListener(
        "controllerchange",
        handleControllerChange,
      );
    };
  }, []);

  return null;
}
