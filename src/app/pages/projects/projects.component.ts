import { CommonModule } from '@angular/common';
import {
  Component,
  computed,
  ElementRef,
  signal,
  ViewChild,
} from '@angular/core';

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

const MOBILE_SWIPE_THRESHOLD_RATIO = 0.18;
const MOBILE_EDGE_RESISTANCE = 0.32;

@Component({
  selector: 'app-projects',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './projects.component.html',
  styleUrl: './projects.component.css',
})
export class ProjectsComponent {
  @ViewChild('mobileCarousel') private mobileCarousel?: ElementRef<HTMLElement>;
  protected readonly categories = signal<ProjectCategory[]>([

    {
      id: 'frontend',
      title: 'Frontend',
      items: [
        {
          id: 'fe-dashboard-app',
          title: 'Internal operations dashboard',
          description:
            'End-to-end loan flows with complex forms, uploads, and multi-step validation for enterprise clients.',
          tech: ['Next.js', 'TypeScript', 'zustand', 'framer-motion'],
          link: 'https://team-dashboard-app.vercel.app/',
        },
        {
          id: 'fe-ops-dashboard',
          title: 'minimal sales dashboard',
          description:
            'Data-heavy dashboards with mock metrics, reporting, and role-based access for business operations.',
          tech: ['React', 'Next.js', 'Framer-motion', 'Data visualization'],
          link: 'https://dashboard-pay.vercel.app/',
        },
        {
          id: 'fe-healthcare',
          title: 'Nzuricares web application',
          description:
            'Scalable frontend architecture, maintainable modules, and performance-conscious delivery in regulated environments.',
          tech: ['Next.js', 'TypeScript', 'Supabase-auth', 'Supabase'],
          link: 'https://nzuricares-webapp.vercel.app/',
        },
        {
          id: 'fe-teleprompter',
          title: 'Software teleprompter',
          description:
            'A browser based teleprompter that allows users to import files, markdown files, and text to be displayed on a screen in real time.',
          tech: ['React', 'TypeScript'],
          link: 'http://software-teleprompter.vercel.app/',
        },
        {
          id: 'Tmegha portfolio',
          title: 'Temitope Akinmegha portfolio',
          description:
            'Portfolio website for Temitope Akinmegha',
          tech: ['Angular', 'OpenAI integration', 'gsap'],
          link: 'https://temitopeakinmegha.com',
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

  protected readonly selectedCategoryId = signal<string>('frontend');
  protected readonly currentPage = signal(1);
  protected readonly mobileSlideIndex = signal(0);
  protected readonly mobileDragPx = signal(0);
  protected readonly mobileDragging = signal(false);

  private touchStartX = 0;
  private touchStartY = 0;
  private touchAxis: 'x' | 'y' | null = null;

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

  protected readonly mobileTrackTransform = computed(() => {
    const index = this.mobileSlideIndex();
    const drag = this.mobileDragPx();
    return `translateX(calc(-${index * 100}% + ${drag}px))`;
  });

  protected mobileSlideCount(): number {
    return this.categoryItems().length;
  }

  protected mobileSlideLabel(): string {
    const total = this.mobileSlideCount();
    if (total === 0) {
      return '';
    }
    return `${this.mobileSlideIndex() + 1} / ${total}`;
  }

  protected onMobileTouchStart(event: TouchEvent): void {
    if (event.touches.length !== 1) {
      return;
    }
    this.touchStartX = event.touches[0].clientX;
    this.touchStartY = event.touches[0].clientY;
    this.touchAxis = null;
    this.mobileDragging.set(true);
    this.mobileDragPx.set(0);
  }

  protected onMobileTouchMove(event: TouchEvent): void {
    if (!this.mobileDragging() || event.touches.length !== 1) {
      return;
    }

    const x = event.touches[0].clientX;
    const y = event.touches[0].clientY;
    const dx = x - this.touchStartX;
    const dy = y - this.touchStartY;

    if (!this.touchAxis) {
      if (Math.abs(dx) < 6 && Math.abs(dy) < 6) {
        return;
      }
      this.touchAxis = Math.abs(dx) > Math.abs(dy) ? 'x' : 'y';
    }

    if (this.touchAxis !== 'x') {
      return;
    }

    this.mobileDragPx.set(this.resistedDrag(dx));
  }

  protected onMobileTouchEnd(): void {
    if (!this.mobileDragging()) {
      return;
    }

    const width = this.mobileCarousel?.nativeElement.offsetWidth ?? 0;
    const threshold = Math.max(48, width * MOBILE_SWIPE_THRESHOLD_RATIO);
    const drag = this.mobileDragPx();
    const maxIndex = Math.max(0, this.mobileSlideCount() - 1);
    let next = this.mobileSlideIndex();

    if (drag < -threshold) {
      next = Math.min(next + 1, maxIndex);
    } else if (drag > threshold) {
      next = Math.max(next - 1, 0);
    }

    this.mobileSlideIndex.set(next);
    this.mobileDragPx.set(0);
    this.mobileDragging.set(false);
    this.touchAxis = null;
  }

  protected onMobileTouchCancel(): void {
    this.mobileDragPx.set(0);
    this.mobileDragging.set(false);
    this.touchAxis = null;
  }

  protected goToMobileSlide(index: number): void {
    const max = Math.max(0, this.mobileSlideCount() - 1);
    const clamped = Math.min(Math.max(index, 0), max);
    this.mobileSlideIndex.set(clamped);
    this.mobileDragPx.set(0);
    this.mobileDragging.set(false);
  }

  private resistedDrag(dx: number): number {
    const index = this.mobileSlideIndex();
    const max = Math.max(0, this.mobileSlideCount() - 1);
    const atStart = index === 0 && dx > 0;
    const atEnd = index === max && dx < 0;
    if (atStart || atEnd) {
      return dx * MOBILE_EDGE_RESISTANCE;
    }
    return dx;
  }

  protected selectCategory(id: string): void {
    this.selectedCategoryId.set(id);
    this.currentPage.set(1);
    this.resetMobileCarousel();
  }

  protected setPage(page: number): void {
    const total = this.totalPages();
    if (page >= 1 && page <= total) {
      this.currentPage.set(page);
    }
  }

  private resetMobileCarousel(): void {
    this.mobileSlideIndex.set(0);
    this.mobileDragPx.set(0);
    this.mobileDragging.set(false);
    this.touchAxis = null;
  }
}
