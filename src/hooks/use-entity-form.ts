import { useEffect, useState, type Dispatch, type SetStateAction } from "react";

interface UseEntityFormResult<TForm> {
  form: TForm;
  setForm: Dispatch<SetStateAction<TForm>>;
  hasChanges: boolean;
  discard: () => void;
}

interface UseEntityFormResultNullable<TForm> {
  form: TForm | null;
  setForm: Dispatch<SetStateAction<TForm | null>>;
  hasChanges: boolean;
  discard: () => void;
}

/**
 * Seeds a local form from an async-resolved entity (via useEntityDetail), keeps it
 * in sync if the entity reloads, and computes hasChanges/discard against it.
 *
 * Two shapes, matching the two patterns this consolidates:
 * - No `emptyForm`: form starts `null` until the entity resolves (edit-only pages).
 * - `emptyForm` + `isCreate`: form starts populated so a "new X" page can render
 *   immediately; hasChanges is forced true while isCreate so Save is always enabled.
 */
export function useEntityForm<TEntity, TForm>(
  entity: TEntity | undefined,
  toFormState: (entity: TEntity) => TForm,
  options: { emptyForm: TForm; isCreate: boolean },
): UseEntityFormResult<TForm>;
export function useEntityForm<TEntity, TForm>(
  entity: TEntity | undefined,
  toFormState: (entity: TEntity) => TForm,
): UseEntityFormResultNullable<TForm>;
export function useEntityForm<TEntity, TForm>(
  entity: TEntity | undefined,
  toFormState: (entity: TEntity) => TForm,
  options?: { emptyForm: TForm; isCreate: boolean },
): UseEntityFormResultNullable<TForm> {
  const { emptyForm, isCreate = false } = options ?? {};
  const [form, setForm] = useState<TForm | null>(() =>
    entity ? toFormState(entity) : (emptyForm ?? null),
  );

  useEffect(() => {
    if (entity) setForm(toFormState(entity));
    // toFormState is re-created every render by every caller; only the entity identity matters here.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [entity]);

  const hasChanges = isCreate
    ? true
    : !!entity && !!form && JSON.stringify(form) !== JSON.stringify(toFormState(entity));

  const discard = () => {
    if (entity) setForm(toFormState(entity));
  };

  return { form, setForm, hasChanges, discard };
}
