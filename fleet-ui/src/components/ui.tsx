import * as Dialog from "@radix-ui/react-dialog";
import * as Toast from "@radix-ui/react-toast";
import clsx from "clsx";
import { X } from "lucide-react";
import { useEffect } from "react";
import type { PropsWithChildren, ReactNode } from "react";
import type { ApiToast } from "../types/fleet";

const TOAST_DURATION_MS = 4200;

export function Button({
  children,
  variant = "default",
  size = "md",
  className,
  ...props
}: PropsWithChildren<React.ButtonHTMLAttributes<HTMLButtonElement>> & {
  variant?: "default" | "primary" | "ghost" | "danger";
  size?: "sm" | "md" | "icon";
}) {
  return (
    <button className={clsx("btn", `btn-${variant}`, `btn-${size}`, className)} {...props}>
      {children}
    </button>
  );
}

export function Pill({
  children,
  tone = "gray",
  className,
}: PropsWithChildren<{ tone?: "gray" | "blue" | "green" | "yellow" | "red"; className?: string }>) {
  return <span className={clsx("pill", `pill-${tone}`, className)}>{children}</span>;
}

export function Modal({
  title,
  description,
  icon,
  open,
  onOpenChange,
  children,
  footer,
  className,
}: PropsWithChildren<{
  title: string;
  description?: string;
  icon?: ReactNode;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  footer?: ReactNode;
  className?: string;
}>) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="dialog-overlay" />
        <Dialog.Content className={clsx("dialog-content", className)}>
          <header className="dialog-header">
            {icon ? <div className="dialog-icon">{icon}</div> : null}
            <div>
              <Dialog.Title className="dialog-title">{title}</Dialog.Title>
              {description ? <Dialog.Description className="dialog-description">{description}</Dialog.Description> : null}
            </div>
            <Dialog.Close asChild>
              <Button variant="ghost" size="icon" className="dialog-close" aria-label="Close">
                <X size={16} />
              </Button>
            </Dialog.Close>
          </header>
          <div className="dialog-body">{children}</div>
          {footer ? <footer className="dialog-footer">{footer}</footer> : null}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

export function ToastHost({ toast, onOpenChange }: { toast: ApiToast | null; onOpenChange: (open: boolean) => void }) {
  useEffect(() => {
    if (!toast) return;

    const timer = window.setTimeout(() => onOpenChange(false), TOAST_DURATION_MS);
    return () => window.clearTimeout(timer);
  }, [toast, onOpenChange]);

  return (
    <Toast.Provider swipeDirection="right">
      <Toast.Root
        className={clsx("toast", toast?.kind === "err" ? "toast-err" : "toast-ok")}
        open={!!toast}
        onOpenChange={onOpenChange}
        duration={TOAST_DURATION_MS}
      >
        <Toast.Title className="toast-title">{toast?.title}</Toast.Title>
        {toast?.body ? <Toast.Description className="toast-body">{toast.body}</Toast.Description> : null}
        <Toast.Close className="toast-close" aria-label="Dismiss">
          <X size={14} />
        </Toast.Close>
      </Toast.Root>
      <Toast.Viewport className="toast-viewport" />
    </Toast.Provider>
  );
}

export function Field({ label, children, hint }: PropsWithChildren<{ label: string; hint?: string }>) {
  return (
    <label className="field">
      <span className="field-label">{label}</span>
      {children}
      {hint ? <span className="field-hint">{hint}</span> : null}
    </label>
  );
}
