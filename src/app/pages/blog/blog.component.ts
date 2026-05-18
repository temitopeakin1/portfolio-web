import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { BlogService } from '../../core/blog/blog.service';

const POSTS_PER_PAGE = 6;

@Component({
  selector: 'app-blog',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './blog.component.html',
})
export class BlogComponent implements OnInit {
  private readonly blog = inject(BlogService);

  protected readonly currentPage = signal(1);
  protected readonly loading = this.blog.isLoading;
  protected readonly posts = computed(() => this.blog.getPosts());

  protected readonly totalPages = computed(() =>
    Math.ceil(this.posts().length / POSTS_PER_PAGE) || 1
  );

  protected readonly pageNumbers = computed(() =>
    Array.from({ length: this.totalPages() }, (_, i) => i + 1)
  );

  protected readonly paginatedPosts = computed(() => {
    const list = this.posts();
    const start = (this.currentPage() - 1) * POSTS_PER_PAGE;
    return list.slice(start, start + POSTS_PER_PAGE);
  });

  ngOnInit(): void {
    void this.blog.ensureLoaded();
  }

  protected setPage(page: number): void {
    if (page >= 1 && page <= this.totalPages()) this.currentPage.set(page);
  }
}
