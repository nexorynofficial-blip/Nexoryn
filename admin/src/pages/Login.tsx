import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { Button, Card, ErrorBanner, Field, Input } from "../components/ui";
import { AmbientBackground } from "../components/AmbientBackground";
import { ApiRequestError } from "../lib/api";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(email, password);
      navigate("/", { replace: true });
    } catch (err) {
      setError(err instanceof ApiRequestError ? err.message : "Something went wrong. Try again.");
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
          <p className="mt-1 text-sm text-white/50">Admin sign in</p>
        </div>

        <ErrorBanner message={error} />

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
      </Card>
    </div>
  );
}
