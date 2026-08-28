import { Link } from "react-router-dom";
import { ThemeSwitcher } from "../../components/ThemeSwitcher";
import { formatDate } from "../../types";
import type { PostCardProps, PostListProps, ReaderChromeProps, ShellProps } from "../registry";

const nav = [{ to: "/", label: "START" }, { to: "/blog", label: "BLOG" }, { to: "/about", label: "ABOUT" }];

export function PixelShell({ children }: ShellProps) {
  return <div className="min-h-screen bg-bg font-sans text-fg"><header className="border-b-4 border-border bg-surface p-4"><div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4"><Link to="/" className="pixel-blink font-display text-xs text-accent-2 no-underline sm:text-sm">PLAYER: KAROL</Link><div className="flex items-center gap-3 font-mono text-lg"><span className="border-2 border-border px-2">POSTS: 06</span><span className="hidden border-2 border-border px-2 sm:inline">TAGS: 09</span><ThemeSwitcher /></div><nav className="flex w-full gap-2 sm:w-auto">{nav.map((item) => <Link key={item.to} to={item.to} className="border-2 border-border bg-accent px-3 py-2 font-display text-[9px] text-fg no-underline shadow-card transition-transform hover:-translate-x-0.5 hover:-translate-y-0.5">{item.label}</Link>)}</nav></div></header><main className="mx-auto max-w-6xl px-4 py-10 sm:px-8">{children}</main><footer className="mx-auto flex max-w-6xl justify-between border-t-4 border-border px-4 py-8 font-mono text-lg text-muted sm:px-8"><span>INSERT COFFEE</span><a href="http://localhost:3000/feed.xml" className="text-accent-2">GET RSS →</a></footer></div>;
}

export function PixelPostList({ posts }: PostListProps) {
  return <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">{posts.map((post, index) => <PixelPostCard key={post.slug} post={post} index={index} />)}</div>;
}

export function PixelPostCard({ post, index = 0 }: PostCardProps) {
  const colors = ["bg-accent", "bg-accent-2", "bg-surface"];
  return <Link to={`/blog/${post.slug}`} className="group flex flex-col border-4 border-border bg-surface text-fg no-underline shadow-card transition-transform hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-card-hover"><div className="flex items-center justify-between border-b-4 border-border p-3 font-mono text-lg"><span className={`${colors[index % colors.length]} border-2 border-border px-2 text-fg`}>#{String(index + 1).padStart(2, "0")}</span><span className="text-muted">{formatDate(post.published_at)}</span></div>{post.cover_image_url && <img src={post.cover_image_url} alt="" className="h-36 w-full object-cover" />}<div className="flex-1 p-4"><h3 className="font-display text-sm leading-relaxed">{post.title}</h3><p className="mt-4 font-mono text-lg leading-5 text-muted">{post.excerpt}</p><div className="mt-5 flex flex-wrap gap-2">{post.tags.map((tag, tagIndex) => <span key={tag} className={`${colors[(tagIndex + index) % colors.length]} border-2 border-border px-2 py-1 font-mono text-base text-fg`}>{tag}</span>)}</div></div></Link>;
}

export function PixelReaderChrome({ post, children }: ReaderChromeProps) {
  return <article className="mx-auto max-w-4xl py-8 sm:py-14"><Link to="/blog" className="font-display text-[10px] text-accent-2">← BACK TO BLOG</Link>{post.cover_image_url && <img src={post.cover_image_url} alt="" className="mt-8 w-full border-4 border-border object-cover shadow-card" />}<div className="mt-8 border-4 border-border bg-surface p-5 shadow-card sm:p-8"><p className="font-mono text-xl text-accent-2">{formatDate(post.published_at)} // {post.reading_time_minutes} MIN READ</p><h1 className="mt-5 font-display text-2xl leading-relaxed sm:text-4xl">{post.title}</h1><div className="mt-8 border-t-4 border-border pt-8">{children}</div></div></article>;
}
