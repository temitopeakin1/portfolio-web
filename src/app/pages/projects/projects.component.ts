import { Component, computed, signal } from '@angular/core';

const PROJECTS_PER_PAGE = 6;

export interface ProjectItem {
  id: string;
  title: string;
  description: string;
  tech: string[];
  link: string;
}

export interface ProjectCategory {
  id: string;
  title: string;
  items: ProjectItem[];
}

@Component({
  selector: 'app-projects',
  standalone: true,
  templateUrl: './projects.component.html',
})
export class ProjectsComponent {
  protected readonly categories = signal<ProjectCategory[]>([

    {
      id: 'frontend',
      title: 'Frontend',
      items: [
        {
          id: 'fe-loan-app',
          title: 'Loan application system',
          description:
            'End-to-end loan flows with complex forms, uploads, and multi-step validation for enterprise clients.',
          tech: ['React', 'TypeScript', 'Forms', 'API integration'],
          link: '#',
        },
        {
          id: 'fe-ops-dashboard',
          title: 'Internal operations dashboard',
          description:
            'Data-heavy dashboards with real-time metrics, reporting, and role-based access for business operations.',
          tech: ['React', 'Next.js', 'TypeScript', 'Data visualization'],
          link: '#',
        },
        {
          id: 'fe-enterprise',
          title: 'Enterprise web application',
          description:
            'Scalable frontend architecture, maintainable modules, and performance-conscious delivery in regulated environments.',
          tech: ['React', 'TypeScript', 'Architecture', 'Performance'],
          link: '#',
        },
        {
          id: 'fe-onboarding',
          title: 'Customer onboarding portal',
          description:
            'Guided onboarding with progress tracking and integration with core services for a smooth first-time experience.',
          tech: ['Next.js', 'TypeScript', 'REST'],
          link: '#',
        },
        {
          id: 'fe-analytics',
          title: 'Analytics & reporting suite',
          description:
            'Configurable reports, filters, and exports for stakeholders with saved views and scheduled delivery.',
          tech: ['React', 'Charts', 'TypeScript'],
          link: '#',
        },
      ],
    },
    {
      id: 'backend',
      title: 'Backend',
      items: [
        {
          id: 'be-payments',
          title: 'Payment platform services',
          description:
            'Secure transaction flows, webhooks, and idempotent APIs with emphasis on reliability and audit-friendly behavior.',
          tech: ['Node.js', 'NestJS', 'REST', 'TypeScript'],
          link: '#',
        },
        {
          id: 'be-loan-apis',
          title: 'Loan & onboarding APIs',
          description:
            'Backend for multi-step applications: validation, document handling, and integration with core banking and third-party checks.',
          tech: ['NestJS', 'TypeScript', 'REST'],
          link: '#',
        },
        {
          id: 'be-auth-identity',
          title: 'Auth & identity service',
          description:
            'JWT/session flows, refresh tokens, role claims, and integration with enterprise SSO where required.',
          tech: ['Node.js', 'TypeScript', 'OAuth2', 'REST'],
          link: '#',
        },
        {
          id: 'be-notifications',
          title: 'Notifications & messaging',
          description:
            'Email and in-app notification pipelines with retries, templating, and delivery tracking for operational visibility.',
          tech: ['NestJS', 'TypeScript', 'Queues', 'REST'],
          link: '#',
        },
        {
          id: 'be-reporting-jobs',
          title: 'Reporting & scheduled jobs',
          description:
            'Cron-driven aggregation, report generation, and exports with idempotent workers and failure alerts.',
          tech: ['Node.js', 'TypeScript', 'PostgreSQL', 'Bull'],
          link: '#',
        },
        {
          id: 'be-file-documents',
          title: 'Document & file service',
          description:
            'Secure uploads, virus scanning hooks, presigned URLs, and lifecycle rules for compliance-sensitive documents.',
          tech: ['NestJS', 'TypeScript', 'S3-compatible', 'REST'],
          link: '#',
        },
        {
          id: 'be-integration-gateway',
          title: 'Integration gateway',
          description:
            'Outbound adapters for third-party APIs with circuit breakers, structured logging, and contract tests.',
          tech: ['TypeScript', 'REST', 'OpenAPI', 'Resilience'],
          link: '#',
        },
        {
          id: 'be-audit-logging',
          title: 'Audit & event logging',
          description:
            'Immutable audit trails and domain events for regulated workflows, with query APIs for support and compliance.',
          tech: ['Node.js', 'TypeScript', 'Event sourcing', 'REST'],
          link: '#',
        },
      ],
    },
    {
      id: 'open-source',
      title: 'Open source',
      items: [
        {
          id: 'oss-portfolio',
          title: 'Portfolio site',
          description:
            'This portfolio — Angular, standalone components, Tailwind, and deployable static build. Source available for reference and forks.',
          tech: ['Angular', 'TypeScript', 'Tailwind CSS'],
          link: 'https://github.com/temitopeakin1',
        },
        {
          id: 'oss-contributions',
          title: 'Community contributions',
          description:
            'Bug fixes, documentation, and small features across public repositories; focused on clarity and maintainable patches.',
          tech: ['GitHub', 'Open source'],
          link: 'https://github.com/temitopeakin1',
        },
      ],
    },
    {
      id: 'tooling',
      title: 'Tooling',
      items: [
        {
          id: 'tool-design-system',
          title: 'Design system & component library',
          description:
            'Shared UI primitives, Storybook documentation, and tokens so teams ship consistent, accessible interfaces faster.',
          tech: ['React', 'Storybook', 'TypeScript', 'Accessibility'],
          link: '#',
        },
        {
          id: 'tool-dx',
          title: 'Developer experience',
          description:
            'Linting, formatting, and CI checks aligned across repos so onboarding and code review stay predictable.',
          tech: ['ESLint', 'Prettier', 'CI'],
          link: '#',
        },
      ],
    },


  ]);

  protected readonly selectedCategoryId = signal<string>('open-source');
  protected readonly currentPage = signal(1);

  protected readonly activeCategory = computed(() => {
    const id = this.selectedCategoryId();
    const list = this.categories();
    return list.find((c) => c.id === id) ?? list[0];
  });

  protected readonly categoryItems = computed(() => this.activeCategory()?.items ?? []);

  protected readonly totalPages = computed(() =>
    Math.ceil(this.categoryItems().length / PROJECTS_PER_PAGE) || 1
  );

  protected readonly pageNumbers = computed(() =>
    Array.from({ length: this.totalPages() }, (_, i) => i + 1)
  );

  protected readonly paginatedProjects = computed(() => {
    const items = this.categoryItems();
    const page = this.currentPage();
    const start = (page - 1) * PROJECTS_PER_PAGE;
    return items.slice(start, start + PROJECTS_PER_PAGE);
  });

  protected selectCategory(id: string): void {
    this.selectedCategoryId.set(id);
    this.currentPage.set(1);
  }

  protected setPage(page: number): void {
    const total = this.totalPages();
    if (page >= 1 && page <= total) {
      this.currentPage.set(page);
    }
  }
}
