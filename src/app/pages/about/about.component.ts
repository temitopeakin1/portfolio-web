import { Component } from '@angular/core';

export interface WhatIDoItem {
  id: string;
  title: string;
  content: string;
}

@Component({
  selector: 'app-about',
  standalone: true,
  templateUrl: './about.component.html',
})
export class AboutComponent {
  openId: string | null = null;

  whatIDoItems: WhatIDoItem[] = [
    {
      id: 'frontend-architecture',
      title: 'Frontend Architecture & Design',
      content: 'I design and implement frontend structure that scales: clear component boundaries, consistent patterns, and alignment with design systems. This includes choosing state management (React Query, Context, or Redux when needed), folder structure, and shared primitives so new features slot in without friction and the codebase stays maintainable as the team grows.',
    },
    {
      id: 'api-layer',
      title: 'API Layer Structuring',
      content: 'I structure the boundary between UI and backend with typed API clients, centralised error handling, and sensible caching (e.g. React Query). I keep data-fetching logic out of components, define clear contracts with the backend, and ensure loading and error states are handled consistently across the app so the frontend remains predictable and easy to change.',
    },
    {
      id: 'complex-forms',
      title: 'Complex Forms & Data UIs',
      content: 'I build complex forms (multi-step, conditional fields, validation) and data-heavy interfaces such as tables, filters, and dashboards. I focus on accessibility, clear validation feedback, and performance with large datasets (e.g. virtualisation or pagination) so users can complete tasks efficiently without hitting UX or performance bottlenecks.',
    },
    {
      id: 'performance',
      title: 'Performance Optimization',
      content: 'I work on bundle size, code-splitting, lazy loading, and runtime performance (render optimisation, memoisation, virtualisation where needed). I use Core Web Vitals and real-user metrics to prioritise improvements and ensure the application stays fast and responsive as features are added.',
    },
    {
      id: 'debugging',
      title: 'Debugging & Clean Code',
      content: 'I prioritise readable, well-structured code and clear naming so that debugging and refactoring are straightforward. I use systematic debugging (repro steps, narrowing scope, tools like React DevTools and network inspection) and support quality with tests and light documentation where they add the most value.',
    },
    {
      id: 'collaboration',
      title: 'Cross-Functional Collaboration',
      content: 'I work closely with product, design, and backend to align on requirements, feasibility, and timelines. I translate specs into technical tasks, flag trade-offs early, and keep handoffs clear so we ship the right thing without surprises. I find this collaboration essential for building products that both meet business goals and stay technically sound.',
    },
  ];

  toggle(id: string): void {
    this.openId = this.openId === id ? null : id;
  }

  isOpen(id: string): boolean {
    return this.openId === id;
  }
}
