"use client";

import { usePathname, useSearchParams } from "next/navigation";
import Script from "next/script";
import { FC, PropsWithChildren, createContext, useEffect, useState } from "react";

export type RouteChangeConfirmationContextType = [string | undefined, (message?: string) => void];

const RouteChangeConfirmationContext = createContext<RouteChangeConfirmationContextType>([undefined, () => {}]);

const RouteChangeConfirmationProvider: FC<PropsWithChildren<Record<string, any>>> = ({ children }) => {
  const [confirmationMessage, setConfirmationMessage] = useState<string | undefined>();
  const msg = confirmationMessage || "Are you sure you want to leave this page?";

  const pathname = usePathname();
  const searchParams = useSearchParams();

  const url = [pathname, searchParams].filter(Boolean).join("?");
  useEffect(() => {
    setConfirmationMessage(undefined);
  }, [url]);

  useEffect(() => {
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      if (!confirmationMessage) return;

      event.preventDefault();
      event.returnValue = msg;
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [confirmationMessage]);

  useEffect(() => {
    const scriptContent = `(() => {
    const originalPushState = history.pushState.bind(history);
    let currentPoint = 0;
    let point = 0;
    history.pushState = function(state, title, url) {
        state.point = ++point;
        currentPoint = point;
        originalPushState(state, title, url);
    };
    const originalReplaceState = history.replaceState.bind(history);
    history.replaceState = function(state, title, url) {
        state.point = currentPoint;
        originalReplaceState(state, title, url);
    };
    window.addEventListener('popstate', function (event) {
        const { state: nextState } = event;
        const isBackNavigation = currentPoint > (nextState?.point || 0);
        currentPoint = nextState?.point || 0;

        const script = document.getElementById('navigation-confirmation-script');
        const confirmationMessage = script?.dataset.msg || '';
        const shouldConfirm = confirmationMessage !== '';
        if (shouldConfirm && !window.confirm(confirmationMessage)) {
            event.stopImmediatePropagation();
            isBackNavigation ? history.forward() : history.back();
        }
    });
})();`;

    const scriptElement = document.createElement("script");
    scriptElement.id = "navigation-confirmation-script";
    scriptElement.textContent = scriptContent;
    document.body.appendChild(scriptElement);

    return () => {
      document.body.removeChild(scriptElement);
    };
  }, [msg]);

  return (
    <RouteChangeConfirmationContext.Provider value={[msg, setConfirmationMessage]}>
      <Script
        strategy="afterInteractive"
        id="proxy-script"
        dangerouslySetInnerHTML={{
          __html: `(() => {
                        const originalPushState = history.pushState.bind(history);
                        let currentPoint = 0;
                        let point = 0;
                        window.history.pushState = function(state, title, url) {
                            state.point = ++point;
                            currentPoint = point;
                            originalPushState(state, title, url);
                        };
                        const originalReplaceState = history.replaceState.bind(history);
                        window.history.replaceState = function(state, title, url) {
                            state.point = currentPoint;
                            originalReplaceState(state, title, url);
                        };
                        window.addEventListener('popstate', function (event) {
                            const { state: nextState } = event;
                            const isback = currentPoint > nextState.point;

                            currentPoint = nextState.point;

                            const script = document.getElementById('proxy-script');
                            if (!script || location.href === script.dataset.href) return;

                            const msg = script.dataset.msg||'';
                            const confirm = msg == '' ? true : window.confirm(msg);
                            if (!confirm) {
                                event.stopImmediatePropagation();
                                isback ? history.forward() : history.back();
                            }
                        });
                    })()`,
        }}
      ></Script>
      {children}
    </RouteChangeConfirmationContext.Provider>
  );
};

export { RouteChangeConfirmationContext, RouteChangeConfirmationProvider };
