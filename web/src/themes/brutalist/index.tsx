import { Link } from "react-router-dom";
import { ThemeSwitcher } from "../../components/ThemeSwitcher";
import { formatDate } from "../../types";
import type { PostCardProps, PostListProps, ReaderChromeProps, ShellProps } from "../registry";

const nav = [{ to: "/", label: "Index" }, { to: "/blog", label: "Writing" }, { to: "/about", label: "About" }];

export function BrutalistShell({ children }: ShellProps) {
  return <div className="min-h-screen bg-bg font-mono text-fg"><aside className="brutalist-rail fixed bottom-0 left-0 top-0 z-20 flex flex-row items-center justify-between border-r border-border bg-bg p-5 md:flex-col md:items-stretch"><Link to="/" className="font-display text-sm font-bold uppercase tracking-widest text-fg no-underline">KAROL<br />/DEV</Link><nav className="hidden flex-col gap-5 text-xs uppercase tracking-widest md:flex">{nav.map((item) => <Link key={item.to} to={item.to} className="text-muted no-underline hover:text-accent">[{item.label}]</Link>)}</nav><div className="flex items-center gap-3 md:block"><ThemeSwitcher /><p className="hidden text-[10px] uppercase text-muted md:block md:pt-8">No noise.<br />Just shipped work.</p></div></aside><main className="brutalist-content min-h-screen pl-[244px] pr-5 sm:pr-10">{children}</main><div className="fixed bottom-0 left-0 right-0 z-10 flex justify-center gap-5 border-t border-border bg-bg p-3 text-xs uppercase md:hidden">{nav.map((item) => <Link key={item.to} to={item.to} className="text-muted no-underline">{item.label}</Link>)}</div></div>;
}

export function BrutalistPostList({ posts }: PostListProps) {
  return <div className="border-t border-border">{posts.map((post, index) => <BrutalistPostCard key={post.slug} post={post} index={index} />)}</div>;
}

export function BrutalistPostCard({ post, index = 0 }: PostCardProps) {
  return <Link to={`/blog/${post.slug}`} className="group grid grid-cols-[42px_1fr_auto] gap-4 border-b border-border py-5 text-fg no-underline transition-colors hover:bg-fg hover:text-bg"><span className="text-muted group-hover:text-bg">{String(index + 1).padStart(2, "0")}</span><span className="font-display text-sm uppercase tracking-wider sm:text-base">{post.title}</span><span className="font-mono text-xs text-muted group-hover:text-bg">{formatDate(post.published_at)}</span></Link>;
}

export function BrutalistReaderChrome({ post, children }: ReaderChromeProps) {
  return <article className="mx-auto max-w-3xl py-16 sm:py-24"><Link to="/blog" className="text-xs uppercase tracking-widest text-muted">← Back</Link><p className="mt-16 text-xs uppercase tracking-widest text-accent">{formatDate(post.published_at)} // {post.reading_time_minutes} MIN</p><h1 className="mt-5 font-display text-4xl font-bold uppercase leading-none tracking-tight sm:text-7xl">{post.title}</h1><div className="mt-8 border-t border-border pt-10 text-base leading-8 text-fg">{children}</div></article>;
}
