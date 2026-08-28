import { Link, Outlet, useNavigate } from "react-router-dom";

export function AdminLayout() {
  const navigate = useNavigate();
  const signOut = () => { localStorage.removeItem("admin_token"); navigate("/admin/login"); };
  return <div className="min-h-screen bg-bg text-fg"><header className="border-b border-border bg-surface"><div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-4"><Link to="/admin" className="font-display font-bold text-fg no-underline">karol.dev / admin</Link><div className="flex items-center gap-4 text-sm"><Link to="/" className="text-muted">View site</Link><button type="button" onClick={signOut} className="text-accent">Sign out</button></div></div></header><main className="mx-auto max-w-6xl px-5 py-10"><Outlet /></main></div>;
}
