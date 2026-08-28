import type { Meta, Post, PostsResponse, Profile, Tag } from "../types";

export const API_URL = (import.meta.env.VITE_API_URL || "http://localhost:3000").replace(/\/$/, "");
export const RSS_URL = `${API_URL}/feed.xml`;

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: { "Content-Type": "application/json", ...(options.headers || {}) },
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(payload.error || "Something went wrong. Please try again.");
  }
  return payload as T;
}

export const api = {
  listPosts: (params: { tag?: string; page?: number; perPage?: number } = {}) => {
    const query = new URLSearchParams();
    if (params.tag) query.set("tag", params.tag);
    if (params.page) query.set("page", String(params.page));
    if (params.perPage) query.set("per_page", String(params.perPage));
    return request<PostsResponse>(`/api/v1/posts${query.size ? `?${query}` : ""}`);
  },
  getPost: (slug: string, token?: string) =>
    request<{ post: Post }>(
      `/api/v1/posts/${encodeURIComponent(slug)}`,
      token ? { headers: { Authorization: `Bearer ${token}` } } : {},
    ),
  listAdminPosts: (status: "all" | "draft" | "published" = "all", token: string) =>
    request<{ posts: Post[] }>(`/api/v1/admin/posts?status=${status}`, {
      headers: { Authorization: `Bearer ${token}` },
    }),
  getTags: () => request<{ tags: Tag[] }>("/api/v1/tags"),
  getProfile: () => request<Profile>("/api/v1/profile"),
  login: (password: string) =>
    request<{ token: string }>("/api/v1/session", {
      method: "POST",
      body: JSON.stringify({ password }),
    }),
  createPost: (post: Partial<Post>, token: string) =>
    request<{ post: Post }>("/api/v1/posts", {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify({ post }),
    }),
  updatePost: (slug: string, post: Partial<Post>, token: string) =>
    request<{ post: Post }>(`/api/v1/posts/${encodeURIComponent(slug)}`, {
      method: "PATCH",
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify({ post }),
    }),
  deletePost: (slug: string, token: string) =>
    request<void>(`/api/v1/posts/${encodeURIComponent(slug)}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    }),
  upload: async (file: File, token: string) => {
    const form = new FormData();
    form.append("file", file);
    const response = await fetch(`${API_URL}/api/v1/uploads`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: form,
    });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(payload.error || "Upload failed.");
    return payload as { url: string };
  },
};

export type { Meta, Post, PostsResponse, Profile, Tag };
