const instructor = (name, suffix) => ({ _id: `65a0000000000000000000${suffix}`, name });
const lessonSet = titles => titles.map((title, index) => ({
  _id: `65b0000000000000000000${String(index + 1).padStart(2, '0')}`,
  title,
  order: index + 1,
  content: `${title}\n\nA practical lesson with examples, guided notes, and a short exercise to help you apply what you have learned.`,
}));

export const courses = [
  {
    _id: '65c000000000000000000001', title: 'Web Development Fundamentals', category: 'Development', duration: '4h 20m',
    description: 'Build a clear foundation in the web: from semantic HTML and modern CSS to the browser runtime and accessible interfaces.',
    instructor: instructor('Maya Patel', '01'), isEnrolled: false,
    lessons: lessonSet(['How the web works', 'Semantic HTML', 'CSS layout foundations', 'Responsive design', 'JavaScript in the browser', 'Accessibility essentials']),
  },
  {
    _id: '65c000000000000000000002', title: 'Advanced JavaScript Patterns', category: 'Development', duration: '5h 10m',
    description: 'Write more expressive JavaScript with practical patterns for composition, asynchronous work, and maintainable modules.',
    instructor: instructor('Jordan Lee', '02'), isEnrolled: false,
    lessons: lessonSet(['Closures in practice', 'Functional composition', 'Async control flow', 'Iterators and generators', 'Module boundaries', 'Resilient error handling']),
  },
  {
    _id: '65c000000000000000000003', title: 'Database Design', category: 'Backend', duration: '3h 45m',
    description: 'Model reliable data, choose useful relationships, and make schema decisions that stay understandable as products grow.',
    instructor: instructor('Amina Yusuf', '03'), isEnrolled: false,
    lessons: lessonSet(['From requirements to entities', 'Keys and relationships', 'Normalization without overdoing it', 'Indexes and query plans', 'Transactions and integrity']),
  },
  {
    _id: '65c000000000000000000004', title: 'API Design with Node.js', category: 'Backend', duration: '4h 05m',
    description: 'Design consistent HTTP APIs with Express, clear validation, useful error responses, and stable resource boundaries.',
    instructor: instructor('Ravi Narang', '04'), isEnrolled: false,
    lessons: lessonSet(['Resource-oriented routes', 'Request validation', 'Consistent response envelopes', 'Authentication middleware', 'Pagination and filtering', 'API versioning']),
  },
  {
    _id: '65c000000000000000000005', title: 'Testing Strategies', category: 'Full Stack', duration: '3h 30m',
    description: 'Choose the right level of test for each risk and build a dependable feedback loop from unit checks to user journeys.',
    instructor: instructor('Elena García', '05'), isEnrolled: false,
    lessons: lessonSet(['Testing as a design tool', 'Focused unit tests', 'Integration boundaries', 'Mocking external systems', 'End-to-end journeys']),
  },
  {
    _id: '65c000000000000000000006', title: 'Deployment & CI/CD', category: 'Full Stack', duration: '4h 40m',
    description: 'Take an application from a local machine to a repeatable release pipeline with checks, environments, and safe rollbacks.',
    instructor: instructor('Noah Williams', '06'), isEnrolled: false,
    lessons: lessonSet(['Build artifacts and environments', 'Continuous integration basics', 'Secrets and configuration', 'Deploying a Node service', 'Health checks and observability', 'Rollback strategies']),
  },
  {
    _id: '65c000000000000000000007', title: 'Full Stack Feature Workshop', category: 'Full Stack', duration: '6h 15m',
    description: 'Plan and build a complete feature across the browser, API, and database while keeping each boundary testable.',
    instructor: instructor('Priya Shah', '07'), isEnrolled: false,
    lessons: lessonSet(['Sketch the user flow', 'Shape the data model', 'Build the API route', 'Connect the interface', 'Handle loading and errors', 'Review and refine']),
  },
];

export default courses;
