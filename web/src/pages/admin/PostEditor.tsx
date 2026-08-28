import {
  useEffect,
  useState,
  type ChangeEvent,
  type FormEvent,
  type KeyboardEvent,
  type SyntheticEvent,
} from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { api, UnauthorizedError } from "../../api/client";
import { Markdown } from "../../components/Markdown";
import { ErrorState, LoadingState } from "../../components/States";

type Draft = {
  title: string;
  slug: string;
  excerpt: string;
  body_markdown: string;
  cover_image_url: string;
  tags: string[];
  published: boolean;
};

type SaveMode = "save" | "publish" | "unpublish";

const empty: Draft = {
  title: "",
  slug: "",
  excerpt: "",
  body_markdown: "",
  cover_image_url: "",
  tags: [],
  published: false,
};

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+/, "");
}

function normalizeSlug(value: string) {
  return slugify(value).replace(/-+$/, "");
}

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
    let ignore = false;
    api
      .getPost(slug, token)
      .then(({ post }) => {
        if (ignore) return;
        setDraft({
          title: post.title,
          slug: post.slug,
          excerpt: post.excerpt || "",
          body_markdown: post.body_markdown || "",
          cover_image_url: post.cover_image_url || "",
          tags: post.tags,
          published: Boolean(post.published),
        });
        setOriginalSlug(post.slug);
      })
      .catch((reason: Error) => {
        if (ignore) return;
        if (reason instanceof UnauthorizedError) {
          localStorage.removeItem("admin_token");
          navigate("/admin/login", { replace: true });
        } else {
          setError(reason.message);
        }
      })
      .finally(() => {
        if (!ignore) setLoading(false);
      });
    return () => {
      ignore = true;
    };
  }, [navigate, slug, token]);

  const set = (field: keyof Draft, value: string | boolean | string[]) => {
    setDraft((current) => ({ ...current, [field]: value }));
  };

  const addTag = () => {
    const tag = tagInput.trim().toLowerCase();
    if (tag && !draft.tags.includes(tag)) set("tags", [...draft.tags, tag]);
    setTagInput("");
  };

  const onTagKey = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter" || event.key === ",") {
      event.preventDefault();
      addTag();
    }
  };

  const upload = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setBusy(true);
    setError("");
    try {
      const result = await api.upload(file, token);
      set("cover_image_url", result.url);
    } catch (reason) {
      if (reason instanceof UnauthorizedError) {
        localStorage.removeItem("admin_token");
        navigate("/admin/login", { replace: true });
      } else {
        setError((reason as Error).message);
      }
    } finally {
      setBusy(false);
    }
  };

  const save = async (event: SyntheticEvent, mode: SaveMode) => {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      const published = mode === "publish" ? true : mode === "unpublish" ? false : draft.published;
      const payload = { ...draft, slug: normalizeSlug(draft.slug), published };
      const result = originalSlug
        ? await api.updatePost(originalSlug, payload, token)
        : await api.createPost(payload, token);
      setDraft((current) => ({ ...current, published: result.post.published ?? published }));
      setOriginalSlug(result.post.slug);
      setSlugEdited(true);
      navigate(`/admin/posts/${result.post.slug}/edit`, { replace: true });
    } catch (reason) {
      if (reason instanceof UnauthorizedError) {
        localStorage.removeItem("admin_token");
        navigate("/admin/login", { replace: true });
      } else {
        setError((reason as Error).message);
      }
    } finally {
      setBusy(false);
    }
  };

  if (loading) return <LoadingState />;

  return (
    <div>
      <div className="mb-8 flex items-center justify-between gap-4">
        <div>
          <Link to="/admin" className="text-sm text-muted">
            ← Posts
          </Link>
          <h1 className="mt-3 font-display text-3xl font-bold">
            {slug ? "Edit post" : "New post"}
          </h1>
        </div>
        <span className="text-sm text-muted">{draft.published ? "Published" : "Draft"}</span>
      </div>
      {error && <ErrorState message={error} />}
      <form onSubmit={(event: FormEvent<HTMLFormElement>) => save(event, "save")}>
        <div className="space-y-5">
          <div className="grid gap-5 lg:grid-cols-2">
            <label className="block text-sm text-muted">
              Title
              <input
                required
                value={draft.title}
                onChange={(event) => {
                  set("title", event.target.value);
                  if (!slugEdited) set("slug", slugify(event.target.value));
                }}
                className="mt-2 w-full rounded-theme border border-border bg-surface px-4 py-3 text-fg"
              />
            </label>
            <label className="block text-sm text-muted">
              Slug
              <input
                required
                value={draft.slug}
                onChange={(event) => {
                  setSlugEdited(true);
                  set("slug", slugify(event.target.value));
                }}
                onBlur={() => set("slug", normalizeSlug(draft.slug))}
                className="mt-2 w-full rounded-theme border border-border bg-surface px-4 py-3 text-fg"
              />
            </label>
          </div>
          <label className="block text-sm text-muted">
            Excerpt
            <textarea
              rows={3}
              value={draft.excerpt}
              onChange={(event) => set("excerpt", event.target.value)}
              className="mt-2 w-full rounded-theme border border-border bg-surface px-4 py-3 text-fg"
            />
          </label>
          <div className="grid gap-5 rounded-theme border border-border bg-surface p-4 sm:grid-cols-2">
            <label className="block text-sm text-muted">
              Cover image URL
              <input
                value={draft.cover_image_url}
                onChange={(event) => set("cover_image_url", event.target.value)}
                className="mt-2 w-full rounded-theme border border-border bg-bg px-3 py-2 text-fg"
              />
            </label>
            <label className="block text-sm text-muted">
              Upload cover
              <input
                type="file"
                accept="image/*"
                onChange={upload}
                className="mt-3 block w-full text-xs text-muted"
              />
            </label>
            <div className="text-sm text-muted sm:col-span-2">
              <label>
                Tags
                <input
                  value={tagInput}
                  onChange={(event) => setTagInput(event.target.value)}
                  onKeyDown={onTagKey}
                  onBlur={addTag}
                  placeholder="Type and press Enter"
                  className="mt-2 w-full rounded-theme border border-border bg-bg px-3 py-2 text-fg"
                />
              </label>
              <div className="mt-3 flex flex-wrap gap-2">
                {draft.tags.map((tag) => (
                  <button
                    type="button"
                    key={tag}
                    onClick={() =>
                      set(
                        "tags",
                        draft.tags.filter((item) => item !== tag),
                      )
                    }
                    className="rounded-full bg-bg px-3 py-1 text-xs text-fg"
                  >
                    #{tag} ×
                  </button>
                ))}
              </div>
            </div>
          </div>
          <div className="grid items-stretch gap-5 lg:grid-cols-2">
            <label className="flex min-h-[600px] flex-col text-sm text-muted">
              Markdown body
              <textarea
                required
                value={draft.body_markdown}
                onChange={(event) => set("body_markdown", event.target.value)}
                className="mt-2 min-h-[560px] flex-1 resize-y rounded-theme border border-border bg-surface px-4 py-4 font-mono text-sm leading-6 text-fg"
              />
            </label>
            <div className="flex min-h-[600px] flex-col rounded-theme border border-border bg-surface p-5 lg:sticky lg:top-5 lg:max-h-[600px]">
              <h2 className="font-display font-bold">Live preview</h2>
              <div className="mt-5 min-h-0 flex-1 overflow-y-auto">
                <Markdown content={draft.body_markdown || "*Start writing to see a preview.*"} />
              </div>
            </div>
          </div>
        </div>
        <div className="mt-8 flex flex-wrap justify-end gap-3 border-t border-border pt-5">
          <button
            type="submit"
            disabled={busy}
            className="rounded-theme border border-border bg-surface px-5 py-3 text-sm text-fg"
          >
            {busy ? "Saving…" : "Save"}
          </button>
          {draft.published ? (
            <button
              type="button"
              disabled={busy}
              onClick={(event) => save(event, "unpublish")}
              className="rounded-theme border border-border px-5 py-3 text-sm text-accent"
            >
              Unpublish
            </button>
          ) : (
            <button
              type="button"
              disabled={busy}
              onClick={(event) => save(event, "publish")}
              className="rounded-theme bg-accent px-5 py-3 text-sm font-medium text-on-accent"
            >
              Publish
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
