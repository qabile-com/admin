"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  Eye,
  EyeOff,
  Flame,
  Lock,
  Mail,
  Loader2,
  ArrowLeft,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/hooks/use-auth";
import apiClient from "@/lib/api-client";

// ─── Types ────────────────────────────────────
type LoginMode = "password" | "otp" | "forgot";

interface LoginResponse {
  mode?: "otp";
  success: boolean;
  message?: string;
  accessToken?: string;
  refreshToken?: string;
  expiresAt?: string;
  user?: {
    id: string;
    name: string;
    email: string | null;
    role: string;
  };
}

export function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();

  // Default to OTP mode
  const [activeMode, setActiveMode] = useState<LoginMode>("otp");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState("");
  const [forgotStep, setForgotStep] = useState<"request" | "verify" | "reset">(
    "request",
  );
  const [verificationToken, setVerificationToken] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const resetAll = () => {
    setEmail("");
    setPassword("");
    setOtpCode("");
    setNewPassword("");
    setConfirmPassword("");
    setError("");
    setOtpSent(false);
    setVerificationToken("");
    setForgotStep("request");
  };

  // ─── Password Login ──────────────────────
  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const response = await apiClient.post<LoginResponse>(
        "/api/v1/auth/login",
        { email, password },
      );
      const data = response.data;

      if (data.mode === "otp") {
        setOtpSent(true);
        setActiveMode("otp");
      } else if (data.accessToken && data.refreshToken) {
        login(data.accessToken, data.refreshToken, data.user ?? null);
        router.push("/dashboard");
      } else {
        setError("Unexpected response");
      }
    } catch (err: unknown) {
      setError(
        (err as any)?.response?.data?.message ||
          "Login failed. Check credentials.",
      );
    } finally {
      setLoading(false);
    }
  };

  // ─── Email OTP (request) ────────────────
  const handleRequestOtp = async () => {
    setError("");
    setLoading(true);
    try {
      await apiClient.post("/api/v1/auth/otp/request", { email });
      setOtpSent(true);
    } catch (err: unknown) {
      setError((err as any)?.response?.data?.message || "Failed to send OTP.");
    } finally {
      setLoading(false);
    }
  };

  // ─── Email OTP (verify) ─────────────────
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const response = await apiClient.post<LoginResponse>(
        "/api/v1/auth/otp/verify",
        { email, code: otpCode },
      );
      const data = response.data;
      if (data.accessToken && data.refreshToken) {
        login(data.accessToken, data.refreshToken, data.user ?? null);
        router.push("/dashboard");
      } else {
        setError("OTP verification failed");
      }
    } catch (err: unknown) {
      setError((err as any)?.response?.data?.message || "Invalid OTP code.");
    } finally {
      setLoading(false);
    }
  };

  // ─── Forgot Password (request OTP) ──────
  const handleForgotRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await apiClient.post("/api/v1/auth/password/forgot/request", { email });
      setForgotStep("verify");
    } catch (err: unknown) {
      setError(
        (err as any)?.response?.data?.message || "Failed to send reset OTP.",
      );
    } finally {
      setLoading(false);
    }
  };

  // ─── Forgot Password (verify OTP) ───────
  const handleForgotVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const response = await apiClient.post<{ verificationToken: string }>(
        "/api/v1/auth/password/forgot/verify",
        { email, code: otpCode },
      );
      setVerificationToken(response.data.verificationToken);
      setForgotStep("reset");
    } catch (err: unknown) {
      setError((err as any)?.response?.data?.message || "Invalid OTP code.");
    } finally {
      setLoading(false);
    }
  };

  // ─── Forgot Password (reset password) ────
  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    setError("");
    setLoading(true);
    try {
      await apiClient.post("/api/v1/auth/password/reset", {
        verificationToken,
        password: newPassword,
        passwordConfirmation: confirmPassword,
      });
      resetAll();
      setActiveMode("password"); // after reset, go to password login
    } catch (err: unknown) {
      setError(
        (err as any)?.response?.data?.message || "Password reset failed.",
      );
    } finally {
      setLoading(false);
    }
  };

  // ─── UI ──────────────────────────────────
  return (
    <main className="grid min-h-dvh lg:grid-cols-[1.05fr_0.95fr]">
      {/* Left Hero Section */}
      <section className="relative hidden overflow-hidden border-r lg:block">
        <Image
          src="/assets/hero-phoenix.webp"
          alt="Qabile phoenix artwork"
          fill
          className="object-cover opacity-70"
          priority
          sizes="50vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/55 to-transparent" />
        <div className="absolute bottom-10 left-10 max-w-lg">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border bg-black/30 px-3 py-1 text-xs font-bold text-orange-100 backdrop-blur">
            <Flame className="size-3.5" />
            Qabile control room
          </div>
          <h1 className="text-4xl font-black leading-tight">
            Calm tools for a growing{" "}
            <span className="fire-text">phoenix tribe</span>.
          </h1>
          <p className="mt-4 text-sm leading-7 text-muted-foreground">
            A focused foundation for admins, ready for authentication, users,
            courses, and the next endpoints.
          </p>
        </div>
      </section>

      {/* Right Login Form */}
      <section className="flex items-center justify-center px-4 py-10">
        <Card className="w-full max-w-md">
          <CardHeader>
            <div className="mb-5 flex items-center gap-3">
              <Image
                src="/assets/phoenix_badge.webp"
                alt="Qabile phoenix badge"
                width={44}
                height={44}
                className="rounded-lg"
              />
              <div>
                <CardTitle>Admin login</CardTitle>
                <CardDescription>
                  {activeMode === "forgot"
                    ? "Reset your password"
                    : activeMode === "otp"
                      ? otpSent
                        ? "Enter the OTP sent to your email"
                        : "Request an OTP to continue"
                      : "Enter your credentials"}
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {/* Mode Tabs (only when not in forgot flow) */}
            {activeMode !== "forgot" && (
              <TabsList className="mb-6">
                <TabsTrigger
                  active={activeMode === "otp"}
                  onClick={() => {
                    setActiveMode("otp");
                    resetAll();
                  }}
                >
                  Email OTP
                </TabsTrigger>
                <TabsTrigger
                  active={activeMode === "password"}
                  onClick={() => {
                    setActiveMode("password");
                    resetAll();
                  }}
                >
                  Password
                </TabsTrigger>
              </TabsList>
            )}

            {/* ─── Password Login Form ─────── */}
            {activeMode === "password" && (
              <form onSubmit={handlePasswordLogin} className="space-y-4">
                <label className="block space-y-2">
                  <span className="text-sm font-bold">Email</span>
                  <div className="relative">
                    <Mail className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      className="pl-10"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      type="email"
                      autoComplete="email"
                      required
                    />
                  </div>
                </label>
                <label className="block space-y-2">
                  <span className="text-sm font-bold">Password</span>
                  <div className="relative">
                    <Lock className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      className="px-10"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      type={showPassword ? "text" : "password"}
                      autoComplete="current-password"
                      required
                    />
                    <button
                      type="button"
                      aria-label={
                        showPassword ? "Hide password" : "Show password"
                      }
                      onClick={() => setShowPassword((v) => !v)}
                      className="absolute right-1 top-1/2 flex size-9 -translate-y-1/2 items-center justify-center rounded-md text-muted-foreground hover:bg-secondary hover:text-foreground"
                    >
                      {showPassword ? (
                        <EyeOff className="size-4" />
                      ) : (
                        <Eye className="size-4" />
                      )}
                    </button>
                  </div>
                </label>

                {error && <ErrorBox>{error}</ErrorBox>}

                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? (
                    <Loader2 className="animate-spin size-4 mr-2" />
                  ) : null}
                  {loading ? "Signing in..." : "Login"}
                </Button>

                <p className="text-center text-sm text-muted-foreground">
                  <button
                    type="button"
                    className="underline hover:text-foreground"
                    onClick={() => {
                      setActiveMode("forgot");
                      setForgotStep("request");
                      resetAll();
                    }}
                  >
                    Forgot password?
                  </button>
                </p>
              </form>
            )}

            {/* ─── Email OTP Form ──────────── */}
            {activeMode === "otp" && (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (!otpSent) {
                    handleRequestOtp();
                  } else {
                    handleVerifyOtp(e);
                  }
                }}
                className="space-y-4"
              >
                <label className="block space-y-2">
                  <span className="text-sm font-bold">Email</span>
                  <div className="relative">
                    <Mail className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      className="pl-10"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      type="email"
                      autoComplete="email"
                      required
                      readOnly={otpSent}
                      disabled={otpSent}
                    />
                  </div>
                </label>

                {otpSent && (
                  <label className="block space-y-2">
                    <span className="text-sm font-bold">OTP Code</span>
                    <Input
                      value={otpCode}
                      onChange={(e) => setOtpCode(e.target.value)}
                      placeholder="6-digit code"
                      required
                    />
                  </label>
                )}

                {error && <ErrorBox>{error}</ErrorBox>}

                <Button
                  type="submit"
                  className="w-full"
                  disabled={loading || !email}
                >
                  {loading ? (
                    <Loader2 className="animate-spin size-4 mr-2" />
                  ) : null}
                  {!otpSent
                    ? "Send OTP"
                    : loading
                      ? "Verifying..."
                      : "Verify OTP"}
                </Button>
              </form>
            )}

            {/* ─── Forgot Password Flow ────── */}
            {activeMode === "forgot" && (
              <div className="space-y-4">
                <button
                  type="button"
                  onClick={() => {
                    setActiveMode("password");
                    resetAll();
                  }}
                  className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
                >
                  <ArrowLeft className="size-4" /> Back to login
                </button>

                {forgotStep === "request" && (
                  <form onSubmit={handleForgotRequest} className="space-y-4">
                    <label className="block space-y-2">
                      <span className="text-sm font-bold">Email</span>
                      <Input
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        type="email"
                        autoComplete="email"
                        required
                      />
                    </label>
                    {error && <ErrorBox>{error}</ErrorBox>}
                    <Button type="submit" className="w-full" disabled={loading}>
                      {loading ? (
                        <Loader2 className="animate-spin size-4 mr-2" />
                      ) : null}
                      Send reset OTP
                    </Button>
                  </form>
                )}

                {forgotStep === "verify" && (
                  <form onSubmit={handleForgotVerify} className="space-y-4">
                    <p className="text-sm text-muted-foreground">
                      Enter the OTP sent to {email}
                    </p>
                    <Input
                      value={otpCode}
                      onChange={(e) => setOtpCode(e.target.value)}
                      placeholder="6-digit code"
                      required
                    />
                    {error && <ErrorBox>{error}</ErrorBox>}
                    <Button type="submit" className="w-full" disabled={loading}>
                      {loading ? (
                        <Loader2 className="animate-spin size-4 mr-2" />
                      ) : null}
                      Verify OTP
                    </Button>
                  </form>
                )}

                {forgotStep === "reset" && (
                  <form onSubmit={handlePasswordReset} className="space-y-4">
                    <label className="block space-y-2">
                      <span className="text-sm font-bold">New Password</span>
                      <Input
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        required
                      />
                    </label>
                    <label className="block space-y-2">
                      <span className="text-sm font-bold">
                        Confirm Password
                      </span>
                      <Input
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                      />
                    </label>
                    {error && <ErrorBox>{error}</ErrorBox>}
                    <Button type="submit" className="w-full" disabled={loading}>
                      {loading ? (
                        <Loader2 className="animate-spin size-4 mr-2" />
                      ) : null}
                      Reset Password
                    </Button>
                  </form>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </section>
    </main>
  );
}

function ErrorBox({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-red-300/25 bg-red-400/10 p-3 text-sm text-red-100">
      {children}
    </div>
  );
}
