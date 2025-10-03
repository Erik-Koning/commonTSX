"use client";

import { useTheme } from "next-themes";
import type { ExternalToast } from "sonner";
import { Toaster as Sonner, toast as sonnerToast } from "sonner";

type ToasterProps = React.ComponentProps<typeof Sonner>;

//The wrapper for the sonner toaster
const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme();

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      toastOptions={{
        classNames: {
          toast: "group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg",
          description: "group-[.toast]:text-muted-foreground",
          actionButton: "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground",
          cancelButton: "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground",
        },
      }}
      {...props}
    />
  );
};

interface ToastProps {
  title?: string;
  message?: string;
  type?: "default" | "success" | "error" | "info" | "warning";
}

type ToastFunction = {
  (props: ToastProps): void;
  (message: string | React.ReactNode, data?: ExternalToast): string | number | undefined;
};

const toastFn: ToastFunction = (propsOrMessage: ToastProps | string | React.ReactNode, data?: ExternalToast) => {
  if (
    typeof propsOrMessage === "object" &&
    propsOrMessage !== null &&
    !Array.isArray(propsOrMessage) &&
    "type" in propsOrMessage &&
    propsOrMessage.type === "error"
  ) {
  }
  if (
    typeof propsOrMessage === "object" &&
    propsOrMessage !== null &&
    !Array.isArray(propsOrMessage) &&
    ("title" in propsOrMessage || "message" in propsOrMessage)
  ) {
    const { title, message, type = "default" } = propsOrMessage;
    const toastMethod =
      {
        success: sonnerToast.success,
        error: sonnerToast.error,
        default: sonnerToast,
        info: sonnerToast.info,
        warning: sonnerToast.warning,
      }[type] || sonnerToast;

    if (title && message) {
      toastMethod(title, { description: message });
    } else if (title) {
      toastMethod(title);
    } else if (message) {
      toastMethod(message);
    }
    return;
  }

  return sonnerToast(propsOrMessage as string | React.ReactNode, data);
};

//Copy all extra methods from sonnerToast to toastFn
const toast = Object.assign(toastFn, sonnerToast);

export { toast, Toaster };
