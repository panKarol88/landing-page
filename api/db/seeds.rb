posts = [
  {
    title: "The Boring Parts of a Good Rails Application",
    excerpt: "A reliable Rails codebase is usually built from a collection of unremarkable, well-named decisions.",
    body_markdown: <<~BODY,
      The best Rails applications I have worked on are not clever. They have boundaries that are easy to explain, queries that are visible in the code, and conventions that remove the need for a meeting.

      That does not mean every object belongs in a model. It means the application has a small vocabulary and uses it consistently. A service object is useful when it names a meaningful operation, not when it merely wraps three lines of Ruby.

      I have learned to treat boringness as a feature. When a new engineer can predict where a change belongs, the framework is doing its job and the team can spend its energy on product decisions.
    BODY
    tags: %w[ruby rails architecture],
    published: true
  },
  {
    title: "A Practical Guide to Reading a Slow Query",
    excerpt: "The fastest way to fix database performance is to measure the query plan before changing the application.",
    body_markdown: <<~BODY,
      A slow page often sends us looking for an expensive Ruby loop, but the database usually has a much better explanation. I start with the exact SQL generated in production-like data, then run `EXPLAIN (ANALYZE, BUFFERS)` against it.

      The plan is a story about the database's choices. Sequential scans are not automatically bad, and an index is not automatically useful. The important question is whether the work matches the number of rows the request actually needs.

      Once the query is understood, the fix is often surprisingly small: a composite index, a narrower select list, or a change that avoids loading an association one record at a time. Measurements after the change are part of the fix, not an optional epilogue.
    BODY
    tags: %w[postgresql performance architecture],
    published: true,
    cover_image_url: "https://picsum.photos/seed/query/1200/630"
  },
  {
    title: "Testing the Behavior That Actually Matters",
    excerpt: "Tests become more valuable when they describe the contract a user or another service can observe.",
    body_markdown: <<~BODY,
      I used to measure a test suite by its line coverage. Coverage is useful, but it cannot tell us whether the important behavior is protected. A hundred assertions about private implementation details can still leave the public contract untested.

      These days I begin at the boundary. For a JSON endpoint, I check the request, response status, shape, and the state change that follows. The test can use factories and helpers underneath, but it should read like a short example of the feature.

      This style also makes refactoring safer. When a controller becomes a command object or a query changes its implementation, the test remains useful because it never depended on the old arrangement of methods.
    BODY
    tags: %w[testing rails],
    published: true
  },
  {
    title: "Keeping a React UI Honest About Loading States",
    excerpt: "A small state model prevents asynchronous interfaces from quietly lying to users.",
    body_markdown: <<~BODY,
      Loading is not a boolean. A screen can be waiting for its first response, refreshing data it already has, submitting a change, or recovering from an error. Treating all of these as `isLoading` creates flicker and makes the UI hard to reason about.

      I prefer state names that describe what the user can see: `initial`, `ready`, `refreshing`, and `failed`. The names make it obvious which content should remain on screen and which controls should be disabled.

      This is less about a particular React library than about acknowledging time in the design. Once the states are explicit, components get smaller and product conversations become concrete: what should happen if the user retries while stale data is still visible?
    BODY
    tags: %w[react frontend architecture],
    published: true,
    cover_image_url: "https://picsum.photos/seed/loading/1200/630"
  },
  {
    title: "The Smallest Useful Architecture Diagram",
    excerpt: "A diagram earns its place when it helps a team make a decision or find a boundary.",
    body_markdown: <<~BODY,
      Architecture diagrams have a reputation for becoming obsolete as soon as they are drawn. The problem is often not the diagram; it is that nobody knows what question the diagram answers.

      I have had better luck with diagrams that show one flow at a time. A request, a queue, a database, and an external dependency are enough to discuss ownership, failure modes, and latency. The drawing can stay useful even while implementation details evolve.

      I also put the decision next to the picture. “We keep this work asynchronous because the provider can take thirty seconds” is more durable than a box labeled “worker.” Context is the part that future readers cannot infer from arrows alone.
    BODY
    tags: %w[architecture],
    published: true
  },
  {
    title: "Career Momentum Comes From Finishing",
    excerpt: "Consistent delivery creates more learning opportunities than an endless queue of ambitious beginnings.",
    body_markdown: <<~BODY,
      A career can feel stalled when every project is measured by how impressive it sounds at the start. In practice, finishing a modest improvement teaches more than repeatedly designing a perfect system that never reaches users.

      Finishing does not mean rushing. It means choosing a slice that can be observed, shipped, and discussed. The feedback loop gives an engineer evidence about both the technical approach and the problem being solved.

      I now look for momentum in small completed loops: a migration with a rollback plan, a test that catches a real regression, or a conversation documented well enough that somebody else can act on it.
    BODY
    tags: %w[career],
    published: true
  },
  {
    title: "Designing a Migration You Can Undo",
    excerpt: "Database changes are easier to operate when reversibility is treated as a product requirement.",
    body_markdown: <<~BODY,
      A migration is not just a file that makes the schema match the model. It is an event that runs against real data, under load, while other versions of the application may still be serving requests.

      I like migrations that separate compatibility from cleanup. Add the new column, write both representations for a while, backfill in controlled batches, and only then remove the old path. The extra steps buy us a safe escape hatch.

      This approach also changes review conversations. Instead of asking whether the final schema is elegant, we can ask what happens when the deploy stops halfway through and how quickly the change can be reversed.
    BODY
    tags: %w[rails postgresql architecture],
    published: false
  },
  {
    title: "Notes on Building a Tiny Design System",
    excerpt: "A design system starts with shared decisions, not a large component catalog.",
    body_markdown: <<~BODY,
      The first version of a design system should make the common path easier, not attempt to encode every possible screen. A small set of spacing, typography, and color decisions can remove a surprising amount of hesitation from everyday UI work.

      I am most interested in the collaboration surface. When designers and engineers use the same names for emphasis, density, and interaction states, a component API becomes a shared language rather than another abstraction layer.

      The system should stay close to real product work. Each new primitive needs a user-facing reason to exist, and each documented example should show how it behaves when content is longer, slower, or less tidy than the happy path.
    BODY
    tags: %w[react design],
    published: false
  }
]

posts.each do |attributes|
  post = Post.find_or_initialize_by(slug: attributes[:title].parameterize)
  post.assign_attributes(attributes)
  post.save!
end
