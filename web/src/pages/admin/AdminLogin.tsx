import { FormEvent, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { api } from "../../api/client";
import { ErrorState } from "../../components/States";

export function AdminLogin() {
  const navigate = useNavigate();
  const location = useLocation();
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      const result = await api.login(password);
      localStorage.setItem("admin_token", result.token);
      navigate((location.state as { from?: string } | null)?.from || "/admin", { replace: true });
    } catch (reason) {
      setError((reason as Error).message);
    } finally {
      setBusy(false);
    }
  };
  return (
    <div className="mx-auto flex min-h-screen max-w-md items-center px-5">
      <form
        onSubmit={submit}
        className="w-full rounded-theme border border-border bg-surface p-7 shadow-card"
      >
        <p className="text-sm uppercase tracking-[.18em] text-accent">Admin</p>
        <h1 className="mt-3 font-display text-3xl font-bold">Sign in</h1>
        <label className="mt-8 block text-sm text-muted" htmlFor="password">
          Password
        </label>
        <input
          required
          autoFocus
          id="password"
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          className="mt-2 w-full rounded-theme border border-border bg-bg px-3 py-3 text-fg"
        />
        {error && <ErrorState message={error} />}
        <button
          disabled={busy}
          type="submit"
          className="mt-5 w-full rounded-theme bg-accent px-4 py-3 font-medium text-on-accent disabled:opacity-50"
        >
          {busy ? "Signing in…" : "Sign in"}
        </button>
      </form>
    </div>
  );
}
