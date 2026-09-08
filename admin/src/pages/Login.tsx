import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { Button, Card, ErrorBanner, Field, Input } from "../components/ui";
import { AmbientBackground } from "../components/AmbientBackground";
import { ApiRequestError } from "../lib/api";

export default function Login() {
  const { login, completeMfa } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Set once the password checks out on an account with two-factor enrolled.
  // Holding it here (rather than in storage) means an abandoned half-login
  // disappears with the page, as it should.
  const [mfaToken, setMfaToken] = useState<string | null>(null);
  const [code, setCode] = useState("");

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const result = await login(email, password);
      if (result.status === "mfa-required") {
        setMfaToken(result.mfaToken);
        return;
      }
      navigate("/", { replace: true });
    } catch (err) {
      setError(err instanceof ApiRequestError ? err.message : "Something went wrong. Try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleMfaSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await completeMfa(mfaToken!, code);
      navigate("/", { replace: true });
    } catch (err) {
      setError(err instanceof ApiRequestError ? err.message : "Something went wrong. Try again.");
      // A challenge token that has expired can't be retried — send them back to
      // the password step rather than leaving them typing codes at a dead form.
      if (err instanceof ApiRequestError && err.status === 401) {
        setMfaToken(null);
        setCode("");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-night px-4">
      <AmbientBackground />
      <Card className="relative z-10 w-full max-w-sm p-8">
        <div className="mb-6 text-center">
          <span className="font-heading text-xl font-bold tracking-tight text-white">
            NEX<span className="text-accent-from">ORYN</span>
          </span>
          <p className="mt-1 text-sm text-white/50">
            {mfaToken ? "Two-step verification" : "Admin sign in"}
          </p>
        </div>

        <ErrorBanner message={error} />

        {mfaToken ? (
          <form onSubmit={handleMfaSubmit} className="flex flex-col gap-4">
            <p className="text-xs leading-relaxed text-white/50">
              Enter the 6-digit code from your authenticator app. If you've lost your phone, one of
              your saved recovery codes works here instead.
            </p>
            <Field label="Verification code">
              <Input
                type="text"
                required
                autoFocus
                inputMode="numeric"
                autoComplete="one-time-code"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="123456"
              />
            </Field>
            <Button type="submit" loading={loading} className="mt-2 w-full">
              Verify
            </Button>
            <button
              type="button"
              onClick={() => {
                setMfaToken(null);
                setCode("");
                setError("");
              }}
              className="text-xs text-white/40 transition hover:text-white/70"
            >
              Back to sign in
            </button>
          </form>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <Field label="Email">
              <Input
                type="email"
                required
                autoFocus
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@nexoryn.ai"
              />
            </Field>
            <Field label="Password">
              <Input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
              />
            </Field>
            <Button type="submit" loading={loading} className="mt-2 w-full">
              Sign in
            </Button>
          </form>
        )}
      </Card>
    </div>
  );
}
