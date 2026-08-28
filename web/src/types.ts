export type Post = {
  title: string;
  slug: string;
  excerpt: string | null;
  body_markdown?: string;
  cover_image_url: string | null;
  tags: string[];
  published?: boolean;
  published_at: string | null;
  reading_time_minutes: number;
};

export type Profile = {
  name: string;
  headline: string;
  bio: string[];
  avatar_url: string;
  location: string;
  links: { label: string; url: string }[];
  skills: string[];
};

export type Tag = { tag: string; count: number };
export type Meta = { page: number; per_page: number; total: number; total_pages: number };
export type PostsResponse = { posts: Post[]; meta: Meta };

export function formatDate(value: string | null) {
  if (!value) return "Unpublished";
  return new Intl.DateTimeFormat("en", { dateStyle: "medium" }).format(new Date(value));
}
