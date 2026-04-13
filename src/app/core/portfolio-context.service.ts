import { Injectable } from '@angular/core';

import { AboutComponent } from '../pages/about/about.component';
import { ProjectsComponent, ProjectCategory } from '../pages/projects/projects.component';
import { BlogPost, HashnodeService } from './hashnode.service';

@Injectable({ providedIn: 'root' })
export class PortfolioContextService {
  constructor(private readonly hashnodeService: HashnodeService) {}

  async buildContext(): Promise<string> {
    const about = new AboutComponent();
    const projects = new ProjectsComponent() as unknown as { categories: () => ProjectCategory[] };
    const blogPosts = await this.getBlogPostsSafe();

    const workHighlights = about.workExperiences
      .slice(0, 4)
      .flatMap((experience) =>
        experience.highlights
          .slice(0, 2)
          .map((line) => `${experience.role} at ${experience.company}: ${line}`)
      );

    const whatIDo = about.whatIDoItems
      .slice(0, 6)
      .map((item) => `${item.title}: ${item.content}`);

    const projectItems = this.flattenProjects(projects.categories())
      .slice(0, 10)
      .map(
        (item) =>
          `[${item.category}] ${item.title} - ${item.description}. Tech: ${item.tech.join(', ')}`
      );

    const blogItems = blogPosts
      .slice(0, 5)
      .map((post) => `${post.title} - ${post.excerpt || 'No summary available.'}`);

    return [
      "Temitope Akinmegha is a Senior Software Engineer with 6+ years in fintech and product engineering.",
      '',
      'What Temitope does:',
      ...whatIDo.map((line) => `- ${line}`),
      '',
      'Work highlights:',
      ...workHighlights.map((line) => `- ${line}`),
      '',
      'Selected projects:',
      ...projectItems.map((line) => `- ${line}`),
      '',
      'Recent blog topics:',
      ...(blogItems.length > 0
        ? blogItems.map((line) => `- ${line}`)
        : ['- No blog topics available right now.']),
    ].join('\n');
  }

  private async getBlogPostsSafe(): Promise<BlogPost[]> {
    try {
      return await this.hashnodeService.getPosts();
    } catch {
      return [];
    }
  }

  private flattenProjects(categories: ProjectCategory[]): Array<{
    category: string;
    title: string;
    description: string;
    tech: string[];
  }> {
    return categories.flatMap((category) =>
      category.items.map((project) => ({
        category: category.title,
        title: project.title,
        description: project.description,
        tech: project.tech,
      }))
    );
  }
}
