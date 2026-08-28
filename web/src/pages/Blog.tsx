import { useSearchParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { api } from "../api/client";
import { ErrorState, LoadingState } from "../components/States";
import { useTheme } from "../components/ThemeProvider";
import type { Meta, Post, Tag } from "../types";

export function Blog() {
  const { PostList } = useTheme();
  const [searchParams, setSearchParams] = useSearchParams();
  const tag = searchParams.get("tag") || "";
  const page = Number(searchParams.get("page") || 1);
  const [posts, setPosts] = useState<Post[] | null>(null);
  const [meta, setMeta] = useState<Meta | null>(null);
  const [tags, setTags] = useState<Tag[]>([]);
  const [tagsError, setTagsError] = useState("");
  const [error, setError] = useState("");
  useEffect(() => {
    setPosts(null);
    api.listPosts({ tag, page, perPage: 10 }).then((result) => { setPosts(result.posts); setMeta(result.meta); }).catch((reason: Error) => setError(reason.message));
    api.getTags().then((result) => setTags(result.tags)).catch((reason: Error) => setTagsError(reason.message));
  }, [tag, page]);
  return <div className="py-section"><div className="mb-10"><p className="text-sm uppercase tracking-[.18em] text-accent">Archive</p><h1 className="mt-3 font-display text-4xl font-bold sm:text-5xl">All writing</h1><p className="mt-4 max-w-xl text-muted">Notes from the workbench: systems, interfaces, and the craft of shipping.</p></div>{tagsError && <ErrorState message={tagsError} />}<div className="mb-8 flex flex-wrap gap-2"><button type="button" onClick={() => setSearchParams({})} className={`rounded-full border border-border px-3 py-1 text-sm ${!tag ? "bg-accent text-fg" : "bg-surface text-muted"}`}>All</button>{tags.map((item) => <button type="button" key={item.tag} onClick={() => setSearchParams({ tag: item.tag })} className={`rounded-full border border-border px-3 py-1 text-sm ${tag === item.tag ? "bg-accent text-fg" : "bg-surface text-muted"}`}>#{item.tag}</button>)}</div>{error ? <ErrorState message={error} onRetry={() => window.location.reload()} /> : posts ? <><PostList posts={posts} />{meta && meta.total_pages > 1 && <div className="mt-10 flex items-center justify-between text-sm"><button type="button" disabled={page <= 1} onClick={() => setSearchParams({ ...(tag ? { tag } : {}), page: String(page - 1) })} className="text-accent disabled:opacity-30">← Newer</button><span className="text-muted">Page {meta.page} of {meta.total_pages}</span><button type="button" disabled={page >= meta.total_pages} onClick={() => setSearchParams({ ...(tag ? { tag } : {}), page: String(page + 1) })} className="text-accent disabled:opacity-30">Older →</button></div>}</> : <LoadingState />}</div>;
}
