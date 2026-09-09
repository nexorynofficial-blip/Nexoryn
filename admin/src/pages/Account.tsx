import { useEffect, useState } from "react";
import { KeyRound, ShieldCheck, Fingerprint, UserCog } from "lucide-react";
import { api, ApiRequestError } from "../lib/api";
import { useAuth } from "../hooks/useAuth";
import type { AdminAccount, PasskeyResult } from "../types";
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

function PasswordCard({ account }: { account: AdminAccount }) {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [passkey, setPasskey] = useState("");
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
      await api.post("/api/v1/admin/account/password", { currentPassword, newPassword, passkey });
      setDone(true);
      setCurrentPassword("");
      setNewPassword("");
      setConfirm("");
      setPasskey("");
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
        At least 12 characters, with a letter and a number. It's also checked against known breached
        passwords. You stay signed in on this device — everywhere else is signed out.
      </p>

      <ErrorBanner message={error} />

      {!account.hasPasskey && (
        <p className="mb-4 rounded-lg border border-amber-500/30 bg-amber-500/5 p-3 text-xs text-amber-300">
          Set up a passkey below first — changing your password needs it.
        </p>
      )}

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

        <Field label="Passkey" error={errors.passkey}>
          <Input
            type="password"
            value={passkey}
            onChange={(e) => setPasskey(e.target.value)}
            placeholder="From Account Settings"
            autoComplete="off"
            required
          />
        </Field>

        <div className="flex items-center gap-3">
          <Button
            type="submit"
            loading={saving}
            disabled={mismatch || !currentPassword || !newPassword || !passkey}
          >
            Change password
          </Button>
          {done && <span className="text-xs text-emerald-400">Password changed.</span>}
        </div>
      </form>
    </Card>
  );
}

/**
 * The action passkey — a second secret required to approve or reject a
 * finance request, and to change the account password. Generated once here
 * and shown exactly one time: the server keeps only a hash, so from this
 * point on it can only be regenerated, never displayed again.
 */
function PasskeyCard({ account, onChanged }: { account: AdminAccount; onChanged: () => void }) {
  const [revealed, setRevealed] = useState<string | null>(null);
  const [regenerating, setRegenerating] = useState(false);
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const reset = () => {
    setPassword("");
    setError("");
    setErrors({});
  };

  const generate = async () => {
    setBusy(true);
    reset();
    try {
      const result = await api.post<PasskeyResult>("/api/v1/admin/account/passkey/setup");
      setRevealed(result.passkey);
      onChanged();
    } catch (err) {
      setError(err instanceof ApiRequestError ? err.message : "Could not generate a passkey");
    } finally {
      setBusy(false);
    }
  };

  const regenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError("");
    setErrors({});
    try {
      const result = await api.post<PasskeyResult>("/api/v1/admin/account/passkey/regenerate", {
        password,
      });
      setRevealed(result.passkey);
      setRegenerating(false);
      reset();
      onChanged();
    } catch (err) {
      setErrors(fieldErrors(err));
      setError(err instanceof ApiRequestError ? err.message : "Could not regenerate your passkey");
    } finally {
      setBusy(false);
    }
  };

  return (
    <Card className="p-6 lg:col-span-2">
      <div className="mb-1 flex items-center gap-2">
        <Fingerprint className="h-4 w-4 text-accent-from" />
        <h2 className="text-sm font-semibold uppercase tracking-wide text-white/70">Passkey</h2>
        {account.hasPasskey && (
          <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-[10px] uppercase tracking-wide text-emerald-400">
            Set
          </span>
        )}
      </div>
      <p className="mb-5 text-xs leading-relaxed text-white/40">
        A second secret, separate from your password. Approving or rejecting a finance request, and
        changing your password, both ask for it — so a signed-in browser alone is never enough to move
        money or take over the account.
      </p>

      <ErrorBanner message={error} />

      {/* Shown exactly once, immediately after generating or regenerating. */}
      {revealed && (
        <div className="mb-5 rounded-xl border border-amber-500/30 bg-amber-500/5 p-4">
          <p className="mb-2 text-xs font-semibold text-amber-300">Save this passkey somewhere safe now.</p>
          <p className="mb-3 text-xs leading-relaxed text-white/50">
            This is the only time it will be shown — we store it scrambled and cannot show it again. If
            you lose it, come back here and regenerate a new one with your password.
          </p>
          <div className="rounded-lg bg-white/5 px-4 py-3 text-center font-mono text-lg tracking-wider text-white">
            {revealed}
          </div>
          <Button className="mt-4" onClick={() => setRevealed(null)}>
            I've saved it
          </Button>
        </div>
      )}

      {/* Regenerating */}
      {regenerating && !revealed && (
        <form onSubmit={regenerate} className="flex flex-col gap-4">
          <p className="text-xs leading-relaxed text-white/50">
            Confirm with your password. The current passkey stops working the moment the new one is
            generated.
          </p>
          <Field label="Password" error={errors.password}>
            <Input
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </Field>
          <div className="flex items-center gap-3">
            <Button type="submit" loading={busy} disabled={!password}>
              Regenerate passkey
            </Button>
            <button
              type="button"
              onClick={() => {
                setRegenerating(false);
                reset();
              }}
              className="text-xs text-white/40 transition hover:text-white/70"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Resting state */}
      {!regenerating && !revealed && (
        <div className="flex flex-wrap items-center gap-4">
          {account.hasPasskey ? (
            <>
              <Button onClick={() => setRegenerating(true)}>Regenerate passkey</Button>
              <span className="text-xs text-white/40">
                {account.passkeySetAt &&
                  `Set on ${new Date(account.passkeySetAt).toLocaleDateString()}`}
              </span>
            </>
          ) : (
            <>
              <Button onClick={generate} loading={busy}>
                Generate passkey
              </Button>
              <span className="text-xs text-white/40">
                Required before you can approve finance requests or change your password.
              </span>
            </>
          )}
        </div>
      )}
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
          <PasswordCard account={account} />

          <PasskeyCard account={account} onChanged={load} />

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
