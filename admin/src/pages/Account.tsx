import { useEffect, useState } from "react";
import { KeyRound, ShieldCheck, UserCog } from "lucide-react";
import { api, ApiRequestError } from "../lib/api";
import { useAuth } from "../hooks/useAuth";
import type { AdminAccount } from "../types";
import { Button, Card, ErrorBanner, Field, Input, PageHeader, Spinner } from "../components/ui";

/** Zod field errors come back keyed by field name; surface them inline. */
function fieldErrors(err: unknown): Record<string, string> {
  return err instanceof ApiRequestError && err.fields ? err.fields : {};
}

function ProfileCard({ account, onSaved }: { account: AdminAccount; onSaved: () => void }) {
  const [name, setName] = useState(account.name);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saved, setSaved] = useState(false);

  const dirty = name.trim() !== account.name;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    setErrors({});
    setSaved(false);
    try {
      await api.patch("/api/v1/admin/account", { name: name.trim() });
      setSaved(true);
      onSaved();
    } catch (err) {
      setErrors(fieldErrors(err));
      setError(err instanceof ApiRequestError ? err.message : "Could not save your name");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card className="p-6">
      <div className="mb-1 flex items-center gap-2">
        <UserCog className="h-4 w-4 text-accent-from" />
        <h2 className="text-sm font-semibold uppercase tracking-wide text-white/70">Profile</h2>
      </div>
      <p className="mb-5 text-xs text-white/40">
        Your display name, shown in the sidebar and on entries you log.
      </p>

      <ErrorBanner message={error} />

      <form onSubmit={submit} className="flex flex-col gap-4">
        <Field label="Display name" error={errors.name}>
          <Input value={name} onChange={(e) => setName(e.target.value)} required maxLength={120} />
        </Field>

        <Field label="Email">
          <Input value={account.email} disabled />
        </Field>

        <div className="flex items-center gap-3">
          <Button type="submit" loading={saving} disabled={!dirty}>
            Save name
          </Button>
          {saved && !dirty && <span className="text-xs text-emerald-400">Saved.</span>}
        </div>
      </form>
    </Card>
  );
}

function PasswordCard() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [done, setDone] = useState(false);

  const mismatch = confirm.length > 0 && confirm !== newPassword;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (mismatch) return;
    setSaving(true);
    setError("");
    setErrors({});
    setDone(false);
    try {
      await api.post("/api/v1/admin/account/password", { currentPassword, newPassword });
      setDone(true);
      setCurrentPassword("");
      setNewPassword("");
      setConfirm("");
    } catch (err) {
      setErrors(fieldErrors(err));
      setError(err instanceof ApiRequestError ? err.message : "Could not change your password");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card className="p-6">
      <div className="mb-1 flex items-center gap-2">
        <KeyRound className="h-4 w-4 text-accent-from" />
        <h2 className="text-sm font-semibold uppercase tracking-wide text-white/70">Password</h2>
      </div>
      <p className="mb-5 text-xs text-white/40">
        At least 8 characters, with a letter and a number. You stay signed in on this device.
      </p>

      <ErrorBanner message={error} />

      <form onSubmit={submit} className="flex flex-col gap-4">
        <Field label="Current password" error={errors.currentPassword}>
          <Input
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            autoComplete="current-password"
            required
          />
        </Field>

        <Field label="New password" error={errors.newPassword}>
          <Input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            autoComplete="new-password"
            required
          />
        </Field>

        <Field label="Confirm new password" error={mismatch ? "Passwords don't match" : undefined}>
          <Input
            type="password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            autoComplete="new-password"
            required
          />
        </Field>

        <div className="flex items-center gap-3">
          <Button type="submit" loading={saving} disabled={mismatch || !currentPassword || !newPassword}>
            Change password
          </Button>
          {done && <span className="text-xs text-emerald-400">Password changed.</span>}
        </div>
      </form>
    </Card>
  );
}

export default function Account() {
  const { refresh } = useAuth();
  const [account, setAccount] = useState<AdminAccount | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = () => {
    setLoading(true);
    api
      .get<AdminAccount>("/api/v1/admin/account")
      .then(setAccount)
      .catch((err) => setError(err instanceof ApiRequestError ? err.message : "Failed to load your account"))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  return (
    <div>
      <PageHeader title="My Account" description="Your login details and password." />
      <ErrorBanner message={error} />

      {loading ? (
        <Spinner />
      ) : !account ? null : (
        <div className="grid gap-6 lg:grid-cols-2">
          <ProfileCard
            account={account}
            onSaved={() => {
              load();
              void refresh();
            }}
          />
          <PasswordCard />

          <Card className="p-6 lg:col-span-2">
            <div className="mb-1 flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-accent-from" />
              <h2 className="text-sm font-semibold uppercase tracking-wide text-white/70">Finance identity</h2>
            </div>
            <p className="mb-4 text-xs text-white/40">
              Set when your account was created and deliberately not editable — every investment, debt and
              approval you have is tied to it. Renaming yourself above is safe precisely because this
              doesn't move.
            </p>
            <dl className="grid gap-4 sm:grid-cols-3">
              <div>
                <dt className="text-[11px] uppercase tracking-wide text-white/40">Ledger identity</dt>
                <dd className="text-sm text-white">{account.partnerName ?? "Not a partner account"}</dd>
              </div>
              <div>
                <dt className="text-[11px] uppercase tracking-wide text-white/40">Account created</dt>
                <dd className="text-sm text-white">{new Date(account.createdAt).toLocaleDateString()}</dd>
              </div>
              <div>
                <dt className="text-[11px] uppercase tracking-wide text-white/40">Last sign-in</dt>
                <dd className="text-sm text-white">
                  {account.lastLoginAt ? new Date(account.lastLoginAt).toLocaleString() : "—"}
                </dd>
              </div>
            </dl>
          </Card>
        </div>
      )}
    </div>
  );
}
