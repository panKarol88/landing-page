import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { api } from "../api/client";
import { ErrorState, LoadingState } from "../components/States";
import { useTheme } from "../components/ThemeProvider";
import type { Post, Profile, Tag } from "../types";

export function Home() {
  const { components } = useTheme();
  const { Hero, PostList, TagCloud } = components;
  const [data, setData] = useState<{
    profile: Profile;
    posts: Post[];
    postCount: number;
    tags: Tag[];
  } | null>(null);
  const [error, setError] = useState("");
  useEffect(() => {
    Promise.all([api.getProfile(), api.listPosts({ perPage: 3 }), api.getTags()])
      .then(([profile, posts, tags]) =>
        setData({
          profile,
          posts: posts.posts,
          postCount: posts.meta.total,
          tags: tags.tags,
        }),
      )
      .catch((reason: Error) => setError(reason.message));
  }, []);
  if (error) return <ErrorState message={error} />;
  if (!data) return <LoadingState />;
  return (
    <div className="py-section">
      <Hero profile={data.profile} postCount={data.postCount} tagCount={data.tags.length} />
      <section className="mb-section">
        <div className="mb-7 flex items-end justify-between">
          <h2 className="font-display text-section-title font-bold">Latest writing</h2>
          <Link to="/blog" className="text-sm">
            View all →
          </Link>
        </div>
        <PostList posts={data.posts} />
      </section>
      <section>
        <h2 className="mb-5 font-display text-section-title font-bold">Explore topics</h2>
        <TagCloud tags={data.tags} />
      </section>
    </div>
  );
}
