import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { api } from "../api/client";
import { ErrorState, LoadingState } from "../components/States";
import { useTheme } from "../components/ThemeProvider";
import type { Post, Profile, Tag } from "../types";

export function Home() {
  const { PostList } = useTheme();
  const [data, setData] = useState<{ profile: Profile; posts: Post[]; tags: Tag[] } | null>(null);
  const [error, setError] = useState("");
  useEffect(() => {
    Promise.all([api.getProfile(), api.listPosts({ perPage: 3 }), api.getTags()])
      .then(([profile, posts, tags]) => setData({ profile, posts: posts.posts, tags: tags.tags }))
      .catch((reason: Error) => setError(reason.message));
  }, []);
  if (error) return <ErrorState message={error} />;
  if (!data) return <LoadingState />;
  return <div className="py-section"><section className="mb-section"><p className="mb-5 text-sm font-medium uppercase tracking-[.18em] text-accent">Hello, I'm Karol.</p><h1 className="max-w-2xl font-display text-4xl font-bold leading-tight sm:text-6xl">{data.profile.headline}</h1><p className="mt-6 max-w-xl text-lg leading-8 text-muted">{data.profile.bio[0]}</p><div className="mt-7 flex flex-wrap gap-5 text-sm">{data.profile.links.map((link) => <a href={link.url} key={link.label} target="_blank" rel="noreferrer">{link.label} ↗</a>)}<Link to="/about" className="text-fg underline">More about me →</Link></div></section><section className="mb-section"><div className="mb-7 flex items-end justify-between"><h2 className="font-display text-2xl font-bold">Latest writing</h2><Link to="/blog" className="text-sm">View all →</Link></div><PostList posts={data.posts} /></section><section><h2 className="mb-5 font-display text-2xl font-bold">Explore topics</h2><div className="flex flex-wrap gap-3">{data.tags.map((tag) => <Link to={`/blog?tag=${encodeURIComponent(tag.tag)}`} className="rounded-full border border-border bg-surface px-4 py-2 text-sm text-fg no-underline hover:text-accent" key={tag.tag}>#{tag.tag} <span className="text-muted">{tag.count}</span></Link>)}</div></section></div>;
}
