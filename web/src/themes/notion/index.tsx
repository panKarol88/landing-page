import { Link } from "react-router-dom";
import { resolveAssetUrl, RSS_URL } from "../../api/client";
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
  { to: "/", label: "Home" },
  { to: "/blog", label: "Writing" },
  { to: "/about", label: "About" },
];

export function NotionShell({ children }: ShellProps) {
  return (
    <div className="min-h-screen bg-bg text-fg">
      <header className="sticky top-0 z-10 border-b border-border bg-bg/90 backdrop-blur">
        <div className="mx-auto flex max-w-3xl items-center justify-between gap-4 px-5 py-4">
          <Link to="/" className="font-display text-sm font-bold text-fg no-underline">
            karol.dev
          </Link>
          <nav className="flex items-center gap-4 text-sm text-muted">
            {nav.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className="text-muted no-underline hover:text-accent"
              >
                {item.label}
              </Link>
            ))}
            <ThemeSwitcher />
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-3xl px-5">{children}</main>
      <footer className="mx-auto flex max-w-3xl items-center justify-between px-5 py-12 text-xs text-muted">
        <span>Built with curiosity.</span>
        <a href={RSS_URL} className="text-muted underline">
          RSS feed
        </a>
      </footer>
    </div>
  );
}

export function NotionHero({ profile }: HeroProps) {
  return (
    <section className="mb-section border-b border-border py-section">
      <p className="mb-5 text-sm font-medium uppercase tracking-[.18em] text-accent">
        Hello, I&apos;m {profile.name}.
      </p>
      <h1 className="max-w-2xl font-display text-hero font-bold leading-tight">
        {profile.headline}
      </h1>
      <p className="mt-6 max-w-xl text-lg leading-8 text-muted">{profile.bio[0]}</p>
      <div className="mt-7 flex flex-wrap gap-5 text-sm">
        {profile.links.map((link) => (
          <a href={link.url} key={link.label} target="_blank" rel="noreferrer">
            {link.label} ↗
          </a>
        ))}
        <Link to="/about" className="text-fg underline">
          More about me →
        </Link>
      </div>
    </section>
  );
}

export function NotionTagCloud({ tags, activeTag, onSelect }: TagCloudProps) {
  return (
    <div className="flex flex-wrap gap-3">
      {!onSelect && tags.length === 0 && <span className="text-muted">No topics yet.</span>}
      {onSelect && (
        <button
          type="button"
          onClick={() => onSelect("")}
          className={`rounded-full border border-border px-4 py-2 text-sm ${
            !activeTag ? "bg-accent text-on-accent" : "bg-surface text-muted"
          }`}
        >
          All
        </button>
      )}
      {tags.map((tag) =>
        onSelect ? (
          <button
            type="button"
            key={tag.tag}
            onClick={() => onSelect(tag.tag)}
            className={`rounded-full border border-border px-4 py-2 text-sm ${
              activeTag === tag.tag ? "bg-accent text-on-accent" : "bg-surface text-muted"
            }`}
          >
            #{tag.tag}
          </button>
        ) : (
          <Link
            to={`/blog?tag=${encodeURIComponent(tag.tag)}`}
            className="rounded-full border border-border bg-surface px-4 py-2 text-sm text-fg no-underline hover:text-accent"
            key={tag.tag}
          >
            #{tag.tag} <span className="text-muted">{tag.count}</span>
          </Link>
        ),
      )}
    </div>
  );
}

export function NotionPostList({ posts }: PostListProps) {
  return (
    <div className="space-y-4">
      {posts.map((post, index) => (
        <NotionPostCard key={post.slug} post={post} index={index} />
      ))}
    </div>
  );
}

export function NotionPostCard({ post }: PostCardProps) {
  return (
    <Link
      to={`/blog/${post.slug}`}
      className="group flex gap-5 rounded-theme bg-surface p-4 text-fg no-underline shadow-card transition-all duration-300 hover:-translate-y-0.5 hover:shadow-card-hover"
    >
      {post.cover_image_url && (
        <div className="hidden h-28 w-36 shrink-0 overflow-hidden rounded-theme bg-bg sm:block">
          <img
            src={resolveAssetUrl(post.cover_image_url)}
            alt=""
            className="h-full w-full object-cover"
          />
        </div>
      )}
      <div className="min-w-0">
        <p className="mb-2 text-xs text-muted">
          {formatDate(post.published_at)} · {post.reading_time_minutes} min read
        </p>
        <h3 className="font-display text-lg font-bold text-fg group-hover:text-accent">
          {post.title}
        </h3>
        <p className="mt-2 text-sm leading-6 text-muted">{post.excerpt}</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {post.tags.map((tag) => (
            <span className="rounded-full bg-bg px-2 py-1 text-xs text-muted" key={tag}>
              #{tag}
            </span>
          ))}
        </div>
      </div>
    </Link>
  );
}

export function NotionReaderChrome({ post, children }: ReaderChromeProps) {
  return (
    <article className="py-section">
      <Link to="/blog" className="text-sm text-muted">
        ← All writing
      </Link>
      {post.cover_image_url && (
        <img
          src={resolveAssetUrl(post.cover_image_url)}
          alt=""
          className="mt-8 max-h-80 w-full rounded-theme object-cover shadow-card"
        />
      )}
      <p className="mt-10 text-sm text-muted">
        {formatDate(post.published_at)} · {post.reading_time_minutes} min read
      </p>
      <h1 className="mt-3 font-display text-page-title font-bold leading-tight">{post.title}</h1>
      <div className="mt-5 flex flex-wrap gap-2">
        {post.tags.map((tag) => (
          <span key={tag} className="rounded-full bg-surface px-3 py-1 text-xs text-muted">
            #{tag}
          </span>
        ))}
      </div>
      <div className="mt-12">{children}</div>
    </article>
  );
}
