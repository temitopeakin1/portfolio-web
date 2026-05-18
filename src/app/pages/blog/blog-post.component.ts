import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { map } from 'rxjs';
import { BlogService } from '../../core/blog/blog.service';
import { MarkdownService } from '../../core/blog/markdown.service';

@Component({
  selector: 'app-blog-post',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './blog-post.component.html',
})
export class BlogPostComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly blog = inject(BlogService);
  private readonly markdown = inject(MarkdownService);

  protected readonly loading = signal(true);
  private readonly slug = toSignal(this.route.paramMap.pipe(map((p) => p.get('slug') ?? '')), { initialValue: '' });

  protected readonly post = computed(() => this.blog.getPostBySlug(this.slug()));
  protected readonly renderedContent = computed(() => {
    const c = this.post()?.content;
    return c ? this.markdown.render(c) : null;
  });

  ngOnInit(): void {
    void this.blog.ensureLoaded().finally(() => this.loading.set(false));
  }
}
