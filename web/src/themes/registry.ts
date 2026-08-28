import type { ComponentType, ReactNode } from "react";
import type { Post, Profile, Tag } from "../types";
import {
  BrutalistHero,
  BrutalistPostCard,
  BrutalistPostList,
  BrutalistReaderChrome,
  BrutalistShell,
  BrutalistTagCloud,
} from "./brutalist";
import {
  NeonHero,
  NeonPostCard,
  NeonPostList,
  NeonReaderChrome,
  NeonShell,
  NeonTagCloud,
} from "./neon";
import {
  NotionHero,
  NotionPostCard,
  NotionPostList,
  NotionReaderChrome,
  NotionShell,
  NotionTagCloud,
} from "./notion";
import {
  PixelHero,
  PixelPostCard,
  PixelPostList,
  PixelReaderChrome,
  PixelShell,
  PixelTagCloud,
} from "./pixel";

export const THEME_IDS = ["notion", "brutalist", "pixel", "neon"] as const;
export type ThemeId = (typeof THEME_IDS)[number];
export const THEME_LABELS: Record<ThemeId, string> = {
  notion: "Notion",
  brutalist: "Brutalist",
  pixel: "Pixel",
  neon: "Neon",
};

export type ShellProps = { children: ReactNode; profile?: Profile | null };
export type PostCardProps = { post: Post; index?: number };
export type PostListProps = { posts: Post[] };
export type ReaderChromeProps = { post: Post; children: ReactNode };
export type HeroProps = { profile: Profile; postCount: number; tagCount: number };
export type TagCloudProps = {
  tags: Tag[];
  activeTag?: string;
  onSelect?: (tag: string) => void;
};
export type ThemeComponents = {
  Shell: ComponentType<ShellProps>;
  Hero: ComponentType<HeroProps>;
  TagCloud: ComponentType<TagCloudProps>;
  PostList: ComponentType<PostListProps>;
  PostCard: ComponentType<PostCardProps>;
  ReaderChrome: ComponentType<ReaderChromeProps>;
};

export const registry: Record<ThemeId, ThemeComponents> = {
  notion: {
    Shell: NotionShell,
    Hero: NotionHero,
    TagCloud: NotionTagCloud,
    PostList: NotionPostList,
    PostCard: NotionPostCard,
    ReaderChrome: NotionReaderChrome,
  },
  brutalist: {
    Shell: BrutalistShell,
    Hero: BrutalistHero,
    TagCloud: BrutalistTagCloud,
    PostList: BrutalistPostList,
    PostCard: BrutalistPostCard,
    ReaderChrome: BrutalistReaderChrome,
  },
  pixel: {
    Shell: PixelShell,
    Hero: PixelHero,
    TagCloud: PixelTagCloud,
    PostList: PixelPostList,
    PostCard: PixelPostCard,
    ReaderChrome: PixelReaderChrome,
  },
  neon: {
    Shell: NeonShell,
    Hero: NeonHero,
    TagCloud: NeonTagCloud,
    PostList: NeonPostList,
    PostCard: NeonPostCard,
    ReaderChrome: NeonReaderChrome,
  },
};
