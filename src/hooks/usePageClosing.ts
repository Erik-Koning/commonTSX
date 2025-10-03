import { RefObject, useEffect } from "react";
import Router from "next/router";

export function usePageClosing(callback: (ev: Event) => void, enable = true) {
  useEffect(() => {
    if (!enable) return;

    const handler = () => {
      if (!window.confirm("HEy! Are you sure you want to leave?")) {
        throw "Route Canceled";
      }
    };

    Router.events.on("beforeHistoryChange", callback);
    window.addEventListener("unload", (ev: Event) => {
      callback(ev);
    });
    window.addEventListener("pagehide", (ev: Event) => {
      callback(ev);
    });
    document.addEventListener("visibilitychange", (ev: Event) => {
      callback(ev);
    });

    return () => {
      // Unbind the event listeners and clear timeout on clean up
      window.removeEventListener("unload", (ev: Event) => {
        callback(ev);
      });
      window.removeEventListener("pagehide", (ev: Event) => {
        callback(ev);
      });
      document.removeEventListener("visibilitychange", (ev: Event) => {
        callback(ev);
      });
      Router.events.off("beforeHistoryChange", callback);
    };
  }, [callback, enable]);
}
