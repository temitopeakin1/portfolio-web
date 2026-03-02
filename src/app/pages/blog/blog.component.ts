import { Component, computed, signal, OnInit } from '@angular/core';
import { HashnodeService, BlogPost } from '../../core/hashnode.service';
import { HASHNODE_HOST } from '../../core/hashnode.config';

const POSTS_PER_PAGE = 6;

const FALLBACK_POSTS: BlogPost[] = [
  { id: '1', title: 'Building Scalable Angular Applications', excerpt: 'Best practices for structuring large-scale Angular projects and maintaining performance.', date: 'Feb 15, 2025', readTime: '8 min read', url: '#' },
  { id: '2', title: 'Microservices: When and Why', excerpt: 'A practical guide to deciding when microservices make sense for your architecture.', date: 'Jan 28, 2025', readTime: '6 min read', url: '#' },
  { id: '3', title: 'TypeScript Tips for Cleaner Code', excerpt: 'Advanced TypeScript patterns that improve type safety and developer experience.', date: 'Jan 10, 2025', readTime: '5 min read', url: '#' },
];

@Component({
  selector: 'app-blog',
  standalone: true,
  templateUrl: './blog.component.html',
})
export class BlogComponent implements OnInit {
  protected readonly currentPage = signal(1);
  protected readonly loading = signal(true);
  protected readonly error = signal<string | null>(null);
  protected readonly posts = signal<BlogPost[]>([]);

  constructor(private hashnode: HashnodeService) {}

  ngOnInit(): void {
    if (HASHNODE_HOST?.trim()) {
      this.hashnode
        .getPosts()
        .then((list) => {
          this.posts.set(list.length > 0 ? list : FALLBACK_POSTS);
          this.error.set(null);
        })
        .catch((err) => {
          this.error.set(err?.message || 'Could not load posts from Hashnode.');
          this.posts.set(FALLBACK_POSTS);
        })
        .finally(() => this.loading.set(false));
    } else {
      this.posts.set(FALLBACK_POSTS);
      this.loading.set(false);
    }
  }

  protected readonly totalPages = computed(() =>
    Math.ceil(this.posts().length / POSTS_PER_PAGE) || 1
  );

  protected readonly pageNumbers = computed(() =>
    Array.from({ length: this.totalPages() }, (_, i) => i + 1)
  );

  protected readonly paginatedPosts = computed(() => {
    const list = this.posts();
    const page = this.currentPage();
    const start = (page - 1) * POSTS_PER_PAGE;
    return list.slice(start, start + POSTS_PER_PAGE);
  });

  protected setPage(page: number): void {
    const total = this.totalPages();
    if (page >= 1 && page <= total) {
      this.currentPage.set(page);
    }
  }
}
