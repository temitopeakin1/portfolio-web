import { Component } from '@angular/core';

@Component({
  selector: 'app-blog',
  standalone: true,
  templateUrl: './blog.component.html',
})
export class BlogComponent {
  protected readonly posts = [
    {
      title: 'Building Scalable Angular Applications',
      excerpt: 'Best practices for structuring large-scale Angular projects and maintaining performance.',
      date: 'Feb 15, 2025',
      readTime: '8 min read',
    },
    {
      title: 'Microservices: When and Why',
      excerpt: 'A practical guide to deciding when microservices make sense for your architecture.',
      date: 'Jan 28, 2025',
      readTime: '6 min read',
    },
    {
      title: 'TypeScript Tips for Cleaner Code',
      excerpt: 'Advanced TypeScript patterns that improve type safety and developer experience.',
      date: 'Jan 10, 2025',
      readTime: '5 min read',
    },
  ];
}
