import { Component } from '@angular/core';
import { PortfolioCopilotComponent } from '../../shared/portfolio-copilot/portfolio-copilot.component';

export interface WhatIDoItem {
  id: string;
  title: string;
  content: string;
}

export interface WorkExperience {
  id: string;
  role: string;
  company: string;
  location?: string;
  workMode?: 'Remote' | 'Hybrid' | 'Onsite';
  startDate: string;
  endDate: string;
  highlights: string[];
}

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [PortfolioCopilotComponent],
  templateUrl: './about.component.html',
})
export class AboutComponent {
  openId: string | null = null;

  workExperiences: WorkExperience[] = [
    {
      id: 'exp-1',
      role: 'Software Engineer',
      company: 'Access Holdings (Oxygen X Finance Company Ltd)',
      location: 'Lagos, Nigeria',
      workMode: 'Hybrid',
      startDate: 'July 2024',
      endDate: 'Present',
      highlights: [
        'Designed and implemented a Self-Service Onboarding module on the Oxygen Now MVP platform using Next.js, enabling merchants to independently register, upload KYC and business documents, and receive real-time status updates during document review.',
        'Developed a Vendor Redirect workflow that enables users with incomplete onboarding to seamlessly resume their process from the exact point of interruption, improving user experience and reducing onboarding drop-offs.',
        'Developed a Point-of-Sale (POS) Merchant Onboarding feature with Next.js, empowering agents to efficiently onboard both individual and corporate clients.',
        'Translated Figma designs into pixel-perfect, production-ready interfaces for Oxygen Now Version 1 using React and TypeScript, ensuring design accuracy and optimal user experience.',
        'Designed, developed, and maintained scalable web applications and APIs using Node.js.',
      ],
    },
    {
      id: 'exp-2',
      role: 'Senior FullStack Engineer',
      company: 'Biela.dev',
      location: 'UAE, Dubai',
      workMode: 'Remote',
      startDate: 'Dec.2024',
      endDate: 'Feb.2025',
      highlights: [
        'Developed the Dashboard, Settings, and Profile pages from scratch based on Figma designs, ensuring seamless functionality and a consistent user experience.',
        'Contributed enhancements to the WebContainer platform, including the development and implementation of file management features such as creating new files and folders, renaming files or folders, and deleting files or folders, significantly improving the platform\'s file structure functionality and user experience.',
        'Developed the API documentation page, providing clear and comprehensive guidelines for users to efficiently interact with the platform\'s API.',
        'Developed and optimized scalable APIs with NestJS, PostgreSQL, and Docker for biela.dev, an AI-driven platform for generating full-stack applications, handling 50k+ daily requests and reducing integration failures by 30%.',
        'Developed robust logic to enable seamless file uploads, enhancing user functionality and streamlining the process for managing file interactions within the platform.',
      ],
    },
    {
      id: 'exp-3',
      role: 'Software Engineer',
      company: 'First City Monument Bank (FCMB)',
      location: 'Lagos, Nigeria',
      workMode: 'Hybrid',
      startDate: 'July 2022',
      endDate: 'Dec.2024',
      highlights: [
        'Wrote reusable unit test documentation to ensure a bug-free application, increasing efficiency by over 30%.',
        'Translated Figma designs into pixel-perfect, functional web interfaces.',
        'Revamped the branch application user interface (Slip free) to deliver a stronger look and feel for the product.',
        'Developed and maintained web applications for the financial institution\'s online banking platform using Angular.',
        'Implemented secure coding practices to safeguard sensitive financial data.',
        'Implemented the CBN weekly cash withdrawal limit policy for individuals (five hundred thousand naira) and corporate customers (five million naira) within the one-week deadline.',
        'Built and maintained multiple bill payment integrations (e.g., Now Now, Bua Payment, Delta State College of Health Tech), generating over 50% revenue growth.',
        'Collaborated with product designers and product managers to translate financial requirements into technical specifications.',
        'Leveraged Angular to seamlessly integrate multiple APIs into branch software applications, enhancing functionality and connectivity.',
      ],
    },
    {
      id: 'exp-4',
      role: 'Fullstack Developer',
      company: 'Dynasty Technologies Global Services Limited',
      location: 'Lagos, Nigeria',
      workMode: 'Remote',
      startDate: 'July 2016',
      endDate: 'Jan.2024',
      highlights: [
        'Led the end-to-end development and deployment of responsive web and mobile applications, ensuring scalability, performance, and maintainability while maintaining core codebases and applications.',
        'Architected and implemented product features and technical designs, collaborating with cross-functional teams to deliver secure and efficient solutions across websites, web apps, and mobile apps.',
        'Conducted comprehensive software testing and debugging, ensuring system stability and reducing production issues by over 25%.',
        'Maintained and optimized codebases, applying clean architecture principles and modern development practices to enhance code quality and performance.',
        'Championed CI/CD best practices and contributed to deployment automation pipelines, improving release efficiency and reducing downtime.',
        'Provided technical leadership and mentorship to junior developers, fostering a culture of collaboration and continuous improvement.',
      ],
    },
    {
      id: 'exp-4',
      role: 'Software Developer / CTO',
      company: 'Scaritel Africa Limited',
      location: 'Antananarivo, Madagascar',
      workMode: 'Remote',
      startDate: 'Jan. 2020',
      endDate: 'July 2024',
      highlights: [
        'Led the end-to-end development and deployment of responsive web and mobile applications, ensuring scalability, performance, and maintainability while maintaining core codebases and applications.',
        'Architected and implemented product features and technical designs, collaborating with cross-functional teams to deliver secure and efficient solutions across websites, web apps, and mobile apps.',
        'Conducted comprehensive software testing and debugging, ensuring system stability and reducing production issues by over 25%.',
        'Maintained and optimized codebases, applying clean architecture principles and modern development practices to enhance code quality and performance.',
        'Championed CI/CD best practices and contributed to deployment automation pipelines, improving release efficiency and reducing downtime.',
        'Provided technical leadership and mentorship to junior developers, fostering a culture of collaboration and continuous improvement.',
      ],
    },
  ];

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
