import { Component } from '@angular/core';

@Component({
  selector: 'app-tech-stack',
  standalone: true,
  templateUrl: './tech-stack.component.html',
})
export class TechStackComponent {
  protected readonly categories = [
    {
      title: 'Frontend',
      items: ['React', 'Next.js', 'TypeScript', 'JavaScript', 'Angular', 'Remix',],
    },
    {
      title: 'Backend & APIs',
      items: ['Node.js', 'NestJS', 'REST APIs', 'GraphQL', 'API Layer Design', 'Microservices'],
    },
    {
      title: 'Databases',
      items: ['PostgreSQL', 'MongoDB', 'Redis', 'MySQL'],
    },
    {
      title: 'Tools & Practices',
      items: ['Git', 'CI/CD', 'Performance Optimization', 'Debugging', 'Clean Architecture'],
    },
  ];
}
