"use client";

import { useMemo, useState } from "react";
import {
  BellRing,
  CheckCircle2,
  Loader2,
  Plus,
  Send,
  TriangleAlert,
  X,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { SwitchField } from "@/components/ui/switch";
import { useConfirm } from "@/components/ui/confirm-dialog";
import { useNotifications } from "@/hooks/use-notifications";
import { cn } from "@/lib/utils";

export function SendNotificationCard() {
  const { send, sending, error, result, reset } = useNotifications();
  const confirm = useConfirm();

  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [sendToAll, setSendToAll] = useState(false);
  const [userIdsRaw, setUserIdsRaw] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [link, setLink] = useState("");
  const [dataPairs, setDataPairs] = useState<{ key: string; value: string }[]>(
    [],
  );
  const [validationError, setValidationError] = useState("");

  const userIds = useMemo(
    () =>
      userIdsRaw
        .split(/[\s,\n]+/)
        .map((id) => id.trim())
        .filter(Boolean),
    [userIdsRaw],
  );

  const canSubmit =
    title.trim() && body.trim() && (sendToAll || userIds.length > 0);

  const addPair = () =>
    setDataPairs((prev) => [...prev, { key: "", value: "" }]);

  const updatePair = (index: number, field: "key" | "value", value: string) =>
    setDataPairs((prev) =>
      prev.map((pair, i) => (i === index ? { ...pair, [field]: value } : pair)),
    );

  const removePair = (index: number) =>
    setDataPairs((prev) => prev.filter((_, i) => i !== index));

  const requestSend = (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError("");
    reset();

    if (!sendToAll && userIds.length === 0) {
      setValidationError(
        "Add at least one user id, or turn on “Send to everyone”.",
      );
      return;
    }

    const data = dataPairs.reduce<Record<string, string>>((acc, pair) => {
      if (pair.key.trim()) acc[pair.key.trim()] = pair.value;
      return acc;
    }, {});

    const payload = {
      title: title.trim(),
      body: body.trim(),
      sendToAll: sendToAll || undefined,
      userIds: sendToAll ? undefined : userIds,
      imageUrl: imageUrl.trim() || null,
      link: link.trim() || null,
      data: Object.keys(data).length ? data : undefined,
    };

    confirm({
      title: sendToAll ? "Send to everyone" : "Send notification",
      description: sendToAll ? (
        <>
          This sends{" "}
          <strong className="text-foreground">&quot;{payload.title}&quot;</strong>{" "}
          to every registered device token in the system, right now. There is
          no way to recall it once sent.
        </>
      ) : (
        <>
          Send{" "}
          <strong className="text-foreground">&quot;{payload.title}&quot;</strong>{" "}
          to {userIds.length} recipient{userIds.length === 1 ? "" : "s"}?
        </>
      ),
      variant: "destructive",
      confirmLabel: sendToAll ? "Send to everyone" : "Send notification",
      requireTypedConfirmation: sendToAll ? "SEND" : undefined,
      onConfirm: async () => {
        // Keep the composed message afterward so it can be tweaked and resent.
        await send(payload);
      },
    });
  };

  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-lg bg-orange-400/10 text-orange-100">
              <BellRing className="size-5" />
            </div>
            <div>
              <CardTitle>Send push notification</CardTitle>
              <p className="mt-0.5 text-xs text-muted-foreground">
                Delivered to registered device tokens
              </p>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <form onSubmit={requestSend} className="space-y-5">
            <label className="space-y-2">
              <span className="text-sm font-bold">Title</span>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="A short, punchy headline"
                maxLength={120}
                required
              />
            </label>

            <label className="space-y-2">
              <span className="text-sm font-bold">Body</span>
              <Textarea
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder="What do you want members to know?"
                rows={4}
                required
              />
              <p className="text-xs text-muted-foreground">
                {body.length} characters
              </p>
            </label>

            <SwitchField
              label="Send to everyone"
              description="Targets every registered push token in the system."
              checked={sendToAll}
              onCheckedChange={setSendToAll}
            />

            <div
              className={cn(
                "space-y-2 transition-opacity",
                sendToAll && "pointer-events-none opacity-50",
              )}
            >
              <label className="text-sm font-bold" htmlFor="notif-user-ids">
                Recipient user IDs
              </label>
              <Textarea
                id="notif-user-ids"
                value={userIdsRaw}
                onChange={(e) => setUserIdsRaw(e.target.value)}
                disabled={sendToAll}
                rows={3}
                placeholder="Paste user IDs separated by commas, spaces, or new lines"
              />
              <p className="text-xs text-muted-foreground">
                {sendToAll
                  ? "Ignored while “Send to everyone” is on."
                  : `${userIds.length} recipient${userIds.length === 1 ? "" : "s"}`}
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="space-y-2">
                <span className="text-sm font-bold">Image URL</span>
                <Input
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="Optional"
                />
              </label>
              <label className="space-y-2">
                <span className="text-sm font-bold">Deep link</span>
                <Input
                  value={link}
                  onChange={(e) => setLink(e.target.value)}
                  placeholder="Optional"
                />
              </label>
            </div>

            {/* Custom data payload */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold">Custom data</span>
                <Button
                  type="button"
                  size="sm"
                  variant="secondary"
                  onClick={addPair}
                >
                  <Plus className="size-4" />
                  Add field
                </Button>
              </div>
              {dataPairs.length === 0 ? (
                <p className="rounded-lg border border-border bg-black/10 p-3 text-xs text-muted-foreground">
                  Optional key/value pairs delivered alongside the push.
                </p>
              ) : (
                <div className="space-y-2">
                  {dataPairs.map((pair, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <Input
                        value={pair.key}
                        onChange={(e) =>
                          updatePair(index, "key", e.target.value)
                        }
                        placeholder="key"
                      />
                      <Input
                        value={pair.value}
                        onChange={(e) =>
                          updatePair(index, "value", e.target.value)
                        }
                        placeholder="value"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        aria-label={`Remove field ${index + 1}`}
                        onClick={() => removePair(index)}
                      >
                        <X className="size-4 text-red-300" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {(validationError || error) && (
              <div className="flex items-start gap-2 rounded-lg border border-red-300/25 bg-red-400/10 p-3 text-sm text-red-100">
                <TriangleAlert className="mt-0.5 size-4 shrink-0" />
                <span>{validationError || error?.message}</span>
              </div>
            )}

            <div className="flex items-center justify-end gap-3 border-t border-border pt-4">
              {sendToAll && (
                <span className="mr-auto text-xs font-bold text-accent">
                  This will notify every user.
                </span>
              )}
              <Button type="submit" disabled={!canSubmit || sending}>
                {sending ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <Send className="size-4" />
                )}
                {sending ? "Sending..." : "Send notification"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Preview + last dispatch result */}
      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Preview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="rounded-xl border border-border bg-black/30 p-3">
              <div className="flex gap-3">
                <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-orange-400/15">
                  <BellRing className="size-4 text-orange-100" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-bold">
                    {title || "Notification title"}
                  </p>
                  <p className="mt-0.5 line-clamp-3 text-xs text-muted-foreground">
                    {body || "Your message body will appear here."}
                  </p>
                </div>
              </div>
            </div>
            <p className="mt-3 text-xs text-muted-foreground">
              {sendToAll
                ? "Audience: everyone"
                : `Audience: ${userIds.length} selected user${userIds.length === 1 ? "" : "s"}`}
            </p>
          </CardContent>
        </Card>

        {result && (
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="size-4 text-emerald-300" />
                <CardTitle className="text-sm">Last dispatch</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <ResultRow
                label="Requested users"
                value={result.requestedUsersCount ?? "All"}
              />
              <ResultRow
                label="Targeted tokens"
                value={result.targetedTokensCount}
              />
              <ResultRow
                label="Delivered"
                value={result.successCount}
                tone="success"
              />
              <ResultRow
                label="Failed"
                value={result.failureCount}
                tone={result.failureCount > 0 ? "danger" : undefined}
              />
              <ResultRow
                label="Invalid tokens removed"
                value={result.removedInvalidTokensCount}
              />
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

function ResultRow({
  label,
  value,
  tone,
}: {
  label: string;
  value: number | string;
  tone?: "success" | "danger";
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-muted-foreground">{label}</span>
      {tone ? (
        <Badge variant={tone}>{value}</Badge>
      ) : (
        <span className="font-bold">{value}</span>
      )}
    </div>
  );
}
