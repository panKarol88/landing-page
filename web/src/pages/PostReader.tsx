import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { api } from "../api/client";
import { Markdown } from "../components/Markdown";
import { ErrorState, LoadingState } from "../components/States";
import { useTheme } from "../components/ThemeProvider";
import type { Post } from "../types";

export function PostReader() {
  const { slug } = useParams();
  const { components } = useTheme();
  const { ReaderChrome } = components;
  const [post, setPost] = useState<Post | null>(null);
  const [error, setError] = useState("");
  useEffect(() => {
    if (slug)
      api
        .getPost(slug)
        .then((result) => setPost(result.post))
        .catch((reason: Error) => setError(reason.message));
  }, [slug]);
  if (error) return <ErrorState message={error} />;
  if (!post) return <LoadingState />;
  return (
    <ReaderChrome post={post}>
      <Markdown content={post.body_markdown || ""} />
    </ReaderChrome>
  );
}
