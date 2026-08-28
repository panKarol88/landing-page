posts = [
  {
    title: "The Boring Parts of a Good Rails Application",
    excerpt: "A reliable Rails codebase is usually built from a collection of unremarkable, well-named decisions.",
    body_markdown: <<~BODY,
      The best Rails applications I have worked on are not clever. They have boundaries that are easy to explain, queries that are visible in the code, and conventions that remove the need for a meeting. “Boring” is not a synonym for careless; it is what a system looks like after the team has removed accidental choices.

      ## Boring is a feature

      A framework earns its keep when it gives a team a small vocabulary. Models, controllers, jobs, mailers, and views should each have a recognizable job. That does not mean every object belongs in a model. It means a reader should be able to predict where a change belongs before opening a search window.

      I use a few questions when a new abstraction is proposed:

      1. What business operation does this name?
      2. Which boundary owns the side effect?
      3. What would a new teammate look for first?

      If the answer is “it keeps this controller short,” the abstraction probably needs a more useful reason to exist. A service object is valuable when it names a meaningful operation, not when it merely wraps three lines of Ruby.

      ## Boundaries that hold

      Rails makes it easy to move quickly, but speed can hide where state changes. I prefer writes to sit close to their transaction boundary and reads to make their shape visible. A command that publishes a post should say whether it also sends notifications, updates a search index, or merely changes one row.

      ```ruby
      result = PublishPost.call(post, actor: current_user)
      render json: result.post
      ```

      The code is not interesting because it uses a service object. It is useful because the operation has a name, a result, and a place where its failure can be handled. The controller can remain responsible for HTTP concerns while the command owns the application decision.

      ### Keep queries inspectable

      Query objects are not automatically better than scopes. I reach for one when a query has a meaningful input and output, or when composing scopes would obscure why a record is included. Otherwise, a well-named scope is often easier to discover.

      A few habits keep query behavior legible:

      - select only the columns the page needs;
      - preload associations at the boundary that renders them;
      - name a scope after the product concept, not the SQL trick;
      - add a regression test for an expensive or surprising join.

      The goal is not to prevent every query from changing. The goal is to make the cost and intent visible enough that a change can be reviewed without opening a console session.

      ## Errors are part of the design

      An ordinary exception is rarely an adequate product decision. A missing record, invalid transition, and unavailable dependency may all be raised from different places, but the caller still needs a predictable response. I like errors that preserve three pieces of information: what operation failed, whether retrying makes sense, and which input needs attention.

      > A good boundary makes the unhappy path as discoverable as the happy path.

      This is also why I avoid rescuing `StandardError` at a broad controller boundary unless the application has a deliberate mapping for it. A broad rescue can turn a programmer error into a friendly-looking 422 and leave the team debugging a lie.

      ## Conventions need maintenance

      Conventions are not a one-time architecture document. They are reinforced by examples, generators, code review, and tests. When a convention becomes awkward, the team should change it explicitly rather than creating a second convention beside it.

      The checklist I use on a Rails change is deliberately modest:

      1. Can the next engineer find the entry point?
      2. Is the state transition named?
      3. Does the test describe behavior at a boundary?
      4. Is the failure mode visible to the caller?
      5. Did the change add a new convention, and if so, is it worth keeping?

      The answers do not need to be perfect before the first commit. They need to be explicit enough that a teammate can question them, improve them, and recognize the same decision the next time it appears in the codebase.

      I have learned to treat boringness as a feature. When a new engineer can predict where a change belongs, the framework is doing its job and the team can spend its energy on product decisions.
    BODY
    tags: %w[ruby rails architecture],
    published: true,
    published_at: Time.current - 4.days,
    cover_image_url: "/covers/aurora.svg"
  },
  {
    title: "A Practical Guide to Reading a Slow Query",
    excerpt: "The fastest way to fix database performance is to measure the query plan before changing the application.",
    body_markdown: <<~BODY,
      A slow page often sends us looking for an expensive Ruby loop, but the database usually has a much better explanation. I start with the exact SQL generated in production-like data, then run `EXPLAIN (ANALYZE, BUFFERS)` against it. The important part is not memorizing every planner node; it is learning to ask whether the work matches what the request needs.

      ## Start with a representative question

      Before touching an index, write down the request the query serves. Which tenant is it reading? How many rows should it return? Is the ordering part of the contract? A query that is fast for twenty rows in development may be doing millions of rows of work for the largest account.

      I capture the SQL and bind values from an application request rather than copying a simplified query from memory. Then I run it against a database with realistic cardinalities. A plan without realistic data can answer the wrong question very confidently.

      ### Read the plan as a story

      `EXPLAIN` describes the planner's intended route. `EXPLAIN ANALYZE` executes the query and adds actual timing and row counts. I compare estimates with reality first. A large difference often points to stale statistics, correlated columns, or a predicate whose selectivity changes across tenants.

      ```sql
      EXPLAIN (ANALYZE, BUFFERS)
      SELECT orders.id, orders.created_at
      FROM orders
      WHERE orders.account_id = 42
        AND orders.status = 'open'
      ORDER BY orders.created_at DESC
      LIMIT 50;
      ```

      A sequential scan is not automatically bad. If a table is tiny, reading it once can be cheaper than walking an index. An index is not automatically useful either: if the predicate matches most rows, the planner may correctly choose a scan.

      Look for a few specific signals:

      - an estimated row count that is far from the actual count;
      - a sort or hash that spills to disk;
      - repeated scans caused by a nested loop;
      - rows removed by a filter after an expensive step;
      - buffer reads that dwarf the rows returned to the application.

      These signals describe work, not blame. The fix may belong in SQL, schema design, application code, or the shape of the request.

      ## Choosing an index

      An index should support a real access pattern. For the example above, the useful order often starts with the equality predicate and continues with the ordering column:

      ```sql
      CREATE INDEX CONCURRENTLY index_orders_on_account_status_created
      ON orders (account_id, status, created_at DESC);
      ```

      Whether that index is right depends on existing indexes, write volume, and the distribution of statuses. A wide index increases write cost and storage. I check duplicate or overlapping indexes before adding another one, and I schedule a cleanup separately so the performance fix remains easy to review.

      A composite index is not a magic prefix for every query. The leftmost columns matter, and a query filtering only by `status` may not benefit from an index beginning with `account_id`. I prefer a small set of measured indexes over a catalog of speculative ones.

      > The cheapest query is the one whose required work is obvious before it reaches production.

      ## Avoiding application-side amplification

      Some “database” problems are actually request-shape problems. Loading an account and then looping over its orders can produce one query for the account plus one query per row. In Rails, `preload`, `includes`, or a deliberate join can fix that, but each changes the result shape and should be checked against the view.

      I also inspect the selected columns. A list page rarely needs a serialized JSON payload, a large text field, and every timestamp. Narrowing the projection reduces memory and network work even when the database chooses the same index.

      A practical investigation sequence is:

      1. Reproduce the slow request and record its SQL.
      2. Run the exact query with `EXPLAIN (ANALYZE, BUFFERS)`.
      3. Compare estimated and actual rows.
      4. Identify the most expensive operation, not the most suspicious-looking line.
      5. Change one thing and rerun the same measurement.

      ## Measure the complete outcome

      A faster query plan is not automatically a faster page. Check database time, object allocation, serialization, and total request latency. An index that saves 80 milliseconds but adds enough write contention to slow every import may be a poor trade.

      Keep the before and after plans with the change, along with the data shape used for the test. A short note prevents the team from “optimizing” the query back to its previous form six months later. Measurements after the change are part of the fix, not an optional epilogue.
    BODY
    tags: %w[postgresql performance architecture],
    published: true,
    published_at: Time.current - 24.days,
    cover_image_url: "/covers/sunset.svg"
  },
  {
    title: "Testing the Behavior That Actually Matters",
    excerpt: "Tests become more valuable when they describe the contract a user or another service can observe.",
    body_markdown: <<~BODY,
      I used to measure a test suite by its line coverage. Coverage is useful, but it cannot tell us whether the important behavior is protected. A hundred assertions about private implementation details can still leave the public contract untested. The more useful question is whether a test would fail if a user-visible promise were broken.

      ## Start at the boundary

      These days I begin with the boundary. For a JSON endpoint, I check the request, response status, shape, and state change that follows. The test can use factories and helpers underneath, but it should read like a short example of the feature.

      A boundary test for publishing a post might ask:

      1. Can an authenticated editor publish a draft?
      2. Does the response expose the new publication time?
      3. Does an anonymous reader see the post afterward?
      4. Does publishing it twice preserve a meaningful timestamp?

      The questions are more valuable than the particular assertion library. They describe the contract that another client relies on.

      ```ruby
      test "publishing a draft makes it visible to readers" do
        post = posts(:draft)

        patch api_v1_post_url(post.slug),
          params: { post: { published: true } },
          headers: admin_headers

        assert_response :success
        assert_not_nil post.reload.published_at

        get api_v1_post_url(post.slug)
        assert_response :success
      end
      ```

      ## Choose the right distance

      Not every behavior needs an end-to-end test. A unit test is a good fit for a pure parser, a value object, or a policy with a small input/output surface. An integration test is useful when a database transaction, serializer, or external boundary is part of the behavior.

      I think of test distance as a cost and a kind of evidence. A unit test can explain a branch precisely, while an integration test can prove that wiring actually connects. Use the shortest test that proves the promise, then add a higher-level example when integration itself is the risk.

      ### Test failure as carefully as success

      The unhappy path is not a second-class case. Invalid input should identify the field that needs correction. Missing authorization should not accidentally reveal whether a private record exists. A dependency timeout should leave a retryable state rather than silently reporting success.

      A useful failure test says what the caller can do next:

      - a validation response names the invalid attribute;
      - a 404 confirms that the resource is unavailable;
      - a 401 sends the client to authentication;
      - a 409 explains which state transition conflicted;
      - a 503 indicates that retrying may be reasonable.

      > A test should make the next action obvious to the person reading the failure.

      ## Avoid implementation-shaped tests

      Tests become brittle when they know too much about private arrangement. If a controller delegates to a command object, the endpoint test should not assert that a method called `perform` was invoked. It should assert the response and resulting state. The command can have its own tests for transitions that are awkward to exercise through HTTP.

      This separation makes refactoring safer. When a controller becomes a command object or a query changes its implementation, the test remains useful because it never depended on the old arrangement of methods. A failing test then points to a changed contract rather than a changed filing cabinet.

      ## Keep fixtures understandable

      Factories are powerful, but a test that creates ten layers of traits can hide the reason it passes. I prefer small named fixtures for stable examples and explicit setup for the one unusual condition a test is about to exercise.

      The data should represent the boundary:

      | Example | Important state | Expected observation |
      | --- | --- | --- |
      | Draft post | `published: false` | hidden from readers |
      | Published post | `published: true` | appears in public list |
      | Invalid post | blank title | returns a field error |

      If a fixture needs a comment to explain why it exists, its name or shape may need improvement. The test should spend its words on behavior.

      ## Let coverage ask questions

      I still look at coverage, but as a prompt rather than a score. An uncovered branch may be harmless defensive code, or it may be the missing example that would have caught a production bug. A high percentage can also be misleading when every assertion checks an internal method.

      On a review, I ask whether the new behavior has:

      1. a happy-path example;
      2. a meaningful invalid or unauthorized example;
      3. an assertion about persisted state;
      4. a regression example for the reason the change exists.

      This style keeps tests close to product language. It also makes them easier to delete when the behavior goes away. The best test suite is not the one with the most examples; it is the one that gives the team confidence to change the implementation without losing the promises users depend on.
    BODY
    tags: %w[testing rails],
    published: true,
    published_at: Time.current - 53.days,
    cover_image_url: "/covers/grid.svg"
  },
  {
    title: "Keeping a React UI Honest About Loading States",
    excerpt: "A small state model prevents asynchronous interfaces from quietly lying to users.",
    body_markdown: <<~BODY,
      Loading is not a boolean. A screen can be waiting for its first response, refreshing data it already has, submitting a change, or recovering from an error. Treating all of these as `isLoading` creates flicker and makes the UI hard to reason about. It also encourages a common lie: replacing useful stale content with a spinner whenever any request starts.

      ## Name what the user can see

      I prefer state names that describe the interface: `initial`, `ready`, `refreshing`, and `failed`. The names make it obvious which content should remain on screen and which controls should be disabled. They also expose questions that a vague boolean hides.

      ```jsx
      function Results({ state }) {
        if (state.kind === "initial") return <ResultsSkeleton />;
        if (state.kind === "failed") return <RetryPanel error={state.error} />;

        return (
          <>
            {state.kind === "refreshing" && <RefreshNotice />}
            <ResultList items={state.items} />
          </>
        );
      }
      ```

      In this example, refreshing does not erase the list. That choice matters on a slow connection: the user can keep reading while the next response arrives, and the notice explains why the data may change.

      ### Model impossible states away

      A pair of booleans can describe contradictory screens: `isLoading: true` and `hasError: true`, or `isLoading: false` with no data and no error. A discriminated union makes the states explicit in TypeScript:

      ```jsx
      const initialState = { kind: "initial" };
      // ready: { kind: "ready", items }
      // refreshing: { kind: "refreshing", items }
      // failed: { kind: "failed", error, previousItems? }
      ```

      The exact representation can vary, but the principle is stable. Each state should answer what content exists, what action is available, and whether the user is waiting for something.

      ## Separate request state from screen state

      A fetch promise describes a request, not the whole screen. A component may have content from a previous request, a form with unsaved edits, and a mutation currently in flight. Combining these into one `loading` flag makes unrelated transitions interfere with each other.

      I keep separate concerns where they have separate user consequences:

      - initial loading controls the skeleton;
      - refresh controls a small status message;
      - mutation controls the submit button;
      - navigation controls whether stale results should be ignored.

      This avoids a full-page flash when a filter changes and keeps a save button disabled only while its own request is active.

      ## Handle races deliberately

      Search and filter interfaces make races visible. Request A can start, request B can start later, and A can finish last. If the component accepts both responses, the screen shows an answer for an old query.

      A small request identity or an `AbortController` is usually enough. The important part is to make the decision explicit: a response is useful only if it still belongs to the active input. Error handling should follow the same rule, otherwise a cancelled request can replace a successful state with an irrelevant error.

      > A response is not automatically current just because it arrived.

      ## Design the empty state

      Empty is different from loading and failure. A successful search with no results needs an explanation and perhaps a way to broaden the query. A new account with no projects needs a call to action. If both use the same blank panel, the user cannot tell whether the system worked.

      I usually write the empty-state sentence before implementing the component. It forces the team to decide whether the condition is expected, actionable, or evidence of a missing setup step.

      ### Keep retries local

      A retry should preserve whatever is still useful. If a refresh fails and old results are safe to show, keep them visible and put the error near the refresh control. If the initial load fails, show a clear retry action where the content would have been.

      The distinction is especially important on mobile, where a full-screen error can make a temporary network problem feel like data loss. The UI should say whether the app has no data or whether it could not fetch the latest data.

      ## Test transitions, not snapshots

      Snapshot tests can tell us that markup changed, but they rarely explain whether a loading transition is honest. I prefer tests that start with a pending request, resolve or reject it, and assert the visible contract:

      1. the skeleton appears only before the first result;
      2. existing results remain during refresh;
      3. a failed refresh preserves safe stale data;
      4. a retry returns to the right pending state;
      5. an old response cannot overwrite a newer request.

      This is less about a particular React library than about acknowledging time in the design. Once the states are explicit, components get smaller and product conversations become concrete: what should happen if the user retries while stale data is still visible? The answer belongs in the interface and in the test.
    BODY
    tags: %w[react frontend architecture],
    published: true,
    published_at: Time.current - 83.days,
    cover_image_url: "/covers/aurora.svg"
  },
  {
    title: "The Smallest Useful Architecture Diagram",
    excerpt: "A diagram earns its place when it helps a team make a decision or find a boundary.",
    body_markdown: <<~BODY,
      Architecture diagrams have a reputation for becoming obsolete as soon as they are drawn. The problem is often not the diagram; it is that nobody knows what question the diagram answers. A picture that tries to describe every class, queue, and vendor becomes a second codebase without the compiler's help.

      ## Draw one decision

      I have had better luck with diagrams that show one flow at a time. A request, a queue, a database, and an external dependency are enough to discuss ownership, failure modes, and latency. The drawing can stay useful even while implementation details evolve.

      Before drawing, I write a sentence beginning with “We need to decide…” If the sentence is about deployment ownership, the diagram should show boundaries and operators. If it is about latency, it should show the synchronous path and where time accumulates. If it is about data correctness, it should show writes, retries, and the source of truth.

      A useful diagram usually has fewer boxes than the first draft. Removing a box is not hiding complexity when that box does not affect the decision; it is keeping attention on the relationship under discussion.

      ### Make arrows mean something

      An arrow can mean a network request, an event, a replicated record, or simply “depends on.” Those are very different relationships. I label the important ones with the operation and, when useful, the expected timing.

      ```text
      browser -- POST /exports (synchronous) --> application
      application -- ExportRequested (at-least-once) --> queue
      worker -- write file --> object storage
      browser -- GET /exports/:id --> application
      ```

      The labels give a reviewer something to challenge. Is the event at-least-once? Can the browser poll? Does object storage become the source of truth, or is the database status authoritative?

      ## Show failure paths

      The happy path is usually already familiar. The architecture becomes valuable when it explains what happens after a timeout, duplicate delivery, or partial deploy. I use a small set of questions:

      1. What happens if the dependency accepts the request but the response is lost?
      2. Where is an in-progress operation visible?
      3. Which component owns retries and backoff?
      4. How does an operator find the correlation ID?
      5. Can the operation be safely repeated?

      These questions often reveal that a box labeled “worker” is carrying too many responsibilities. The worker may need an idempotency key, a lease, a dead-letter state, and a user-facing status. The diagram should not become an implementation manual, but it should expose the decisions that make the flow operable.

      > A diagram earns its place when it helps someone choose, debug, or hand off work.

      ### Put context beside the picture

      I also put the decision next to the picture. “We keep this work asynchronous because the provider can take thirty seconds” is more durable than a box labeled “worker.” Context is the part that future readers cannot infer from arrows alone.

      A short decision note should include the constraints that mattered, alternatives considered, and what would cause a revisit. It does not need to predict every future system. It needs to explain why this shape was reasonable at the time.

      ## Choose the right level

      There are at least three useful levels of architecture drawing:

      - a system context map showing users, the product, and external dependencies;
      - a container or service flow showing ownership and communication;
      - a focused sequence showing one request, event, or failure mode.

      I avoid mixing all three in one image. A context map is good for a planning conversation, but it cannot explain retry order. A sequence is good for an incident review, but it may be too detailed for a new teammate learning the system.

      ### Treat diagrams as code-adjacent

      Diagrams should have an owner, a location, and a review habit. Keep the source in the repository when possible, use stable names for important boundaries, and link the image from the decision record or runbook. A diagram that nobody can find is equivalent to an unwritten assumption.

      I do not require every commit to update a drawing. Instead, I look for changes that alter a boundary, a dependency, or a failure mode. Those changes deserve a diagram review in the same way that a public API change deserves documentation review.

      ## Review the model with reality

      After drawing, trace one real request through logs and compare it with the picture. If the diagram says the application writes status before enqueueing but the code does the reverse, the mismatch is useful evidence. Either the implementation or the model needs to change.

      The review checklist is short:

      1. Can a new teammate explain the synchronous path?
      2. Are ownership boundaries visible?
      3. Is the source of truth named?
      4. Are retries, duplicates, and timeouts accounted for?
      5. Is there a sentence explaining why the shape exists?

      A good diagram is not an architectural trophy. It is a compact tool for making a decision and remembering the constraint behind it. When it stops helping, delete or redraw it instead of preserving a stale picture out of politeness.
    BODY
    tags: %w[architecture],
    published: true,
    published_at: Time.current - 118.days,
    cover_image_url: "/covers/forest.svg"
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
    published: true,
    published_at: Time.current - 151.days,
    cover_image_url: "/covers/sunset.svg"
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
    published: false,
    published_at: nil
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
    published: false,
    published_at: nil
  },
  {
    title: "A Good API Error Has a Job",
    excerpt: "Error responses should help a caller decide what to do next, not simply announce that something went wrong.",
    body_markdown: <<~BODY,
      An API error is part of the interface contract. A status code tells a client how broadly to classify the problem, while the response body should provide enough context for a useful next action.

      I try to distinguish invalid input, missing resources, and temporary failures. The distinction lets a UI highlight a field, change a route, or offer a retry without parsing a sentence written for humans.

      Consistency matters more than cleverness here. A small documented error shape is easier to log, test, and evolve than a collection of controller-specific messages.
    BODY
    tags: %w[api architecture testing],
    published: true,
    published_at: Time.current - 184.days,
    cover_image_url: "/covers/grid.svg"
  },
  {
    title: "The Team Habit of Writing Things Down",
    excerpt: "A short decision record can save a team from reopening the same question every few months.",
    body_markdown: <<~BODY,
      Documentation is often framed as a task that competes with delivery. I think of a good note as part of delivery: it gives the next person the context required to safely continue the work.

      The most useful notes are specific about the decision, alternatives, and the evidence available at the time. They do not need to predict the future or become a complete manual.

      Writing also exposes uncertainty early. If a decision is difficult to summarize, that may be a sign that ownership or constraints still need clarification before implementation begins.
    BODY
    tags: %w[career architecture],
    published: true,
    published_at: Time.current - 221.days,
    cover_image_url: "/covers/forest.svg"
  },
  {
    title: "Refactoring Without Losing the Plot",
    excerpt: "The safest refactors improve the shape of code while keeping the product behavior observable.",
    body_markdown: <<~BODY,
      Refactoring is easiest to explain when the behavior under protection is explicit. Without that boundary, a cleanup can quietly become a feature change and reviews become a debate about taste.

      I prefer small steps with a working test after each one. Rename a concept, move one responsibility, and let the compiler or suite tell us where the old assumption still lives.

      The result is not merely cleaner code. It is a team that can change direction without making every improvement feel like a rewrite.
    BODY
    tags: %w[ruby testing career],
    published: true,
    published_at: Time.current - 255.days,
    cover_image_url: "/covers/aurora.svg"
  },
  {
    title: "When a Queue Is the Right Boundary",
    excerpt: "Asynchronous work is useful when it gives a slow or unreliable dependency room to fail safely.",
    body_markdown: <<~BODY,
      A queue is not a universal performance button. It changes when a user receives feedback, how retries work, and where the system stores the state of an unfinished operation. Adding one can make a request faster while making the product harder to explain, so I start with the user-visible contract rather than the worker technology.

      ## Find the right boundary

      I reach for a queue when the caller does not need the external result before responding. That boundary keeps request latency predictable and lets workers apply backoff without holding open a browser connection. Sending a receipt email, resizing an uploaded image, and importing a large report are common examples.

      A queue is a poor fit when the caller must know the result to continue, when the operation is too small to justify another state, or when a delayed failure would be more confusing than a slow response. In those cases, making the synchronous path efficient may be the simpler design.

      ### Name the unfinished state

      Once work moves out of the request, the product needs a durable answer to “what happened?” A boolean such as `complete` is rarely enough. I prefer states that describe the lifecycle:

      1. `queued` means the application accepted the request;
      2. `running` means a worker has claimed it;
      3. `succeeded` contains the result location or summary;
      4. `failed` contains a safe explanation and retry policy.

      The state belongs in a store the reader can query. A log line is evidence for operators, not a user-facing status. The API can return a job ID immediately, while the UI polls or subscribes to a status endpoint.

      ```ruby
      ExportJob.perform_later(export_id)
      render json: { id: export_id, status: "queued" }, status: :accepted
      ```

      The response makes the asynchronous contract explicit. It does not pretend that enqueueing is the same as finishing.

      ## Design for repetition

      Most queues provide at-least-once delivery. A worker can complete the external call and crash before acknowledging the message, so the same job may run again. Idempotency is not an optimization; it is part of correctness.

      I give each operation a stable key derived from the business action. The worker checks whether that key already produced a result, performs the side effect inside the appropriate transaction or provider idempotency mechanism, and records the outcome. “Check then act” alone is not enough when two workers can race, so the database constraint or provider key must enforce uniqueness.

      > A retry is a normal execution path, not an exceptional fantasy.

      ### Make retries bounded

      Automatic retries are useful for transient network failures and dangerous for invalid input. The worker should distinguish retryable errors from permanent ones, use backoff, and stop after a deliberate limit. A dead-letter or failed state must be visible to someone who can decide what to do next.

      I record the last failure without storing secrets or an unbounded provider response. The useful fields are usually the operation, safe error category, attempt count, next retry time, and correlation ID.

      ## Protect the dependency

      A queue can move pressure rather than remove it. If ten thousand requests enqueue work for a dependency that can process one hundred operations per minute, the backlog becomes the new failure mode. Concurrency, rate limits, and queue partitioning should reflect the dependency's capacity.

      I watch at least these signals:

      - oldest queued item age;
      - queue depth by operation;
      - processing time and retry count;
      - permanent failures;
      - dependency rate-limit responses.

      A rising queue depth with a flat worker count is a capacity problem. A normal depth with growing age may indicate starvation or a blocked dependency. These signals help operators choose whether to add workers, slow producers, or pause a job class.

      ### Keep cancellation honest

      Cancellation is often requested after the work has already crossed an external boundary. The API should distinguish “cancel requested” from “cancelled,” and the worker should check cancellation at safe points. Claiming cancellation succeeded while a charge or email is still possible creates a worse incident than admitting the limit.

      For long work, checkpoints can make cancellation and recovery practical. Each checkpoint should be safe to repeat and should record enough progress to resume without guessing. This is also a natural place to expose progress to the UI.

      ## Test the operational contract

      A job test that only calls `perform` once misses the important behavior. I test:

      1. enqueueing returns the expected accepted response;
      2. a duplicate delivery does not duplicate the side effect;
      3. a transient failure retries with bounded attempts;
      4. a permanent failure becomes inspectable;
      5. a completed job exposes a useful result;
      6. a missing record does not create an endless retry loop.

      The operational detail matters: jobs need an idempotency key, visible failure state, and a way for someone to inspect what happened after the original request is gone. A queue is the right boundary when it gives both the user and the operator a clearer contract, not merely when it makes a benchmark number smaller.
    BODY
    tags: %w[architecture rails performance],
    published: true,
    published_at: Time.current - 290.days,
    cover_image_url: "/covers/sunset.svg"
  },
  {
    title: "A Frontend Performance Budget That People Use",
    excerpt: "A performance budget works when it is small enough to guide everyday decisions and visible before launch.",
    body_markdown: <<~BODY,
      Performance budgets are most effective when they describe the experience rather than a vanity number. Bundle weight, image size, and interaction timing each point at a different kind of user cost.

      I like budgets that are checked in the same place as the build. A warning in a pull request arrives while the tradeoff is still easy to discuss, instead of after a report says the site got slower last quarter.

      The budget should have an owner and an escape hatch. Product work sometimes needs an exception, but the exception should be visible enough that it does not become the new baseline by accident.
    BODY
    tags: %w[react frontend performance],
    published: true,
    published_at: Time.current - 325.days,
    cover_image_url: "/covers/grid.svg"
  },
  {
    title: "A Note on Reviewing Your Own Work",
    excerpt: "A deliberate second look catches confusing names and missing edge cases before they become somebody else's problem.",
    body_markdown: <<~BODY,
      Self-review is not a substitute for another pair of eyes. It is a short pause that lets the author read the change as a teammate who does not have the surrounding context.

      I check the happy path, the failure path, and the shape of the diff. I also look for names that made sense while I was implementing but will be ambiguous six months from now.

      That habit makes collaboration kinder. Reviewers can spend their time on the important design questions instead of reconstructing what a small change was meant to do.
    BODY
    tags: %w[career testing],
    published: true,
    published_at: Time.current - 360.days,
    cover_image_url: "/covers/forest.svg"
  }
]

posts.each do |attributes|
  post = Post.find_or_initialize_by(slug: attributes[:title].parameterize)
  post.assign_attributes(attributes)
  post.save!
end
