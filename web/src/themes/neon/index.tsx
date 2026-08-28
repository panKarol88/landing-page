import { Link } from "react-router-dom";
import { RSS_URL } from "../../api/client";
import { ThemeSwitcher } from "../../components/ThemeSwitcher";
import { formatDate } from "../../types";
import type {
  HeroProps,
  PostCardProps,
  PostListProps,
  ReaderChromeProps,
  ShellProps,
  TagCloudProps,
} from "../registry";

const nav = [
  { to: "/", label: "home" },
  { to: "/blog", label: "writing" },
  { to: "/about", label: "about" },
];

export function NeonShell({ children }: ShellProps) {
  return (
    <div className="relative min-h-screen overflow-hidden bg-bg font-sans text-fg">
      <div className="neon-blob neon-blob-one" />
      <div className="neon-blob neon-blob-two" />
      <header className="relative z-10 mx-auto max-w-5xl px-4 pt-5">
        <div className="flex items-center justify-between rounded-full border border-border bg-surface/80 px-5 py-3 shadow-card backdrop-blur">
          <Link to="/" className="font-display font-bold tracking-tight text-fg no-underline">
            karol<span className="text-accent">.</span>dev
          </Link>
          <nav className="hidden items-center gap-6 text-sm text-muted sm:flex">
            {nav.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className="text-muted no-underline hover:text-accent"
              >
                {item.label}
              </Link>
            ))}
          </nav>
          <ThemeSwitcher />
        </div>
      </header>
      <main className="relative z-10 mx-auto max-w-5xl px-4">{children}</main>
      <footer className="relative z-10 mx-auto flex max-w-5xl justify-between px-4 py-16 font-mono text-xs text-muted">
        <span>STATUS: ONLINE</span>
        <a href={RSS_URL} className="text-accent">
          /feed.xml
        </a>
      </footer>
    </div>
  );
}

export function NeonHero({ profile, postCount, tagCount }: HeroProps) {
  return (
    <section className="mb-section py-section text-center">
      <p className="font-mono text-xs uppercase tracking-[.3em] text-accent">
        software engineer · {postCount} transmissions · {tagCount} channels
      </p>
      <h1 className="neon-headline mt-7 font-display text-hero font-semibold leading-tight">
        {profile.headline}
      </h1>
      <div className="mx-auto mt-7 h-px max-w-md bg-gradient-to-r from-accent to-accent-2 shadow-card" />
      <p className="mx-auto mt-7 max-w-2xl text-lg leading-8 text-muted">{profile.bio[0]}</p>
      <div className="mt-8 flex flex-wrap justify-center gap-5 text-sm">
        {profile.links.map((link) => (
          <a href={link.url} key={link.label} target="_blank" rel="noreferrer">
            {link.label} ↗
          </a>
        ))}
        <Link to="/about">about_me()</Link>
      </div>
    </section>
  );
}

export function NeonTagCloud({ tags, activeTag, onSelect }: TagCloudProps) {
  return (
    <div className="flex flex-wrap gap-3">
      {onSelect && (
        <button
          type="button"
          onClick={() => onSelect("")}
          className={`rounded-full border border-border px-4 py-2 font-mono text-xs ${
            !activeTag ? "bg-accent text-bg shadow-card" : "text-muted"
          }`}
        >
          #all
        </button>
      )}
      {tags.map((tag) =>
        onSelect ? (
          <button
            type="button"
            key={tag.tag}
            onClick={() => onSelect(tag.tag)}
            className={`rounded-full border border-border px-4 py-2 font-mono text-xs transition-shadow ${
              activeTag === tag.tag
                ? "bg-accent text-bg shadow-card"
                : "text-accent hover:shadow-card"
            }`}
          >
            #{tag.tag}
          </button>
        ) : (
          <Link
            to={`/blog?tag=${encodeURIComponent(tag.tag)}`}
            className="rounded-full border border-border px-4 py-2 font-mono text-xs text-accent no-underline shadow-card hover:shadow-card-hover"
            key={tag.tag}
          >
            #{tag.tag} <span className="text-muted">{tag.count}</span>
          </Link>
        ),
      )}
    </div>
  );
}

export function NeonPostList({ posts }: PostListProps) {
  return (
    <div className="grid gap-5 md:grid-cols-2">
      {posts.map((post, index) => (
        <NeonPostCard key={post.slug} post={post} index={index} />
      ))}
    </div>
  );
}

export function NeonPostCard({ post }: PostCardProps) {
  return (
    <Link
      to={`/blog/${post.slug}`}
      className="group relative overflow-hidden rounded-theme border border-border bg-surface p-6 text-fg no-underline shadow-card transition-all duration-300 hover:-translate-y-1 hover:shadow-card-hover before:absolute before:left-0 before:right-0 before:top-0 before:h-0.5 before:bg-accent"
    >
      <p className="font-mono text-xs text-muted">
        {formatDate(post.published_at)} // {post.reading_time_minutes} min
      </p>
      <h3 className="mt-8 font-display text-2xl font-semibold group-hover:text-accent">
        {post.title}
      </h3>
      <p className="mt-3 leading-7 text-muted">{post.excerpt}</p>
      <div className="mt-6 flex flex-wrap gap-2">
        {post.tags.map((tag) => (
          <span
            className="rounded-full border border-border px-3 py-1 font-mono text-[10px] text-accent"
            key={tag}
          >
            #{tag}
          </span>
        ))}
      </div>
    </Link>
  );
}

export function NeonReaderChrome({ post, children }: ReaderChromeProps) {
  return (
    <article className="mx-auto max-w-3xl py-section">
      <Link to="/blog" className="font-mono text-xs text-muted">
        ← return_to_writing()
      </Link>
      <p className="mt-16 font-mono text-xs text-muted">
        {formatDate(post.published_at)} · {post.reading_time_minutes} MINUTES
      </p>
      <h1 className="neon-headline mt-4 font-display text-page-title font-semibold leading-tight">
        {post.title}
      </h1>
      <div className="mt-8 h-px bg-gradient-to-r from-accent to-accent-2 shadow-card" />
      <div className="mt-10">{children}</div>
    </article>
  );
}
