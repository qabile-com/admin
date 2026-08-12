"use client";

import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

const SIZE_CLASS = {
  md: "sm:max-w-lg",
  lg: "sm:max-w-2xl",
  xl: "sm:max-w-4xl",
} as const;

// ── Base Dialog ──────────────────────────────────────────
function Dialog({
  open,
  onOpenChange,
  size = "md",
  preventClose = false,
  children,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Dialog width. "md" (default) matches the original max-w-lg. */
  size?: keyof typeof SIZE_CLASS;
  /**
   * While true, the X button, outside-click, and Escape are all disabled so an
   * in-flight submission can't be dropped by a misclick. Pass the same
   * `submitting`/`pending` flag the form already tracks.
   */
  preventClose?: boolean;
  children: React.ReactNode;
}) {
  return (
    <DialogPrimitive.Root
      open={open}
      onOpenChange={(next) => {
        if (preventClose && !next) return;
        onOpenChange(next);
      }}
    >
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm" />
        <DialogPrimitive.Content
          onEscapeKeyDown={(e) => preventClose && e.preventDefault()}
          onPointerDownOutside={(e) => preventClose && e.preventDefault()}
          onInteractOutside={(e) => preventClose && e.preventDefault()}
          className={cn(
            "fixed left-1/2 top-1/2 z-50 flex max-h-[90vh] w-full max-w-[calc(100vw-2rem)] -translate-x-1/2 -translate-y-1/2 flex-col rounded-xl bg-card shadow-2xl",
            SIZE_CLASS[size],
          )}
        >
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
  closeDisabled = false,
}: {
  children: React.ReactNode;
  onClose?: () => void;
  /** Dims the X button to match a `preventClose` dialog. The click itself is
   * already a no-op in that state (Root swallows the onOpenChange), this just
   * makes that visually obvious instead of looking broken. */
  closeDisabled?: boolean;
}) {
  return (
    <div className="flex items-center justify-between border-b border-border px-4 py-3 sm:px-6 sm:py-4">
      <div className="text-base font-extrabold tracking-normal sm:text-lg">
        {children}
      </div>
      <DialogPrimitive.Close
        onClick={onClose}
        disabled={closeDisabled}
        className="flex size-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground disabled:pointer-events-none disabled:opacity-40"
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
