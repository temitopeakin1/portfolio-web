import { Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AdminAuthService } from '../../core/blog/admin-auth.service';
import { BlogApiService } from '../../core/blog/blog-api.service';
import { BlogService } from '../../core/blog/blog.service';
import { MarkdownEditorComponent } from './markdown-editor.component';

function slugify(v: string): string {
  return v.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
}

function stripMarkdown(md: string): string {
  return md
    .replace(/```[\s\S]*?```/g, '')
    .replace(/`[^`]+`/g, '')
    .replace(/!\[[^\]]*]\([^)]*\)/g, '')
    .replace(/\[[^\]]*]\([^)]*\)/g, '$1')
    .replace(/[#>*_~-]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

@Component({
  selector: 'app-admin-blog-editor',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, MarkdownEditorComponent],
  templateUrl: './admin-blog-editor.component.html',
  styleUrl: './admin-blog-editor.component.css',
})
export class AdminBlogEditorComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AdminAuthService);
  private readonly api = inject(BlogApiService);
  private readonly blog = inject(BlogService);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly submitting = signal(false);
  protected readonly loading = signal(true);
  protected readonly error = signal<string | null>(null);
  protected readonly slugTouched = signal(false);
  protected readonly editSlug = signal<string | null>(null);
  protected readonly coverUrlInput = signal('');

  protected readonly form = this.fb.nonNullable.group({
    title: ['', Validators.required],
    subtitle: [''],
    slug: ['', Validators.required],
    excerpt: [''],
    coverImage: [''],
    date: [
      new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }),
      Validators.required,
    ],
    readTime: ['5 min read'],
    content: ['', Validators.required],
  });

  ngOnInit(): void {
    const slug = this.route.snapshot.paramMap.get('slug');
    if (slug) {
      this.editSlug.set(slug);
      void this.load(slug);
      return;
    }
    this.loading.set(false);
    this.form.controls.title.valueChanges.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((t) => {
      if (!this.slugTouched()) this.form.controls.slug.setValue(slugify(t), { emitEvent: false });
    });
  }

  protected onSlugInput(): void {
    this.slugTouched.set(true);
  }

  protected coverImageValue(): string {
    return this.form.controls.coverImage.value;
  }

  protected onCoverClick(input: HTMLInputElement): void {
    input.click();
  }

  protected onCoverFileSelected(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      this.error.set('Please choose an image file.');
      return;
    }
    if (file.size > 800_000) {
      this.error.set('Cover image must be under 800 KB.');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      this.form.controls.coverImage.setValue(String(reader.result ?? ''));
      this.error.set(null);
    };
    reader.readAsDataURL(file);
  }

  protected applyCoverUrl(): void {
    const url = this.coverUrlInput().trim();
    if (!url) return;
    this.form.controls.coverImage.setValue(url);
    this.coverUrlInput.set('');
  }

  protected removeCover(): void {
    this.form.controls.coverImage.setValue('');
    this.coverUrlInput.set('');
  }

  protected async submit(): Promise<void> {
    if (this.submitting()) return;

    this.form.updateValueAndValidity();
    const payload = this.buildPayload();
    const missing: string[] = [];
    if (!payload.title.trim()) missing.push('title');
    if (!payload.slug.trim()) missing.push('slug');
    if (!payload.content.trim()) missing.push('article body');

    if (missing.length) {
      this.form.markAllAsTouched();
      this.error.set(`Please fill in: ${missing.join(', ')}.`);
      return;
    }

    const token = this.auth.getToken();
    if (!token) return;

    this.submitting.set(true);
    this.error.set(null);
    try {
      await this.api.adminSavePost(token, payload, this.editSlug() ?? undefined);
      await this.blog.refresh();
      await this.router.navigate(['/admin/blog']);
    } catch (e) {
      this.error.set(
        e instanceof HttpErrorResponse ? String(e.error?.error || e.message) : 'Could not save.'
      );
    } finally {
      this.submitting.set(false);
    }
  }

  private buildPayload() {
    const raw = this.form.getRawValue();
    const excerpt =
      raw.excerpt.trim() ||
      raw.subtitle.trim() ||
      stripMarkdown(raw.content).slice(0, 160) ||
      'Read more on the blog.';
    const words = stripMarkdown(raw.content).split(/\s+/).filter(Boolean).length;
    const readTime = raw.readTime.trim() || `${Math.max(1, Math.ceil(words / 200))} min read`;

    return {
      ...raw,
      excerpt,
      readTime,
      subtitle: raw.subtitle.trim(),
      coverImage: raw.coverImage.trim(),
    };
  }

  private async load(slug: string): Promise<void> {
    const token = this.auth.getToken();
    if (!token) return;
    try {
      const post = (await this.api.adminListPosts(token)).find((p) => p.slug === slug);
      if (!post) {
        this.error.set('Post not found.');
        return;
      }
      this.form.patchValue({
        title: post.title,
        subtitle: post.subtitle ?? '',
        slug: post.slug,
        excerpt: post.excerpt,
        coverImage: post.coverImage ?? '',
        date: post.date,
        readTime: post.readTime,
        content: post.content,
      });
      this.slugTouched.set(true);
    } catch (err) {
      if (err instanceof HttpErrorResponse && err.status === 401) {
        this.auth.logout();
        void this.router.navigate(['/admin/login']);
        return;
      }
      const msg =
        err instanceof HttpErrorResponse
          ? String(err.error?.error || err.message)
          : 'Could not load post.';
      this.error.set(msg || 'Could not load post.');
    } finally {
      this.loading.set(false);
    }
  }
}
