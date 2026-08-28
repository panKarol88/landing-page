import type { ComponentType, ReactNode } from "react";
import type { Post, Profile } from "../types";
import { BrutalistPostCard, BrutalistPostList, BrutalistReaderChrome, BrutalistShell } from "./brutalist";
import { NeonPostCard, NeonPostList, NeonReaderChrome, NeonShell } from "./neon";
import { NotionPostCard, NotionPostList, NotionReaderChrome, NotionShell } from "./notion";
import { PixelPostCard, PixelPostList, PixelReaderChrome, PixelShell } from "./pixel";

export const THEME_IDS = ["notion", "brutalist", "pixel", "neon"] as const;
export type ThemeId = (typeof THEME_IDS)[number];
export const THEME_LABELS: Record<ThemeId, string> = { notion: "Notion", brutalist: "Brutalist", pixel: "Pixel", neon: "Neon" };

export type ShellProps = { children: ReactNode; profile?: Profile | null };
export type PostCardProps = { post: Post; index?: number };
export type PostListProps = { posts: Post[] };
export type ReaderChromeProps = { post: Post; children: ReactNode };
export type ThemeComponents = {
  Shell: ComponentType<ShellProps>;
  PostList: ComponentType<PostListProps>;
  PostCard: ComponentType<PostCardProps>;
  ReaderChrome: ComponentType<ReaderChromeProps>;
};

export const registry: Record<ThemeId, ThemeComponents> = {
  notion: { Shell: NotionShell, PostList: NotionPostList, PostCard: NotionPostCard, ReaderChrome: NotionReaderChrome },
  brutalist: { Shell: BrutalistShell, PostList: BrutalistPostList, PostCard: BrutalistPostCard, ReaderChrome: BrutalistReaderChrome },
  pixel: { Shell: PixelShell, PostList: PixelPostList, PostCard: PixelPostCard, ReaderChrome: PixelReaderChrome },
  neon: { Shell: NeonShell, PostList: NeonPostList, PostCard: NeonPostCard, ReaderChrome: NeonReaderChrome },
};
