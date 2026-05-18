import { Injectable, inject, signal } from '@angular/core';
import { BLOG_POSTS } from './blog-posts.data';
import { BlogApiService } from './blog-api.service';
import type { BlogPost, BlogPostSummary } from './blog.model';

@Injectable({ providedIn: 'root' })
export class BlogService {
  private readonly api = inject(BlogApiService);
  private readonly posts = signal<BlogPost[]>([...BLOG_POSTS]);
  private readonly loaded = signal(false);
  private readonly loading = signal(false);
  private loadPromise: Promise<void> | null = null;

  readonly isLoading = this.loading.asReadonly();

  ensureLoaded(): Promise<void> {
    if (this.loaded()) return Promise.resolve();
    if (!this.loadPromise) this.loadPromise = this.load();
    return this.loadPromise;
  }

  async refresh(): Promise<void> {
    this.loaded.set(false);
    this.loadPromise = null;
    await this.ensureLoaded();
  }

  getPosts(): BlogPostSummary[] {
    return this.posts().map(({ content: _c, ...s }) => s);
  }

  getPostBySlug(slug: string): BlogPost | undefined {
    return this.posts().find((p) => p.slug === slug);
  }

  private async load(): Promise<void> {
    this.loading.set(true);
    try {
      const summaries = await this.api.fetchSummaries();
      if (!summaries.length) {
        this.posts.set([...BLOG_POSTS]);
        return;
      }
      const full = await Promise.all(
        summaries.map(async (s) => (await this.api.fetchPost(s.slug)) ?? ({ ...s, content: '' } as BlogPost))
      );
      this.posts.set(full.filter((p) => p.content));
    } catch {
      this.posts.set([...BLOG_POSTS]);
    } finally {
      this.loading.set(false);
      this.loaded.set(true);
    }
  }
}
