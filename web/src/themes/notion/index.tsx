import { Link } from "react-router-dom";
import { ThemeSwitcher } from "../../components/ThemeSwitcher";
import { formatDate, type Profile } from "../../types";
import type { PostCardProps, PostListProps, ReaderChromeProps, ShellProps } from "../registry";

const nav = [{ to: "/", label: "Home" }, { to: "/blog", label: "Writing" }, { to: "/about", label: "About" }];

export function NotionShell({ children }: ShellProps) {
  return <div className="min-h-screen bg-bg text-fg"><header className="sticky top-0 z-10 border-b border-border bg-bg/90 backdrop-blur"><div className="mx-auto flex max-w-3xl items-center justify-between gap-4 px-5 py-4"><Link to="/" className="font-display text-sm font-bold text-fg no-underline">karol.dev</Link><nav className="flex items-center gap-4 text-sm text-muted">{nav.map((item) => <Link key={item.to} to={item.to} className="text-muted no-underline hover:text-accent">{item.label}</Link>)}<ThemeSwitcher /></nav></div></header><main className="mx-auto max-w-3xl px-5">{children}</main><footer className="mx-auto flex max-w-3xl items-center justify-between px-5 py-12 text-xs text-muted"><span>Built with curiosity.</span><a href="http://localhost:3000/feed.xml" className="text-muted underline">RSS feed</a></footer></div>;
}

export function NotionPostList({ posts }: PostListProps) {
  return <div className="space-y-4">{posts.map((post, index) => <NotionPostCard key={post.slug} post={post} index={index} />)}</div>;
}

export function NotionPostCard({ post }: PostCardProps) {
  return <Link to={`/blog/${post.slug}`} className="group flex gap-5 rounded-theme bg-surface p-4 text-fg no-underline shadow-card transition-all duration-300 hover:-translate-y-0.5 hover:shadow-card-hover"><div className="hidden h-28 w-36 shrink-0 overflow-hidden rounded-theme bg-bg sm:block">{post.cover_image_url && <img src={post.cover_image_url} alt="" className="h-full w-full object-cover" />}</div><div className="min-w-0"><p className="mb-2 text-xs text-muted">{formatDate(post.published_at)} · {post.reading_time_minutes} min read</p><h3 className="font-display text-lg font-bold text-fg group-hover:text-accent">{post.title}</h3><p className="mt-2 text-sm leading-6 text-muted">{post.excerpt}</p><div className="mt-3 flex flex-wrap gap-2">{post.tags.map((tag) => <span className="rounded-full bg-bg px-2 py-1 text-xs text-muted" key={tag}>#{tag}</span>)}</div></div></Link>;
}

export function NotionReaderChrome({ post, children }: ReaderChromeProps) {
  return <article className="py-16 sm:py-20"><Link to="/blog" className="text-sm text-muted">← All writing</Link>{post.cover_image_url && <img src={post.cover_image_url} alt="" className="mt-8 max-h-80 w-full rounded-theme object-cover shadow-card" />}<p className="mt-10 text-sm text-muted">{formatDate(post.published_at)} · {post.reading_time_minutes} min read</p><h1 className="mt-3 font-display text-4xl font-bold leading-tight sm:text-5xl">{post.title}</h1><div className="mt-5 flex flex-wrap gap-2">{post.tags.map((tag) => <span key={tag} className="rounded-full bg-surface px-3 py-1 text-xs text-muted">#{tag}</span>)}</div><div className="mt-12">{children}</div></article>;
}

export type NotionProfile = Profile;
