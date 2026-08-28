import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api, UnauthorizedError } from "../../api/client";
import { ErrorState, LoadingState } from "../../components/States";
import { formatDate, type Post } from "../../types";

type Status = "all" | "draft" | "published";
export function AdminDashboard() {
  const navigate = useNavigate();
  const token = localStorage.getItem("admin_token") || "";
  const [status, setStatus] = useState<Status>("all");
  const [posts, setPosts] = useState<Post[] | null>(null);
  const [error, setError] = useState("");
  const load = () => {
    setPosts(null);
    setError("");
    api
      .listAdminPosts(status, token)
      .then((result) => setPosts(result.posts))
      .catch((reason: Error) => {
        if (reason instanceof UnauthorizedError) {
          localStorage.removeItem("admin_token");
          navigate("/admin/login", { replace: true });
        } else {
          setError(reason.message);
        }
      });
  };
  useEffect(() => {
    let ignore = false;
    setPosts(null);
    setError("");
    api
      .listAdminPosts(status, token)
      .then((result) => {
        if (!ignore) setPosts(result.posts);
      })
      .catch((reason: Error) => {
        if (ignore) return;
        if (reason instanceof UnauthorizedError) {
          localStorage.removeItem("admin_token");
          navigate("/admin/login", { replace: true });
        } else {
          setError(reason.message);
        }
      });
    return () => {
      ignore = true;
    };
  }, [navigate, status, token]);
  const update = async (post: Post, published: boolean) => {
    try {
      await api.updatePost(post.slug, { published }, token);
      load();
    } catch (reason) {
      if (reason instanceof UnauthorizedError) {
        localStorage.removeItem("admin_token");
        navigate("/admin/login", { replace: true });
      } else {
        setError((reason as Error).message);
      }
    }
  };
  const remove = async (post: Post) => {
    if (!window.confirm(`Delete “${post.title}”?`)) return;
    try {
      await api.deletePost(post.slug, token);
      load();
    } catch (reason) {
      if (reason instanceof UnauthorizedError) {
        localStorage.removeItem("admin_token");
        navigate("/admin/login", { replace: true });
      } else {
        setError((reason as Error).message);
      }
    }
  };
  if (error && !posts) return <ErrorState message={error} onRetry={load} />;
  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-5">
        <div>
          <p className="text-sm uppercase tracking-[.18em] text-accent">Workspace</p>
          <h1 className="mt-2 font-display text-4xl font-bold">Posts</h1>
        </div>
        <Link
          to="/admin/posts/new"
          className="rounded-theme bg-accent px-4 py-3 text-sm font-medium text-on-accent no-underline"
        >
          New post
        </Link>
      </div>
      <div className="mt-10 flex gap-5 border-b border-border">
        {(["all", "draft", "published"] as Status[]).map((item) => (
          <button
            type="button"
            key={item}
            onClick={() => setStatus(item)}
            className={`border-b-2 px-1 pb-3 text-sm capitalize ${status === item ? "border-accent text-accent" : "border-transparent text-muted"}`}
          >
            {item}
          </button>
        ))}
      </div>
      {error && <ErrorState message={error} />}
      {!posts ? (
        <LoadingState />
      ) : (
        <div className="mt-5 overflow-x-auto rounded-theme border border-border bg-surface">
          <table className="w-full min-w-[650px] text-left text-sm">
            <thead className="border-b border-border text-xs uppercase tracking-wider text-muted">
              <tr>
                <th className="px-4 py-4">Title</th>
                <th className="px-4 py-4">Status</th>
                <th className="px-4 py-4">Updated</th>
                <th className="px-4 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {posts.map((post) => (
                <tr className="border-b border-border last:border-0" key={post.slug}>
                  <td className="px-4 py-4 font-medium">{post.title}</td>
                  <td className="px-4 py-4 text-muted">{post.published ? "Published" : "Draft"}</td>
                  <td className="px-4 py-4 text-muted">{formatDate(post.updated_at || null)}</td>
                  <td className="space-x-4 px-4 py-4 text-right">
                    <button
                      type="button"
                      onClick={() => update(post, !post.published)}
                      className="text-accent"
                    >
                      {post.published ? "Unpublish" : "Publish"}
                    </button>
                    <Link to={`/admin/posts/${post.slug}/edit`} className="text-accent">
                      Edit
                    </Link>
                    <button type="button" onClick={() => remove(post)} className="text-accent">
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
