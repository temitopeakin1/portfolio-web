import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';
import type { BlogPost, BlogPostSummary } from './blog.model';

@Injectable({ providedIn: 'root' })
export class BlogApiService {
  private readonly http = inject(HttpClient);

  fetchSummaries(): Promise<BlogPostSummary[]> {
    return firstValueFrom(this.http.get<{ posts: BlogPostSummary[] }>(environment.blog.postsEndpoint)).then(
      (r) => r.posts ?? []
    );
  }

  fetchPost(slug: string): Promise<BlogPost | null> {
    return firstValueFrom(
      this.http.get<BlogPost>(environment.blog.postsEndpoint, { params: { slug } })
    ).catch(() => null);
  }

  adminLogin(password: string): Promise<string> {
    return firstValueFrom(
      this.http.post<{ token: string }>(environment.blog.adminLoginEndpoint, { password })
    ).then((r) => r.token);
  }

  adminListPosts(token: string): Promise<BlogPost[]> {
    return firstValueFrom(
      this.http.get<{ posts: BlogPost[] }>(environment.blog.adminBlogEndpoint, {
        headers: this.auth(token),
      })
    ).then((r) => r.posts ?? []);
  }

  adminSavePost(token: string, post: Partial<BlogPost>, editSlug?: string): Promise<BlogPost> {
    if (editSlug) {
      return firstValueFrom(
        this.http.put<{ post: BlogPost }>(
          `${environment.blog.adminBlogEndpoint}?slug=${encodeURIComponent(editSlug)}`,
          { post },
          { headers: this.auth(token) }
        )
      ).then((r) => r.post);
    }
    return firstValueFrom(
      this.http.post<{ post: BlogPost }>(environment.blog.adminBlogEndpoint, { post }, { headers: this.auth(token) })
    ).then((r) => r.post);
  }

  adminDeletePost(token: string, slug: string): Promise<void> {
    return firstValueFrom(
      this.http.delete(`${environment.blog.adminBlogEndpoint}?slug=${encodeURIComponent(slug)}`, {
        headers: this.auth(token),
      })
    ).then(() => undefined);
  }

  private auth(token: string): HttpHeaders {
    return new HttpHeaders({ Authorization: `Bearer ${token}` });
  }
}
