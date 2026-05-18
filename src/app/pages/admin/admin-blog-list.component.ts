import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AdminAuthService } from '../../core/blog/admin-auth.service';
import { BlogApiService } from '../../core/blog/blog-api.service';
import { BlogService } from '../../core/blog/blog.service';
import type { BlogPost } from '../../core/blog/blog.model';

@Component({
  selector: 'app-admin-blog-list',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './admin-blog-list.component.html',
})
export class AdminBlogListComponent implements OnInit {
  private readonly auth = inject(AdminAuthService);
  private readonly router = inject(Router);
  private readonly api = inject(BlogApiService);
  private readonly blog = inject(BlogService);

  protected readonly posts = signal<BlogPost[]>([]);
  protected readonly loading = signal(true);
  protected readonly error = signal<string | null>(null);
  protected readonly searchQuery = signal('');

  protected readonly filteredPosts = computed(() => {
    const list = this.posts();
    const q = this.searchQuery().trim().toLowerCase();
    if (!q) return list;
    return list.filter((post) => {
      const haystack = [
        post.title,
        post.subtitle ?? '',
        post.excerpt,
        post.slug,
        post.content,
        post.date,
        post.readTime,
        post.id,
      ]
        .join(' ')
        .toLowerCase();
      return haystack.includes(q);
    });
  });

  ngOnInit(): void {
    void this.load();
  }

  protected onSearchInput(event: Event): void {
    this.searchQuery.set((event.target as HTMLInputElement).value);
  }

  protected clearSearch(): void {
    this.searchQuery.set('');
  }

  protected logout(): void {
    this.auth.logout();
    void this.router.navigate(['/admin/login']);
  }

  protected async deletePost(slug: string): Promise<void> {
    const token = this.auth.getToken();
    if (!token || !confirm('Delete this post?')) return;
    try {
      await this.api.adminDeletePost(token, slug);
      await this.blog.refresh();
      await this.load();
    } catch {
      this.error.set('Could not delete post.');
    }
  }

  private async load(): Promise<void> {
    const token = this.auth.getToken();
    if (!token) return;
    this.loading.set(true);
    try {
      this.posts.set(await this.api.adminListPosts(token));
    } catch {
      this.error.set('Could not load posts.');
    } finally {
      this.loading.set(false);
    }
  }
}
