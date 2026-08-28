import { ChangeEvent, FormEvent, useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { api } from "../../api/client";
import { Markdown } from "../../components/Markdown";
import { ErrorState, LoadingState } from "../../components/States";

type Draft = { title: string; slug: string; excerpt: string; body_markdown: string; cover_image_url: string; tags: string[]; published: boolean };
const empty: Draft = { title: "", slug: "", excerpt: "", body_markdown: "", cover_image_url: "", tags: [], published: false };
function slugify(value: string) { return value.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""); }

export function PostEditor() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const token = localStorage.getItem("admin_token") || "";
  const [draft, setDraft] = useState<Draft>(empty);
  const [originalSlug, setOriginalSlug] = useState(slug || "");
  const [slugEdited, setSlugEdited] = useState(Boolean(slug));
  const [tagInput, setTagInput] = useState("");
  const [loading, setLoading] = useState(Boolean(slug));
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  useEffect(() => {
    if (!slug) return;
    api.getPost(slug, token).then(({ post }) => {
      setDraft({ title: post.title, slug: post.slug, excerpt: post.excerpt || "", body_markdown: post.body_markdown || "", cover_image_url: post.cover_image_url || "", tags: post.tags, published: Boolean(post.published) });
      setOriginalSlug(post.slug);
    }).catch((reason: Error) => setError(reason.message)).finally(() => setLoading(false));
  }, [slug, token]);
  const set = (field: keyof Draft, value: string | boolean | string[]) => setDraft((current) => ({ ...current, [field]: value }));
  const addTag = () => { const tag = tagInput.trim().toLowerCase(); if (tag && !draft.tags.includes(tag)) set("tags", [...draft.tags, tag]); setTagInput(""); };
  const onTagKey = (event: React.KeyboardEvent<HTMLInputElement>) => { if (event.key === "Enter" || event.key === ",") { event.preventDefault(); addTag(); } };
  const upload = async (event: ChangeEvent<HTMLInputElement>) => { const file = event.target.files?.[0]; if (!file) return; setBusy(true); try { const result = await api.upload(file, token); set("cover_image_url", result.url); } catch (reason) { setError((reason as Error).message); } finally { setBusy(false); } };
  const save = async (event: FormEvent, publish: boolean) => {
    event.preventDefault(); setBusy(true); setError("");
    try {
      const payload = { ...draft, published: publish };
      const result = originalSlug ? await api.updatePost(originalSlug, payload, token) : await api.createPost(payload, token);
      navigate(`/admin/posts/${result.post.slug}/edit`, { replace: true });
    } catch (reason) { setError((reason as Error).message); } finally { setBusy(false); }
  };
  if (loading) return <LoadingState />;
  return <div><div className="mb-8 flex items-center justify-between gap-4"><div><Link to="/admin" className="text-sm text-muted">← Posts</Link><h1 className="mt-3 font-display text-3xl font-bold">{slug ? "Edit post" : "New post"}</h1></div><span className="text-sm text-muted">{draft.published ? "Published" : "Draft"}</span></div>{error && <ErrorState message={error} />}<form onSubmit={(event) => save(event, false)}><div className="grid gap-5 lg:grid-cols-3"><div className="space-y-5 lg:col-span-2"><label className="block text-sm text-muted">Title<input required value={draft.title} onChange={(event) => { set("title", event.target.value); if (!slugEdited) set("slug", slugify(event.target.value)); }} className="mt-2 w-full rounded-theme border border-border bg-surface px-4 py-3 text-fg" /></label><label className="block text-sm text-muted">Slug<input required value={draft.slug} onChange={(event) => { setSlugEdited(true); set("slug", slugify(event.target.value)); }} className="mt-2 w-full rounded-theme border border-border bg-surface px-4 py-3 text-fg" /></label><label className="block text-sm text-muted">Excerpt<textarea rows={3} value={draft.excerpt} onChange={(event) => set("excerpt", event.target.value)} className="mt-2 w-full rounded-theme border border-border bg-surface px-4 py-3 text-fg" /></label><label className="block text-sm text-muted">Markdown body<textarea required rows={18} value={draft.body_markdown} onChange={(event) => set("body_markdown", event.target.value)} className="mt-2 w-full rounded-theme border border-border bg-surface px-4 py-3 font-mono text-sm text-fg" /></label></div><aside className="space-y-5"><div className="rounded-theme border border-border bg-surface p-5"><h2 className="font-display font-bold">Live preview</h2><div className="mt-5 max-h-[500px] overflow-y-auto"><Markdown content={draft.body_markdown || "*Start writing to see a preview.*"} /></div></div><label className="block text-sm text-muted">Cover image URL<input value={draft.cover_image_url} onChange={(event) => set("cover_image_url", event.target.value)} className="mt-2 w-full rounded-theme border border-border bg-surface px-3 py-2 text-fg" /></label><label className="block text-sm text-muted">Upload cover<input type="file" accept="image/*" onChange={upload} className="mt-2 block w-full text-xs text-muted" /></label><div className="text-sm text-muted"><label>Tags<input value={tagInput} onChange={(event) => setTagInput(event.target.value)} onKeyDown={onTagKey} onBlur={addTag} placeholder="Type and press Enter" className="mt-2 w-full rounded-theme border border-border bg-surface px-3 py-2 text-fg" /></label><div className="mt-3 flex flex-wrap gap-2">{draft.tags.map((tag) => <button type="button" key={tag} onClick={() => set("tags", draft.tags.filter((item) => item !== tag))} className="rounded-full bg-bg px-3 py-1 text-xs text-fg">#{tag} ×</button>)}</div></div></aside></div><div className="mt-8 flex flex-wrap justify-end gap-3 border-t border-border pt-5"><button type="submit" disabled={busy} className="rounded-theme border border-border bg-surface px-5 py-3 text-sm text-fg">Save draft</button><button type="button" disabled={busy} onClick={(event) => save(event, true)} className="rounded-theme bg-accent px-5 py-3 text-sm font-medium text-fg">Publish</button></div></form></div>;
}
