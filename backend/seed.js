require('dotenv').config();

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Course = require('./models/Course');
const Lesson = require('./models/Lesson');
const User = require('./models/User');

const MONGO_URI = process.env.MONGO_URI || process.env.MONGODB_URI;
const DEMO_PASSWORD = 'Password123!';

const instructorData = [
  { name: 'Maya Patel', email: 'maya@openbook.test' },
  { name: 'Jordan Lee', email: 'jordan@openbook.test' },
  { name: 'Amina Yusuf', email: 'amina@openbook.test' },
  { name: 'Ravi Narang', email: 'ravi@openbook.test' },
  { name: 'Elena García', email: 'elena@openbook.test' },
  { name: 'Noah Williams', email: 'noah@openbook.test' },
  { name: 'Priya Shah', email: 'priya@openbook.test' },
];

// Each lesson pairs a concrete concept with an exercise a learner can complete.
const lesson = (title, minutes, explanation, exercise, example = '') => ({
  title,
  duration: minutes,
  content: [
    explanation,
    example && `Example\n\n${example}`,
    `Practice\n\n${exercise}`,
  ].filter(Boolean).join('\n\n'),
});

const courseData = [
  {
    title: 'Web Development Fundamentals',
    description: 'Build a clear foundation in the web: from semantic HTML and modern CSS to the browser runtime and accessible interfaces.',
    category: 'Development', duration: '4h 20m', instructorEmail: 'maya@openbook.test',
    lessons: [
      lesson('How the web works', 35, 'A browser turns a URL into a request, receives a response from a server, and builds a document it can render. Learn how DNS, HTTP, HTML, CSS, and JavaScript fit together, and how the developer tools Network panel reveals each step.', 'Open a page with the Network panel enabled. Identify its document request, status code, response type, and one asset loaded afterward.'),
      lesson('Semantic HTML', 40, 'HTML describes the meaning and structure of a document. Headings establish hierarchy, landmarks identify regions, and native buttons and links provide keyboard behavior that generic containers do not.', 'Build an article page with one main landmark, a logical heading order, a navigation region, and a list of related links.', '<main>\n  <article>\n    <h1>Field notes</h1>\n    <p>Observations from the project.</p>\n  </article>\n</main>'),
      lesson('CSS layout foundations', 45, 'The box model determines an element’s content, padding, border, and outer spacing. Flexbox arranges items along one axis; Grid is useful when rows and columns need to work together. Learn how intrinsic sizing prevents brittle fixed-width layouts.', 'Recreate a two-column article layout with Grid, then use Flexbox to align its metadata row. Resize the viewport and note which layout decisions remain stable.', '*, *::before, *::after { box-sizing: border-box; }\n.layout { display: grid; grid-template-columns: 16rem minmax(0, 1fr); gap: 2rem; }'),
      lesson('Responsive design', 40, 'Responsive interfaces adapt to available space instead of targeting a particular device. Use flexible units, content-driven breakpoints, responsive images, and a mobile-first cascade to keep content readable.', 'Take the two-column layout from the previous lesson and stack it when the content column becomes too narrow. Check at 320px, 768px, and desktop widths.', '@media (max-width: 48rem) {\n  .layout { grid-template-columns: 1fr; }\n}'),
      lesson('JavaScript in the browser', 40, 'The DOM represents the document as nodes that JavaScript can read and update. Event listeners respond to user actions, while browser APIs such as fetch and localStorage provide capabilities beyond the language itself.', 'Create a button that toggles a details panel. Update its expanded state and ensure repeated clicks open and close the same panel.', "button.addEventListener('click', () => {\n  panel.hidden = !panel.hidden;\n  button.setAttribute('aria-expanded', String(!panel.hidden));\n});"),
      lesson('Accessibility essentials', 40, 'Accessible interfaces support keyboard use, screen readers, zoom, and varied input methods. Start with semantic controls, visible focus, sufficient contrast, useful labels, and clear error messages; verify behavior rather than relying only on appearance.', 'Navigate your page using only Tab, Shift+Tab, Enter, and Space. Add a visible focus style and a programmatic label to any unlabeled control.'),
    ],
  },
  {
    title: 'Advanced JavaScript Patterns',
    description: 'Write more expressive JavaScript with practical patterns for composition, asynchronous work, and maintainable modules.',
    category: 'Development', duration: '5h 10m', instructorEmail: 'jordan@openbook.test',
    lessons: [
      lesson('Closures in practice', 45, 'A closure is a function together with access to variables in its lexical scope. Closures are useful for private state and callbacks, but captured values can also outlive the work that created them.', 'Build a createCounter function whose returned methods can read and update a private count without exposing the variable directly.', 'function createCounter() {\n  let count = 0;\n  return () => ++count;\n}'),
      lesson('Functional composition', 50, 'Small functions are easier to understand when each has one responsibility. Composition connects their outputs and inputs; pure functions make the same result from the same input without changing outside state.', 'Write separate functions to normalize a course title and create a URL slug, then compose or sequence them without mutating the original course object.'),
      lesson('Async control flow', 55, 'Promises represent values that may become available later. async and await make promise chains easier to read, while try/catch and finally give explicit places to handle failures and release loading state.', 'Fetch a list and its detail record, show a useful error if either request fails, and ensure a loading indicator is cleared on both success and failure.', 'async function loadCourse(id) {\n  try { return await fetchCourse(id); }\n  catch (error) { report(error); throw error; }\n}'),
      lesson('Iterators and generators', 45, 'An iterable provides a standard way to produce values one at a time. Generators pause at yield, making them useful for custom sequences and for understanding how iteration protocols work.', 'Create a generator that yields page numbers for a known total, then consume it with for...of and stop after the first three values.'),
      lesson('Module boundaries', 45, 'ES modules make dependencies explicit through import and export. A useful module boundary groups related behavior while keeping implementation details private and avoiding cycles between unrelated parts of an application.', 'Split a small data utility into named exports and a consumer module. Verify that each module has a clear reason to change.'),
      lesson('Resilient error handling', 50, 'Errors should preserve enough context to diagnose a failure and provide a useful recovery path. Distinguish expected validation failures from unexpected faults, and avoid swallowing exceptions or exposing internal details to end users.', 'Wrap a parsing operation with a targeted error message, log the underlying cause for debugging, and render a retry action only when retrying can help.'),
    ],
  },
  {
    title: 'Database Design',
    description: 'Model reliable data, choose useful relationships, and make schema decisions that stay understandable as products grow.',
    category: 'Backend', duration: '3h 45m', instructorEmail: 'amina@openbook.test',
    lessons: [
      lesson('From requirements to entities', 40, 'A data model begins with the facts a product must remember and the questions it must answer. Identify entities, attributes, ownership, and lifecycle before choosing tables or documents.', 'For a course catalog, list the entities needed to represent instructors, courses, lessons, and learner enrollment. Mark which facts belong to each entity.'),
      lesson('Keys and relationships', 45, 'Primary keys identify records; foreign keys connect related records and enforce referential integrity. One-to-many and many-to-many relationships should reflect the actual domain, not just the shape of one screen.', 'Draw the relationships for courses and lessons, then model learners enrolling in several courses while each course has many learners.'),
      lesson('Normalization without overdoing it', 45, 'Normalization reduces duplicated facts and update anomalies by assigning each fact a clear home. Denormalization can be appropriate for measured read patterns, but duplicated data needs an explicit consistency strategy.', 'Find a repeated instructor email in a sample course table. Move instructor facts into their own relation and describe how a course refers to its instructor.'),
      lesson('Indexes and query plans', 50, 'An index helps a database locate records without scanning a full collection, at the cost of storage and slower writes. Index field order should match actual filters and sorts; query plans show whether an index is used effectively.', 'Given queries filtering by instructor and sorting by creation date, propose an index and explain what workload evidence you would gather before adding it.'),
      lesson('Transactions and integrity', 45, 'A transaction groups related writes so they succeed or fail together. Constraints, unique indexes, and validation rules protect invariants even when requests race or application code has a bug.', 'Describe the invariant for one enrollment per learner and course. Choose a database constraint or atomic operation that makes two simultaneous enroll requests safe.'),
    ],
  },
  {
    title: 'API Design with Node.js',
    description: 'Design consistent HTTP APIs with Express, clear validation, useful error responses, and stable resource boundaries.',
    category: 'Backend', duration: '4h 05m', instructorEmail: 'ravi@openbook.test',
    lessons: [
      lesson('Resource-oriented routes', 40, 'HTTP APIs are easier to navigate when URLs identify resources and methods describe operations. Use nouns for collections and items, and choose status codes that communicate whether a resource was read, created, or rejected.', 'Design routes for listing courses, reading one course, creating a course, and enrolling the current learner. Specify the method and expected success status for each.'),
      lesson('Request validation', 40, 'Treat request data as untrusted at the server boundary. Validate types, required fields, formats, and allowed values before performing writes, and return field-specific feedback without leaking internal implementation details.', 'Add validation rules for a course title and description. Try missing, blank, and wrong-type values and record the response each should receive.'),
      lesson('Consistent response envelopes', 40, 'A stable response shape reduces special cases for API clients. Pair a clear message with structured data, use a consistent error shape, and keep list metadata separate from the resource records themselves.', 'Define example success and validation-error responses for course creation. Ensure the client can reliably find the returned course ID.'),
      lesson('Authentication middleware', 45, 'Authentication identifies the caller; authorization checks whether that caller may perform an operation. Middleware can verify a signed token once, attach a trusted user identity, and let role and ownership checks enforce narrower permissions.', 'Protect a route so only an authenticated instructor can create courses, then require the course owner to update an existing one.'),
      lesson('Pagination and filtering', 40, 'Large collections need bounded responses. Cursor pagination remains stable as records change; filtering and sorting should be explicit, validated, and backed by indexes that match common queries.', 'Design query parameters for category filtering and cursor pagination. Define what the next-page cursor represents and what happens when the filter changes.'),
      lesson('API versioning', 40, 'An API change is breaking when existing clients can no longer interpret a response or request. Prefer additive changes where possible, document deprecation windows, and introduce versions when incompatible behavior must coexist.', 'Take a response change that renames a field. Propose a migration that lets current clients keep working while a new client adopts the replacement.'),
    ],
  },
  {
    title: 'Testing Strategies',
    description: 'Choose the right level of test for each risk and build a dependable feedback loop from unit checks to user journeys.',
    category: 'Full Stack', duration: '3h 30m', instructorEmail: 'elena@openbook.test',
    lessons: [
      lesson('Testing as a design tool', 35, 'Tests provide fast feedback about behavior and make assumptions visible. Choose coverage based on risk: pure transformations are cheap to unit test, while critical user journeys need checks across real boundaries.', 'Pick one course-enrollment feature and list its highest-risk rules. Map each rule to the cheapest test level that still gives credible evidence.'),
      lesson('Focused unit tests', 40, 'A unit test checks a small piece of behavior with controlled inputs. Good tests assert outcomes rather than implementation details and include meaningful edge cases without duplicating the code under test.', 'Write cases for a progress-percentage function: no lessons, no completed lessons, partial completion, full completion, and an invalid total.'),
      lesson('Integration boundaries', 45, 'Integration tests verify that components collaborate across a real boundary such as a database, router, or HTTP handler. They catch wiring and serialization errors that isolated unit tests cannot reveal.', 'Test an API route against a disposable database and verify both the response envelope and the persisted enrollment record.'),
      lesson('Mocking external systems', 40, 'Mocks isolate a test from slow or costly external services, but overly detailed mocks can repeat implementation assumptions. Mock at stable boundaries and keep contract checks for the behavior your application depends on.', 'Mock a payment or email provider at its adapter boundary. Assert the intent passed to it, not the internal sequence of every helper call.'),
      lesson('End-to-end journeys', 50, 'End-to-end tests exercise the application as a user would, catching navigation, integration, and rendering defects. Keep the suite focused on critical paths because these tests are slower and more sensitive to environment setup.', 'Write a learner journey covering sign-in, course enrollment, lesson completion, and a visible progress update. Identify one useful failure message at each step.'),
    ],
  },
  {
    title: 'Deployment & CI/CD',
    description: 'Take an application from a local machine to a repeatable release pipeline with checks, environments, and safe rollbacks.',
    category: 'Full Stack', duration: '4h 40m', instructorEmail: 'noah@openbook.test',
    lessons: [
      lesson('Build artifacts and environments', 40, 'A build artifact is the packaged output that moves through release environments. Reproducible builds reduce surprises; environment-specific configuration should be supplied at runtime rather than baked into the artifact.', 'Document the inputs required to build the frontend and backend. Identify which values belong in environment configuration and which can safely be shared across environments.'),
      lesson('Continuous integration basics', 45, 'A CI pipeline runs repeatable checks whenever code changes. Useful stages include dependency installation, linting, unit and integration tests, and producing an artifact only after required checks pass.', 'Sketch a pipeline that blocks a release on a failed build or test. Make dependency installation deterministic using the committed lockfile.'),
      lesson('Secrets and configuration', 40, 'Credentials should not be committed to source control or exposed in client bundles. Store secrets in an environment or secret manager, grant each service only the access it needs, and rotate credentials after exposure.', 'Review a sample configuration and mark which values are public, sensitive, or environment-specific. Move a database credential to server-side secret configuration.'),
      lesson('Deploying a Node service', 50, 'A Node service needs a known runtime, startup command, port binding, and health behavior. Deployment configuration should make process failures visible and allow the service to restart without losing durable data.', 'Prepare a deployment checklist covering Node version, install command, startup script, injected port, database connection, and a smoke check.'),
      lesson('Health checks and observability', 45, 'A health endpoint should report whether the process can serve traffic, while metrics and structured logs help diagnose behavior over time. Avoid marking a service healthy if a critical dependency is unavailable.', 'Define a lightweight readiness check for an API with a database dependency. Add request IDs and structured error context to logs while omitting secrets.'),
      lesson('Rollback strategies', 40, 'A rollback restores a known-good application version when a release causes harm. Database changes need compatible migration steps because reverting code alone may not reverse a schema safely.', 'Plan a rollback for a release that adds a database field. Separate additive migration, application rollout, and any later cleanup that would make rollback unsafe.'),
    ],
  },
  {
    title: 'Full Stack Feature Workshop',
    description: 'Plan and build a complete feature across the browser, API, and database while keeping each boundary testable.',
    category: 'Full Stack', duration: '6h 15m', instructorEmail: 'priya@openbook.test',
    lessons: [
      lesson('Sketch the user flow', 50, 'A user flow makes the states and decisions in a feature visible before implementation. Include empty, loading, success, and error states so the interface and API contract account for more than the happy path.', 'Draw the learner flow for saving a course to a study list. Include first use, duplicate save, network failure, and removal.'),
      lesson('Shape the data model', 55, 'Data design should support the actions and queries in the flow while maintaining ownership and uniqueness rules. Start with the source of truth, then identify any derived values that can be computed safely.', 'Model the saved-course relationship for the study-list feature. Decide how to enforce one saved record per learner and course.'),
      lesson('Build the API route', 60, 'An API route should authenticate the caller, validate input, enforce authorization, and perform an atomic database operation. Its response should give the client enough information to update the view predictably.', 'Implement an authenticated endpoint to add or remove a saved course. Return a consistent envelope and define responses for missing courses and duplicate actions.'),
      lesson('Connect the interface', 60, 'The browser client should keep transport details in one API layer and present clear state transitions to the user. Disable duplicate submissions while a request is pending and refresh or update the visible list after success.', 'Connect a save button to the API. Make the saved state visible and ensure a failed request leaves the previous state understandable.'),
      lesson('Handle loading and errors', 50, 'Network requests can be delayed, interrupted, or rejected. Loading indicators should match the content being loaded, while retry controls should repeat only safe operations and preserve the user’s context.', 'Simulate a slow request and a rejected request. Provide a loading state and a retry action, then confirm neither state causes duplicate saved records.'),
      lesson('Review and refine', 40, 'A feature review checks behavior, accessibility, security, and maintainability across the entire path. A useful review follows the user flow, checks keyboard operation, inspects authorization, and removes duplicated logic.', 'Review the finished feature with another person or a checklist. Record one accessibility improvement, one security check, and one test that protects a key invariant.'),
    ],
  },
];

