import { useEffect, useState } from "react";
import { KeyRound, ShieldCheck, Smartphone, UserCog } from "lucide-react";
import { api, ApiRequestError } from "../lib/api";
import { useAuth } from "../hooks/useAuth";
import type { AdminAccount, MfaEnableResult, MfaSetup } from "../types";
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
        At least 12 characters, with a letter and a number. It's also checked against known breached
        passwords. You stay signed in on this device — everywhere else is signed out.
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

/**
 * Two-factor enrolment and removal.
 *
 * Enrolment is deliberately two steps — /mfa/setup hands back a secret but
 * leaves the account unprotected until /mfa/enable proves a working code. That
 * way closing this page halfway through cannot lock anyone out of their own
 * account.
 */
function TwoFactorCard({ account, onChanged }: { account: AdminAccount; onChanged: () => void }) {
  const [setup, setSetup] = useState<MfaSetup | null>(null);
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [recoveryCodes, setRecoveryCodes] = useState<string[] | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [disabling, setDisabling] = useState(false);

  const reset = () => {
    setCode("");
    setPassword("");
    setError("");
    setErrors({});
  };

  const beginSetup = async () => {
    setBusy(true);
    reset();
    try {
      setSetup(await api.post<MfaSetup>("/api/v1/admin/account/mfa/setup"));
    } catch (err) {
      setError(err instanceof ApiRequestError ? err.message : "Could not start setup");
    } finally {
      setBusy(false);
    }
  };

  const confirmSetup = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError("");
    setErrors({});
    try {
      const result = await api.post<MfaEnableResult>("/api/v1/admin/account/mfa/enable", { code });
      // Shown once and never retrievable again — the server stores only hashes.
      setRecoveryCodes(result.recoveryCodes);
      setSetup(null);
      setCode("");
      onChanged();
    } catch (err) {
      setErrors(fieldErrors(err));
      setError(err instanceof ApiRequestError ? err.message : "Could not turn on two-step");
    } finally {
      setBusy(false);
    }
  };

  const disable = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError("");
    setErrors({});
    try {
      await api.post("/api/v1/admin/account/mfa/disable", { password, code });
      setDisabling(false);
      reset();
      onChanged();
    } catch (err) {
      setErrors(fieldErrors(err));
      setError(err instanceof ApiRequestError ? err.message : "Could not turn off two-step");
    } finally {
      setBusy(false);
    }
  };

  return (
    <Card className="p-6 lg:col-span-2">
      <div className="mb-1 flex items-center gap-2">
        <Smartphone className="h-4 w-4 text-accent-from" />
        <h2 className="text-sm font-semibold uppercase tracking-wide text-white/70">
          Two-step verification
        </h2>
        {account.mfaEnabled && (
          <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-[10px] uppercase tracking-wide text-emerald-400">
            On
          </span>
        )}
      </div>
      <p className="mb-5 text-xs leading-relaxed text-white/40">
        Asks for a 6-digit code from your phone after your password. It means a stolen or guessed
        password isn't enough on its own to reach the ledger or customer details.
      </p>

      <ErrorBanner message={error} />

      {/* Recovery codes — displayed once, immediately after enrolling. */}
      {recoveryCodes && (
        <div className="mb-5 rounded-xl border border-amber-500/30 bg-amber-500/5 p-4">
          <p className="mb-2 text-xs font-semibold text-amber-300">
            Save these recovery codes somewhere safe now.
          </p>
          <p className="mb-3 text-xs leading-relaxed text-white/50">
            Each one works once, in place of your phone. This is the only time they'll be shown —
            we store them scrambled and cannot show them again.
          </p>
          <div className="grid grid-cols-2 gap-2 font-mono text-xs text-white sm:grid-cols-5">
            {recoveryCodes.map((c) => (
              <span key={c} className="rounded bg-white/5 px-2 py-1 text-center">
                {c}
              </span>
            ))}
          </div>
          <Button className="mt-4" onClick={() => setRecoveryCodes(null)}>
            I've saved them
          </Button>
        </div>
      )}

      {/* Enrolment in progress */}
      {setup && (
        <form onSubmit={confirmSetup} className="flex flex-col gap-4">
          <p className="text-xs leading-relaxed text-white/50">
            In your authenticator app (Google Authenticator, 1Password, Authy…), add an account and
            enter this key, then type the code it shows to confirm.
          </p>
          <div className="rounded-xl border border-white/10 bg-white/5 p-4">
            <div className="text-[11px] uppercase tracking-wide text-white/40">Setup key</div>
            <div className="mt-1 break-all font-mono text-sm text-white">{setup.secret}</div>
          </div>
          <Field label="Code from your app" error={errors.code}>
            <Input
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="123456"
              required
            />
          </Field>
          <div className="flex items-center gap-3">
            <Button type="submit" loading={busy} disabled={!code}>
              Turn on two-step
            </Button>
            <button
              type="button"
              onClick={() => {
                setSetup(null);
                reset();
              }}
              className="text-xs text-white/40 transition hover:text-white/70"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Turning it off */}
      {disabling && (
        <form onSubmit={disable} className="flex flex-col gap-4">
          <p className="text-xs leading-relaxed text-white/50">
            Confirm with your password and a current code. Both are required so that someone who has
            only got hold of your signed-in browser can't quietly remove this.
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
          <Field label="Code from your app" error={errors.code}>
            <Input
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="123456"
              required
            />
          </Field>
          <div className="flex items-center gap-3">
            <Button type="submit" loading={busy} disabled={!password || !code}>
              Turn off two-step
            </Button>
            <button
              type="button"
              onClick={() => {
                setDisabling(false);
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
      {!setup && !disabling && (
        <div className="flex flex-wrap items-center gap-4">
          {account.mfaEnabled ? (
            <>
              <Button onClick={() => setDisabling(true)}>Turn off</Button>
              <span className="text-xs text-white/40">
                {account.recoveryCodesRemaining} recovery{" "}
                {account.recoveryCodesRemaining === 1 ? "code" : "codes"} left
                {account.mfaEnabledAt &&
                  ` · on since ${new Date(account.mfaEnabledAt).toLocaleDateString()}`}
              </span>
            </>
          ) : (
            <>
              <Button onClick={beginSetup} loading={busy}>
                Set up two-step
              </Button>
              <span className="text-xs text-white/40">Recommended — takes about a minute.</span>
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
          <PasswordCard />

          <TwoFactorCard account={account} onChanged={load} />

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
