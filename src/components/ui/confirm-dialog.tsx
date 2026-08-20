"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { Loader2, ShieldAlert, TriangleAlert } from "lucide-react";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { IconCircle } from "@/components/ui/icon-circle";
import { Input } from "@/components/ui/input";
import { getErrorMessage } from "@/lib/utils";

type ConfirmVariant = "default" | "warning" | "destructive";

export interface ConfirmOptions {
  title: string;
  description: ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  /** Visual + copy weight. Defaults to "default" (a routine, reversible change). */
  variant?: ConfirmVariant;
  /**
   * Require the admin to type this exact string before the confirm button
   * enables. Reserved for the handful of actions where a mis-click is
   * genuinely costly (cascading deletes, "send to everyone").
   */
  requireTypedConfirmation?: string;
  /** Runs on confirm. The dialog stays open and shows the error on rejection. */
  onConfirm: () => Promise<void>;
}

type ConfirmFn = (options: ConfirmOptions) => void;

const ConfirmContext = createContext<ConfirmFn | null>(null);

const VARIANT_ICON: Record<ConfirmVariant, typeof ShieldAlert> = {
  default: ShieldAlert,
  warning: TriangleAlert,
  destructive: TriangleAlert,
};

const VARIANT_ICON_TONE: Record<ConfirmVariant, "brand" | "warning" | "danger"> = {
  default: "brand",
  warning: "warning",
  destructive: "danger",
};

const VARIANT_BUTTON: Record<ConfirmVariant, "default" | "destructive"> = {
  default: "default",
  warning: "default",
  destructive: "destructive",
};

export function ConfirmProvider({ children }: { children: ReactNode }) {
  const [options, setOptions] = useState<ConfirmOptions | null>(null);
  const [typedValue, setTypedValue] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");

  const confirm = useCallback<ConfirmFn>((next) => {
    setOptions(next);
    setTypedValue("");
    setError("");
  }, []);

  const close = () => {
    if (pending) return;
    setOptions(null);
  };

  const handleConfirm = async () => {
    if (!options) return;
    setError("");
    setPending(true);
    try {
      await options.onConfirm();
      setOptions(null);
    } catch (err: unknown) {
      setError(getErrorMessage(err, "The action failed"));
    } finally {
      setPending(false);
    }
  };

  const variant = options?.variant ?? "default";
  const Icon = VARIANT_ICON[variant];
  const typedRequirement = options?.requireTypedConfirmation;
  const typedSatisfied = !typedRequirement || typedValue === typedRequirement;

  return (
    <ConfirmContext.Provider value={confirm}>
      {children}
      <Dialog
        open={!!options}
        onOpenChange={(open) => !open && close()}
        preventClose={pending}
      >
        {options && (
          <>
            <Dialog.Header onClose={close} closeDisabled={pending}>
              {options.title}
            </Dialog.Header>
            <Dialog.Body>
              <div className="flex gap-3">
                <IconCircle tone={VARIANT_ICON_TONE[variant]} size="size-9">
                  <Icon className="size-4" />
                </IconCircle>
                <div className="space-y-3 text-sm text-muted-foreground">
                  {options.description}
                  {typedRequirement && (
                    <div className="space-y-1.5 pt-1">
                      <p className="text-xs font-bold text-foreground">
                        Type{" "}
                        <span className="font-mono text-orange-200">
                          {typedRequirement}
                        </span>{" "}
                        to confirm
                      </p>
                      <Input
                        autoFocus
                        value={typedValue}
                        onChange={(e) => setTypedValue(e.target.value)}
                        disabled={pending}
                        placeholder={typedRequirement}
                        className="font-mono"
                      />
                    </div>
                  )}
                </div>
              </div>
              {error && <Alert className="mt-4">{error}</Alert>}
            </Dialog.Body>
            <Dialog.Footer>
              <div className="flex justify-end gap-2">
                <Button variant="secondary" onClick={close} disabled={pending}>
                  {options.cancelLabel ?? "Cancel"}
                </Button>
                <Button
                  variant={VARIANT_BUTTON[variant]}
                  onClick={handleConfirm}
                  disabled={pending || !typedSatisfied}
                >
                  {pending && <Loader2 className="size-4 animate-spin" />}
                  {pending
                    ? "Working..."
                    : (options.confirmLabel ??
                      (variant === "destructive" ? "Delete" : "Confirm"))}
                </Button>
              </div>
            </Dialog.Footer>
          </>
        )}
      </Dialog>
    </ConfirmContext.Provider>
  );
}

/**
 * `const confirm = useConfirm(); confirm({ title, description, onConfirm })`
 * Opens a single shared confirmation dialog. The dialog owns pending/error
 * state and only closes on success — callers don't need any local state.
 */
export function useConfirm(): ConfirmFn {
  const ctx = useContext(ConfirmContext);
  if (!ctx) throw new Error("useConfirm must be used within ConfirmProvider");
  return ctx;
}

/** Convenience for the common "delete this entity" case. */
export function useConfirmDelete() {
  const confirm = useConfirm();
  return useMemo(
    () =>
      ({
        entityLabel,
        entityName,
        description,
        requireTypedConfirmation,
        onConfirm,
      }: {
        entityLabel: string;
        entityName: string;
        description?: ReactNode;
        requireTypedConfirmation?: string;
        onConfirm: () => Promise<void>;
      }) =>
        confirm({
          title: `Delete ${entityLabel}`,
          description: description ?? (
            <>
              Permanently delete <strong className="text-foreground">{entityName}</strong>?
              This cannot be undone.
            </>
          ),
          variant: "destructive",
          confirmLabel: `Delete ${entityLabel}`,
          requireTypedConfirmation,
          onConfirm,
        }),
    [confirm],
  );
}
