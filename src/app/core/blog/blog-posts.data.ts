import type { BlogPost } from './blog.model';

export const BLOG_POSTS: BlogPost[] = [
  {
    id: '1',
    slug: 'building-scalable-angular-applications',
    title: 'Building Scalable Angular Applications',
    excerpt:
      'Best practices for structuring large-scale Angular projects and maintaining performance.',
    date: 'Feb 15, 2025',
    readTime: '8 min read',
    content: `# Building Scalable Angular Applications

As Angular applications grow, structure becomes more important than any single optimization trick.

## Start with feature boundaries

Organize code by **feature**, not by file type.

\`\`\`typescript
export const routes: Routes = [
  {
    path: 'projects',
    loadComponent: () =>
      import('./pages/projects/projects.component').then((m) => m.ProjectsComponent),
  },
];
\`\`\`

## State: local first

| Approach | When to use |
| --- | --- |
| Component state | UI-only data |
| Signals / services | Cross-component within a feature |
| Global store | Truly app-wide concerns |

> Optimize when metrics tell you to—not when hype tells you to.
`,
  },
  {
    id: '2',
    slug: 'microservices-when-and-why',
    title: 'Microservices: When and Why',
    excerpt:
      'A practical guide to deciding when microservices make sense for your architecture.',
    date: 'Jan 28, 2025',
    readTime: '6 min read',
    content: `# Microservices: When and Why

Microservices are a deployment and team-scaling strategy—not a default architecture.

## What they buy you

- **Independent deployability**
- **Team autonomy**
- **Technology flexibility**

## What they cost you

- Distributed tracing and retries become everyday work.
- Data consistency moves toward eventual consistency.

> Premature distribution is one of the most expensive mistakes in backend architecture.
`,
  },
  {
    id: '3',
    slug: 'typescript-tips-for-cleaner-code',
    title: 'TypeScript Tips for Cleaner Code',
    excerpt:
      'Advanced TypeScript patterns that improve type safety and developer experience.',
    date: 'Jan 10, 2025',
    readTime: '5 min read',
    content: `# TypeScript Tips for Cleaner Code

TypeScript shines when types guide API design—not when they fight you.

## Prefer satisfies

\`\`\`typescript
const routes = {
  home: '/',
  blog: '/blog',
} as const satisfies Record<string, string>;
\`\`\`

## Discriminated unions for UI state

\`\`\`typescript
type RequestState<T> =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success'; data: T }
  | { status: 'error'; message: string };
\`\`\`

Great TypeScript reads like documentation that cannot go stale.
`,
  },
];
