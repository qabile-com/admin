"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Award,
  Ban,
  BadgeCheck,
  Loader2,
  Trash2,
  TriangleAlert,
  UserRound,
  UserMinus,
  UserPlus,
  Zap,
} from "lucide-react";
import { AdminShell } from "@/components/layout/admin-shell";
import { DetailPageHeader } from "@/components/layout/detail-page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog } from "@/components/ui/dialog";
import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useConfirm, useConfirmDelete } from "@/components/ui/confirm-dialog";
import { useInvitedUsers } from "@/hooks/use-bd-users";
import { useEntityDetail } from "@/hooks/use-entity-detail";
import {
  assignBdUser,
  awardAchievement,
  banUser,
  deleteUser,
  fetchAchievements,
  fetchBdUsers,
  fetchUsers,
  modifyUserXp,
  removeBdUser,
  verifyUser,
} from "@/lib/api-services";
import { rememberEntity } from "@/lib/entity-cache";
import { formatDateTime, getErrorMessage, humanize, userLabel } from "@/lib/utils";
import type { Achievement, AdminUser, BdUser } from "@/types/api-types";

export function UserDetail({ id }: { id: string }) {
  const router = useRouter();
  const confirm = useConfirm();
  const confirmDelete = useConfirmDelete();

  const { entity, loading, notFound, error, setEntity } =
    useEntityDetail<AdminUser>("users", id, (params) => fetchUsers(params));

  const [showAwardDialog, setShowAwardDialog] = useState(false);
  const [showXpDialog, setShowXpDialog] = useState(false);
  const [banReason, setBanReason] = useState("");

  const label = entity ? userLabel(entity) : "";

  const handleBan = () => {
    if (!entity) return;
    const willBan = entity.isActive;
    confirm({
      title: willBan ? "Ban user" : "Unban user",
      variant: willBan ? "destructive" : "default",
      confirmLabel: willBan ? "Ban user" : "Unban user",
      description: willBan ? (
        <>
          Ban <strong className="text-foreground">{label}</strong>? They will
          immediately lose access to their account.
          {banReason && (
            <>
              {" "}
              Reason: <strong className="text-foreground">{banReason}</strong>
            </>
          )}
        </>
      ) : (
        <>
          Restore access for <strong className="text-foreground">{label}</strong>?
        </>
      ),
      onConfirm: async () => {
        const updated = await banUser(entity.id, {
          isBanned: willBan,
          reason: banReason || undefined,
        });
        setEntity(updated);
        setBanReason("");
      },
    });
  };

  const handleVerify = (isVerified: boolean) => {
    if (!entity) return;
    confirm({
      title: isVerified ? "Verify user" : "Un-verify user",
      description: (
        <>
          {isVerified ? "Mark" : "Unmark"}{" "}
          <strong className="text-foreground">{label}</strong> as verified?
        </>
      ),
      onConfirm: async () => {
        const updated = await verifyUser(entity.id, isVerified);
        setEntity(updated);
      },
    });
  };

  const handleDelete = () => {
    if (!entity) return;
    confirmDelete({
      entityLabel: "user",
      entityName: label,
      onConfirm: async () => {
        await deleteUser(entity.id);
        router.push("/dashboard/users");
      },
    });
  };

  const handleAssignBd = () => {
    if (!entity) return;
    confirm({
      title: "Assign to BD program",
      description: (
        <>
          Add <strong className="text-foreground">{label}</strong> to the BD
          program?
        </>
      ),
      onConfirm: async () => {
        const updated = await assignBdUser(entity.id);
        setEntity(updated);
      },
    });
  };

  const handleRemoveBd = () => {
    if (!entity) return;
    confirm({
      title: "Remove from BD program",
      description: (
        <>
          Remove <strong className="text-foreground">{label}</strong> from
          the BD program? Their referral history is kept.
        </>
      ),
      onConfirm: async () => {
        await removeBdUser(entity.id);
        setEntity({ ...entity, isBd: false });
      },
    });
  };

  if (notFound) {
    return (
      <AdminShell
        header={
          <DetailPageHeader
            backHref="/dashboard/users"
            backLabel="Back to users"
            title="User not found"
          />
        }
      >
        <NotFoundCard />
      </AdminShell>
    );
  }

  if (error) {
    return (
      <AdminShell
        header={
          <DetailPageHeader
            backHref="/dashboard/users"
            backLabel="Back to users"
            title="Couldn't load user"
          />
        }
      >
        <Card>
          <CardContent className="flex flex-col items-center gap-3 py-12 text-center">
            <TriangleAlert className="size-6 text-red-300" />
            <p className="text-sm text-muted-foreground">{error.message}</p>
          </CardContent>
        </Card>
      </AdminShell>
    );
  }

  return (
    <AdminShell
      header={
        <DetailPageHeader
          backHref="/dashboard/users"
          backLabel="Back to users"
          loading={loading}
          title={label}
          badges={
            entity && (
              <>
                <Badge variant="muted">{humanize(entity.role)}</Badge>
                <Badge variant={entity.isActive ? "success" : "danger"}>
                  {entity.isActive ? "Active" : "Banned"}
                </Badge>
                {entity.isBd && <Badge variant="warning">BD</Badge>}
              </>
            )
          }
          actions={
            entity && (
              <Button variant="destructive" size="sm" onClick={handleDelete}>
                <Trash2 className="size-4" />
                Delete
              </Button>
            )
          }
        />
      }
    >
      {loading || !entity ? (
        <div className="space-y-4">
          <div className="h-40 animate-pulse rounded-xl bg-[var(--glass-2)]" />
          <div className="h-24 animate-pulse rounded-xl bg-[var(--glass-2)]" />
        </div>
      ) : (
        <div className="space-y-4">
          <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
            {/* Profile */}
            <Card>
              <CardHeader>
                <CardTitle>Profile</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-3 sm:grid-cols-2">
                  <InfoRow label="Username" value={entity.username ? `@${entity.username}` : "—"} />
                  <InfoRow label="Email" value={entity.email || "—"} />
                  <InfoRow label="Phone" value={entity.phone || "—"} />
                  <InfoRow label="Title" value={entity.title || "—"} />
                  <InfoRow
                    label="Onboarding"
                    value={entity.isCompleteOnboarding ? "Complete" : "Incomplete"}
                  />
                  <InfoRow label="User ID" value={entity.id} mono />
                </div>
                {entity.bio && (
                  <div>
                    <p className="text-xs font-bold uppercase text-muted-foreground">
                      Bio
                    </p>
                    <p className="mt-1 text-sm">{entity.bio}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Stats */}
            <Card>
              <CardHeader>
                <CardTitle>Progress</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-3 gap-3 text-center">
                  <Stat label="Level" value={entity.level} />
                  <Stat label="Streak" value={entity.streak} />
                  <Stat label="XP" value={entity.xp.toLocaleString()} />
                </div>
                <div>
                  <div className="mb-1 flex justify-between text-xs text-muted-foreground">
                    <span>XP to next level</span>
                    <span>
                      {entity.xp.toLocaleString()} / {entity.xpMax.toLocaleString()}
                    </span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-black/30">
                    <div
                      className="h-full rounded-full bg-primary"
                      style={{
                        width: `${entity.xpMax ? Math.min(100, (entity.xp / entity.xpMax) * 100) : 0}%`,
                      }}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap items-end gap-2">
                {entity.isActive && (
                  <div className="min-w-48 flex-1">
                    <FormField label="Ban reason" hint="Optional, shown in the audit log">
                      <Input
                        value={banReason}
                        onChange={(e) => setBanReason(e.target.value)}
                        placeholder="e.g. Spam / abuse"
                      />
                    </FormField>
                  </div>
                )}
                <Button
                  variant={entity.isActive ? "destructive" : "secondary"}
                  onClick={handleBan}
                >
                  <Ban className="size-4" />
                  {entity.isActive ? "Ban user" : "Unban user"}
                </Button>
                <Button variant="secondary" onClick={() => handleVerify(true)}>
                  <BadgeCheck className="size-4" />
                  Verify
                </Button>
                <Button variant="secondary" onClick={() => handleVerify(false)}>
                  Un-verify
                </Button>
                <Button variant="secondary" onClick={() => setShowXpDialog(true)}>
                  <Zap className="size-4" />
                  Adjust XP
                </Button>
                <Button variant="secondary" onClick={() => setShowAwardDialog(true)}>
                  <Award className="size-4" />
                  Award achievement
                </Button>
                {entity.isBd ? (
                  <Button variant="secondary" onClick={handleRemoveBd}>
                    <UserMinus className="size-4" />
                    Remove from BD
                  </Button>
                ) : (
                  <Button variant="secondary" onClick={handleAssignBd}>
                    <UserPlus className="size-4" />
                    Assign to BD
                  </Button>
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                Verification status isn&apos;t reported back by the API, so
                Verify/Un-verify are direct actions rather than a toggle.
              </p>
            </CardContent>
          </Card>

          {/* Achievements earned */}
          <AchievementsEarnedCard achievements={entity.achievements} />

          {/* BD program details */}
          {entity.isBd && <BdProgramCard user={entity} />}
        </div>
      )}

      <AwardAchievementDialog
        open={showAwardDialog}
        onOpenChange={setShowAwardDialog}
        userLabel={label}
        onAward={async (achievementId) => {
          await awardAchievement(id, achievementId);
        }}
      />
      <AdjustXpDialog
        open={showXpDialog}
        onOpenChange={setShowXpDialog}
        userLabel={label}
        onAdjust={async (amount, reason) => {
          const updated = await modifyUserXp(id, { amount, reason });
          setEntity(updated);
        }}
      />
    </AdminShell>
  );
}

function NotFoundCard() {
  return (
    <Card>
      <CardContent className="flex flex-col items-center gap-3 py-16 text-center">
        <div className="flex size-11 items-center justify-center rounded-full bg-secondary">
          <UserRound className="size-5 text-muted-foreground" />
        </div>
        <div className="space-y-1">
          <p className="text-sm font-bold">User not found</p>
          <p className="text-sm text-muted-foreground">
            It may have been deleted, or the link is out of date.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

function InfoRow({
  label,
  value,
  mono,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-lg border border-border bg-black/10 px-3 py-2">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span
        className={`truncate text-sm font-bold ${mono ? "font-mono text-xs" : ""}`}
        title={value}
      >
        {value}
      </span>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="rounded-lg border border-border bg-black/10 py-3">
      <p className="text-lg font-black">{value}</p>
      <p className="text-xs text-muted-foreground">{label}</p>
    </div>
  );
}

function AchievementsEarnedCard({
  achievements,
}: {
  achievements: AdminUser["achievements"];
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Achievements earned</CardTitle>
      </CardHeader>
      <CardContent>
        {achievements.length === 0 ? (
          <p className="py-4 text-center text-sm text-muted-foreground">
            No achievements earned yet.
          </p>
        ) : (
          <div className="grid gap-2 sm:grid-cols-2">
            {achievements.map((a) => (
              <div
                key={`${a.slug}-${a.earnedAt}`}
                className="flex items-center justify-between gap-3 rounded-lg border border-border bg-black/10 px-3 py-2"
              >
                <span className="truncate text-sm font-bold" title={a.slug}>
                  {humanize(a.slug)}
                </span>
                <span className="shrink-0 text-xs text-muted-foreground">
                  {formatDateTime(a.earnedAt)}
                </span>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

/**
 * BdUser-only fields (referralCode, invitedUsersCount, bdAssignedAt) aren't
 * present when the page was reached via the plain Users list (only the base
 * AdminUser shape is cached there). If they're missing, do one lightweight
 * lookup against the BD list before rendering — bounded to a single request,
 * not a full scan; if it comes up empty we just omit those fields.
 */
function BdProgramCard({ user }: { user: AdminUser }) {
  const [bdUser, setBdUser] = useState<BdUser | null>(
    "referralCode" in user ? (user as BdUser) : null,
  );

  useEffect(() => {
    if ("referralCode" in user) {
      setBdUser(user as BdUser);
      return;
    }
    let cancelled = false;
    fetchBdUsers({ limit: 20, offset: 0, q: user.username ?? undefined })
      .then((res) => {
        if (cancelled) return;
        const match = res.data.find((u) => u.id === user.id);
        if (match) {
          rememberEntity("users", match);
          setBdUser(match);
        }
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [user]);

  const invited = useInvitedUsers(user.id, { limit: 10, offset: 0 });

  return (
    <Card>
      <CardHeader>
        <CardTitle>BD program</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-3 sm:grid-cols-3">
          <InfoRow label="Referral code" value={bdUser?.referralCode || "—"} mono />
          <InfoRow
            label="Invited users"
            value={String(bdUser?.invitedUsersCount ?? "—")}
          />
          <InfoRow
            label="Assigned"
            value={bdUser ? formatDateTime(bdUser.bdAssignedAt) : "—"}
          />
        </div>

        <div>
          <p className="mb-2 text-xs font-bold uppercase text-muted-foreground">
            Invited users
          </p>
          {invited.loading ? (
            <div className="h-24 animate-pulse rounded-lg bg-[var(--glass-2)]" />
          ) : invited.users.length === 0 ? (
            <p className="rounded-lg border border-border bg-black/10 p-4 text-center text-sm text-muted-foreground">
              No one has used this referral code yet.
            </p>
          ) : (
            <div className="overflow-x-auto rounded-lg border border-white/5">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Joined</TableHead>
                    <TableHead>Referral code used</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {invited.users.map((u) => (
                    <TableRow key={u.id}>
                      <TableCell className="font-bold">{userLabel(u)}</TableCell>
                      <TableCell>{formatDateTime(u.joinedAt)}</TableCell>
                      <TableCell className="font-mono text-xs">
                        {u.usedReferralCode || "—"}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function AwardAchievementDialog({
  open,
  onOpenChange,
  userLabel: label,
  onAward,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userLabel: string;
  onAward: (achievementId: string) => Promise<void>;
}) {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [loadingList, setLoadingList] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open) return;
    setSelectedId(null);
    setError("");
    setLoadingList(true);
    fetchAchievements({ limit: 100 })
      .then((res) => setAchievements(res.data))
      .catch((err: unknown) => setError(getErrorMessage(err, "Failed to load achievements")))
      .finally(() => setLoadingList(false));
  }, [open]);

  const selected = achievements.find((a) => a.id === selectedId);

  const handleSubmit = async () => {
    if (!selectedId) return;
    setError("");
    setSubmitting(true);
    try {
      await onAward(selectedId);
      onOpenChange(false);
    } catch (err: unknown) {
      setError(getErrorMessage(err, "Failed to award the achievement"));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange} preventClose={submitting}>
      <Dialog.Header onClose={() => onOpenChange(false)} closeDisabled={submitting}>
        Award achievement
      </Dialog.Header>
      <Dialog.Body>
        {error && (
          <div className="mb-4 rounded-lg border border-red-300/25 bg-red-400/10 p-3 text-sm text-red-100">
            {error}
          </div>
        )}
        <p className="mb-3 text-sm text-muted-foreground">
          Choose an achievement to grant to{" "}
          <strong className="text-foreground">{label}</strong>.
        </p>
        {loadingList ? (
          <div className="space-y-2">
            {[0, 1, 2].map((i) => (
              <div key={i} className="h-12 animate-pulse rounded-lg bg-[var(--glass-2)]" />
            ))}
          </div>
        ) : (
          <div className="max-h-72 space-y-1.5 overflow-y-auto">
            {achievements.map((a) => (
              <button
                key={a.id}
                type="button"
                onClick={() => setSelectedId(a.id)}
                className={`flex w-full items-center justify-between gap-3 rounded-lg border px-3 py-2 text-left text-sm transition-colors ${
                  selectedId === a.id
                    ? "border-orange-300/40 bg-orange-400/10"
                    : "border-border bg-black/10 hover:bg-white/[0.04]"
                }`}
              >
                <span className="min-w-0 truncate font-bold">{a.title}</span>
                <Badge variant="muted">{a.xpEarned} XP</Badge>
              </button>
            ))}
          </div>
        )}
      </Dialog.Body>
      <Dialog.Footer>
        <div className="flex justify-end gap-2">
          <Button
            type="button"
            variant="secondary"
            onClick={() => onOpenChange(false)}
            disabled={submitting}
          >
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={!selected || submitting}>
            {submitting && <Loader2 className="size-4 animate-spin" />}
            {submitting
              ? "Awarding..."
              : selected
                ? `Award "${selected.title}"`
                : "Award"}
          </Button>
        </div>
      </Dialog.Footer>
    </Dialog>
  );
}

function AdjustXpDialog({
  open,
  onOpenChange,
  userLabel: label,
  onAdjust,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userLabel: string;
  onAdjust: (amount: number, reason?: string) => Promise<void>;
}) {
  const [amount, setAmount] = useState("0");
  const [reason, setReason] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (open) {
      setAmount("0");
      setReason("");
      setError("");
    }
  }, [open]);

  const parsed = Number(amount);
  const isValid = Number.isFinite(parsed) && parsed !== 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid) return;
    setError("");
    setSubmitting(true);
    try {
      await onAdjust(parsed, reason || undefined);
      onOpenChange(false);
    } catch (err: unknown) {
      setError(getErrorMessage(err, "Failed to adjust XP"));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange} preventClose={submitting}>
      <Dialog.Header onClose={() => onOpenChange(false)} closeDisabled={submitting}>
        Adjust XP
      </Dialog.Header>
      <Dialog.Body>
        {error && (
          <div className="mb-4 rounded-lg border border-red-300/25 bg-red-400/10 p-3 text-sm text-red-100">
            {error}
          </div>
        )}
        <form id="adjust-xp-form" onSubmit={handleSubmit} className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Grant or deduct XP for{" "}
            <strong className="text-foreground">{label}</strong>. Use a
            negative number to deduct.
          </p>
          <FormField label="Amount" required>
            <Input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="e.g. 100 or -50"
              required
            />
          </FormField>
          <FormField label="Reason" hint="Optional, shown in the audit log">
            <Input
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g. Manual correction"
            />
          </FormField>
        </form>
      </Dialog.Body>
      <Dialog.Footer>
        <div className="flex justify-end gap-2">
          <Button
            type="button"
            variant="secondary"
            onClick={() => onOpenChange(false)}
            disabled={submitting}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            form="adjust-xp-form"
            disabled={!isValid || submitting}
          >
            {submitting && <Loader2 className="size-4 animate-spin" />}
            {submitting
              ? "Applying..."
              : isValid
                ? `${parsed > 0 ? "Grant" : "Deduct"} ${Math.abs(parsed)} XP`
                : "Adjust XP"}
          </Button>
        </div>
      </Dialog.Footer>
    </Dialog>
  );
}
