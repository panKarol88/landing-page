import { useEffect, useState } from "react";
import { api } from "../api/client";
import { ErrorState, LoadingState } from "../components/States";
import type { Profile } from "../types";

export function About() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [error, setError] = useState("");
  useEffect(() => {
    api
      .getProfile()
      .then(setProfile)
      .catch((reason: Error) => setError(reason.message));
  }, []);
  if (error) return <ErrorState message={error} />;
  if (!profile) return <LoadingState />;
  return (
    <div className="py-section">
      <div className="flex flex-col gap-8 sm:flex-row sm:items-start">
        <img
          src={profile.avatar_url}
          alt={profile.name}
          className="h-32 w-32 rounded-theme object-cover"
        />
        <div>
          <p className="text-sm uppercase tracking-[.18em] text-accent">About</p>
          <h1 className="mt-3 font-display text-4xl font-bold">{profile.name}</h1>
          <p className="mt-2 text-lg text-muted">{profile.headline}</p>
          <p className="mt-3 text-sm text-muted">Based in {profile.location}</p>
        </div>
      </div>
      <div className="mt-12 max-w-2xl space-y-5 text-lg leading-8 text-muted">
        {profile.bio.map((paragraph) => (
          <p key={paragraph}>{paragraph}</p>
        ))}
      </div>
      <section className="mt-16">
        <h2 className="font-display text-2xl font-bold">Skills</h2>
        <div className="mt-5 flex flex-wrap gap-3">
          {profile.skills.map((skill) => (
            <span key={skill} className="rounded-full bg-surface px-4 py-2 text-sm text-fg">
              {skill}
            </span>
          ))}
        </div>
      </section>
      <section className="mt-16">
        <h2 className="font-display text-2xl font-bold">Find me online</h2>
        <div className="mt-5 flex flex-wrap gap-6">
          {profile.links.map((link) => (
            <a href={link.url} target="_blank" rel="noreferrer" key={link.label}>
              {link.label} ↗
            </a>
          ))}
        </div>
      </section>
    </div>
  );
}