async function seed() {
  if (!MONGO_URI) {
    throw new Error('MONGO_URI (or MONGODB_URI) is not defined in backend/.env');
  }

  await mongoose.connect(MONGO_URI);
  console.log('Connected to MongoDB.');

  const password = await bcrypt.hash(DEMO_PASSWORD, 10);
  const instructorIds = new Map();
  for (const instructor of instructorData) {
    const user = await User.findOneAndUpdate(
      { email: instructor.email },
      { $set: { name: instructor.name, email: instructor.email, password, role: 'instructor' } },
      { upsert: true, new: true, runValidators: true, setDefaultsOnInsert: true },
    );
    instructorIds.set(instructor.email, user._id);
  }

  let created = 0;
  let updated = 0;
  let totalLessons = 0;
  for (const definition of courseData) {
    const instructorId = instructorIds.get(definition.instructorEmail);
    let course = await Course.findOne({ title: definition.title });

    // Never take ownership of an unrelated user's same-titled course.
    if (course && String(course.instructor) !== String(instructorId)) {
      console.log(`Skipped "${definition.title}": that title belongs to another instructor.`);
      continue;
    }

    const wasCreated = !course;
    if (!course) course = new Course({ instructor: instructorId, lessons: [], enrolledLearners: [] });
    course.title = definition.title;
    course.description = definition.description;
    course.category = definition.category;
    course.duration = definition.duration;
    course.instructor = instructorId;

    const lessonIds = [];
    for (const [index, item] of definition.lessons.entries()) {
      const doc = await Lesson.findOneAndUpdate(
        { course: course._id, order: index + 1 },
        { $set: { title: item.title, content: item.content, duration: item.duration, course: course._id, order: index + 1 } },
        { upsert: true, new: true, runValidators: true, setDefaultsOnInsert: true },
      );
      lessonIds.push(doc._id);
    }

    course.lessons = lessonIds;
    await course.save();
    totalLessons += lessonIds.length;
    if (wasCreated) created += 1;
    else updated += 1;
    console.log(`${wasCreated ? 'Created' : 'Updated'}: ${definition.title} (${lessonIds.length} lessons)`);
  }

  console.log(`Seed complete: ${created} created, ${updated} updated, ${totalLessons} lessons.`);
  console.log(`Demo instructor password: ${DEMO_PASSWORD}`);
}

seed()
  .catch((error) => {
    console.error('Seed failed:', error.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    if (mongoose.connection.readyState !== 0) await mongoose.disconnect();
  });
