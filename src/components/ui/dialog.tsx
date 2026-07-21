"use client";

import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X } from "lucide-react";

// ── Base Dialog ──────────────────────────────────────────
function Dialog({
  open,
  onOpenChange,
  children,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
}) {
  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm" />
        <DialogPrimitive.Content className="fixed left-1/2 top-1/2 z-50 flex max-h-[90vh] w-full max-w-[calc(100vw-2rem)] -translate-x-1/2 -translate-y-1/2 flex-col rounded-xl bg-card shadow-2xl sm:max-w-lg">
          {children}
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}

// ── Header ───────────────────────────────────────────────
function DialogHeader({
  children,
  onClose,
}: {
  children: React.ReactNode;
  onClose?: () => void;
}) {
  return (
    <div className="flex items-center justify-between border-b border-border px-4 py-3 sm:px-6 sm:py-4">
      <div className="text-base font-extrabold tracking-normal sm:text-lg">
        {children}
      </div>
      <DialogPrimitive.Close
        onClick={onClose}
        className="flex size-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
      >
        <X className="size-4" />
      </DialogPrimitive.Close>
    </div>
  );
}

// ── Body (scrollable) ────────────────────────────────────
function DialogBody({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex-1 overflow-y-auto px-4 py-4 sm:px-6 sm:py-6">
      {children}
    </div>
  );
}

// ── Footer ───────────────────────────────────────────────
function DialogFooter({ children }: { children: React.ReactNode }) {
  return (
    <div className="border-t border-border px-4 py-3 sm:px-6 sm:py-4">
      {children}
    </div>
  );
}

// Attach subcomponents as static properties
Dialog.Header = DialogHeader;
Dialog.Body = DialogBody;
Dialog.Footer = DialogFooter;

export { Dialog };
