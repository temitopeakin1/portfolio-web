import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, catchError, of } from 'rxjs';
import { firstValueFrom } from 'rxjs';
import { HASHNODE_HOST } from './hashnode.config';

const GQL_ENDPOINT = 'https://gql.hashnode.com';

const POSTS_QUERY = `
  query Publication($host: String!, $first: Int!) {
    publication(host: $host) {
      id
      posts(first: $first) {
        edges {
          node {
            id
            title
            url
            brief
            publishedAt
          }
        }
      }
    }
  }
`;

export interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  date: string;
  readTime: string;
  url: string;
}

interface HashnodePostNode {
  id: string;
  title: string;
  url: string;
  brief: string;
  publishedAt: string;
}

interface HashnodeResponse {
  data?: {
    publication: {
      id: string;
      posts: {
        edges: Array<{ node: HashnodePostNode }>;
      };
    };
  };
  errors?: Array<{ message: string }>;
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

function mapNodeToPost(node: HashnodePostNode, index: number): BlogPost {
  return {
    id: node.id || `hashnode-${index}`,
    title: node.title,
    excerpt: node.brief || '',
    date: formatDate(node.publishedAt),
    readTime: '–', // Hashnode API doesn't expose readTime in this query
    url: node.url,
  };
}

@Injectable({ providedIn: 'root' })
export class HashnodeService {
  constructor(private http: HttpClient) {}

  /**
   * Fetches posts from the configured Hashnode publication (up to 50).
   */
  getPosts(host: string = HASHNODE_HOST): Promise<BlogPost[]> {
    if (!host?.trim()) {
      return Promise.resolve([]);
    }

    return firstValueFrom(
      this.http
        .post<HashnodeResponse>(GQL_ENDPOINT, {
          query: POSTS_QUERY,
          variables: {
            host: host.trim(),
            first: 50,
          },
        })
        .pipe(
          map((res) => {
            if (res.errors?.length) {
              throw new Error(res.errors.map((e) => e.message).join('; '));
            }
            const pub = res.data?.publication;
            if (!pub?.posts?.edges) return [];
            return pub.posts.edges.map((e, i) => mapNodeToPost(e.node, i));
          }),
          catchError(() => of([]))
        )
    );
  }
}
