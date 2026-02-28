import { Component } from '@angular/core';

@Component({
  selector: 'app-projects',
  standalone: true,
  templateUrl: './projects.component.html',
})
export class ProjectsComponent {
  protected readonly projects = [
    {
      title: 'Payment Platform',
      description: 'Production-grade payment processing system with secure transactions, real-time status updates, and compliance requirements for fintech.',
      tech: ['React', 'Next.js', 'TypeScript', 'REST APIs'],
      link: '#',
    },
    {
      title: 'Loan Application System',
      description: 'End-to-end loan application flow with complex forms, document uploads, and multi-step validation for enterprise clients.',
      tech: ['React', 'TypeScript', 'Form Libraries', 'API Integration'],
      link: '#',
    },
    {
      title: 'Internal Operations Dashboard',
      description: 'Data-heavy internal dashboard for business operations with real-time metrics, reporting, and role-based access.',
      tech: ['React', 'Next.js', 'TypeScript', 'Data Visualization'],
      link: '#',
    },
    {
      title: 'Enterprise Web Application',
      description: 'Scalable frontend system for enterprise environment with maintainable architecture and extensible codebase.',
      tech: ['React', 'TypeScript', 'Clean Architecture', 'Performance'],
      link: '#',
    },
  ];
}
