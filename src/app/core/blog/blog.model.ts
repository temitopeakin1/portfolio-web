export interface BlogPostSummary {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  date: string;
  readTime: string;
  coverImage?: string;
  subtitle?: string;
}

export interface BlogPost extends BlogPostSummary {
  content: string;
}
