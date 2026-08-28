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
  { to: "/", label: "START" },
  { to: "/blog", label: "BLOG" },
  { to: "/about", label: "ABOUT" },
];

const chipColors = ["bg-accent", "bg-accent-2", "bg-surface"];

export function PixelShell({ children }: ShellProps) {
  return (
    <div className="min-h-screen bg-bg font-sans text-fg">
      <header className="border-b-4 border-border bg-surface p-4">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4">
          <Link
            to="/"
            className="pixel-blink font-display text-xs text-accent-2 no-underline sm:text-sm"
          >
            PLAYER: KAROL
          </Link>
          <ThemeSwitcher />
          <nav className="flex w-full gap-2 sm:w-auto">
            {nav.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className="border-2 border-border bg-accent px-3 py-2 font-display text-[9px] text-fg no-underline shadow-card transition-transform hover:-translate-x-0.5 hover:-translate-y-0.5"
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-10 sm:px-8">{children}</main>
      <footer className="mx-auto flex max-w-6xl justify-between border-t-4 border-border px-4 py-8 font-mono text-lg text-muted sm:px-8">
        <span>INSERT COFFEE</span>
        <a href={RSS_URL} className="text-accent-2">
          GET RSS →
        </a>
      </footer>
    </div>
  );
}

export function PixelHero({ profile, postCount, tagCount }: HeroProps) {
  return (
    <section className="mb-section border-4 border-border bg-surface p-5 shadow-card sm:p-8">
      <div className="mb-6 flex flex-wrap justify-between gap-3 border-b-4 border-border pb-4 font-mono text-xl">
        <span className="text-accent-2">PLAYER: KAROL</span>
        <span>
          POSTS: {postCount} / TAGS: {tagCount}
        </span>
      </div>
      <p className="font-display text-[10px] text-accent-2">NEW QUEST UNLOCKED</p>
      <h1 className="mt-5 max-w-4xl font-display text-hero leading-relaxed">{profile.headline}</h1>
      <p className="mt-6 max-w-3xl font-mono text-2xl leading-6 text-muted">{profile.bio[0]}</p>
      <div className="mt-8 flex flex-wrap gap-3">
        {profile.links.map((link) => (
          <a
            href={link.url}
            key={link.label}
            target="_blank"
            rel="noreferrer"
            className="border-2 border-border bg-accent-2 px-3 py-2 font-display text-[10px] text-fg no-underline"
          >
            {link.label} ↗
          </a>
        ))}
        <Link
          to="/about"
          className="border-2 border-border px-3 py-2 font-display text-[10px] no-underline"
        >
          ABOUT →
        </Link>
      </div>
    </section>
  );
}

export function PixelTagCloud({ tags, activeTag, onSelect }: TagCloudProps) {
  return (
    <div className="flex flex-wrap gap-2 font-mono text-xl">
      {onSelect && (
        <button
          type="button"
          onClick={() => onSelect("")}
          className={`border-2 border-border px-3 py-1 ${
            !activeTag ? "bg-accent text-fg" : "bg-surface text-muted"
          }`}
        >
          ALL
        </button>
      )}
      {tags.map((tag, index) =>
        onSelect ? (
          <button
            type="button"
            key={tag.tag}
            onClick={() => onSelect(tag.tag)}
            className={`border-2 border-border px-3 py-1 ${
              chipColors[index % chipColors.length]
            } text-fg`}
          >
            #{tag.tag}
          </button>
        ) : (
          <Link
            to={`/blog?tag=${encodeURIComponent(tag.tag)}`}
            className={`border-2 border-border px-3 py-1 ${
              chipColors[index % chipColors.length]
            } text-fg no-underline`}
            key={tag.tag}
          >
            #{tag.tag} [{tag.count}]
          </Link>
        ),
      )}
    </div>
  );
}

export function PixelPostList({ posts }: PostListProps) {
  return (
    <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
      {posts.map((post, index) => (
        <PixelPostCard key={post.slug} post={post} index={index} />
      ))}
    </div>
  );
}

export function PixelPostCard({ post, index = 0 }: PostCardProps) {
  return (
    <Link
      to={`/blog/${post.slug}`}
      className="group flex flex-col border-4 border-border bg-surface text-fg no-underline shadow-card transition-transform hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-card-hover"
    >
      <div className="flex items-center justify-between border-b-4 border-border p-3 font-mono text-lg">
        <span
          className={`${chipColors[index % chipColors.length]} border-2 border-border px-2 text-fg`}
        >
          #{String(index + 1).padStart(2, "0")}
        </span>
        <span className="text-muted">{formatDate(post.published_at)}</span>
      </div>
      {post.cover_image_url && (
        <img src={post.cover_image_url} alt="" className="h-36 w-full object-cover" />
      )}
      <div className="flex-1 p-4">
        <h3 className="font-display text-sm leading-relaxed">{post.title}</h3>
        <p className="mt-4 font-mono text-lg leading-5 text-muted">{post.excerpt}</p>
        <div className="mt-5 flex flex-wrap gap-2">
          {post.tags.map((tag, tagIndex) => (
            <span
              key={tag}
              className={`${chipColors[(tagIndex + index) % chipColors.length]} border-2 border-border px-2 py-1 font-mono text-base text-fg`}
            >
              {tag}
            </span>
          ))}
        </div>
      </div>
    </Link>
  );
}

export function PixelReaderChrome({ post, children }: ReaderChromeProps) {
  return (
    <article className="mx-auto max-w-4xl py-8 sm:py-14">
      <Link to="/blog" className="font-display text-[10px] text-accent-2">
        ← BACK TO BLOG
      </Link>
      {post.cover_image_url && (
        <img
          src={post.cover_image_url}
          alt=""
          className="mt-8 w-full border-4 border-border object-cover shadow-card"
        />
      )}
      <div className="mt-8 border-4 border-border bg-surface p-5 shadow-card sm:p-8">
        <p className="font-mono text-xl text-accent-2">
          {formatDate(post.published_at)} // {post.reading_time_minutes} MIN READ
        </p>
        <h1 className="mt-5 font-display text-page-title leading-relaxed">{post.title}</h1>
        <div className="mt-8 border-t-4 border-border pt-8">{children}</div>
      </div>
    </article>
  );
}
